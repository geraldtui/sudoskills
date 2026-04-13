import { StepData } from '@/types';

const processes: StepData[] = [
  {
    title: "Introduction to Process Management",
    description: "Every running program in Linux is a process. In this lesson, you'll learn to list processes, identify problems, and stop misbehaving ones.",
    interactive: false,
    readOnly: true,
    expectedCommand: [],
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {}
          }
        }
      }
    },
    initialCwd: "/home/user"
  },
  {
    title: "List Your Processes",
    description: "The 'ps' command shows running processes. By default, it only shows processes for your current session. Try it now.",
    interactive: true,
    expectedCommand: ["ps"],
    hint: "Just type ps to see your running processes",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {}
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return output.includes('PID') && output.includes('CMD');
    }
  },
  {
    title: "List All Processes",
    description: "To see ALL processes on the system (not just yours), use 'ps aux'. This shows every process with details like CPU and memory usage.",
    interactive: true,
    expectedCommand: ["ps aux"],
    hint: "Use ps with the aux flags to see all processes",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {}
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return output.includes('USER') && output.includes('%CPU') && output.includes('root');
    }
  },
  {
    title: "Spot the Problem Process",
    description: "Look at the 'ps aux' output. One process is using 45% CPU — that's the runaway script! Note its PID (process ID) number. Run 'ps aux' to find it.",
    interactive: true,
    expectedCommand: ["ps aux"],
    hint: "Run ps aux and look for the process with high CPU usage",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {}
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return output.includes('45.2') && output.includes('runaway_script.py');
    }
  },
  {
    title: "Kill a Process",
    description: "The 'kill' command sends a signal to stop a process. Kill the runaway script (PID 341) using the kill command.",
    interactive: true,
    expectedCommand: ["kill 341"],
    hint: "Use kill followed by the PID number of the runaway process",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {}
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd) => {
      return cmd.includes('kill') && cmd.includes('341');
    }
  },
  {
    title: "Force Kill with -9",
    description: "Sometimes a process ignores the regular kill signal. The -9 flag sends SIGKILL, which forces the process to stop immediately. Force kill process 512.",
    interactive: true,
    expectedCommand: ["kill -9 512"],
    hint: "Use kill with the -9 flag followed by the PID",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {}
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd) => {
      return cmd.includes('kill') && cmd.includes('-9') && cmd.includes('512');
    }
  },
  {
    title: "Verify the Process is Gone",
    description: "After killing a process, verify it's gone by running 'ps aux' again. The runaway script should no longer appear.",
    interactive: true,
    expectedCommand: ["ps aux"],
    hint: "Run ps aux to check that the killed process is no longer listed",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {}
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return output.includes('USER') && output.includes('PID') && !output.includes('runaway_script.py');
    }
  }
];

export default processes;
