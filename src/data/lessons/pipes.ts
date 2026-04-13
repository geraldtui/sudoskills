import { StepData } from '@/types';

const pipes: StepData[] = [
  {
    title: "Introduction to Pipes & Redirection",
    description: "Pipes are what make Linux truly powerful. The pipe operator '|' sends the output of one command as input to another, letting you chain commands together like building blocks.",
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
              "names.txt": { type: "file", content: "Charlie\nAlice\nBob\nAlice\nDave\nBob\nBob" },
              "access.log": { type: "file", content: "GET /index.html 200\nGET /about.html 200\nGET /index.html 404\nPOST /api/login 200\nGET /index.html 200\nGET /about.html 500" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user"
  },
  {
    title: "Your First Pipe",
    description: "Use a pipe to send the output of 'cat names.txt' into 'sort'. This sorts the file contents without creating a new file.",
    interactive: true,
    expectedCommand: ["cat names.txt | sort"],
    hint: "Use the | symbol between cat and sort",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "names.txt": { type: "file", content: "Charlie\nAlice\nBob\nDave" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      const lines = output.split('\n');
      return cmd.includes('|') && lines[0] === 'Alice';
    }
  },
  {
    title: "Chain Multiple Pipes",
    description: "You can chain multiple pipes. Sort the names and then remove duplicates by piping through both sort and uniq.",
    interactive: true,
    expectedCommand: ["cat names.txt | sort | uniq"],
    hint: "Chain three commands: cat | sort | uniq",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "names.txt": { type: "file", content: "Charlie\nAlice\nBob\nAlice\nDave\nBob\nBob" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      const lines = output.split('\n').filter(l => l);
      return cmd.includes('|') && lines.length === 4;
    }
  },
  {
    title: "Count with Pipes",
    description: "Find how many unique names are in the file by piping through sort, uniq, and wc -l.",
    interactive: true,
    expectedCommand: ["cat names.txt | sort | uniq | wc -l"],
    hint: "Add wc -l at the end of the pipe chain to count the unique lines",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "names.txt": { type: "file", content: "Charlie\nAlice\nBob\nAlice\nDave\nBob\nBob" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes('|') && cmd.includes('wc') && output.includes('4');
    }
  },
  {
    title: "Grep with Pipes",
    description: "Search the access log for all 200 status codes using grep piped from cat.",
    interactive: true,
    expectedCommand: ["cat access.log | grep 200", "grep 200 access.log"],
    hint: "Pipe the output of cat into grep to filter for '200'",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "access.log": { type: "file", content: "GET /index.html 200\nGET /about.html 200\nGET /index.html 404\nPOST /api/login 200\nGET /index.html 200\nGET /about.html 500" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return output.includes('200') && !output.includes('404') && !output.includes('500');
    }
  },
  {
    title: "Redirect Output to a File",
    description: "You already know '>' redirects output to a file. Combine it with a pipe: sort names.txt and save the sorted result to 'sorted-names.txt'.",
    interactive: true,
    expectedCommand: ["sort names.txt > sorted-names.txt", "cat names.txt | sort > sorted-names.txt"],
    hint: "Use sort with > to redirect the output into a new file",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "names.txt": { type: "file", content: "Charlie\nAlice\nBob\nDave" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output, fs) => {
      return fs.exists("/home/user/sorted-names.txt");
    }
  },
  {
    title: "Append with >>",
    description: "The '>>' operator appends to a file instead of overwriting it. Add a second name to 'sorted-names.txt' using echo and >>.",
    interactive: true,
    expectedCommand: ["echo Eve >> sorted-names.txt"],
    hint: "Use echo with >> to append to the file",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "sorted-names.txt": { type: "file", content: "Alice\nBob\nCharlie\nDave\n" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output, fs) => {
      const content = fs.cat("/home/user/sorted-names.txt");
      return cmd.includes('>>') && content.includes('Eve');
    }
  },
  {
    title: "Write to File and Screen with tee",
    description: "The 'tee' command writes to both a file AND the screen at the same time. Pipe 'echo hello' through tee to save it to 'greeting.txt' while also seeing the output.",
    interactive: true,
    expectedCommand: ["echo hello | tee greeting.txt"],
    hint: "Pipe echo into tee followed by the filename",
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
    customValidate: (cmd, output, fs) => {
      return cmd.includes('tee') && fs.exists("/home/user/greeting.txt") && output.includes('hello');
    }
  },
  {
    title: "Real-World Pipeline",
    description: "Let's build a real analysis pipeline: find all error lines in the access log, count them, and see the result. Use: grep 500 access.log | wc -l",
    interactive: true,
    expectedCommand: ["grep 500 access.log | wc -l", "cat access.log | grep 500 | wc -l"],
    hint: "Pipe grep output into wc -l to count the error lines",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "access.log": { type: "file", content: "GET /index.html 200\nGET /about.html 200\nGET /index.html 404\nPOST /api/login 500\nGET /index.html 200\nGET /about.html 500\nGET /contact.html 500" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes('|') && cmd.includes('wc') && output.includes('3');
    }
  }
];

export default pipes;
