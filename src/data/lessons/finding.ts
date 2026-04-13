import { StepData } from '@/types';

const finding: StepData[] = [
  {
    title: "Introduction to Finding Things",
    description: "One of the most common tasks in Linux is finding files and searching for text inside them. In this lesson, you'll learn 'find', 'grep', and 'which'.",
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
              "projects": {
                type: "dir",
                children: {
                  "app": {
                    type: "dir",
                    children: {
                      "index.js": { type: "file", content: "const app = require('express');\napp.listen(3000);" },
                      "config.json": { type: "file", content: '{"port": 3000, "debug": true}' }
                    }
                  },
                  "docs": {
                    type: "dir",
                    children: {
                      "README.md": { type: "file", content: "# My Project\nThis is a web application." },
                      "CHANGELOG.md": { type: "file", content: "# Changelog\n## v1.0 - Initial release" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    initialCwd: "/home/user"
  },
  {
    title: "Find Files by Name",
    description: "The 'find' command searches for files in a directory tree. Find all Markdown files (.md) starting from the current directory.",
    interactive: true,
    expectedCommand: ["find . -name *.md"],
    hint: "Use find with the -name flag and a wildcard pattern like *.md",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "projects": {
                type: "dir",
                children: {
                  "docs": {
                    type: "dir",
                    children: {
                      "README.md": { type: "file", content: "# My Project" },
                      "CHANGELOG.md": { type: "file", content: "# Changelog" }
                    }
                  },
                  "src": {
                    type: "dir",
                    children: {
                      "app.js": { type: "file", content: "console.log('hello');" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes("find") && cmd.includes("-name") && output.includes(".md");
    }
  },
  {
    title: "Find Only Directories",
    description: "You can filter by type. Use '-type d' to find only directories under the current path.",
    interactive: true,
    expectedCommand: ["find . -type d"],
    hint: "Use find with -type d to search for directories only",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "projects": {
                type: "dir",
                children: {
                  "src": { type: "dir", children: {} },
                  "docs": { type: "dir", children: {} },
                  "README.md": { type: "file", content: "# Project" }
                }
              }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes("-type") && cmd.includes("d") && output.includes("projects");
    }
  },
  {
    title: "Search Inside Files with grep",
    description: "The 'grep' command searches for text patterns inside files. Search for the word 'error' in 'server.log'.",
    interactive: true,
    expectedCommand: ["grep error server.log"],
    hint: "Use grep followed by the pattern and the filename",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "server.log": { type: "file", content: "INFO: Server started\nINFO: Listening on port 8080\nWARN: High memory usage\nerror: connection timeout\nINFO: Request processed\nerror: disk full" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return output.includes("error");
    }
  },
  {
    title: "Case-Insensitive Search",
    description: "By default, grep is case-sensitive. Use the -i flag to search for 'ERROR' regardless of case in 'server.log'.",
    interactive: true,
    expectedCommand: ["grep -i error server.log", "grep -i ERROR server.log"],
    hint: "Use the -i flag with grep to ignore case",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "server.log": { type: "file", content: "INFO: Server started\nERROR: Connection timeout\nWARN: High memory\nerror: disk full\nInfo: Request OK\nError: Bad gateway" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes("-i") && output.includes("ERROR") && output.includes("error");
    }
  },
  {
    title: "Show Line Numbers with grep",
    description: "The -n flag shows the line number of each match. Search for 'WARN' in 'server.log' with line numbers.",
    interactive: true,
    expectedCommand: ["grep -n WARN server.log"],
    hint: "Use the -n flag with grep to show line numbers",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "server.log": { type: "file", content: "INFO: Server started\nWARN: High memory usage\nINFO: Request processed\nWARN: Slow query detected\nINFO: Backup completed" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes("-n") && output.includes("2:") && output.includes("WARN");
    }
  },
  {
    title: "Find a Command's Location with which",
    description: "The 'which' command tells you where a command's executable is located. Find where 'grep' lives on the system.",
    interactive: true,
    expectedCommand: ["which grep"],
    hint: "Use which followed by the command name",
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
      return output.includes("/usr/bin/grep");
    }
  }
];

export default finding;
