import Link from 'next/link';
import { Header } from '@/components/Header';
import { LessonMeta } from '@/types';
import { getAllProgress } from '@/utils/storage';
import { useEffect, useState } from 'react';
import lessons from '@/data/lessons/index.json';

export default function LearnIndex() {
  const [progress, setProgress] = useState<Record<string, any>>({});

  useEffect(() => {
    setProgress(getAllProgress());
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <h1 className="text-4xl font-bold mb-4">Learn Linux Commands</h1>
        <p className="text-terminal-muted mb-12">
          Master the terminal through interactive, hands-on lessons
        </p>

        <div className="space-y-4">
          {lessons.map((lesson: LessonMeta) => {
            const lessonProgress = progress[lesson.key];
            const completed = lessonProgress?.lastStep === lesson.stepCount - 1;
            const inProgress = lessonProgress && !completed;

            return (
              <Link
                key={lesson.key}
                href={`/learn/${lesson.slug}`}
                className="block bg-terminal-surface border border-terminal-surface rounded-lg p-6 hover:border-terminal-prompt transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                    <p className="text-terminal-muted mb-4">{lesson.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-terminal-muted">
                        {lesson.stepCount} steps
                      </span>
                      
                      {lessonProgress && (
                        <span className="text-terminal-prompt">
                          {lessonProgress.lastStep + 1} / {lesson.stepCount} completed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {completed && (
                      <span className="bg-terminal-success/20 text-terminal-success px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Completed
                      </span>
                    )}
                    {inProgress && (
                      <span className="bg-terminal-prompt/20 text-terminal-prompt px-3 py-1 rounded-full text-sm font-medium">
                        In Progress
                      </span>
                    )}
                    <span className="text-terminal-prompt font-medium">
                      {inProgress ? 'Continue →' : 'Start →'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
