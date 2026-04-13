import { StepData } from '@/types';

const textprocessing: StepData[] = [
  {
    title: "Introduction to Text Processing",
    description: "Linux excels at processing text. In this lesson, you'll learn commands to sort, deduplicate, and extract columns from data — the bread and butter of log analysis.",
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
              "scores.csv": { type: "file", content: "Alice,95\nBob,87\nCharlie,92\nDave,78" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user"
  },
  {
    title: "Sort Lines Alphabetically",
    description: "The 'sort' command sorts lines of text. Sort the contents of 'names.txt' alphabetically.",
    interactive: true,
    expectedCommand: ["sort names.txt"],
    hint: "Use the sort command followed by the filename",
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
      return lines[0] === 'Alice' && lines[1] === 'Bob';
    }
  },
  {
    title: "Sort in Reverse",
    description: "Use the -r flag to sort in reverse (descending) order. Sort 'names.txt' from Z to A.",
    interactive: true,
    expectedCommand: ["sort -r names.txt"],
    hint: "Use the -r flag with sort to reverse the order",
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
      return lines[0] === 'Dave' && cmd.includes("-r");
    }
  },
  {
    title: "Sort Numbers",
    description: "By default, sort treats everything as text (so '9' comes after '10'). Use the -n flag for numeric sorting. Sort 'numbers.txt' numerically.",
    interactive: true,
    expectedCommand: ["sort -n numbers.txt"],
    hint: "Use the -n flag with sort for numeric ordering",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "numbers.txt": { type: "file", content: "10\n2\n30\n1\n15" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      const lines = output.split('\n');
      return lines[0] === '1' && lines[1] === '2' && cmd.includes("-n");
    }
  },
  {
    title: "Remove Duplicates with uniq",
    description: "The 'uniq' command removes consecutive duplicate lines. The file 'visitors.txt' has been pre-sorted. Use uniq to remove the duplicates.",
    interactive: true,
    expectedCommand: ["uniq visitors.txt"],
    hint: "Use the uniq command on the sorted file",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "visitors.txt": { type: "file", content: "Alice\nAlice\nBob\nBob\nBob\nCharlie\nDave\nDave" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      const lines = output.split('\n').filter(l => l);
      return lines.length === 4 && lines[0] === 'Alice';
    }
  },
  {
    title: "Count Occurrences with uniq -c",
    description: "The -c flag shows how many times each line appeared. Count how many times each visitor appears in 'visitors.txt'.",
    interactive: true,
    expectedCommand: ["uniq -c visitors.txt"],
    hint: "Use uniq with the -c flag to count occurrences",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "visitors.txt": { type: "file", content: "Alice\nAlice\nBob\nBob\nBob\nCharlie\nDave\nDave" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes("-c") && output.includes("3") && output.includes("Bob");
    }
  },
  {
    title: "Extract Columns with cut",
    description: "The 'cut' command extracts specific columns from text. The file 'scores.csv' uses commas as delimiters. Extract just the names (field 1).",
    interactive: true,
    expectedCommand: ["cut -d, -f1 scores.csv", "cut -d , -f 1 scores.csv", "cut -d',' -f1 scores.csv"],
    hint: "Use cut with -d to set the delimiter (comma) and -f to pick the field number",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "scores.csv": { type: "file", content: "Alice,95\nBob,87\nCharlie,92\nDave,78" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes("cut") && output.includes("Alice") && !output.includes("95");
    }
  },
  {
    title: "Count Lines with wc -l",
    description: "Use 'wc -l' to quickly count how many entries are in 'scores.csv'.",
    interactive: true,
    expectedCommand: ["wc -l scores.csv"],
    hint: "Use wc with the -l flag to count lines",
    initialFS: {
      "home": {
        type: "dir",
        children: {
          "user": {
            type: "dir",
            children: {
              "scores.csv": { type: "file", content: "Alice,95\nBob,87\nCharlie,92\nDave,78" }
            }
          }
        }
      }
    },
    initialCwd: "/home/user",
    customValidate: (cmd, output) => {
      return cmd.includes("wc") && cmd.includes("-l") && output.includes("4");
    }
  }
];

export default textprocessing;
