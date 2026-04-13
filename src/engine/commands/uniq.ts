import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';

export function uniq(
  parsed: ParsedCommand,
  fs: VirtualFilesystem
): ExecutionResult {
  try {
    let lines: string[];

    if (parsed.stdin !== undefined && parsed.stdin !== '') {
      lines = parsed.stdin.split('\n');
    } else if (parsed.args.length > 0) {
      lines = fs.readLines(parsed.args[0]);
    } else {
      return { output: '', exitCode: 0 };
    }

    const showCount = parsed.flags.c || false;
    const result: string[] = [];
    let count = 1;

    for (let i = 1; i <= lines.length; i++) {
      if (i < lines.length && lines[i] === lines[i - 1]) {
        count++;
      } else {
        if (showCount) {
          result.push(`      ${count} ${lines[i - 1]}`);
        } else {
          result.push(lines[i - 1]);
        }
        count = 1;
      }
    }

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
