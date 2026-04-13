import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VirtualFilesystem } from '@/engine/filesystem';
import { checkCommand } from '@/utils/checkCommand';
import { loadProgress, saveProgress } from '@/utils/storage';
import { StepData } from '@/types';

interface TerminalContextState {
  step: number;
  lastStep: number;
  success: boolean;
  error: string | null;
  lockError: boolean;
  output: string[];
  filesystem: VirtualFilesystem | null;
  lessonData: StepData[];
  lessonKey: string;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  executeUserCommand: (cmd: string) => void;
  resetLesson: () => void;
}

const TerminalContext = createContext<TerminalContextState | undefined>(undefined);

export function useTerminalContext() {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminalContext must be used within InteractiveTerminalProvider');
  }
  return context;
}

interface Props {
  children: React.ReactNode;
  lessonData: StepData[];
  lessonKey: string;
}

export function InteractiveTerminalProvider({ children, lessonData, lessonKey }: Props) {
  const [step, setStepState] = useState(0);
  const [lastStep, setLastStep] = useState(-1);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockError, setLockError] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [filesystem, setFilesystem] = useState<VirtualFilesystem | null>(null);

  const initializeFilesystem = useCallback((stepIndex: number) => {
    const stepData = lessonData[stepIndex];
    const fs = new VirtualFilesystem(stepData.initialFS, stepData.initialCwd);
    setFilesystem(fs);
    setOutput([]);
    setSuccess(stepData.interactive === false);
    setError(null);
  }, [lessonData]);

  useEffect(() => {
    const saved = loadProgress(lessonKey);
    if (saved) {
      setStepState(saved.currentStep);
      setLastStep(saved.lastStep);
    }
    
    initializeFilesystem(saved?.currentStep || 0);
  }, [lessonKey, initializeFilesystem]);

  useEffect(() => {
    if (success && step > lastStep) {
      const newLastStep = step;
      setLastStep(newLastStep);
      saveProgress(lessonKey, {
        currentStep: step,
        lastStep: newLastStep
      });
    }
  }, [success, step, lastStep, lessonKey]);

  const executeUserCommand = useCallback((cmd: string) => {
    if (!filesystem) return;

    const stepData = lessonData[step];
    if (!stepData.interactive) return;

    const validation = checkCommand(cmd, stepData, filesystem);

    const promptLine = `$ ${cmd}`;
    const newLines = validation.output
      ? [promptLine, ...validation.output.split('\n')]
      : [promptLine];
    setOutput(prev => [...prev, ...newLines]);

    if (validation.isSuccess) {
      setSuccess(true);
      setError(null);
    } else {
      setError(validation.error || 'Try again');
      setLockError(true);
      setTimeout(() => setLockError(false), 2000);
    }
  }, [filesystem, lessonData, step]);

  const nextStep = useCallback(() => {
    if (!success || step >= lessonData.length - 1) return;
    
    const newStep = step + 1;
    setStepState(newStep);
    initializeFilesystem(newStep);
    
    saveProgress(lessonKey, {
      currentStep: newStep,
      lastStep
    });
  }, [success, step, lessonData.length, initializeFilesystem, lessonKey, lastStep]);

  const prevStep = useCallback(() => {
    if (step <= 0) return;
    
    const newStep = step - 1;
    setStepState(newStep);
    initializeFilesystem(newStep);
    
    saveProgress(lessonKey, {
      currentStep: newStep,
      lastStep
    });
  }, [step, initializeFilesystem, lessonKey, lastStep]);

  const setStep = useCallback((newStep: number) => {
    if (newStep < 0 || newStep >= lessonData.length || newStep > lastStep + 1) {
      return;
    }
    
    setStepState(newStep);
    initializeFilesystem(newStep);
    
    saveProgress(lessonKey, {
      currentStep: newStep,
      lastStep
    });
  }, [lessonData.length, lastStep, initializeFilesystem, lessonKey]);

  const resetLesson = useCallback(() => {
    setStepState(0);
    setLastStep(-1);
    initializeFilesystem(0);
    saveProgress(lessonKey, {
      currentStep: 0,
      lastStep: -1
    });
  }, [initializeFilesystem, lessonKey]);

  const value: TerminalContextState = {
    step,
    lastStep,
    success,
    error,
    lockError,
    output,
    filesystem,
    lessonData,
    lessonKey,
    nextStep,
    prevStep,
    setStep,
    executeUserCommand,
    resetLesson
  };

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
}
