import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Eye, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendationData {
  timestamp: Date;
  title: string;
  channel: string;
  category: string;
  relevanceScore: number;
  isTargetContent: boolean;
  isAvoidContent: boolean;
}

interface RealTimeAnalyticsProps {
  isActive: boolean;
  targetKeywords: string[];
  avoidKeywords: string[];
}

export const RealTimeAnalytics: React.FC<RealTimeAnalyticsProps> = ({
  isActive,
  targetKeywords,
  avoidKeywords
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const [profileStrength, setProfileStrength] = useState<{ time: string; strength: number }[]>([]);
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    targetMatches: 0,
    avoidMatches: 0,
    profileScore: 0,
    diversityScore: 0
  });

  // Listen for real training progress updates
  useEffect(() => {
    if (!isActive) return;

    const handleTrainingProgress = (event: MessageEvent) => {
      if (event.data.type === 'TRAINING_PROGRESS') {
        const progressData = event.data.progress;
        
        // Update recommendations with real data
        if (progressData.recommendations) {
          const newRecommendations = progressData.recommendations.map((rec: any) => ({
            timestamp: new Date(),
            title: rec.title,
            channel: rec.channel,
            category: rec.category || 'neutral',
            relevanceScore: rec.relevanceScore || 0,
            isTargetContent: targetKeywords.some(keyword => 
              rec.title.toLowerCase().includes(keyword.toLowerCase())
            ),
            isAvoidContent: avoidKeywords.some(keyword => 
              rec.title.toLowerCase().includes(keyword.toLowerCase())
            )
          }));
          
          setRecommendations(prev => [...prev.slice(-19), ...newRecommendations]);

          // Update profile strength over time
          const currentTime = new Date().toLocaleTimeString();
          setProfileStrength(prev => {
            const newData = [...prev.slice(-9), {
              time: currentTime,
              strength: progressData.profileScore || 0
            }];
            return newData;
          });
        }
      }
    };

    // Listen for messages from the extension
    window.addEventListener('message', handleTrainingProgress);

    // Also listen for chrome runtime messages
    if (chrome?.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'TRAINING_PROGRESS') {
          handleTrainingProgress({ data: message } as MessageEvent);
        }
      });
    }

    return () => {
      window.removeEventListener('message', handleTrainingProgress);
      if (chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(handleTrainingProgress);
      }
    };
  }, [isActive, targetKeywords, avoidKeywords]);

  // Update stats when recommendations change
  useEffect(() => {
    const totalRecommendations = recommendations.length;
    const targetMatches = recommendations.filter(r => r.isTargetContent).length;
    const avoidMatches = recommendations.filter(r => r.isAvoidContent).length;
    
    const profileScore = totalRecommendations > 0 
      ? Math.round((targetMatches / totalRecommendations) * 100)
      : 0;
    
    const diversityScore = totalRecommendations > 0
      ? Math.round(((totalRecommendations - targetMatches - avoidMatches) / totalRecommendations) * 100)
      : 100;

    setStats({
      totalRecommendations,
      targetMatches,
      avoidMatches,
      profileScore,
      diversityScore
    });
  }, [recommendations]);

  const categoryData = [
    { name: 'Target Content', value: stats.targetMatches, color: '#10B981' },
    { name: 'Avoid Content', value: stats.avoidMatches, color: '#EF4444' },
    { name: 'Neutral Content', value: stats.totalRecommendations - stats.targetMatches - stats.avoidMatches, color: '#6B7280' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Live Analytics</h3>
        {isActive && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-gray-700/50 rounded-lg p-4 text-center"
        >
          <div className="text-2xl font-bold text-blue-400">{stats.profileScore}%</div>
          <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <Target className="h-3 w-3" />
            <span>Profile Score</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-gray-700/50 rounded-lg p-4 text-center"
        >
          <div className="text-2xl font-bold text-green-400">{stats.targetMatches}</div>
          <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Target Hits</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-gray-700/50 rounded-lg p-4 text-center"
        >
          <div className="text-2xl font-bold text-red-400">{stats.avoidMatches}</div>
          <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Avoid Hits</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-gray-700/50 rounded-lg p-4 text-center"
        >
          <div className="text-2xl font-bold text-purple-400">{stats.diversityScore}%</div>
          <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>Diversity</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Content Verteilung</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  color: '#F3F4F6'
                }}
              />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profile Strength Over Time */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Profile Stärke über Zeit</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={profileStrength}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  color: '#F3F4F6'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="strength" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Recommendations */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Neueste Empfehlungen</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {recommendations.slice(-5).reverse().map((rec, index) => (
            <motion.div
              key={`${rec.timestamp.getTime()}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border ${
                rec.isTargetContent ? 'bg-green-900/20 border-green-700' :
                rec.isAvoidContent ? 'bg-red-900/20 border-red-700' :
                'bg-gray-700/30 border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{rec.title}</div>
                  <div className="text-xs text-gray-400">{rec.channel}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-gray-400">
                    {rec.timestamp.toLocaleTimeString()}
                  </div>
                  {rec.isTargetContent && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                  {rec.isAvoidContent && (
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {!isActive && (
        <div className="text-center py-8 text-gray-400">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Starte die Automation um Live-Analytics zu sehen</p>
        </div>
      )}
    </div>
  );
};