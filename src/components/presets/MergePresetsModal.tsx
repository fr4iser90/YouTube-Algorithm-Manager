import React, { useState, useEffect, useMemo } from 'react';
import { TrainingPreset } from '../../types/preset';
import { X, Plus, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PresetCard } from './PresetCard';

interface MergePresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preset: TrainingPreset) => void;
}

export const MergePresetsModal: React.FC<MergePresetsModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [presets, setPresets] = useState<TrainingPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    // 1. Lade lokale Presets (optional)
    const loadLocal = async () => {
      let localPresets: any[] = [];
      try {
        localPresets = JSON.parse(localStorage.getItem('youtube-presets') || '[]');
      } catch {
        localPresets = [];
      }
      return localPresets.map(p => ({ ...p, source: 'local' }));
    };
    // 2. Lade GitHub-Presets
    const loadGitHub = async () => {
      try {
        const manifestUrl = 'https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/training-presets/manifest.json';
        const manifestRes = await fetch(manifestUrl, { cache: 'no-store' });
        if (!manifestRes.ok) return [];
        const manifest = await manifestRes.json();
        const presetPromises = manifest.map(async (meta: any) => {
          const res = await fetch('https://raw.githubusercontent.com/fr4iser90/YouTube-Algorithm-Manager/main/' + meta.path, { cache: 'no-store' });
          if (!res.ok) return null;
          const preset = await res.json();
          return { ...meta, ...preset, source: 'github' };
        });
        return (await Promise.all(presetPromises)).filter(Boolean);
      } catch {
        return [];
      }
    };
    (async () => {
      const [local, github] = await Promise.all([loadLocal(), loadGitHub()]);
      setPresets([...github, ...local]);
      setLoading(false);
    })();
  }, [isOpen]);

  const categories = useMemo(() => Array.from(new Set(presets.map(p => p.category))), [presets]);
  const languages = useMemo(() => Array.from(new Set(presets.map(p => p.language))), [presets]);
  const regions = useMemo(() => Array.from(new Set(presets.map(p => p.region))), [presets]);

  const filteredPresets = useMemo(() => {
    return presets.filter(p => {
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesLanguage = languageFilter === 'all' || p.language === languageFilter;
      const matchesRegion = regionFilter === 'all' || p.region === regionFilter;
      const matchesSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesLanguage && matchesRegion && matchesSearch;
    });
  }, [presets, categoryFilter, languageFilter, regionFilter, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleMerge = () => {
    const selected = presets.filter(p => selectedIds.includes(p.id));
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
    onSave(merged);
    setSelectedIds([]);
    onClose();
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
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search presets, keywords..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={languageFilter}
                  onChange={e => setLanguageFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={regionFilter}
                  onChange={e => setRegionFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading presets...</div>
              ) : filteredPresets.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No presets found.</div>
              ) : filteredPresets.map(preset => (
                <div key={preset.id} className="flex items-center space-x-3 bg-gray-700 rounded-md p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(preset.id)}
                    onChange={() => toggleSelect(preset.id)}
                    className="form-checkbox h-6 w-6 text-blue-600"
                  />
                  <span className="text-2xl mr-2">{preset.language === 'de' ? '🇩🇪' : preset.language === 'en' ? '🇺🇸' : '🌐'}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{preset.name}</div>
                    <div className="text-xs text-gray-400 mb-1">{preset.category?.charAt(0).toUpperCase() + preset.category?.slice(1) || ''}</div>
                    <div className="text-xs text-gray-300 truncate">{preset.description}</div>
                  </div>
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
      </motion.div>
    </AnimatePresence>
  );
};