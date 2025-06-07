import React, { useState, useEffect } from 'react';
import { Save, Play, Trash2, Download, Upload, Clock, Target, Globe, Users, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BubblePreset, AlgorithmState } from '../types';

interface SavedSession {
  id: string;
  name: string;
  description: string;
  preset: BubblePreset;
  algorithmState: AlgorithmState;
  cookies: string; // Base64 encoded cookie data
  localStorage: string; // Base64 encoded localStorage data
  sessionStorage: string; // Base64 encoded sessionStorage data
  createdAt: Date;
  lastUsed: Date;
  bubbleStrength: number;
  totalVideosWatched: number;
  totalSearches: number;
  trainingHours: number;
  isActive: boolean;
  tags: string[];
}

interface SessionLoaderProps {
  onLoadSession: (session: SavedSession) => void;
  onCreateSession: () => void;
  currentPreset?: BubblePreset;
  currentAlgorithmState?: AlgorithmState;
  isVisible: boolean;
  onClose: () => void;
}

export const SessionLoader: React.FC<SessionLoaderProps> = ({
  onLoadSession,
  onCreateSession,
  currentPreset,
  currentAlgorithmState,
  isVisible,
  onClose
}) => {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'lastUsed' | 'bubbleStrength' | 'name' | 'createdAt'>('lastUsed');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [newSessionTags, setNewSessionTags] = useState<string[]>([]);

  // Load saved sessions from localStorage
  useEffect(() => {
    loadSavedSessions();
  }, []);

  const loadSavedSessions = () => {
    try {
      const saved = localStorage.getItem('youtube-bubble-sessions');
      if (saved) {
        const sessions = JSON.parse(saved, (key, value) => {
          if (key.endsWith('At')) {
            return new Date(value);
          }
          return value;
        });
        setSavedSessions(sessions);
      }
    } catch (error) {
      console.error('Failed to load saved sessions:', error);
    }
  };

  const saveSessions = (sessions: SavedSession[]) => {
    try {
      localStorage.setItem('youtube-bubble-sessions', JSON.stringify(sessions));
      setSavedSessions(sessions);
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  };

  const saveCurrentSession = () => {
    if (!currentPreset || !newSessionName.trim()) return;

    const newSession: SavedSession = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: newSessionName.trim(),
      description: newSessionDescription.trim(),
      preset: currentPreset,
      algorithmState: currentAlgorithmState || {
        timestamp: new Date(),
        recommendations: [],
        categories: [],
        sentiment: 'neutral',
        bubbleScore: 0,
        language: currentPreset.language,
        region: currentPreset.region,
        blockedChannels: [],
        prioritizedChannels: []
      },
      cookies: btoa(JSON.stringify(document.cookie)), // Save current cookies
      localStorage: btoa(JSON.stringify(localStorage)),
      sessionStorage: btoa(JSON.stringify(sessionStorage)),
      createdAt: new Date(),
      lastUsed: new Date(),
      bubbleStrength: currentAlgorithmState?.bubbleScore || 0,
      totalVideosWatched: Math.floor(Math.random() * 100) + 50, // Mock data
      totalSearches: Math.floor(Math.random() * 50) + 20,
      trainingHours: Math.floor(Math.random() * 10) + 2,
      isActive: false,
      tags: newSessionTags
    };

    const updatedSessions = [...savedSessions, newSession];
    saveSessions(updatedSessions);
    
    setShowSaveDialog(false);
    setNewSessionName('');
    setNewSessionDescription('');
    setNewSessionTags([]);
  };

  const loadSession = (session: SavedSession) => {
    try {
      // Restore cookies
      const cookieData = JSON.parse(atob(session.cookies));
      // Note: In real implementation, you'd need to properly restore cookies
      
      // Restore localStorage (carefully to not overwrite app data)
      const localStorageData = JSON.parse(atob(session.localStorage));
      Object.keys(localStorageData).forEach(key => {
        if (key.startsWith('youtube-') || key.startsWith('bubble-')) {
          localStorage.setItem(key, localStorageData[key]);
        }
      });

      // Mark session as active and update last used
      const updatedSessions = savedSessions.map(s => ({
        ...s,
        isActive: s.id === session.id,
        lastUsed: s.id === session.id ? new Date() : s.lastUsed
      }));
      saveSessions(updatedSessions);

      onLoadSession(session);
      onClose();
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = savedSessions.filter(s => s.id !== sessionId);
    saveSessions(updatedSessions);
  };

  const duplicateSession = (session: SavedSession) => {
    const duplicated: SavedSession = {
      ...session,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `${session.name} (Copy)`,
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: false
    };
    
    const updatedSessions = [...savedSessions, duplicated];
    saveSessions(updatedSessions);
  };

  const exportSessions = () => {
    const dataStr = JSON.stringify(savedSessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'youtube-bubble-sessions.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSessions = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedSessions = JSON.parse(e.target?.result as string, (key, value) => {
              if (key.endsWith('At')) {
                return new Date(value);
              }
              return value;
            });
            
            const mergedSessions = [...savedSessions, ...importedSessions];
            saveSessions(mergedSessions);
          } catch (error) {
            alert('Invalid session file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const filteredAndSortedSessions = savedSessions
    .filter(session => {
      const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.preset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = filterTag === 'all' || session.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'lastUsed':
          return b.lastUsed.getTime() - a.lastUsed.getTime();
        case 'bubbleStrength':
          return b.bubbleStrength - a.bubbleStrength;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

  const allTags = Array.from(new Set(savedSessions.flatMap(s => s.tags)));

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  if (!isVisible) return null;

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
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Save className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Session Manager</h2>
              <p className="text-sm text-gray-400">Load saved bubble sessions with persistent cookies</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={importSessions}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            
            <button
              onClick={exportSessions}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Current</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lastUsed">Last Used</option>
              <option value="bubbleStrength">Bubble Strength</option>
              <option value="name">Name</option>
              <option value="createdAt">Created Date</option>
            </select>
            
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-400">
            {filteredAndSortedSessions.length} session{filteredAndSortedSessions.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Sessions List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredAndSortedSessions.length === 0 ? (
            <div className="text-center py-12">
              <Save className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Sessions Found</h3>
              <p className="text-gray-400 mb-4">
                {savedSessions.length === 0 
                  ? 'Create your first session to get started'
                  : 'Try adjusting your search or filters'
                }
              </p>
              <button
                onClick={onCreateSession}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Create First Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedSessions.map(session => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    session.isActive
                      ? 'bg-green-900/30 border-green-500 ring-2 ring-green-500/50'
                      : selectedSession === session.id
                      ? 'bg-blue-900/30 border-blue-500'
                      : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedSession(session.id)}
                  onDoubleClick={() => loadSession(session)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: session.preset.color }}
                      />
                      <h3 className="font-semibold text-white">{session.name}</h3>
                      {session.isActive && (
                        <div className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                          Active
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSession(session);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Duplicate"
                      >
                        <Save className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {session.description || session.preset.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Target className="h-3 w-3" />
                      <span>{session.bubbleStrength}% Bubble</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Play className="h-3 w-3" />
                      <span>{session.totalVideosWatched} Videos</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Globe className="h-3 w-3" />
                      <span>{session.preset.language.toUpperCase()}/{session.preset.region}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Clock className="h-3 w-3" />
                      <span>{session.trainingHours}h Training</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last used: {formatTimeAgo(session.lastUsed)}</span>
                    <span>{session.preset.category}</span>
                  </div>

                  {session.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {session.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {session.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                          +{session.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {selectedSession === session.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-gray-600"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          loadSession(session);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        <span>Load Session (Instant)</span>
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Save Current Session</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Session Name *
                  </label>
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter session name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this session..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newSessionTags.join(', ')}
                    onChange={(e) => setNewSessionTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tech, ai, research..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentSession}
                  disabled={!newSessionName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Save Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};