import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';

export function chmod(
  parsed: ParsedCommand,
  fs: VirtualFilesystem
): ExecutionResult {
  try {
    if (parsed.args.length < 2) {
      return {
        output: '',
        error: 'chmod: missing operand',
        exitCode: 1
      };
    }

    const mode = parsed.args[0];
    const path = parsed.args[1];

    fs.chmod(path, mode);

    return { output: '', exitCode: 0 };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      exitCode: 1
    };
  }
}
