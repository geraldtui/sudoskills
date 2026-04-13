import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';
import { parseCommand } from '@/utils/commandParser';
import { commandRegistry } from './index';
import { setIsSudo } from '../userTable';

export function sudo(
  parsed: ParsedCommand,
  fs: VirtualFilesystem
): ExecutionResult {
  if (parsed.args.length === 0) {
    return {
      output: '',
      error: 'sudo: missing command',
      exitCode: 1
    };
  }

  const innerInput = parsed.args.join(' ');
  const innerParsed = parseCommand(innerInput);

  const handler = commandRegistry[innerParsed.command];

  if (!handler) {
    return {
      output: '',
      error: `sudo: ${innerParsed.command}: command not found`,
      exitCode: 127
    };
  }

  setIsSudo(true);
  try {
    return handler(innerParsed, fs);
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      exitCode: 1
    };
  } finally {
    setIsSudo(false);
  }
}
