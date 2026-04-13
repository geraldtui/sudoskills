import { StepData } from '@/types';

const users: StepData[] = [
  {
    title: "Introduction to Users & Groups",
    description: "Linux is a multi-user system. Every file is owned by a user and a group. In this lesson, you'll learn to check your identity and use elevated privileges.",
    interactive: false,
    readOnly: true,
    expectedCommand: [],
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "protected.txt": { type: "file", content: "This file is owned by root", permissions: "rw-------", owner: "root", group: "root" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user"
  },
  {
    title: "Who Am I?",
    description: "The 'whoami' command tells you which user you're logged in as. Try it now.",
    interactive: true,
    expectedCommand: ["whoami"],
    hint: "Just type whoami",
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
      return output.includes('user');
    }
  },
  {
    title: "Get Detailed Identity",
    description: "The 'id' command shows your user ID (uid), group ID (gid), and all groups you belong to. Run it to see your full identity.",
    interactive: true,
    expectedCommand: ["id"],
    hint: "Just type id to see your user and group information",
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
      return output.includes('uid=1000') && output.includes('gid=');
    }
  },
  {
    title: "Understanding sudo",
    description: "Some commands require administrator (root) privileges. The 'sudo' command lets you run a single command as root. Use sudo to view a root-owned file by running 'sudo cat protected.txt'.",
    interactive: true,
    expectedCommand: ["sudo cat protected.txt"],
    hint: "Prefix the command with sudo to run it with elevated privileges",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "protected.txt": { type: "file", content: "SECRET: database_password=hunter2", permissions: "rw-------", owner: "root", group: "root" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes('sudo') && output.includes('SECRET');
    }
  },
  {
    title: "sudo with Other Commands",
    description: "You can use sudo with any command. Use 'sudo chmod 644 protected.txt' to change the permissions of a root-owned file.",
    interactive: true,
    expectedCommand: ["sudo chmod 644 protected.txt"],
    hint: "Use sudo before chmod to change permissions on a root-owned file",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "protected.txt": { type: "file", content: "config data", permissions: "rw-------", owner: "root", group: "root" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd) => {
      return cmd.includes('sudo') && cmd.includes('chmod') && cmd.includes('644');
    }
  },
  {
    title: "Check File Ownership",
    description: "Use 'ls -l' to see who owns the files in the current directory. Notice the owner and group columns.",
    interactive: true,
    expectedCommand: ["ls -l"],
    hint: "Use ls -l to see file ownership details",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "my-file.txt": { type: "file", content: "my data", permissions: "rw-r--r--", owner: "user", group: "user" },
              "system.conf": { type: "file", content: "system config", permissions: "rw-r-----", owner: "root", group: "root" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return output.includes('user') && output.includes('my-file.txt');
    }
  },
  {
    title: "Change Ownership with sudo",
    description: "Use 'sudo chown' to take ownership of 'system.conf'. Change its owner to 'user'.",
    interactive: true,
    expectedCommand: ["sudo chown user system.conf", "sudo chown user:user system.conf"],
    hint: "Use sudo chown followed by the new owner and the filename",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "system.conf": { type: "file", content: "system config", permissions: "rw-r-----", owner: "root", group: "root" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd) => {
      return cmd.includes('sudo') && cmd.includes('chown') && cmd.includes('user') && cmd.includes('system.conf');
    }
  }
];

export default users;
