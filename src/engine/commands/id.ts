import { ExecutionResult, ParsedCommand } from '@/types';
import { getCurrentUser } from '../userTable';

export function id(
  _parsed: ParsedCommand,
): ExecutionResult {
  const user = getCurrentUser();
  const GID_MAP: Record<string, number> = { user: 1000, sudo: 27 };
  const groupList = user.groups.map(g => `${GID_MAP[g] ?? user.gid}(${g})`).join(',');
  return {
    output: `uid=${user.uid}(${user.username}) gid=${user.gid}(${user.groups[0]}) groups=${groupList}`,
    exitCode: 0
  };
}
