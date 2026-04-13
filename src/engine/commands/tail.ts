import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';

const DEFAULT_LINES = 10;

export function tail(
  parsed: ParsedCommand,
  fs: VirtualFilesystem
): ExecutionResult {
  try {
    if (parsed.args.length === 0) {
      return {
        output: '',
        error: 'tail: missing file operand',
        exitCode: 1
      };
    }

    const lineCount = parsed.flags.n ? parseInt(parsed.args[0], 10) : DEFAULT_LINES;
    const filePath = parsed.flags.n ? parsed.args[1] : parsed.args[0];

    if (!filePath) {
      return {
        output: '',
        error: 'tail: missing file operand',
        exitCode: 1
      };
    }

    const lines = fs.readLines(filePath);
    const result = lines.slice(-lineCount);

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
