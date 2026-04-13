import { useState, useEffect } from 'react';
import { useTerminalContext } from '@/context/InteractiveTerminalContext';
import { InteractiveTerminal } from './InteractiveTerminal';
import { EnterIcon } from './EnterIcon';

export function Step() {
  const { lessonData, step, nextStep, success } = useTerminalContext();
  const currentStep = lessonData[step];
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setShowHint(false);
  }, [step]);

  if (!currentStep) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-terminal-muted">
        <p role="status">Loading…</p>
      </div>
    );
  }

  const isIntroStep = !currentStep.interactive;

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
      <aside className="lg:w-1/3 space-y-4">
        <div className="bg-terminal-surface rounded-lg p-6 border border-terminal-surface">
          <div className="text-sm text-terminal-prompt font-semibold mb-2">
            Step {step + 1} of {lessonData.length}
          </div>
          <h2 className="text-2xl font-bold mb-4">{currentStep.title}</h2>
          <p className="text-terminal-muted leading-relaxed">
            {currentStep.description}
            {currentStep.interactive && (
              <span className="block mt-3 text-sm text-terminal-prompt/70">
                💡 Use <code className="px-1 py-0.5 bg-terminal-bg rounded text-terminal-prompt">man [command]</code> to view command usage.
              </span>
            )}
          </p>

          {isIntroStep && success && (
            <button
              type="button"
              onClick={nextStep}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-terminal-prompt hover:bg-terminal-prompt/90 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Start Lesson
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-white/20 rounded">
                Enter <EnterIcon />
              </kbd>
            </button>
          )}
        </div>

        {currentStep.hint && (
          <div className="bg-terminal-surface/50 rounded-lg p-4 border border-terminal-surface">
            {!showHint ? (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-sm text-terminal-prompt hover:text-terminal-text transition-colors font-medium"
              >
                💡 Show Hint
              </button>
            ) : (
              <div className="text-sm text-terminal-muted">
                <span className="font-semibold">💡 Hint:</span> {currentStep.hint}
              </div>
            )}
          </div>
        )}
      </aside>

      <main className="flex-1 min-h-[500px]">
        <InteractiveTerminal />
      </main>
    </div>
  );
}
