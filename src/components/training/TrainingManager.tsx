import React, { useEffect, useState } from 'react';
import { Upload, Download, Plus, X, PlaySquare } from 'lucide-react';
import { PresetCard } from '@/components/presets/PresetCard';
import { PresetEditor } from '@/components/presets/PresetEditor';

interface TrainingManagerProps {
  onImport: () => void;
  onExport: () => void;
  onCreate: () => void;
  onEdit: (preset: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (preset: any) => void;
  onTrain: (preset: any) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const TrainingManager: React.FC<TrainingManagerProps> = ({
  onImport,
  onExport,
  onCreate,
  onEdit,
  onDelete,
  onDuplicate,
  onTrain,
  searchQuery,
  setSearchQuery,
  isVisible,
  onClose
}) => {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<any | undefined>(undefined);

  useEffect(() => {
    if (!isVisible) return;
    setLoading(true);
    // 1. Lade lokale Presets (chrome.storage.local oder localStorage)
    const loadLocal = async () => {
      let localPresets: any[] = [];
      if (window.chrome?.storage?.local) {
        const storage = await chrome.storage.local.get(['userPresets']);
        localPresets = storage.userPresets || [];
      } else {
        try {
          localPresets = JSON.parse(localStorage.getItem('youtube-presets') || '[]');
        } catch {
          localPresets = [];
        }
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
    // 3. Zusammenführen
    (async () => {
      const [local, github] = await Promise.all([loadLocal(), loadGitHub()]);
      setPresets([...github, ...local]);
      setLoading(false);
    })();
  }, [isVisible]);

  const handleCreatePreset = () => {
    setEditingPreset(undefined);
    setIsEditorOpen(true);
  };

  const handleEditPreset = (preset: any) => {
    setEditingPreset(preset);
    setIsEditorOpen(true);
  };

  const handleSavePreset = (preset: any) => {
    if (editingPreset) {
      // Update existing preset
      setPresets(prev => prev.map(p => p.id === preset.id ? preset : p));
    } else {
      // Add new preset
      setPresets(prev => [...prev, preset]);
    }
    setIsEditorOpen(false);
    setEditingPreset(undefined);
  };

  const safePresets = presets || [];
  return !isVisible ? null : (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <PlaySquare className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Training Manager</h2>
              <p className="text-sm text-gray-400">Manage and launch YouTube training presets</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onImport}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleCreatePreset}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Preset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Search & Content */}
        <div className="p-6 border-b border-gray-700">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search presets, keywords..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Preset List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center text-gray-400 py-12">Lade Presets...</div>
            ) : safePresets.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-12">
                Keine Presets gefunden. Erstelle ein neues Preset.
              </div>
            ) : (
              (safePresets || []).map((preset: any) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onTrain={onTrain}
                  onEdit={handleEditPreset}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <PresetEditor
        preset={editingPreset}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPreset(undefined);
        }}
        onSave={handleSavePreset}
      />
    </div>
  );
};
