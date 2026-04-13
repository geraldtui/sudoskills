# Practice Mode Roadmap: Live Linux Troubleshooting

## Overview

Add a "Practice" section to SudoSkills where users connect to live Docker containers to troubleshoot real Linux issues. The architecture uses Docker for containers now, with a pluggable backend interface so VMs can be added later.

**Two modes of learning:**
- **Learn** (existing) — guided, step-by-step lessons with a simulated terminal
- **Practice** (new) — open-ended troubleshooting scenarios on live Docker containers

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                            │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Learn    │  │  Practice    │  │  Shared                  │  │
│  │  (exists) │  │  (new)       │  │  Header, i18n, Layout    │  │
│  │  Sim Term │  │  xterm.js    │  │  LanguageSwitcher        │  │
│  └──────────┘  │  WebSocket    │  └──────────────────────────┘  │
│                └──────┬───────┘                                 │
└───────────────────────┼─────────────────────────────────────────┘
                        │ WebSocket (wss://)
┌───────────────────────┼─────────────────────────────────────────┐
│                Backend API Server                               │
│  ┌────────────────────┴──────────────────────────────────────┐  │
│  │  Environment Manager (pluggable interface)                │  │
│  │  ┌─────────────────────┐  ┌─────────────────────────────┐ │  │
│  │  │  DockerProvider      │  │  VMProvider (future)        │ │  │
│  │  │  - create container  │  │  - create VM                │ │  │
│  │  │  - attach WebSocket  │  │  - attach WebSocket         │ │  │
│  │  │  - destroy container │  │  - destroy VM               │ │  │
│  │  └─────────────────────┘  └─────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Session Manager                                          │  │
│  │  - track active sessions                                  │  │
│  │  - enforce timeouts                                       │  │
│  │  - cleanup on disconnect                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Validation Service                                       │  │
│  │  - run check scripts inside container                     │  │
│  │  - report objective completion                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
     ┌────┴────┐  ┌────┴────┐  ┌────┴────┐
     │Container│  │Container│  │Container│
     │ User A  │  │ User B  │  │ User C  │
     └─────────┘  └─────────┘  └─────────┘
```

---

## Phase 1: Navigation Restructure

**Goal:** Reorganize the site to support both Learn and Practice sections.

### Changes

- **Header** — add "Practice" nav link alongside "Learn"
- **Landing page** — update Hero, Features, and HowItWorks to showcase both modes
- **Routing** — add `/practice` and `/practice/:scenario` routes
- **i18n** — add translation keys for Practice section in `en.json` and `sm.json`

### New Routes

```
/practice              → Scenario catalog
/practice/:scenario    → Individual scenario (live terminal)
```

### Dependencies

None — purely frontend, no backend needed yet.

---

## Phase 2: Practice Catalog & Scenario Data Model

**Goal:** Define the scenario data structure and build the catalog page.

### Scenario Data Model

```typescript
interface ScenarioMeta {
  key: string;                // e.g., "nginx-502"
  slug: string;               // e.g., "fix-nginx-502"
  title: string;              // e.g., "Fix a Broken Web Server"
  description: string;        // short summary
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];             // e.g., ["nginx", "networking", "logs"]
  estimatedMinutes: number;   // e.g., 15
  environment: string;        // Docker image name
}

interface Scenario extends ScenarioMeta {
  briefing: string;           // situation description shown to user
  objectives: Objective[];    // checklist of things to fix
  hints: string[];            // progressive hints
  validationScript: string;   // script path run inside container to check completion
}

interface Objective {
  id: string;
  description: string;        // e.g., "Nginx is returning 200 OK on port 80"
  checkCommand: string;       // command run inside container to verify
  successPattern: string;     // regex to match against check output
}
```

### Catalog Page (`/practice`)

- List all scenarios with difficulty badge, tags, estimated time
- Filter/sort by difficulty and tags
- Show completion status from localStorage

### Dependencies

None — data model and static catalog page only.

---

## Phase 3: Backend API Server

**Goal:** Build the backend that manages Docker containers and WebSocket connections.

### Tech Stack

- **Runtime:** Node.js (shares language with frontend)
- **Framework:** Express or Fastify
- **WebSocket:** `ws` library
- **Docker:** `dockerode` (Node.js Docker API client)
- **Session store:** In-memory (Redis later if scaling)

### API Endpoints

```
POST   /api/sessions              → Create a new session (spins up container)
DELETE /api/sessions/:sessionId   → End session (destroys container)
GET    /api/sessions/:sessionId   → Get session status
POST   /api/sessions/:sessionId/validate → Run validation script
WS     /api/sessions/:sessionId/terminal → WebSocket terminal connection
```

### Environment Provider Interface

The key abstraction for future VM support:

```typescript
interface EnvironmentProvider {
  create(config: EnvironmentConfig): Promise<EnvironmentInstance>;
  destroy(instanceId: string): Promise<void>;
  attach(instanceId: string): Promise<NodeJS.ReadWriteStream>;
  exec(instanceId: string, command: string): Promise<ExecResult>;
  getStatus(instanceId: string): Promise<EnvironmentStatus>;
}

interface EnvironmentConfig {
  image: string;              // Docker image or VM template
  memoryLimit: string;        // e.g., "256m"
  cpuLimit: number;           // e.g., 0.5
  timeoutMinutes: number;     // auto-destroy after this
  labels: Record<string, string>;
}

interface EnvironmentInstance {
  id: string;
  provider: 'docker' | 'vm';
  status: 'creating' | 'running' | 'stopped' | 'destroyed';
  createdAt: Date;
  expiresAt: Date;
}
```

### DockerProvider Implementation

- Uses `dockerode` to create/manage containers
- Each scenario has a pre-built Docker image with the "broken" state baked in
- Containers are ephemeral — destroyed when session ends or times out
- Resource limits enforced (memory, CPU, no network access to host)

### Security

- Containers run with `--network=none` or isolated bridge network
- No volume mounts to host filesystem
- Rootless containers where possible
- Seccomp profiles to limit syscalls
- Auto-destroy after timeout (default 30 minutes)

### Dependencies

- Docker installed on the server
- `dockerode`, `ws` npm packages

---

## Phase 4: Live Terminal Integration (Frontend)

**Goal:** Connect the frontend to the backend via WebSocket and render a real terminal.

### xterm.js Integration

- Use `xterm.js` + `xterm-addon-fit` + `xterm-addon-web-links`
- WebSocket connection to backend relays stdin/stdout to the container
- Terminal resizes propagated to container PTY

### Practice Page (`/practice/:scenario`)

Layout:
```
┌─────────────────────────────────────────────────┐
│  Header                                         │
├────────────────────┬────────────────────────────┤
│  Briefing Panel    │  Live Terminal (xterm.js)   │
│  - Situation       │  - Real shell session       │
│  - Objectives []   │  - Full Linux environment   │
│  - Hints           │                             │
│  - Timer           │                             │
├────────────────────┴────────────────────────────┤
│  Footer: [Check Solution] [Reset] [Give Up]     │
└─────────────────────────────────────────────────┘
```

### Session Lifecycle (Frontend)

1. User clicks "Start Scenario"
2. Frontend calls `POST /api/sessions` with scenario key
3. Backend spins up container, returns `sessionId`
4. Frontend opens WebSocket to `/api/sessions/:sessionId/terminal`
5. xterm.js renders the live shell
6. User works on the problem
7. User clicks "Check Solution" → `POST /api/sessions/:sessionId/validate`
8. Backend runs validation script inside container, returns results
9. Objectives update in real-time
10. On completion or timeout → session destroyed

### Dependencies

- Phase 3 (Backend API) must be running
- `xterm`, `xterm-addon-fit`, `xterm-addon-web-links` npm packages

---

## Phase 5: Scenario Engine & Validation

**Goal:** Build the system that checks whether users have solved the problem.

### Validation Flow

1. User clicks "Check Solution"
2. Backend runs each objective's `checkCommand` inside the container via `docker exec`
3. Output is matched against `successPattern` (regex)
4. Results returned to frontend as a list of pass/fail per objective

### Example Scenario: "Fix a Broken Nginx Server"

```typescript
{
  key: "nginx-502",
  slug: "fix-nginx-502",
  title: "Fix a Broken Web Server",
  difficulty: "beginner",
  tags: ["nginx", "logs", "configuration"],
  estimatedMinutes: 15,
  environment: "sudoskills/scenario-nginx-502:latest",
  briefing: "Users are reporting 502 Bad Gateway errors on the company website. The Nginx web server is running but something is misconfigured. Your job is to find and fix the issue.",
  objectives: [
    {
      id: "nginx-running",
      description: "Nginx service is running",
      checkCommand: "systemctl is-active nginx",
      successPattern: "^active$"
    },
    {
      id: "nginx-200",
      description: "Nginx returns HTTP 200 on port 80",
      checkCommand: "curl -s -o /dev/null -w '%{http_code}' http://localhost",
      successPattern: "^200$"
    }
  ],
  hints: [
    "Check the Nginx error log: /var/log/nginx/error.log",
    "Look at the Nginx configuration: /etc/nginx/sites-enabled/",
    "The upstream backend port might be wrong in the proxy_pass directive"
  ]
}
```

### Docker Image for This Scenario

A Dockerfile that bakes in the broken state:

```dockerfile
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y nginx curl systemctl
# Install a broken nginx config (wrong upstream port)
COPY broken-nginx.conf /etc/nginx/sites-enabled/default
# Start nginx on container boot
CMD ["/sbin/init"]
```

### Dependencies

- Phase 3 (Backend) and Phase 4 (Frontend terminal) complete
- Pre-built Docker images for each scenario

---

## Phase 6: First Scenarios (Content)

**Goal:** Create 3-5 initial practice scenarios covering common troubleshooting tasks.

### Starter Scenarios

| # | Scenario | Difficulty | Skills Tested |
|---|----------|-----------|---------------|
| 1 | Fix file permissions blocking a script | Beginner | chmod, ls -l, file permissions |
| 2 | Find and kill a runaway process | Beginner | ps, top, kill, grep |
| 3 | Fix a broken Nginx config (502 error) | Intermediate | nginx, logs, config files, curl |
| 4 | Recover a deleted cron job | Intermediate | crontab, logs, systemctl |
| 5 | Debug a full disk preventing log writes | Advanced | df, du, find, log rotation |

### Per Scenario Deliverables

- Dockerfile that creates the broken environment
- Scenario data file (metadata, briefing, objectives, hints, validation)
- Samoan translation of briefing, objectives, and hints

### Dependencies

- All previous phases complete
- Docker images built and tested

---

## Phase 7: Deployment (DigitalOcean)

**Goal:** Deploy the full stack on a single DigitalOcean Droplet.

### Why DigitalOcean

- **1-click Docker image** — Docker pre-installed and configured, no manual setup
- **Best-in-class documentation** — step-by-step tutorials for our exact stack (Next.js + Docker)
- **Built-in monitoring** — CPU, memory, disk, and bandwidth graphs in the dashboard
- **Simple pricing** — flat monthly rate, no usage surprises
- **Easy CI/CD** — GitHub Actions templates for SSH-based deploy workflows

### Recommended Droplet

| Spec | Value |
|------|-------|
| Plan | Basic (Shared CPU) |
| Size | 4GB RAM / 2 vCPUs / 80GB SSD |
| Image | Docker on Ubuntu 22.04 (1-click) |
| Region | SFO3 or NYC1 (closest to target users) |
| Cost | $24/mo |
| Backups | Enabled (+$4.80/mo) |

### Capacity Estimate

With 4GB RAM and 256MB per container:
- ~12-14 concurrent practice sessions (leaving ~500MB for OS, Next.js, and backend)
- Upgrade to 8GB ($48/mo) when you consistently hit 10+ concurrent sessions

### Server Architecture

```
┌─────────────────────────────────────────────────────┐
│  DigitalOcean Droplet (4GB / 2 vCPU / Ubuntu 22.04) │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Nginx (reverse proxy)                         │  │
│  │  - Port 80/443 → Next.js (:3000)              │  │
│  │  - /api/sessions/* → Backend (:4000)           │  │
│  │  - /ws/* → WebSocket upgrade → Backend (:4000) │  │
│  │  - SSL via Let's Encrypt (certbot)             │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────┐  ┌─────────────────────────┐  │
│  │  Next.js          │  │  Backend API Server     │  │
│  │  (port 3000)      │  │  (port 4000)            │  │
│  │  - Learn pages    │  │  - Session management   │  │
│  │  - Practice UI    │  │  - WebSocket relay      │  │
│  │  - Static assets  │  │  - Docker orchestration │  │
│  └──────────────────┘  └─────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Docker Engine                                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │  │
│  │  │Container │ │Container │ │Container │ ...    │  │
│  │  │ User A   │ │ User B   │ │ User C   │       │  │
│  │  └──────────┘ └──────────┘ └──────────┘       │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Setup Steps

1. **Create Droplet** — select Docker 1-click image, enable backups, add SSH key
2. **DNS** — point `sudoskills.com` (or subdomain) to Droplet IP via A record
3. **Nginx** — install and configure as reverse proxy for Next.js + backend
4. **SSL** — `certbot --nginx` for free Let's Encrypt certificate (auto-renews)
5. **Clone repo** — `git clone` the SudoSkills repo onto the Droplet
6. **Build & run** — `docker compose up -d` for the full stack (Next.js, backend, scenario images)
7. **Firewall** — enable DigitalOcean cloud firewall: allow 80, 443, 22 only
8. **Monitoring** — enable built-in Droplet monitoring + set up alerts for CPU/memory

### CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to DigitalOcean
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DO_HOST }}
          username: root
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /opt/sudoskills
            git pull origin main
            docker compose build
            docker compose up -d --remove-orphans
```

### Scaling Path

| Stage | Trigger | Action |
|-------|---------|--------|
| Start | Launch | 4GB Droplet ($24/mo) |
| Growth | >10 concurrent sessions regularly | Resize to 8GB ($48/mo) — 1-click, ~1 min downtime |
| Scale | >25 concurrent sessions | Add a second Droplet for containers, use DO Load Balancer ($12/mo) |
| Large | >100 concurrent sessions | Move to DO Kubernetes (DOKS) with auto-scaling node pools |

---

## Phase 8: Polish & Hardening

**Goal:** Production-readiness for the practice mode.

### Items

- **Session cleanup** — cron job or background worker to destroy orphaned containers
- **Rate limiting** — prevent abuse (max N concurrent sessions per IP)
- **Monitoring** — track container count, memory usage, session duration via DO dashboard + custom metrics
- **Error handling** — graceful fallbacks when Docker is unavailable
- **Loading states** — spinner while container spins up (~2-5 seconds)
- **Mobile experience** — xterm.js on mobile with touch-friendly controls
- **i18n** — ensure all Practice UI strings are translated
- **Progress persistence** — save completed scenarios in localStorage

---

## Future: VM Support

When the time comes to add VM-based scenarios (boot repair, kernel tuning, multi-machine networking), the work is:

1. **Implement `VMProvider`** that satisfies the `EnvironmentProvider` interface
2. **Use Firecracker microVMs** or cloud VMs (AWS EC2, GCP Compute)
3. **Add `provider` field to scenario data** — `"docker"` or `"vm"`
4. **Backend routes scenario to correct provider** based on config
5. **No frontend changes needed** — xterm.js and WebSocket work the same way

The pluggable `EnvironmentProvider` interface in Phase 3 makes this a backend-only change.

---

## Implementation Order & Estimates

| Phase | Description | Depends On | Estimate |
|-------|-------------|-----------|----------|
| 1 | Navigation restructure | — | 1-2 days |
| 2 | Scenario data model & catalog page | Phase 1 | 1-2 days |
| 3 | Backend API server + Docker provider | — | 3-5 days |
| 4 | Live terminal integration (xterm.js) | Phase 3 | 2-3 days |
| 5 | Scenario engine & validation | Phase 3, 4 | 2-3 days |
| 6 | First 3-5 scenarios (content) | Phase 5 | 2-3 days |
| 7 | Deployment (DigitalOcean) | Phase 3 | 1-2 days |
| 8 | Polish & hardening | Phase 6, 7 | 2-3 days |

**Total estimate: ~2.5-3.5 weeks**

Phases 1-2 (frontend) and Phase 3 (backend) can be developed in parallel. Phase 7 (deployment) can begin as soon as the backend is ready, running alongside content creation.

---

## Tech Stack Additions

| Component | Technology | Why |
|-----------|-----------|-----|
| Terminal UI | xterm.js | Industry standard browser terminal emulator |
| WebSocket | ws (Node.js) | Lightweight, well-maintained |
| Docker API | dockerode | Full Docker API for Node.js |
| Backend framework | Express or Fastify | Lightweight, familiar |
| Container images | Ubuntu 22.04 base | Realistic Linux environment |
| Hosting | DigitalOcean Droplet | 1-click Docker, great docs, built-in monitoring |
| Reverse proxy | Nginx | Routes HTTP/WS traffic, handles SSL |
| SSL | Let's Encrypt (certbot) | Free, auto-renewing certificates |
| CI/CD | GitHub Actions | SSH-based deploy on push to main |

---

## Key Design Decisions

1. **Docker first, VMs later** — Docker covers 90% of scenarios, is cheaper, and starts faster
2. **Pluggable provider interface** — `EnvironmentProvider` abstraction means adding VMs is a backend-only change
3. **Ephemeral containers** — every session gets a fresh container, destroyed on completion or timeout
4. **Validation via exec** — run check scripts inside the container rather than inspecting from outside
5. **No auth for MVP** — sessions are anonymous, rate-limited by IP. Auth can be added later
6. **Separate backend** — the practice backend is a separate Node.js service, not embedded in Next.js, keeping the Learn section purely static
7. **Single-server deployment** — DigitalOcean Droplet hosts everything (Next.js, backend, Docker containers) for simplicity and cost. Nginx reverse proxy routes traffic. Scale vertically first, split later.
