import { StepData } from '@/types';

const viewing: StepData[] = [
  {
    title: "Introduction to Viewing Files",
    description: "You already know 'cat' for viewing files. But what about large files? In this lesson, you'll learn commands to peek at parts of a file without opening the whole thing.",
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
              "server.log": { type: "file", content: "2026-01-01 INFO Server started\n2026-01-01 INFO Listening on port 8080\n2026-01-02 WARN High memory usage\n2026-01-02 ERROR Connection timeout\n2026-01-03 INFO Request from 192.168.1.1\n2026-01-03 INFO Request from 10.0.0.5\n2026-01-03 WARN Slow query detected\n2026-01-04 ERROR Disk space low\n2026-01-04 INFO Backup completed\n2026-01-05 INFO Server restarted\n2026-01-05 INFO All services healthy\n2026-01-05 WARN Certificate expiring soon" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user"
  },
  {
    title: "View the First Lines with head",
    description: "The 'head' command shows the first 10 lines of a file by default. Use it to see the beginning of 'server.log'.",
    interactive: true,
    expectedCommand: ["head server.log"],
    hint: "Use the head command followed by the filename",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "server.log": { type: "file", content: "2026-01-01 INFO Server started\n2026-01-01 INFO Listening on port 8080\n2026-01-02 WARN High memory usage\n2026-01-02 ERROR Connection timeout\n2026-01-03 INFO Request from 192.168.1.1\n2026-01-03 INFO Request from 10.0.0.5\n2026-01-03 WARN Slow query detected\n2026-01-04 ERROR Disk space low\n2026-01-04 INFO Backup completed\n2026-01-05 INFO Server restarted\n2026-01-05 INFO All services healthy\n2026-01-05 WARN Certificate expiring soon" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return output.includes("Server started") && output.includes("Listening on port");
    }
  },
  {
    title: "View a Specific Number of Lines",
    description: "You can specify how many lines to show with the -n flag. Show only the first 3 lines of 'server.log'.",
    interactive: true,
    expectedCommand: ["head -n 3 server.log"],
    hint: "Use head with -n followed by the number of lines",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "server.log": { type: "file", content: "2026-01-01 INFO Server started\n2026-01-01 INFO Listening on port 8080\n2026-01-02 WARN High memory usage\n2026-01-02 ERROR Connection timeout\n2026-01-03 INFO Request from 192.168.1.1" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd) => {
      return cmd.includes("head") && cmd.includes("-n") && cmd.includes("3");
    }
  },
  {
    title: "View the Last Lines with tail",
    description: "The 'tail' command shows the last 10 lines. It's perfect for checking the most recent entries in a log file. Show the end of 'server.log'.",
    interactive: true,
    expectedCommand: ["tail server.log"],
    hint: "Use the tail command followed by the filename",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "server.log": { type: "file", content: "2026-01-01 INFO Server started\n2026-01-01 INFO Listening on port 8080\n2026-01-02 WARN High memory usage\n2026-01-02 ERROR Connection timeout\n2026-01-03 INFO Request from 192.168.1.1\n2026-01-03 INFO Request from 10.0.0.5\n2026-01-03 WARN Slow query detected\n2026-01-04 ERROR Disk space low\n2026-01-04 INFO Backup completed\n2026-01-05 INFO Server restarted\n2026-01-05 INFO All services healthy\n2026-01-05 WARN Certificate expiring soon" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return output.includes("Certificate expiring soon");
    }
  },
  {
    title: "View the Last N Lines",
    description: "Show only the last 2 lines of 'server.log' using tail with the -n flag.",
    interactive: true,
    expectedCommand: ["tail -n 2 server.log"],
    hint: "Use tail with -n followed by the number of lines",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "server.log": { type: "file", content: "2026-01-01 INFO Server started\n2026-01-01 INFO Listening on port 8080\n2026-01-02 WARN High memory usage\n2026-01-05 INFO All services healthy\n2026-01-05 WARN Certificate expiring soon" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd) => {
      return cmd.includes("tail") && cmd.includes("-n") && cmd.includes("2");
    }
  },
  {
    title: "Count Lines with wc",
    description: "The 'wc' (word count) command counts lines, words, and characters. Use 'wc -l' to count how many lines are in 'server.log'.",
    interactive: true,
    expectedCommand: ["wc -l server.log"],
    hint: "Use wc with the -l flag to count lines only",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "server.log": { type: "file", content: "2026-01-01 INFO Server started\n2026-01-01 INFO Listening on port 8080\n2026-01-02 WARN High memory usage\n2026-01-02 ERROR Connection timeout\n2026-01-03 INFO Request from 192.168.1.1" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes("wc") && cmd.includes("-l") && output.includes("5");
    }
  },
  {
    title: "Full Word Count",
    description: "Without any flags, 'wc' shows lines, words, and characters all at once. Try running 'wc' on 'message.txt'.",
    interactive: true,
    expectedCommand: ["wc message.txt"],
    hint: "Use wc without any flags to see all counts",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "message.txt": { type: "file", content: "Hello World\nThis is a test file\nWith three lines" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes("wc") && output.includes("message.txt");
    }
  }
];

export default viewing;
