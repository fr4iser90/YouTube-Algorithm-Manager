import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Play, History, BrainCircuit, Save, Plus } from 'lucide-react';

const COLORS = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F5F3FF'];

interface AnalysisResults {
  historyVideoCount: number;
  recommendedVideoCount: number;
  topKeywords: { term: string; score: number }[];
  topPhrases: { phrase: string; count: number }[];
  topChannels: {
    channel: string;
    count: number;
    historyRatio: number;
    recommendationRatio: number;
    categories: string[];
    keywords: string[];
  }[];
  topVideos: { title: string; url: string }[];
  categoryDistribution: Record<string, number>;
  engagementPatterns: {
    watchTimeDistribution: Record<string, number>;
    contentTypes: Record<string, number>;
    peakHours: Record<string, number>;
  };
  timestamp: number;
}

type AnalysisTab = 'keywords' | 'phrases' | 'channels' | 'videos' | 'categories' | 'engagement';

export function PreTrainingAnalysis() {
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>('keywords');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [minRecommendations, setMinRecommendations] = useState(100);

  useEffect(() => {
    // Load last results on mount
    chrome.storage.local.get('lastAnalysisResults', (data) => {
      if (data.lastAnalysisResults) {
        setResults(data.lastAnalysisResults);
      }
    });

    const handleMessage = (message: any) => {
      if (message.type === 'PRE_TRAINING_ANALYSIS_COMPLETE') {
        setResults(message.results);
        chrome.storage.local.set({ lastAnalysisResults: message.results }); // Save results
        setIsAnalyzing(false);
        setAnalysisStep('');
      } else if (message.type === 'HISTORY_ANALYSIS_COMPLETE') {
        setAnalysisStep('Analyzing recommendations...');
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStep('Analyzing history...');
    try {
      await chrome.runtime.sendMessage({ type: 'ANALYZE_PRE_TRAINING', preset: { advancedOptions: { minRecommendations } } });
    } catch (error) {
      console.error('Error starting pre-training analysis:', error);
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const saveAsProfile = () => {
    if (!results) return;

    const profileName = prompt('Enter a name for this new profile:', 'Analyzed Profile');
    if (!profileName) return;

    const newProfilePreset = {
        id: `custom-${Date.now()}`,
        name: profileName,
        description: `Generated from analysis on ${new Date(results.timestamp).toLocaleString()}`,
        color: '#8B5CF6',
        category: 'custom',
        language: 'en',
        region: 'US',
        searches: results.topKeywords.slice(0, 5).map(kw => ({
            query: kw.term,
            frequency: 2,
            duration: 60
        })),
        targetKeywords: results.topKeywords.map(kw => kw.term),
        avoidKeywords: [],
        trainingDuration: 15,
        advancedOptions: {
            engagementRate: 0.4,
            skipAds: true
        }
    };

    const newProfile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: profileName,
      description: `Profile generated from analysis on ${new Date(results.timestamp).toLocaleString()}`,
      preset: newProfilePreset,
      algorithmState: {
        timestamp: new Date(),
        recommendations: results.topVideos,
        categories: Object.keys(results.categoryDistribution),
        sentiment: 'neutral',
        profileScore: 0,
        language: 'en',
        region: 'US',
        blockedChannels: [],
        prioritizedChannels: results.topChannels.slice(0, 5).map(c => c.channel),
        categoryDistribution: results.categoryDistribution,
        engagementPatterns: results.engagementPatterns,
        topKeywords: results.topKeywords,
        topPhrases: results.topPhrases,
        topChannels: results.topChannels,
        contentAnalysis: {
          relevance: 0,
          sentiment: 'neutral',
          category: 'custom',
          keywords: results.topKeywords.map(k => k.term)
        }
      },
      createdAt: new Date(),
      lastUsed: new Date(),
      profileStrength: 0,
      totalVideosWatched: results.historyVideoCount,
      totalSearches: 0,
      trainingHours: 0,
      isActive: false,
      tags: ['analyzed', ...results.topKeywords.slice(0, 4).map(kw => kw.term)],
      preferredCategories: Object.keys(results.categoryDistribution),
      preferredChannels: results.topChannels.slice(0, 5).map(c => c.channel),
      preferredKeywords: results.topKeywords.map(k => k.term),
      watchHistory: [],
      avoidedChannels: [],
      avoidedKeywords: []
    };

    try {
      chrome.runtime.sendMessage({
        type: 'SAVE_PROFILES',
        profiles: [newProfile]
      }, (response) => {
        if (response && response.success) {
          window.dispatchEvent(new CustomEvent('profiles-updated'));
          alert(`Profile "${profileName}" saved successfully! You can now access it in the Profile Manager.`);
        } else {
          console.error('Failed to save profile:', response?.error);
          alert('Error saving profile. See console for details.');
        }
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Error saving profile. See console for details.');
    }
  };

  const createPreset = () => {
    if (!results) return;
    window.dispatchEvent(new CustomEvent('open-preset-editor', {
      detail: {
        preset: {
          name: `Analysis Preset ${new Date().toLocaleDateString()}`,
          description: `Generated from analysis on ${new Date(results.timestamp).toLocaleString()}`,
          category: 'custom',
          color: '#8B5CF6',
          language: 'en',
          region: 'US',
          searches: results.topKeywords.slice(0, 5).map(kw => ({
            query: kw.term,
            frequency: 2,
            duration: 60,
            language: 'en',
            region: 'US'
          })),
          targetKeywords: results.topKeywords.map(kw => kw.term),
          avoidKeywords: [],
          trainingDuration: 15,
          advancedOptions: {
            engagementRate: 0.4,
            skipAds: true
          }
        }
      }
    }));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Algorithm Snapshot</h3>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={minRecommendations}
            onChange={(e) => setMinRecommendations(parseInt(e.target.value, 10))}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-24"
            placeholder="Min Recs"
          />
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>Analyze Now</span>
          </button>
        </div>
      </div>

      {isAnalyzing && (
        <div className="text-center text-purple-300">
          {analysisStep}
        </div>
      )}

      {results && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-gray-400 mb-2">
                <History className="h-4 w-4" />
                <span>History Videos Analyzed</span>
              </div>
              <div className="text-2xl font-bold text-white">{results.historyVideoCount}</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-gray-400 mb-2">
                <Play className="h-4 w-4" />
                <span>Recommended Videos Analyzed</span>
              </div>
              <div className="text-2xl font-bold text-white">{results.recommendedVideoCount}</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center border-b border-gray-700 mb-4">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('keywords')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'keywords'
                      ? 'border-b-2 border-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Keywords
                </button>
                <button
                  onClick={() => setActiveTab('phrases')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'phrases'
                      ? 'border-b-2 border-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Phrases
                </button>
                <button
                  onClick={() => setActiveTab('channels')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'channels'
                      ? 'border-b-2 border-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Channels
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'categories'
                      ? 'border-b-2 border-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Categories
                </button>
                <button
                  onClick={() => setActiveTab('engagement')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'engagement'
                      ? 'border-b-2 border-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Engagement
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'videos'
                      ? 'border-b-2 border-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Videos
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={createPreset}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Preset</span>
                </button>
                <button
                  onClick={saveAsProfile}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save as Profile</span>
                </button>
              </div>
            </div>

            <div style={{ width: '100%', height: 400 }}>
              {activeTab === 'keywords' && (
                <ResponsiveContainer>
                  <BarChart data={results.topKeywords} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="term" type="category" width={120} tick={{ fill: '#9CA3AF' }} axisLine={{ stroke: '#4B5563' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#E5E7EB' }}
                    />
                    <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                    <Bar dataKey="score" name="TF-IDF Score" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeTab === 'phrases' && (
                <ResponsiveContainer>
                  <BarChart data={results.topPhrases} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="phrase" type="category" width={150} tick={{ fill: '#9CA3AF' }} axisLine={{ stroke: '#4B5563' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#E5E7EB' }}
                    />
                    <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                    <Bar dataKey="count" name="Occurrences" fill="#A78BFA" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeTab === 'channels' && (
                <div className="overflow-y-auto h-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2">Channel</th>
                        <th className="text-right py-2">Videos</th>
                        <th className="text-right py-2">History %</th>
                        <th className="text-right py-2">Recs %</th>
                        <th className="text-left py-2">Categories</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.topChannels.map((channel, index) => (
                        <tr key={index} className="border-b border-gray-700/50">
                          <td className="py-2 text-white">{channel.channel}</td>
                          <td className="py-2 text-right text-gray-300">{channel.count}</td>
                          <td className="py-2 text-right text-gray-300">{Math.round(channel.historyRatio * 100)}%</td>
                          <td className="py-2 text-right text-gray-300">{Math.round(channel.recommendationRatio * 100)}%</td>
                          <td className="py-2 text-gray-300">
                            <div className="flex flex-wrap gap-1">
                              {channel.categories.map((cat, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'categories' && (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={Object.entries(results.categoryDistribution).map(([name, value]) => ({
                        name,
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(results.categoryDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#E5E7EB' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {activeTab === 'engagement' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Watch Time Distribution</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={Object.entries(results.engagementPatterns.watchTimeDistribution).map(([name, value]) => ({
                        name,
                        value: value * 100
                      }))}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#E5E7EB' }}
                          formatter={(value) => [`${value}%`, 'Percentage']}
                        />
                        <Bar dataKey="value" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Content Types</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={Object.entries(results.engagementPatterns.contentTypes).map(([name, value]) => ({
                        name,
                        value
                      }))}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#E5E7EB' }}
                        />
                        <Bar dataKey="value" fill="#A78BFA" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Peak Hours</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={Object.entries(results.engagementPatterns.peakHours).map(([name, value]) => ({
                        name,
                        value: value * 100
                      }))}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#E5E7EB' }}
                          formatter={(value) => [`${value}%`, 'Percentage']}
                        />
                        <Bar dataKey="value" fill="#C4B5FD" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="overflow-y-auto h-full">
                  <ul className="space-y-2">
                    {results.topVideos.map((video, index) => (
                      <li key={index} className="text-sm">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {video.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
