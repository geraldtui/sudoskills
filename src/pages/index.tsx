import Head from 'next/head';
import { Header } from '@/components/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';

export default function Home() {
  return (
    <>
      <Head>
        <title>SudoSkills - Interactive Linux Terminal Lessons</title>
        <meta name="description" content="Master the Linux terminal through interactive, hands-on lessons directly in your browser. No installation required." />
      </Head>
      <div className="min-h-screen flex flex-col bg-terminal-bg">
        <Header />

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-4xl w-full">
            <Hero />
            <Features />
            <HowItWorks />
          </div>
        </main>
      </div>
    </>
  );
}
