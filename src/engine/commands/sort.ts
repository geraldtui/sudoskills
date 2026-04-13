import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';

export function sort(
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

    const numeric = parsed.flags.n || false;
    const reverse = parsed.flags.r || false;

    lines.sort((a, b) => {
      if (numeric) {
        return parseFloat(a) - parseFloat(b);
      }
      return a.localeCompare(b);
    });

    if (reverse) {
      lines.reverse();
    }

    return {
      output: lines.join('\n'),
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
