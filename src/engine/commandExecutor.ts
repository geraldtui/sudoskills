import { VirtualFilesystem } from './filesystem';
import { ParsedCommand, ExecutionResult } from '@/types';
import { parseCommand, hasPipe, parsePipeline } from '@/utils/commandParser';
import { commandRegistry } from './commands';

export function executeCommand(
  input: string,
  fs: VirtualFilesystem
): ExecutionResult {
  if (hasPipe(input)) {
    return executePipeline(input, fs);
  }

  const parsed = parseCommand(input);
  return executeSingleCommand(parsed, fs);
}

function executeSingleCommand(
  parsed: ParsedCommand,
  fs: VirtualFilesystem,
  stdin?: string
): ExecutionResult {
  if (!parsed.command) {
    return { output: '', exitCode: 0 };
  }

  const handler = commandRegistry[parsed.command];

  if (!handler) {
    return {
      output: '',
      error: `bash: ${parsed.command}: command not found`,
      exitCode: 127
    };
  }

  try {
    if (stdin !== undefined) {
      parsed.stdin = stdin;
    }
    return handler(parsed, fs);
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      exitCode: 1
    };
  }
}

function executePipeline(
  input: string,
  fs: VirtualFilesystem
): ExecutionResult {
  const segments = parsePipeline(input);

  let currentOutput = '';
  let lastResult: ExecutionResult = { output: '', exitCode: 0 };

  for (const parsed of segments) {
    parsed.stdin = currentOutput;
    lastResult = executeSingleCommand(parsed, fs, currentOutput);

    if (lastResult.error) {
      return lastResult;
    }

    currentOutput = lastResult.output;
  }

  return lastResult;
}
