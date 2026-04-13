import { StepData } from '@/types';

const copying: StepData[] = [
  {
    title: "Introduction to Copying & Moving",
    description: "In this lesson, you'll learn how to copy and move files and directories. These are essential skills for organizing your filesystem.",
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
              "documents": { type: "dir", children: {} },
              "report.txt": { type: "file", content: "Quarterly Report\nRevenue: $50,000\nExpenses: $30,000" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user"
  },
  {
    title: "Copy a File",
    description: "The 'cp' command copies files. Copy 'report.txt' to create a backup called 'report-backup.txt'.",
    interactive: true,
    expectedCommand: ["cp report.txt report-backup.txt"],
    hint: "Use cp followed by the source file and the destination name",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "report.txt": { type: "file", content: "Quarterly Report\nRevenue: $50,000" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output, fs) => {
      return fs.exists("/home/user/report-backup.txt") && fs.exists("/home/user/report.txt");
    }
  },
  {
    title: "Copy a File into a Directory",
    description: "You can copy a file into an existing directory. Copy 'notes.txt' into the 'backup' folder.",
    interactive: true,
    expectedCommand: ["cp notes.txt backup", "cp notes.txt backup/"],
    hint: "Use cp with the file name and the directory as the destination",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "notes.txt": { type: "file", content: "Meeting notes from Monday" },
              "backup": { type: "dir", children: {} }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output, fs) => {
      return fs.exists("/home/user/backup/notes.txt") && fs.exists("/home/user/notes.txt");
    }
  },
  {
    title: "Copy a Directory",
    description: "To copy a directory and all its contents, you need the -r (recursive) flag. Copy the 'project' directory to 'project-backup'.",
    interactive: true,
    expectedCommand: ["cp -r project project-backup"],
    hint: "Use the -r flag with cp to copy directories recursively",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "project": {
                type: "dir",
                children: {
                  "index.html": { type: "file", content: "<html>Hello</html>" },
                  "style.css": { type: "file", content: "body { color: red; }" }
                }
              }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output, fs) => {
      return fs.exists("/home/user/project-backup") &&
             fs.isDirectory("/home/user/project-backup") &&
             fs.exists("/home/user/project");
    }
  },
  {
    title: "Rename a File with mv",
    description: "The 'mv' command moves files, but it's also used to rename them. Rename 'draft.txt' to 'final.txt'.",
    interactive: true,
    expectedCommand: ["mv draft.txt final.txt"],
    hint: "Use mv with the old name and the new name",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "draft.txt": { type: "file", content: "This is the final version." }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output, fs) => {
      return fs.exists("/home/user/final.txt") && !fs.exists("/home/user/draft.txt");
    }
  },
  {
    title: "Move a File to a Directory",
    description: "Move 'todo.txt' into the 'documents' directory.",
    interactive: true,
    expectedCommand: ["mv todo.txt documents", "mv todo.txt documents/"],
    hint: "Use mv with the file and the destination directory",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "todo.txt": { type: "file", content: "1. Learn Linux\n2. Practice commands" },
              "documents": { type: "dir", children: {} }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output, fs) => {
      return fs.exists("/home/user/documents/todo.txt") && !fs.exists("/home/user/todo.txt");
    }
  },
  {
    title: "Move a Directory",
    description: "Unlike cp, mv doesn't need -r to move directories. Move the 'old-project' directory into 'archive'.",
    interactive: true,
    expectedCommand: ["mv old-project archive", "mv old-project archive/"],
    hint: "Just use mv with the directory name and the destination",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "old-project": {
                type: "dir",
                children: {
                  "README.md": { type: "file", content: "# Old Project" }
                }
              },
              "archive": { type: "dir", children: {} }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output, fs) => {
      return fs.exists("/home/user/archive/old-project") && !fs.exists("/home/user/old-project");
    }
  },
  {
    title: "Rename a Directory",
    description: "You can also use mv to rename directories. Rename 'temp' to 'data'.",
    interactive: true,
    expectedCommand: ["mv temp data"],
    hint: "Use mv with the old directory name and the new name",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "temp": {
                type: "dir",
                children: {
                  "results.csv": { type: "file", content: "name,score\nAlice,95\nBob,87" }
                }
              }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output, fs) => {
      return fs.exists("/home/user/data") && fs.isDirectory("/home/user/data") && !fs.exists("/home/user/temp");
    }
  }
];

export default copying;
