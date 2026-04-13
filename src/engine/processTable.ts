import { ProcessEntry } from '@/types';

const DEFAULT_PROCESSES: ProcessEntry[] = [
  { pid: 1, user: 'root', cpu: '0.0', mem: '0.4', command: '/sbin/init', state: 'S' },
  { pid: 42, user: 'root', cpu: '0.1', mem: '0.2', command: '/usr/sbin/sshd', state: 'S' },
  { pid: 87, user: 'root', cpu: '0.0', mem: '0.1', command: '/usr/sbin/cron', state: 'S' },
  { pid: 156, user: 'user', cpu: '0.3', mem: '1.2', command: '-bash', state: 'S' },
  { pid: 203, user: 'www-data', cpu: '2.1', mem: '3.5', command: 'nginx: worker process', state: 'S' },
  { pid: 341, user: 'user', cpu: '45.2', mem: '12.8', command: 'python3 runaway_script.py', state: 'R' },
  { pid: 512, user: 'root', cpu: '0.0', mem: '0.3', command: '/usr/sbin/rsyslogd', state: 'S' },
];

let processes: ProcessEntry[] = [...DEFAULT_PROCESSES.map(p => ({ ...p }))];

export function listProcesses(): ProcessEntry[] {
  return [...processes];
}

export function killProcess(pid: number): boolean {
  const index = processes.findIndex(p => p.pid === pid);
  if (index === -1) return false;
  processes.splice(index, 1);
  return true;
}

export function addProcess(entry: ProcessEntry): void {
  processes.push({ ...entry });
}

export function resetProcesses(): void {
  processes = [...DEFAULT_PROCESSES.map(p => ({ ...p }))];
}
