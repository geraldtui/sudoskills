import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';

export function wc(
  parsed: ParsedCommand,
  fs: VirtualFilesystem
): ExecutionResult {
  try {
    if (parsed.args.length === 0) {
      return {
        output: '',
        error: 'wc: missing file operand',
        exitCode: 1
      };
    }

    const filePath = parsed.args[0];
    const content = fs.cat(filePath);
    const lines = content === '' ? 0 : content.split('\n').length;
    const words = content === '' ? 0 : content.trim().split(/\s+/).length;
    const chars = content.length;

    if (parsed.flags.l) {
      return { output: `${lines} ${filePath}`, exitCode: 0 };
    }
    if (parsed.flags.w) {
      return { output: `${words} ${filePath}`, exitCode: 0 };
    }
    if (parsed.flags.c) {
      return { output: `${chars} ${filePath}`, exitCode: 0 };
    }

    return {
      output: `  ${lines}  ${words} ${chars} ${filePath}`,
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
