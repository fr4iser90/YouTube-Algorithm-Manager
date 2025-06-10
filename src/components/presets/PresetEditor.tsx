import React, { useState, useEffect } from 'react';
import { TrainingPreset, SearchPattern, WatchPattern, ChannelPreference } from '@/types';
import { 
  X, Plus, Trash2, Search, Globe, Target, Clock, Shield, 
  Users, Play, Pause, Settings, Lightbulb, Youtube, Eye,
  ChevronDown, ChevronUp, Save, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PresetEditorProps {
  preset?: TrainingPreset;
  isOpen: boolean;
  onClose: () => void;
  onSave: (preset: TrainingPreset) => void;
}

export const PresetEditor: React.FC<PresetEditorProps> = ({
  preset,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<TrainingPreset>>({
    name: '',
    description: '',
    category: 'custom',
    color: '#3B82F6',
    language: 'en',
    region: 'US',
    searches: [],
    watchPatterns: [],
    channelPreferences: [],
    targetKeywords: [],
    avoidKeywords: [],
    trainingDuration: 45,
    advancedOptions: {
      engagementRate: 0.7,
      skipAds: true
    }
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'keywords' | 'searches' | 'channels' | 'advanced'>('basic');
  const [keywordInput, setKeywordInput] = useState('');
  const [avoidKeywordInput, setAvoidKeywordInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [channelInput, setChannelInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAvoidSuggestions, setShowAvoidSuggestions] = useState(false);

  // Keyword suggestions based on category and language
  const keywordSuggestions = {
    tech: {
      en: ['AI', 'machine learning', 'programming', 'software', 'coding', 'algorithm', 'data science', 'cybersecurity', 'blockchain', 'cloud computing'],
      de: ['KI', 'Programmierung', 'Software', 'Algorithmus', 'Datenwissenschaft', 'Cybersicherheit', 'Cloud Computing', 'Technologie'],
      es: ['IA', 'programación', 'software', 'algoritmo', 'ciencia de datos', 'ciberseguridad', 'tecnología'],
      ja: ['AI', 'プログラミング', 'ソフトウェア', 'アルゴリズム', 'データサイエンス', 'テクノロジー']
    },
    science: {
      en: ['research', 'experiment', 'study', 'analysis', 'theory', 'hypothesis', 'peer review', 'methodology'],
      de: ['Forschung', 'Experiment', 'Studie', 'Analyse', 'Theorie', 'Hypothese', 'Methodik'],
      es: ['investigación', 'experimento', 'estudio', 'análisis', 'teoría', 'hipótesis', 'metodología'],
      ja: ['研究', '実験', '分析', '理論', '仮説', '方法論']
    },
    politics: {
      en: ['policy', 'government', 'election', 'democracy', 'debate', 'legislation', 'politics'],
      de: ['Politik', 'Regierung', 'Wahl', 'Demokratie', 'Debatte', 'Gesetzgebung'],
      es: ['política', 'gobierno', 'elección', 'democracia', 'debate', 'legislación'],
      ja: ['政治', '政府', '選挙', '民主主義', '討論', '立法']
    },
    music: {
      en: ['music', 'production', 'composition', 'theory', 'instrument', 'recording', 'mixing'],
      de: ['Musik', 'Produktion', 'Komposition', 'Theorie', 'Instrument', 'Aufnahme'],
      es: ['música', 'producción', 'composición', 'teoría', 'instrumento', 'grabación'],
      ja: ['音楽', '制作', '作曲', '理論', '楽器', '録音']
    },
    lifestyle: {
      en: ['wellness', 'productivity', 'minimalism', 'health', 'fitness', 'mindfulness', 'lifestyle'],
      de: ['Wellness', 'Produktivität', 'Minimalismus', 'Gesundheit', 'Fitness', 'Achtsamkeit'],
      es: ['bienestar', 'productividad', 'minimalismo', 'salud', 'fitness', 'estilo de vida'],
      ja: ['ウェルネス', '生産性', 'ミニマリズム', '健康', 'フィットネス', 'ライフスタイル']
    },
    custom: {
      en: ['tutorial', 'guide', 'tips', 'review', 'analysis', 'discussion'],
      de: ['Tutorial', 'Anleitung', 'Tipps', 'Bewertung', 'Analyse', 'Diskussion'],
      es: ['tutorial', 'guía', 'consejos', 'reseña', 'análisis', 'discusión'],
      ja: ['チュートリアル', 'ガイド', 'ヒント', 'レビュー', '分析', '議論']
    }
  };

  const avoidKeywordSuggestions = {
    en: ['drama', 'gossip', 'clickbait', 'reaction', 'controversy', 'beef', 'exposed', 'cringe'],
    de: ['Drama', 'Klatsch', 'Clickbait', 'Reaktion', 'Kontroverse', 'Skandal'],
    es: ['drama', 'chisme', 'clickbait', 'reacción', 'controversia', 'escándalo'],
    ja: ['ドラマ', 'ゴシップ', 'クリックベイト', 'リアクション', '論争']
  };

  useEffect(() => {
    if (preset) {
      setFormData(preset);
    } else {
      // Reset form for new preset
      setFormData({
        name: '',
        description: '',
        category: 'custom',
        color: '#3B82F6',
        language: 'en',
        region: 'US',
        searches: [],
        watchPatterns: [],
        channelPreferences: [],
        targetKeywords: [],
        avoidKeywords: [],
        trainingDuration: 45,
        advancedOptions: {
          engagementRate: 0.7,
          skipAds: true
        }
      });
    }
  }, [preset]);

  const handleSave = () => {
    if (!formData.name?.trim()) return;

    const savedPreset: TrainingPreset = {
      id: preset?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: formData.name,
      description: formData.description || '',
      category: formData.category || 'custom',
      color: formData.color || '#3B82F6',
      language: formData.language || 'en',
      region: formData.region || 'US',
      searches: formData.searches || [],
      watchPatterns: formData.watchPatterns || [],
      channelPreferences: formData.channelPreferences || [],
      targetKeywords: formData.targetKeywords || [],
      avoidKeywords: formData.avoidKeywords || [],
      trainingDuration: formData.trainingDuration || 45,
      advancedOptions: formData.advancedOptions || {
        engagementRate: 0.7,
        skipAds: true
      },
      createdAt: preset?.createdAt || new Date(),
      lastUsed: preset?.lastUsed
    };

    onSave(savedPreset);
    onClose();
  };

  const addKeyword = (keyword: string, type: 'target' | 'avoid') => {
    if (!keyword.trim()) return;
    
    const field = type === 'target' ? 'targetKeywords' : 'avoidKeywords';
    const currentKeywords = formData[field] || [];
    
    if (!currentKeywords.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...currentKeywords, keyword.trim()]
      }));
    }
    
    if (type === 'target') {
      setKeywordInput('');
    } else {
      setAvoidKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string, type: 'target' | 'avoid') => {
    const field = type === 'target' ? 'targetKeywords' : 'avoidKeywords';
    const currentKeywords = formData[field] || [];
    
    setFormData(prev => ({
      ...prev,
      [field]: currentKeywords.filter(k => k !== keyword)
    }));
  };

  const generateSearchesFromKeywords = () => {
    const keywords = formData.targetKeywords || [];
    const language = formData.language || 'en';
    const region = formData.region || 'US';
    
    const searchTemplates = {
      en: [
        '{keyword} tutorial',
        '{keyword} explained',
        '{keyword} guide',
        'best {keyword}',
        '{keyword} tips',
        'how to {keyword}',
        '{keyword} review',
        '{keyword} analysis'
      ],
      de: [
        '{keyword} Tutorial',
        '{keyword} erklärt',
        '{keyword} Anleitung',
        'beste {keyword}',
        '{keyword} Tipps',
        'wie {keyword}',
        '{keyword} Bewertung'
      ],
      es: [
        '{keyword} tutorial',
        '{keyword} explicado',
        '{keyword} guía',
        'mejor {keyword}',
        '{keyword} consejos',
        'cómo {keyword}',
        '{keyword} reseña'
      ],
      ja: [
        '{keyword} チュートリアル',
        '{keyword} 解説',
        '{keyword} ガイド',
        '{keyword} 使い方',
        '{keyword} レビュー'
      ]
    };

    const templates = searchTemplates[language as keyof typeof searchTemplates] || searchTemplates.en;
    const newSearches: SearchPattern[] = [];

    keywords.forEach(keyword => {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const query = template.replace('{keyword}', keyword);
      
      newSearches.push({
        query,
        frequency: Math.floor(Math.random() * 3) + 2, // 2-4
        duration: Math.floor(Math.random() * 60) + 60, // 60-120 seconds
        language,
        region
      });
    });

    setFormData(prev => ({
      ...prev,
      searches: [...(prev.searches || []), ...newSearches]
    }));
  };

  const addSearch = () => {
    if (!searchInput.trim()) return;
    
    const newSearch: SearchPattern = {
      query: searchInput.trim(),
      frequency: 3,
      duration: 90,
      language: formData.language || 'en',
      region: formData.region || 'US'
    };
    
    setFormData(prev => ({
      ...prev,
      searches: [...(prev.searches || []), newSearch]
    }));
    
    setSearchInput('');
  };

  const removeSearch = (index: number) => {
    setFormData(prev => ({
      ...prev,
      searches: (prev.searches || []).filter((_, i) => i !== index)
    }));
  };

  const addChannel = (action: 'subscribe' | 'avoid' | 'block' | 'prioritize') => {
    if (!channelInput.trim()) return;
    
    const newChannel: ChannelPreference = {
      channelId: `channel_${Date.now()}`,
      channelName: channelInput.trim(),
      action,
      reason: ''
    };
    
    setFormData(prev => ({
      ...prev,
      channelPreferences: [...(prev.channelPreferences || []), newChannel]
    }));
    
    setChannelInput('');
  };

  const removeChannel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      channelPreferences: (prev.channelPreferences || []).filter((_, i) => i !== index)
    }));
  };

  const getSuggestedKeywords = () => {
    const category = formData.category || 'custom';
    const language = formData.language || 'en';
    return keywordSuggestions[category]?.[language as keyof typeof keywordSuggestions[typeof category]] || [];
  };

  const getSuggestedAvoidKeywords = () => {
    const language = formData.language || 'en';
    return avoidKeywordSuggestions[language as keyof typeof avoidKeywordSuggestions] || [];
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {preset ? 'Edit Preset' : 'Create New Preset'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          {[
            { id: 'basic', label: 'Basic Info', icon: Settings },
            { id: 'keywords', label: 'Keywords', icon: Target },
            { id: 'searches', label: 'Searches', icon: Search },
            { id: 'channels', label: 'Channels', icon: Users },
            { id: 'advanced', label: 'Advanced', icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preset Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter preset name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category || 'custom'}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tech">Tech</option>
                    <option value="science">Science</option>
                    <option value="politics">Politics</option>
                    <option value="music">Music</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language || 'en'}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                    <option value="ru">Русский</option>
                    <option value="pt">Português</option>
                    <option value="it">Italiano</option>
                    <option value="ko">한국어</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Region
                  </label>
                  <select
                    value={formData.region || 'US'}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="US">United States</option>
                    <option value="DE">Germany</option>
                    <option value="ES">Spain</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="CN">China</option>
                    <option value="RU">Russia</option>
                    <option value="BR">Brazil</option>
                    <option value="IT">Italy</option>
                    <option value="KR">South Korea</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Training Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={formData.trainingDuration || 45}
                    onChange={(e) => setFormData(prev => ({ ...prev, trainingDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color || '#3B82F6'}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what this preset is for..."
                />
              </div>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Target Keywords</h3>
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span>Suggestions</span>
                    {showSuggestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                    >
                      <p className="text-sm text-gray-300 mb-2">Suggested keywords for {formData.category} in {formData.language}:</p>
                      <div className="flex flex-wrap gap-2">
                        {getSuggestedKeywords().map(keyword => (
                          <button
                            key={keyword}
                            onClick={() => addKeyword(keyword, 'target')}
                            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            + {keyword}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword(keywordInput, 'target')}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add target keyword..."
                  />
                  <button
                    onClick={() => addKeyword(keywordInput, 'target')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(formData.targetKeywords || []).map(keyword => (
                    <span
                      key={keyword}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-900/30 text-green-300 rounded border border-green-700"
                    >
                      <span>+{keyword}</span>
                      <button
                        onClick={() => removeKeyword(keyword, 'target')}
                        className="text-green-400 hover:text-green-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Avoid Keywords</h3>
                  <button
                    onClick={() => setShowAvoidSuggestions(!showAvoidSuggestions)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span>Suggestions</span>
                    {showAvoidSuggestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                <AnimatePresence>
                  {showAvoidSuggestions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                    >
                      <p className="text-sm text-gray-300 mb-2">Common keywords to avoid:</p>
                      <div className="flex flex-wrap gap-2">
                        {getSuggestedAvoidKeywords().map(keyword => (
                          <button
                            key={keyword}
                            onClick={() => addKeyword(keyword, 'avoid')}
                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            - {keyword}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={avoidKeywordInput}
                    onChange={(e) => setAvoidKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword(avoidKeywordInput, 'avoid')}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add keyword to avoid..."
                  />
                  <button
                    onClick={() => addKeyword(avoidKeywordInput, 'avoid')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(formData.avoidKeywords || []).map(keyword => (
                    <span
                      key={keyword}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-900/30 text-red-300 rounded border border-red-700"
                    >
                      <span>-{keyword}</span>
                      <button
                        onClick={() => removeKeyword(keyword, 'avoid')}
                        className="text-red-400 hover:text-red-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'searches' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Search Patterns</h3>
                <button
                  onClick={generateSearchesFromKeywords}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>Auto-Generate from Keywords</span>
                </button>
              </div>

              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSearch()}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add search query..."
                />
                <button
                  onClick={addSearch}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {(formData.searches || []).map((search, index) => (
                  <div key={index} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{search.query}</span>
                      <button
                        onClick={() => removeSearch(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="block text-gray-400 mb-1">Frequency</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={search.frequency}
                          onChange={(e) => {
                            const newSearches = [...(formData.searches || [])];
                            newSearches[index].frequency = parseInt(e.target.value);
                            setFormData(prev => ({ ...prev, searches: newSearches }));
                          }}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Duration (sec)</label>
                        <input
                          type="number"
                          min="30"
                          max="300"
                          value={search.duration}
                          onChange={(e) => {
                            const newSearches = [...(formData.searches || [])];
                            newSearches[index].duration = parseInt(e.target.value);
                            setFormData(prev => ({ ...prev, searches: newSearches }));
                          }}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white"
                        />
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Globe className="h-4 w-4" />
                        <span>{search.language}/{search.region}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(formData.searches || []).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No search patterns added yet.</p>
                  <p className="text-sm">Add searches manually or auto-generate from keywords.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Channel Preferences</h3>

              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Channel name or URL..."
                />
                <button
                  onClick={() => addChannel('prioritize')}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
                >
                  Prioritize
                </button>
                <button
                  onClick={() => addChannel('subscribe')}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
                >
                  Subscribe
                </button>
                <button
                  onClick={() => addChannel('avoid')}
                  className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors text-sm"
                >
                  Avoid
                </button>
                <button
                  onClick={() => addChannel('block')}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                >
                  Block
                </button>
              </div>

              <div className="space-y-3">
                {(formData.channelPreferences || []).map((channel, index) => (
                  <div key={index} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Youtube className="h-5 w-5 text-red-400" />
                        <div>
                          <span className="text-white font-medium">{channel.channelName}</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${
                            channel.action === 'prioritize' ? 'bg-green-900/30 text-green-300' :
                            channel.action === 'subscribe' ? 'bg-blue-900/30 text-blue-300' :
                            channel.action === 'avoid' ? 'bg-yellow-900/30 text-yellow-300' :
                            'bg-red-900/30 text-red-300'
                          }`}>
                            {channel.action}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeChannel(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {channel.reason && (
                      <p className="text-sm text-gray-400 mt-2">{channel.reason}</p>
                    )}
                  </div>
                ))}
              </div>

              {(formData.channelPreferences || []).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No channel preferences set.</p>
                  <p className="text-sm">Add channels to prioritize, subscribe to, avoid, or block.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Advanced Options</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <Shield className="h-4 w-4" />
                    <span>Skip Ads</span>
                  </label>
                  <input
                    type="checkbox"
                    id="advSkipAds"
                    checked={formData.advancedOptions?.skipAds || false}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      advancedOptions: {
                        ...prev.advancedOptions!,
                        skipAds: e.target.checked
                      }
                    }))}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <Target className="h-4 w-4" />
                    <span>Engagement Rate</span>
                  </label>
                  <input
                    type="range"
                    id="advEngagement"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.advancedOptions?.engagementRate || 0.7}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      advancedOptions: {
                        ...prev.advancedOptions!,
                        engagementRate: parseFloat(e.target.value)
                      }
                    }))}
                    className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gray-300 w-12 text-right">
                    {Math.round((formData.advancedOptions?.engagementRate || 0.7) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setFormData({
                  name: '',
                  description: '',
                  category: 'custom',
                  color: '#3B82F6',
                  language: 'en',
                  region: 'US',
                  searches: [],
                  watchPatterns: [],
                  channelPreferences: [],
                  targetKeywords: [],
                  avoidKeywords: [],
                  trainingDuration: 45,
                  advancedOptions: {
                    engagementRate: 0.7,
                    skipAds: true
                  }
                });
              }}
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={!formData.name?.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{preset ? 'Update Preset' : 'Create Preset'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};