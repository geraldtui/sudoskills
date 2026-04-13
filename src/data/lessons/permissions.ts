import { StepData } from '@/types';

const permissions: StepData[] = [
  {
    title: "Introduction to File Permissions",
    description: "Every file and directory in Linux has permissions that control who can read, write, or execute it. In this lesson, you'll learn to read and change permissions.",
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
              "script.sh": { type: "file", content: "#!/bin/bash\necho 'Hello World'", permissions: "rw-r--r--" },
              "data.txt": { type: "file", content: "sensitive data", permissions: "rw-rw-r--" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user"
  },
  {
    title: "Reading Permissions with ls -l",
    description: "Use 'ls -l' to see the permissions of files. The first column shows the permission string (e.g., -rw-r--r--). Try it now.",
    interactive: true,
    expectedCommand: ["ls -l"],
    hint: "Use ls with the -l flag for the long listing format",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "script.sh": { type: "file", content: "#!/bin/bash\necho 'Hello'", permissions: "rw-r--r--" },
              "readme.txt": { type: "file", content: "Read me!", permissions: "rw-rw-r--" },
              "secret.key": { type: "file", content: "abc123", permissions: "rw-------" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return output.includes("rw-") && output.includes("script.sh");
    }
  },
  {
    title: "Understanding Permission Numbers",
    description: "Permissions use octal numbers: 4=read, 2=write, 1=execute. So 755 means rwxr-xr-x (owner: all, group: read+execute, others: read+execute). Make 'script.sh' executable with chmod 755.",
    interactive: true,
    expectedCommand: ["chmod 755 script.sh"],
    hint: "Use chmod followed by the octal number and the filename",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "script.sh": { type: "file", content: "#!/bin/bash\necho 'Hello'", permissions: "rw-r--r--" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output, fs) => {
      return cmd.includes("chmod") && cmd.includes("755");
    }
  },
  {
    title: "Verify the Permission Change",
    description: "Now use 'ls -l' to verify that script.sh has the new permissions (rwxr-xr-x).",
    interactive: true,
    expectedCommand: ["ls -l"],
    hint: "Use ls -l to see the updated permissions",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "script.sh": { type: "file", content: "#!/bin/bash\necho 'Hello'", permissions: "rwxr-xr-x" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return output.includes("rwxr-xr-x");
    }
  },
  {
    title: "Restrict Permissions",
    description: "Make 'secret.key' readable and writable only by the owner (600 = rw-------). No one else should be able to access it.",
    interactive: true,
    expectedCommand: ["chmod 600 secret.key"],
    hint: "Use chmod with 600 to give only the owner read and write access",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "secret.key": { type: "file", content: "private-key-data", permissions: "rw-r--r--" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd) => {
      return cmd.includes("chmod") && cmd.includes("600");
    }
  },
  {
    title: "Make a Script Executable",
    description: "A common task: you've written a script but can't run it because it lacks execute permission. Use chmod to add execute permission for everyone (755) on 'deploy.sh'.",
    interactive: true,
    expectedCommand: ["chmod 755 deploy.sh"],
    hint: "Use chmod 755 to give full permissions to the owner and read+execute to others",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "deploy.sh": { type: "file", content: "#!/bin/bash\nrsync -avz ./dist/ server:/var/www/", permissions: "rw-r--r--" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd) => {
      return cmd.includes("chmod") && cmd.includes("755") && cmd.includes("deploy.sh");
    }
  },
  {
    title: "Change File Ownership",
    description: "The 'chown' command changes who owns a file. Change the owner of 'config.ini' to 'www-data'.",
    interactive: true,
    expectedCommand: ["chown www-data config.ini"],
    hint: "Use chown followed by the new owner and the filename",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "config.ini": { type: "file", content: "port=8080\nhost=0.0.0.0", permissions: "rw-r--r--", owner: "user", group: "user" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd) => {
      return cmd.includes("chown") && cmd.includes("www-data") && cmd.includes("config.ini");
    }
  },
  {
    title: "Change Owner and Group",
    description: "You can change both owner and group at once using 'owner:group' syntax. Change 'app.log' to be owned by 'www-data' in the 'www-data' group.",
    interactive: true,
    expectedCommand: ["chown www-data:www-data app.log"],
    hint: "Use chown with owner:group syntax",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "app.log": { type: "file", content: "Application log entries", permissions: "rw-r--r--", owner: "root", group: "root" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd) => {
      return cmd.includes("chown") && cmd.includes("www-data:www-data") && cmd.includes("app.log");
    }
  }
];

export default permissions;
