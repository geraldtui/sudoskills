import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';

export function tee(
  parsed: ParsedCommand,
  fs: VirtualFilesystem
): ExecutionResult {
  try {
    const input = parsed.stdin || '';

    if (parsed.args.length > 0) {
      const filePath = parsed.args[0];
      const append = parsed.flags.a || false;
      fs.writeFile(filePath, input + '\n', append);
    }

    return {
      output: input,
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
