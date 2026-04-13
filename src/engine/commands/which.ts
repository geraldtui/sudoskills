import { ExecutionResult, ParsedCommand } from '@/types';

const KNOWN_COMMANDS: Record<string, string> = {
  pwd: '/usr/bin/pwd',
  ls: '/usr/bin/ls',
  cd: '/usr/bin/cd',
  mkdir: '/usr/bin/mkdir',
  touch: '/usr/bin/touch',
  cat: '/usr/bin/cat',
  echo: '/usr/bin/echo',
  rm: '/usr/bin/rm',
  cp: '/usr/bin/cp',
  mv: '/usr/bin/mv',
  head: '/usr/bin/head',
  tail: '/usr/bin/tail',
  wc: '/usr/bin/wc',
  grep: '/usr/bin/grep',
  find: '/usr/bin/find',
  chmod: '/usr/bin/chmod',
  chown: '/usr/bin/chown',
  sort: '/usr/bin/sort',
  uniq: '/usr/bin/uniq',
  cut: '/usr/bin/cut',
  tee: '/usr/bin/tee',
  ps: '/usr/bin/ps',
  kill: '/usr/bin/kill',
  whoami: '/usr/bin/whoami',
  id: '/usr/bin/id',
  sudo: '/usr/bin/sudo',
  man: '/usr/bin/man',
  clear: '/usr/bin/clear',
};

export function which(
  parsed: ParsedCommand,
): ExecutionResult {
  if (parsed.args.length === 0) {
    return {
      output: '',
      error: 'which: missing operand',
      exitCode: 1
    };
  }

  const cmd = parsed.args[0];
  const path = KNOWN_COMMANDS[cmd];

  if (path) {
    return { output: path, exitCode: 0 };
  }

  return {
    output: '',
    error: `which: no ${cmd} in (/usr/bin)`,
    exitCode: 1
  };
}
