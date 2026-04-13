import {
  useState,
  useEffect,
  useRef,
  FormEvent,
  KeyboardEvent,
} from 'react';
import { useTerminalContext } from '@/context/InteractiveTerminalContext';
import clsx from 'clsx';

export interface InteractiveTerminalProps {
  readOnly?: boolean;
  onCommandExecute?: (cmd: string) => void;
}

export function InteractiveTerminal({
  readOnly: readOnlyProp,
  onCommandExecute,
}: InteractiveTerminalProps = {}) {
  const {
    success,
    error,
    output,
    executeUserCommand,
    lessonData,
    step,
    filesystem,
  } = useTerminalContext();

  const [input, setInput] = useState('');
  const [historyCursor, setHistoryCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const commandsHistoryRef = useRef<string[]>([]);
  const skipHistoryCursorReset = useRef(false);

  const currentStep = lessonData[step];
  const isReadOnlyFromStep = !!currentStep?.readOnly;
  const isReadOnly =
    readOnlyProp === true ||
    (readOnlyProp === undefined && isReadOnlyFromStep);
  const isInteractive = currentStep?.interactive !== false;

  useEffect(() => {
    commandsHistoryRef.current = [];
    setHistoryCursor(-1);
    setInput('');
  }, [step]);

  useEffect(() => {
    if (inputRef.current && !isReadOnly && isInteractive) {
      inputRef.current.focus();
    }
  }, [step, isReadOnly, isInteractive]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, input]);

  const applyHistoryIndex = (nextIndex: number, nextInput: string) => {
    skipHistoryCursorReset.current = true;
    setHistoryCursor(nextIndex);
    setInput(nextInput);
  };

  const navigateHistory = (direction: 'up' | 'down') => {
    const history = commandsHistoryRef.current;
    if (history.length === 0) return;

    if (direction === 'up') {
      const nextIndex =
        historyCursor === -1
          ? history.length - 1
          : Math.max(0, historyCursor - 1);
      applyHistoryIndex(nextIndex, history[nextIndex]);
      return;
    }

    if (historyCursor === -1) return;

    const nextIndex = historyCursor + 1;
    if (nextIndex >= history.length) {
      skipHistoryCursorReset.current = true;
      setHistoryCursor(-1);
      setInput('');
    } else {
      applyHistoryIndex(nextIndex, history[nextIndex]);
    }
  };

  const handleInputChange = (value: string) => {
    if (!skipHistoryCursorReset.current) {
      setHistoryCursor(-1);
    }
    skipHistoryCursorReset.current = false;
    setInput(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (success || !isInteractive) return;
    if (!input.trim()) return;

    const cmd = input;
    commandsHistoryRef.current = [...commandsHistoryRef.current, cmd];
    executeUserCommand(cmd);
    onCommandExecute?.(cmd);
    setInput('');
    setHistoryCursor(-1);
  };

  const inputDisabled = success || isReadOnly;

  const handleOutputClick = () => {
    if (inputRef.current && !inputDisabled && isInteractive) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="bg-terminal-bg border border-terminal-surface rounded-lg overflow-hidden h-full flex flex-col">
      <div className="bg-terminal-surface px-4 py-2 border-b border-terminal-surface flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" aria-hidden />
        <div className="w-3 h-3 rounded-full bg-yellow-500" aria-hidden />
        <div className="w-3 h-3 rounded-full bg-green-500" aria-hidden />
        <span className="ml-2 text-sm text-terminal-muted">
          {filesystem?.pwd() || '/home/user'}
        </span>
      </div>

      <div
        ref={outputRef}
        role="log"
        aria-label="Terminal output"
        aria-live="polite"
        aria-relevant="additions"
        onClick={handleOutputClick}
        className="flex-1 p-4 font-mono text-sm overflow-y-auto min-h-0 cursor-text relative"
      >
        {output.map((line, index) => (
          <div
            key={index}
            className={clsx(
              line.startsWith('$') && 'text-terminal-prompt',
              line.includes('error') && 'text-terminal-error',
              !line.startsWith('$') &&
                !line.includes('error') &&
                'text-terminal-text'
            )}
          >
            {line || '\u00A0'}
          </div>
        ))}

        {isInteractive && !inputDisabled && (
          <div className="flex items-center gap-1">
            <span className="text-terminal-prompt font-mono">$</span>
            <div className="relative flex items-center">
              {!input && (
                <span className="inline-block w-2 h-4 bg-terminal-text animate-blink" />
              )}
              <span className="text-terminal-text font-mono whitespace-pre">{input}</span>
              {input && (
                <span className="inline-block w-2 h-4 bg-terminal-text animate-blink" />
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="absolute opacity-0 pointer-events-none">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={inputDisabled}
            autoComplete="off"
            aria-label="Terminal command input"
            tabIndex={-1}
          />
        </form>
      </div>

      {error && !success && (
        <div className="px-4 py-2 bg-terminal-error/10 border-t border-terminal-error/20">
          <p className="text-terminal-error text-sm">{error}</p>
          {currentStep?.hint && (
            <p className="text-terminal-muted text-sm mt-1">
              💡 Hint: {currentStep.hint}
            </p>
          )}
        </div>
      )}

      {success && isInteractive && (
        <div className="px-4 py-2 bg-terminal-success/10 border-t border-terminal-success/20">
          <p className="text-terminal-success text-sm">
            ✓ Correct! Press Enter or click Next to continue.
          </p>
        </div>
      )}
    </div>
  );
}
