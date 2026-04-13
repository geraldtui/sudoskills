import { ExecutionResult, ParsedCommand } from '@/types';
import { killProcess } from '../processTable';

export function kill(
  parsed: ParsedCommand,
): ExecutionResult {
  if (parsed.args.length === 0) {
    return {
      output: '',
      error: 'kill: missing operand',
      exitCode: 1
    };
  }

  const pidArg = parsed.args[parsed.args.length - 1];
  const pid = parseInt(pidArg, 10);

  if (isNaN(pid)) {
    return {
      output: '',
      error: `kill: (${pidArg}): arguments must be process or job IDs`,
      exitCode: 1
    };
  }

  const success = killProcess(pid);

  if (!success) {
    return {
      output: '',
      error: `kill: (${pid}): No such process`,
      exitCode: 1
    };
  }

  return { output: '', exitCode: 0 };
}
