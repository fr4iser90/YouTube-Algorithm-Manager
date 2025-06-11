import React, { useState, useMemo } from 'react';
import { TrainingPreset } from '@/types/preset';
import { X, Plus, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PresetEditor } from './PresetEditor';

interface MergePresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets?: TrainingPreset[];
  onSave: (preset: TrainingPreset) => void;
}

const getCategories = (presets: TrainingPreset[] = []) => {
  const cats = Array.from(new Set((presets || []).map(p => p.category)));
  return cats;
};
const getSubcategories = (presets: TrainingPreset[] = [], category: string) => {
  return Array.from(new Set((presets || []).filter(p => p.category === category).map(p => p.subcategory || 'General')));
};

export const MergePresetsModal: React.FC<MergePresetsModalProps> = ({
  isOpen,
  onClose,
  presets = [],
  onSave
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [mergedPreset, setMergedPreset] = useState<TrainingPreset | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [expandedSubcats, setExpandedSubcats] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const categories = useMemo(() => getCategories(presets || []), [presets]);
  const languages = useMemo(() => Array.from(new Set((presets || []).map(p => p.language))), [presets]);
  const regions = useMemo(() => Array.from(new Set((presets || []).map(p => p.region))), [presets]);

  React.useEffect(() => {
    if (!activeCategory && categories.length > 0) setActiveCategory(categories[0]);
  }, [categories, activeCategory]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSubcat = (subcat: string) => {
    setExpandedSubcats(prev => prev.includes(subcat) ? prev.filter(x => x !== subcat) : [...prev, subcat]);
  };

  const filteredPresets = useMemo(() => {
    return (presets || []).filter(p =>
      (!activeCategory || p.category === activeCategory) &&
      (languageFilter === 'all' || p.language === languageFilter) &&
      (regionFilter === 'all' || p.region === regionFilter) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase()))
    );
  }, [presets, activeCategory, languageFilter, regionFilter, search]);

  const subcategories = useMemo(() => getSubcategories(filteredPresets, activeCategory), [filteredPresets, activeCategory]);

  const handleMerge = () => {
    const selected = (presets || []).filter(p => selectedIds.includes(p.id));
    if (selected.length < 2) return;
    const merged: TrainingPreset = {
      ...selected[0],
      id: '',
      name: selected.map(p => p.name).join(' + '),
      description: selected.map(p => p.description).filter(Boolean).join(' | '),
      category: selected[0].category,
      color: selected[0].color,
      language: selected[0].language,
      region: selected[0].region,
      searches: selected.flatMap(p => p.searches || []),
      watchPatterns: selected.flatMap(p => p.watchPatterns || []),
      channelPreferences: selected.flatMap(p => p.channelPreferences || []),
      targetKeywords: Array.from(new Set(selected.flatMap(p => p.targetKeywords || []))),
      avoidKeywords: Array.from(new Set(selected.flatMap(p => p.avoidKeywords || []))),
      trainingDuration: Math.max(...selected.map(p => p.trainingDuration || 0)),
      advancedOptions: selected[0].advancedOptions,
      createdAt: new Date(),
      lastUsed: undefined
    };
    setMergedPreset(merged);
    setShowEditor(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Merge Presets</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="text"
                placeholder="Search presets..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
              />
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={languageFilter}
                onChange={e => setLanguageFilter(e.target.value)}
                className="px-2 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                <option value="all">All Languages</option>
                {(languages || []).map(lang => (
                  <option key={lang} value={lang}>{lang?.toUpperCase?.() || ''}</option>
                ))}
              </select>
              <select
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value)}
                className="px-2 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                <option value="all">All Regions</option>
                {(regions || []).map(region => (
                  <option key={region} value={region}>{region?.toUpperCase?.() || ''}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2 mb-4">
              {(categories || []).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {cat?.charAt?.(0).toUpperCase?.() + cat?.slice?.(1) || ''}
                </button>
              ))}
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(subcategories || []).map(subcat => (
                <div key={subcat} className="bg-gray-700 rounded-md mb-2">
                  <button
                    className="w-full flex items-center justify-between px-4 py-2 text-left text-white font-semibold focus:outline-none"
                    onClick={() => toggleSubcat(subcat)}
                  >
                    <span>{subcat?.charAt?.(0).toUpperCase?.() + subcat?.slice?.(1) || ''}</span>
                    {expandedSubcats.includes(subcat) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <AnimatePresence>
                    {expandedSubcats.includes(subcat) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-2"
                      >
                        {(filteredPresets || []).filter(p => (p.subcategory || 'General') === subcat).map(preset => (
                          <label key={preset.id} className="flex items-center space-x-3 cursor-pointer py-1">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(preset.id)}
                              onChange={() => toggleSelect(preset.id)}
                              className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span className="text-white font-medium">{preset.name}</span>
                            <span className="text-gray-400 text-xs">({preset.language}/{preset.region})</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <button
              onClick={handleMerge}
              disabled={selectedIds.length < 2}
              className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 inline-block mr-1" /> Merge & Edit
            </button>
          </div>
        </motion.div>
        {showEditor && mergedPreset && (
          <PresetEditor
            preset={mergedPreset}
            isOpen={showEditor}
            onClose={() => setShowEditor(false)}
            onSave={onSave}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
