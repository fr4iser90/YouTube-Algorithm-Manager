import React from 'react';
import { TrainingProfile } from '@/types';
import { motion } from 'framer-motion';
import { Pause, Square, Activity } from 'lucide-react';

interface TrainingProgressProps {
  profile: TrainingProfile;
  onPause: () => void;
  onStop: () => void;
}

export const TrainingProgress: React.FC<TrainingProgressProps> = ({
  profile,
  onPause,
  onStop
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 border border-blue-500/50 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Activity className="h-5 w-5 text-blue-400 animate-pulse" />
          <div>
            <h3 className="text-lg font-semibold text-white">Training in Progress</h3>
            <p className="text-sm text-gray-400">{profile.currentAction}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onPause}
            className="flex items-center space-x-1 px-3 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
          >
            <Pause className="h-4 w-4" />
            <span>Pause</span>
          </button>
          <button
            onClick={onStop}
            className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            <Square className="h-4 w-4" />
            <span>Stop</span>
          </button>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Progress</span>
          <span>{Math.round(profile.progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${profile.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Started: {profile.startTime.toLocaleTimeString()}
      </div>
    </motion.div>
  );
};