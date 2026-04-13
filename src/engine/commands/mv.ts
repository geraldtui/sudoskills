import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';

export function mv(
  parsed: ParsedCommand,
  fs: VirtualFilesystem
): ExecutionResult {
  try {
    if (parsed.args.length < 2) {
      return {
        output: '',
        error: 'mv: missing file operand',
        exitCode: 1
      };
    }

    const src = parsed.args[0];
    const dest = parsed.args[1];

    fs.mv(src, dest);

    return { output: '', exitCode: 0 };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      exitCode: 1
    };
  }
}
