import { useState, useMemo } from 'react';
import { TrainingPreset } from '@/types';

export const usePresetFilters = (presets: TrainingPreset[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  const filteredPresets = useMemo(() => {
    return presets.filter(preset => {
      const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (preset.targetKeywords || []).some(keyword => 
                            keyword.toLowerCase().includes(searchQuery.toLowerCase())
                          );
      const matchesCategory = categoryFilter === 'all' || preset.category === categoryFilter;
      const matchesLanguage = languageFilter === 'all' || preset.language === languageFilter;
      return matchesSearch && matchesCategory && matchesLanguage;
    });
  }, [presets, searchQuery, categoryFilter, languageFilter]);

  const availableLanguages = useMemo(() => 
    Array.from(new Set(presets.map(p => p.language || 'en'))),
    [presets]
  );

  return {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    languageFilter,
    setLanguageFilter,
    filteredPresets,
    availableLanguages
  };
}; 