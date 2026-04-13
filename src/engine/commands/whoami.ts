import { ExecutionResult, ParsedCommand } from '@/types';
import { getCurrentUser } from '../userTable';

export function whoami(
  _parsed: ParsedCommand,
): ExecutionResult {
  const user = getCurrentUser();
  return {
    output: user.username,
    exitCode: 0
  };
}
