import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, Clock, Users, Target, Shield, Globe } from 'lucide-react';
import { PresetCard } from '@/components/presets/PresetCard';
import { TrainingPreset } from '@/types/preset';
import { detectLanguage, getLanguageName } from '@/utils/detect-language';
import { detectRegion, getRegionFlag } from '@/utils/detect-region';
import { MergePresetsModal } from '@/components/presets/MergePresetsModal';

interface PresetGridProps {
  filteredPresets: TrainingPreset[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  languageFilter: string;
  setLanguageFilter: (language: string) => void;
  availableLanguages: string[];
  handleCreatePreset: () => void;
  handleTrainPreset: (preset: TrainingPreset) => void;
  handleEditPreset: (preset: TrainingPreset) => void;
  handleDeletePreset: (preset: TrainingPreset) => void;
  handleDuplicatePreset: (preset: TrainingPreset) => void;
  isTraining: boolean;
  presets: TrainingPreset[];
}

export const PresetGrid: React.FC<PresetGridProps> = ({
  filteredPresets,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  languageFilter,
  setLanguageFilter,
  availableLanguages,
  handleCreatePreset,
  handleTrainPreset,
  handleEditPreset,
  handleDeletePreset,
  handleDuplicatePreset,
  isTraining,
  presets
}) => {
  const [userLanguage, setUserLanguage] = useState<string>('en');
  const [userRegion, setUserRegion] = useState<string>('US');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  useEffect(() => {
    const detectUserSettings = async () => {
      const lang = await detectLanguage();
      const region = await detectRegion();
      setUserLanguage(lang);
      setUserRegion(region);
      setDetectedLanguage(lang);
      
      // Set initial region filter to detected region
      setRegionFilter(region);
    };
    detectUserSettings();
  }, []);

  // Get unique regions from presets
  const availableRegions = Array.from(new Set(filteredPresets.map(preset => preset.region)));

  // Sort presets by relevance to user's region
  const sortedPresets = [...filteredPresets].sort((a, b) => {
    const aMatchesRegion = a.region === userRegion;
    const bMatchesRegion = b.region === userRegion;

    if (aMatchesRegion && !bMatchesRegion) return -1;
    if (bMatchesRegion && !aMatchesRegion) return 1;
    return 0;
  });

  // Filter presets based on selected language and region
  const filteredPresetsByLanguageAndRegion = sortedPresets.filter(preset => {
    const matchesLanguage = languageFilter === 'all' || preset.language === languageFilter;
    const matchesRegion = regionFilter === 'all' || preset.region === regionFilter;
    return matchesLanguage && matchesRegion;
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">YouTube Presets</h2>
          <p className="text-gray-400 text-sm mt-1">
            {languageFilter === 'all' ? 'All Languages' : getLanguageName(languageFilter)} {regionFilter === 'all' ? '' : getRegionFlag(regionFilter)} • {filteredPresetsByLanguageAndRegion.length} presets available
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleCreatePreset}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Preset</span>
          </button>
          <button
            onClick={() => setIsMergeModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Merge Presets</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search presets, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="tech">Tech</option>
            <option value="science">Science</option>
            <option value="politics">Politics</option>
            <option value="music">Music</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Languages</option>
            {availableLanguages.map(lang => (
              <option key={lang} value={lang}>
                {getLanguageName(lang)} {getRegionFlag(lang.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-gray-400" />
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Regions</option>
            {availableRegions.map(region => (
              <option key={region} value={region}>
                {getRegionFlag(region)} {region}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {filteredPresetsByLanguageAndRegion.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onTrain={handleTrainPreset}
            onEdit={handleEditPreset}
            onDelete={handleDeletePreset}
            onDuplicate={handleDuplicatePreset}
            isTraining={isTraining}
            userLanguage={userLanguage}
            userRegion={userRegion}
          />
        ))}
      </motion.div>

      {filteredPresetsByLanguageAndRegion.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchQuery || categoryFilter !== 'all' || languageFilter !== 'all' || regionFilter !== 'all'
              ? 'No presets found' 
              : 'No presets available'
            }
          </div>
          <button 
            onClick={handleCreatePreset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Create First Preset
          </button>
        </div>
      )}

      <MergePresetsModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        presets={presets}
        onSave={(mergedPreset) => {
          setIsMergeModalOpen(false);
          handleCreatePreset(); // Optionally open editor for further editing
          // You can also directly save the merged preset here if desired
        }}
      />
    </div>
  );
};
