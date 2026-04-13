import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';

export function cut(
  parsed: ParsedCommand,
  fs: VirtualFilesystem
): ExecutionResult {
  try {
    let delimiter = '\t';
    let fields: number[] = [];
    let inputLines: string[];

    const fileArgs: string[] = [];

    for (let i = 0; i < parsed.args.length; i++) {
      if (parsed.args[i] === '-d' && i + 1 < parsed.args.length) {
        delimiter = parsed.args[++i];
      } else if (parsed.args[i].startsWith('-d')) {
        delimiter = parsed.args[i].slice(2);
      } else if (parsed.args[i] === '-f' && i + 1 < parsed.args.length) {
        fields = parseFields(parsed.args[++i]);
      } else if (parsed.args[i].startsWith('-f')) {
        fields = parseFields(parsed.args[i].slice(2));
      } else {
        fileArgs.push(parsed.args[i]);
      }
    }

    if (parsed.stdin !== undefined && parsed.stdin !== '') {
      inputLines = parsed.stdin.split('\n');
    } else if (fileArgs.length > 0) {
      inputLines = fs.readLines(fileArgs[0]);
    } else {
      return { output: '', exitCode: 0 };
    }

    if (fields.length === 0) {
      return {
        output: '',
        error: 'cut: you must specify a list of fields',
        exitCode: 1
      };
    }

    const result = inputLines.map(line => {
      const parts = line.split(delimiter);
      return fields.map(f => parts[f - 1] || '').join(delimiter);
    });

    return {
      output: result.join('\n'),
      exitCode: 0
    };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      exitCode: 1
    };
  }
}

function parseFields(spec: string): number[] {
  const fields: number[] = [];
  for (const part of spec.split(',')) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        fields.push(i);
      }
    } else {
      fields.push(parseInt(part, 10));
    }
  }
  return fields;
}
