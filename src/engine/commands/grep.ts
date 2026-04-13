import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';

export function grep(
  parsed: ParsedCommand,
  fs: VirtualFilesystem
): ExecutionResult {
  try {
    if (parsed.args.length < 1) {
      return {
        output: '',
        error: 'grep: missing pattern or file operand',
        exitCode: 1
      };
    }

    const pattern = parsed.args[0];
    const caseInsensitive = parsed.flags.i || false;
    const showLineNumbers = parsed.flags.n || false;
    const countOnly = parsed.flags.c || false;

    const lines = parsed.args.length >= 2
      ? fs.readLines(parsed.args[1])
      : (parsed.stdin || '').split('\n');
    const flags = caseInsensitive ? 'i' : '';
    const regex = new RegExp(pattern, flags);

    const matches: string[] = [];
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        if (showLineNumbers) {
          matches.push(`${index + 1}:${line}`);
        } else {
          matches.push(line);
        }
      }
    });

    if (countOnly) {
      return { output: String(matches.length), exitCode: 0 };
    }

    if (matches.length === 0) {
      return { output: '', exitCode: 1 };
    }

    return {
      output: matches.join('\n'),
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
