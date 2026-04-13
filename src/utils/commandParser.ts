import { ParsedCommand } from '@/types';

const OPTION_STYLE_COMMANDS: Record<string, Set<string>> = {
  find: new Set(['-name', '-type']),
};

export function parseCommand(input: string): ParsedCommand {
  const raw = input.trim();
  
  if (!raw) {
    return {
      command: '',
      flags: {},
      args: [],
      raw: ''
    };
  }

  const tokens = tokenize(raw);
  
  if (tokens.length === 0) {
    return {
      command: '',
      flags: {},
      args: [],
      raw
    };
  }

  const command = tokens[0];
  const flags: Record<string, boolean> = {};
  const args: string[] = [];
  let redirect: { type: '>' | '>>'; target: string } | undefined;
  const optionArgs = OPTION_STYLE_COMMANDS[command];

  let i = 1;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token === '>' || token === '>>') {
      if (i + 1 < tokens.length) {
        redirect = {
          type: token as '>' | '>>',
          target: tokens[i + 1]
        };
        i += 2;
      } else {
        i++;
      }
    } else if (optionArgs?.has(token) && i + 1 < tokens.length) {
      args.push(token, tokens[i + 1]);
      i += 2;
    } else if (token.startsWith('-') && token.length > 1 && !token.startsWith('--')) {
      const flagChars = token.slice(1).split('');
      flagChars.forEach(char => {
        flags[char] = true;
      });
      i++;
    } else {
      args.push(token);
      i++;
    }
  }

  return {
    command,
    flags,
    args,
    raw,
    redirect
  };
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
    } else if (char === ' ' && !inQuotes) {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

export function parsePipeline(input: string): ParsedCommand[] {
  const segments = input.split('|').map(s => s.trim()).filter(Boolean);
  return segments.map(parseCommand);
}

export function hasPipe(input: string): boolean {
  let inQuotes = false;
  let quoteChar = '';
  for (const char of input) {
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
    } else if (char === '|' && !inQuotes) {
      return true;
    }
  }
  return false;
}

export function normalizeCommand(cmd: string): string {
  const parsed = parseCommand(cmd);
  const flagStr = Object.keys(parsed.flags).sort().join('');
  const flags = flagStr ? `-${flagStr}` : '';
  const args = parsed.args.join(' ');
  
  return [parsed.command, flags, args].filter(Boolean).join(' ').trim();
}
