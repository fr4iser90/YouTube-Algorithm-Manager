import { useState, useCallback } from 'react';
import { automationManager, AutomationProgress } from '@/utils/automationManager';
import { TrainingPreset, AlgorithmState } from '@/types';

export const useRealAutomation = () => {
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState<AutomationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAutomation = useCallback(async (
    preset: TrainingPreset,
    browserConfig: any,
    anonymousConfig: any,
    onComplete: (results: AlgorithmState) => void
  ) => {
    try {
      setIsActive(true);
      setError(null);
      setProgress(null);

      await automationManager.startTraining(
        preset,
        browserConfig,
        anonymousConfig,
        (progressData) => {
          setProgress(progressData);
        },
        (results) => {
          setIsActive(false);
          setProgress(null);
          onComplete(results);
        },
        (errorMessage) => {
          setError(errorMessage);
          setIsActive(false);
          setProgress(null);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsActive(false);
      setProgress(null);
    }
  }, []);

  const pauseAutomation = useCallback(async () => {
    await automationManager.pauseTraining();
    setIsActive(false);
  }, []);

  const stopAutomation = useCallback(async () => {
    await automationManager.stopTraining();
    setIsActive(false);
    setProgress(null);
  }, []);

  return {
    isActive,
    progress,
    error,
    startAutomation,
    pauseAutomation,
    stopAutomation
  };
};