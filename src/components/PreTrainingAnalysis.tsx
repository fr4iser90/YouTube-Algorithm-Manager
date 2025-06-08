import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, History, BrainCircuit, Save } from 'lucide-react';

interface AnalysisResults {
  historyVideoCount: number;
  recommendedVideoCount: number;
  topKeywords: { term: string; score: number }[];
  topChannels: { channel: string; count: number }[];
  topVideos: { title: string; url: string }[];
  timestamp: number;
}

type AnalysisTab = 'keywords' | 'channels' | 'videos';

export function PreTrainingAnalysis() {
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>('keywords');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

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
      await chrome.runtime.sendMessage({ type: 'ANALYZE_PRE_TRAINING' });
    } catch (error) {
      console.error('Error starting pre-training analysis:', error);
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const saveAsProfile = () => {
    if (!results) return;

    const profileName = prompt('Enter a name for this new profile:', 'My Custom Profile');
    if (!profileName) return;

    const newProfile = {
      id: `custom-${Date.now()}`,
      name: profileName,
      desc: `Profile generated from analysis on ${new Date(results.timestamp).toLocaleString()}`,
      avatar: '🔬',
      category: 'custom',
      language: 'en',
      region: 'US',
      searches: results.topKeywords.map(kw => ({
        query: kw.term,
        frequency: 2,
        duration: 60
      })),
      targetKeywords: results.topKeywords.map(kw => kw.term),
      avoidKeywords: [],
      trainingDuration: 15,
      advancedOptions: {
        clearHistoryFirst: true,
        useIncognito: true,
        simulateRealTiming: true,
        engagementRate: 0.4,
        skipAds: true
      }
    };

    // Send to background script to save
    chrome.runtime.sendMessage({ type: 'SAVE_PROFILE', profile: newProfile }, (response) => {
      if (response.success) {
        alert(`Profile "${profileName}" saved successfully!`);
      } else {
        alert(`Error saving profile: ${response.error}`);
      }
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Algorithm Snapshot</h3>
        </div>
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
                  Top Keywords
                </button>
                <button
                  onClick={() => setActiveTab('channels')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'channels'
                      ? 'border-b-2 border-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Top Channels
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'videos'
                      ? 'border-b-2 border-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Top Videos
                </button>
              </div>
              <button
                onClick={saveAsProfile}
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save as Profile</span>
              </button>
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
              {activeTab === 'channels' && (
                <ResponsiveContainer>
                  <BarChart data={results.topChannels} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="channel"
                      type="category"
                      width={150}
                      tick={{ fill: '#9CA3AF' }}
                      axisLine={{ stroke: '#4B5563' }}
                      tickFormatter={(value) => (value.length > 20 ? `${value.substring(0, 18)}...` : value)}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#E5E7EB' }}
                      labelStyle={{ color: '#E5E7EB' }}
                    />
                    <Legend wrapperStyle={{ color: '#E5E7EB' }} />
                    <Bar dataKey="count" name="Video Count" fill="#A78BFA" />
                  </BarChart>
                </ResponsiveContainer>
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
