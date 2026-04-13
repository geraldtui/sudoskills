import { useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import confetti from 'canvas-confetti';
import lessons from '@/data/lessons/index.json';
import { LessonMeta } from '@/types';
import { EnterIcon } from './EnterIcon';

interface LessonCompleteModalProps {
  lessonKey: string;
  onClose: () => void;
}

export function LessonCompleteModal({ lessonKey, onClose }: LessonCompleteModalProps) {
  const router = useRouter();
  const navigatingRef = useRef(false);

  const nextLesson = useMemo(() => {
    const currentIndex = (lessons as LessonMeta[]).findIndex(l => l.key === lessonKey);
    if (currentIndex === -1 || currentIndex >= lessons.length - 1) return null;
    return (lessons as LessonMeta[])[currentIndex + 1];
  }, [lessonKey]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && nextLesson && !navigatingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      navigatingRef.current = true;
      router.push(`/learn/${nextLesson.slug}`);
    }
  }, [onClose, nextLesson, router]);

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 },
    });

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      (confetti as unknown as { reset: () => void }).reset();
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Lesson complete"
    >
      <div className="bg-terminal-surface border border-terminal-prompt/30 rounded-2xl p-10 max-w-md w-full mx-4 text-center shadow-2xl">
        <div className="text-5xl mb-4">🎉</div>

        <h2 className="text-2xl font-bold text-terminal-text mb-3">
          Lesson Complete!
        </h2>

        <p className="text-terminal-muted mb-8">
          {nextLesson
            ? "Great work! You\u2019ve successfully completed this lesson. Keep the momentum going!"
            : "Congratulations! You\u2019ve completed all available lessons. Well done!"}
        </p>

        <div className="flex flex-col gap-3">
          {nextLesson && (
            <Link
              href={`/learn/${nextLesson.slug}`}
              className="flex items-center justify-center gap-2 w-full bg-terminal-success hover:bg-terminal-success/90 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              <span>Next Lesson: {nextLesson.title}</span>
              <kbd className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-white/20 rounded">
                Enter <EnterIcon size={14} />
              </kbd>
            </Link>
          )}

          <Link
            href="/learn"
            className={`block w-full font-semibold py-3 px-6 rounded-lg transition-all ${
              nextLesson
                ? 'bg-terminal-surface border border-terminal-prompt/30 text-terminal-text hover:bg-terminal-prompt/10'
                : 'bg-terminal-prompt hover:bg-terminal-prompt/90 text-white'
            }`}
          >
            Browse All Lessons
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-terminal-muted hover:text-terminal-text py-2 px-6 rounded-lg transition-all text-sm"
          >
            Stay on this lesson
          </button>
        </div>
      </div>
    </div>
  );
}
