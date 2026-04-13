import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';

export function chown(
  parsed: ParsedCommand,
  fs: VirtualFilesystem
): ExecutionResult {
  try {
    if (parsed.args.length < 2) {
      return {
        output: '',
        error: 'chown: missing operand',
        exitCode: 1
      };
    }

    const ownerGroup = parsed.args[0];
    const path = parsed.args[1];

    const parts = ownerGroup.split(':');
    const owner = parts[0];
    const group = parts[1];

    fs.chown(path, owner, group);

    return { output: '', exitCode: 0 };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      exitCode: 1
    };
  }
}
