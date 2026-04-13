import { GetStaticProps, GetStaticPaths } from 'next';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Step } from '@/components/Step';
import { LearnProgress } from '@/components/LearnProgress';
import { LearnFooter } from '@/components/LearnFooter';
import { InteractiveTerminalProvider } from '@/context/InteractiveTerminalContext';
import { StepData, LessonMeta } from '@/types';
import lessons from '@/data/lessons/index.json';

interface Props {
  lesson: LessonMeta;
  lessonData: StepData[];
}

export default function LessonPage({ lesson }: Props) {
  const [lessonData, setLessonData] = useState<StepData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function loadLessonData() {
      const lessonModule = await import(`@/data/lessons/${lesson.key}`);
      setLessonData(lessonModule.default);
      setLoading(false);
    }
    loadLessonData();
  }, [lesson.key]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-terminal-muted">Loading lesson...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <InteractiveTerminalProvider lessonData={lessonData} lessonKey={lesson.key}>
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0">
          <LearnProgress />
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <Step />
            <LearnFooter />
          </div>
        </div>
      </InteractiveTerminalProvider>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lessonSlug = params?.lesson as string;
  const lesson = lessons.find((l: LessonMeta) => l.slug === lessonSlug);

  if (!lesson) {
    return { notFound: true };
  }

  return {
    props: {
      lesson,
      lessonData: []
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = lessons.map((lesson: LessonMeta) => ({
    params: {
      lesson: lesson.slug
    }
  }));

  return {
    paths,
    fallback: false
  };
};
