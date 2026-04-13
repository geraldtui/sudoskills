import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';

export function find(
  parsed: ParsedCommand,
  fs: VirtualFilesystem
): ExecutionResult {
  try {
    const startPath = parsed.args[0] || '.';
    const options: { name?: string; type?: 'f' | 'd' } = {};

    for (let i = 1; i < parsed.args.length; i++) {
      if (parsed.args[i] === '-name' && i + 1 < parsed.args.length) {
        options.name = parsed.args[++i];
      } else if (parsed.args[i] === '-type' && i + 1 < parsed.args.length) {
        options.type = parsed.args[++i] as 'f' | 'd';
      }
    }

    const results = fs.findNodes(startPath, options);

    return {
      output: results.join('\n'),
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
