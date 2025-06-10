import { useState } from 'react';
import { TrainingPreset } from '@/types';

export const usePresetManagement = (initialPresets: TrainingPreset[]) => {
  const [presets, setPresets] = useState<TrainingPreset[]>(initialPresets);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<TrainingPreset | undefined>(undefined);

  const handleCreatePreset = () => {
    setEditingPreset(undefined);
    setIsEditorOpen(true);
  };

  const handleEditPreset = (preset: TrainingPreset) => {
    setEditingPreset(preset);
    setIsEditorOpen(true);
  };

  const handleDeletePreset = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  const handleDuplicatePreset = (preset: TrainingPreset) => {
    const duplicated: TrainingPreset = {
      ...preset,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `${preset.name} (Copy)`,
      createdAt: new Date(),
      lastUsed: undefined
    };
    setPresets(prev => [...prev, duplicated]);
  };

  const handleSavePreset = (preset: TrainingPreset) => {
    if (editingPreset) {
      // Update existing preset
      setPresets(prev => prev.map(p => p.id === preset.id ? preset : p));
    } else {
      // Add new preset
      setPresets(prev => [...prev, preset]);
    }
  };

  return {
    presets,
    setPresets,
    isEditorOpen,
    setIsEditorOpen,
    editingPreset,
    setEditingPreset,
    handleCreatePreset,
    handleEditPreset,
    handleDeletePreset,
    handleDuplicatePreset,
    handleSavePreset
  };
}; 