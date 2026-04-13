import { ExecutionResult, ParsedCommand } from '@/types';
import { listProcesses } from '../processTable';

export function ps(
  parsed: ParsedCommand,
): ExecutionResult {
  const processes = listProcesses();
  const isAux = parsed.args.includes('aux') || (parsed.flags.a && parsed.flags.u && parsed.flags.x);

  if (isAux) {
    const header = 'USER         PID %CPU %MEM STAT COMMAND';
    const rows = processes.map(p =>
      `${p.user.padEnd(12)} ${String(p.pid).padStart(4)} ${p.cpu.padStart(4)} ${p.mem.padStart(4)} ${p.state.padEnd(4)} ${p.command}`
    );
    return {
      output: [header, ...rows].join('\n'),
      exitCode: 0
    };
  }

  const header = '  PID TTY          TIME CMD';
  const userProcesses = processes.filter(p => p.user === 'user');
  const rows = userProcesses.map(p =>
    `${String(p.pid).padStart(5)} pts/0    00:00:00 ${p.command}`
  );

  return {
    output: [header, ...rows].join('\n'),
    exitCode: 0
  };
}
