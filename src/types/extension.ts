import { TrainingPreset } from './preset';

export interface ExtensionStatus {
  isInstalled: boolean;
  isConnected: boolean;
  version?: string;
  isTraining: boolean;
  currentPreset?: string;
  detectionMethod?: string;
}

export interface ExtensionBridgeHandle {
  startTraining: (preset: TrainingPreset) => Promise<boolean>;
  stopTraining: () => Promise<void>;
  openProfileManager: () => void;
}
