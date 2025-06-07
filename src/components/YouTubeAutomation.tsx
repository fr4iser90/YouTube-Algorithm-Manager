import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Activity, Youtube, Search, Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AutomationAction {
  id: string;
  type: 'search' | 'watch' | 'like' | 'comment' | 'subscribe' | 'navigate';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number;
  progress?: number;
  data?: any;
}

interface YouTubeAutomationProps {
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  currentPreset?: any;
}

export const YouTubeAutomation: React.FC<YouTubeAutomationProps> = ({
  isActive,
  onStart,
  onPause,
  onStop,
  currentPreset
}) => {
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [currentAction, setCurrentAction] = useState<AutomationAction | null>(null);
  const [realTimeData, setRealTimeData] = useState({
    recommendationsFound: 0,
    videosWatched: 0,
    searchesPerformed: 0,
    engagementsPerformed: 0,
    currentUrl: '',
    currentVideoTitle: ''
  });

  // Simulate real-time automation actions
  useEffect(() => {
    if (!isActive || !currentPreset) return;

    const generateActions = () => {
      const newActions: AutomationAction[] = [];
      
      // Generate search actions
      currentPreset.searches?.forEach((search: any, index: number) => {
        newActions.push({
          id: `search-${index}`,
          type: 'search',
          description: `Suche nach: "${search.query}"`,
          status: 'pending',
          duration: search.duration || 60,
          data: search
        });
      });

      // Generate watch actions
      for (let i = 0; i < 10; i++) {
        newActions.push({
          id: `watch-${i}`,
          type: 'watch',
          description: `Video ${i + 1} ansehen`,
          status: 'pending',
          duration: Math.floor(Math.random() * 120) + 30,
        });
      }

      // Generate engagement actions
      for (let i = 0; i < 5; i++) {
        newActions.push({
          id: `like-${i}`,
          type: 'like',
          description: `Video ${i + 1} liken`,
          status: 'pending',
          duration: 2,
        });
      }

      setActions(newActions);
    };

    generateActions();
  }, [isActive, currentPreset]);

  // Simulate action execution
  useEffect(() => {
    if (!isActive || actions.length === 0) return;

    const executeNextAction = () => {
      const nextAction = actions.find(a => a.status === 'pending');
      if (!nextAction) return;

      setCurrentAction(nextAction);
      setActions(prev => prev.map(a => 
        a.id === nextAction.id ? { ...a, status: 'running', progress: 0 } : a
      ));

      // Simulate action progress
      const duration = nextAction.duration || 30;
      const interval = setInterval(() => {
        setActions(prev => prev.map(a => {
          if (a.id === nextAction.id) {
            const newProgress = (a.progress || 0) + (100 / duration);
            if (newProgress >= 100) {
              clearInterval(interval);
              
              // Update real-time data
              setRealTimeData(prev => ({
                ...prev,
                recommendationsFound: prev.recommendationsFound + (nextAction.type === 'search' ? 10 : 0),
                videosWatched: prev.videosWatched + (nextAction.type === 'watch' ? 1 : 0),
                searchesPerformed: prev.searchesPerformed + (nextAction.type === 'search' ? 1 : 0),
                engagementsPerformed: prev.engagementsPerformed + (nextAction.type === 'like' ? 1 : 0),
                currentUrl: nextAction.type === 'watch' ? `https://youtube.com/watch?v=example${Math.random()}` : prev.currentUrl,
                currentVideoTitle: nextAction.type === 'watch' ? `Example Video ${Math.floor(Math.random() * 100)}` : prev.currentVideoTitle
              }));

              setTimeout(executeNextAction, 1000);
              return { ...a, status: 'completed', progress: 100 };
            }
            return { ...a, progress: newProgress };
          }
          return a;
        }));
      }, 1000);
    };

    executeNextAction();
  }, [isActive, actions]);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'search': return <Search className="h-4 w-4" />;
      case 'watch': return <Eye className="h-4 w-4" />;
      case 'like': return <ThumbsUp className="h-4 w-4" />;
      case 'comment': return <MessageCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Youtube className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">YouTube Automation</h3>
          {isActive && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!isActive ? (
            <button
              onClick={onStart}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Start</span>
            </button>
          ) : (
            <>
              <button
                onClick={onPause}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
              >
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={onStop}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <Square className="h-4 w-4" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Real-time Statistics */}
      {isActive && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{realTimeData.searchesPerformed}</div>
            <div className="text-xs text-gray-400">Suchen</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{realTimeData.videosWatched}</div>
            <div className="text-xs text-gray-400">Videos</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{realTimeData.recommendationsFound}</div>
            <div className="text-xs text-gray-400">Empfehlungen</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{realTimeData.engagementsPerformed}</div>
            <div className="text-xs text-gray-400">Interaktionen</div>
          </div>
        </div>
      )}

      {/* Current Action */}
      {currentAction && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg"
        >
          <div className="flex items-center space-x-3 mb-2">
            {getActionIcon(currentAction.type)}
            <span className="text-blue-300 font-medium">{currentAction.description}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${currentAction.progress || 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {realTimeData.currentVideoTitle && (
            <div className="mt-2 text-xs text-gray-400">
              Aktuell: {realTimeData.currentVideoTitle}
            </div>
          )}
        </motion.div>
      )}

      {/* Action Queue */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Aktionen Queue</h4>
        <AnimatePresence>
          {actions.slice(0, 10).map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                action.status === 'running' ? 'bg-blue-900/30 border border-blue-700' :
                action.status === 'completed' ? 'bg-green-900/20 border border-green-700' :
                'bg-gray-700/30'
              }`}
            >
              <div className={getStatusColor(action.status)}>
                {getActionIcon(action.type)}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white">{action.description}</div>
                {action.status === 'running' && action.progress && (
                  <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${action.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                action.status === 'running' ? 'bg-blue-600 text-white' :
                action.status === 'completed' ? 'bg-green-600 text-white' :
                action.status === 'error' ? 'bg-red-600 text-white' :
                'bg-gray-600 text-gray-300'
              }`}>
                {action.status === 'pending' ? 'Wartend' :
                 action.status === 'running' ? 'Läuft' :
                 action.status === 'completed' ? 'Fertig' : 'Fehler'}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!isActive && actions.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Youtube className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Wähle ein Preset und starte die Automation</p>
        </div>
      )}
    </div>
  );
};