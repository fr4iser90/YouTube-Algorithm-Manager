import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Zap, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MLContentClassifier, ContentAnalysis, createMLClassifier } from '../utils/mlContentClassifier';

interface MLAnalyticsProps {
  isActive: boolean;
  recommendations: any[];
  targetKeywords: string[];
  avoidKeywords: string[];
}

export const MLAnalytics: React.FC<MLAnalyticsProps> = ({
  isActive,
  recommendations,
  targetKeywords,
  avoidKeywords
}) => {
  const [classifier, setClassifier] = useState<MLContentClassifier | null>(null);
  const [analyses, setAnalyses] = useState<ContentAnalysis[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelMetrics, setModelMetrics] = useState({ accuracy: 0, categories: [], isInitialized: false });
  const [insights, setInsights] = useState({
    avgQuality: 0,
    clickbaitPercentage: 0,
    sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
    categoryDistribution: {} as Record<string, number>,
    engagementPrediction: 0,
    bubbleEffectiveness: 0
  });

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#EC4899', '#14B8A6'];

  useEffect(() => {
    initializeClassifier();
  }, []);

  useEffect(() => {
    if (recommendations.length > 0 && classifier && isInitialized) {
      analyzeRecommendations();
    }
  }, [recommendations, classifier, isInitialized]);

  const initializeClassifier = async () => {
    try {
      const mlClassifier = createMLClassifier();
      await mlClassifier.initialize();
      
      setClassifier(mlClassifier);
      setIsInitialized(true);
      setModelMetrics(mlClassifier.getModelMetrics());
      
    } catch (error) {
      console.error('Failed to initialize ML classifier:', error);
    }
  };

  const analyzeRecommendations = async () => {
    if (!classifier || recommendations.length === 0) return;

    setIsAnalyzing(true);

    try {
      const contents = recommendations.map(rec => ({
        title: rec.title || '',
        description: rec.description || '',
        channelName: rec.channel || ''
      }));

      const results = await classifier.analyzeMultipleContents(contents);
      setAnalyses(results);
      calculateInsights(results);

    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateInsights = (results: ContentAnalysis[]) => {
    if (results.length === 0) return;

    // Average quality score
    const avgQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;

    // Clickbait percentage
    const clickbaitCount = results.filter(r => r.isClickbait).length;
    const clickbaitPercentage = (clickbaitCount / results.length) * 100;

    // Sentiment distribution
    const sentimentCounts = results.reduce((acc, r) => {
      acc[r.sentiment]++;
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    const sentimentDistribution = {
      positive: (sentimentCounts.positive / results.length) * 100,
      negative: (sentimentCounts.negative / results.length) * 100,
      neutral: (sentimentCounts.neutral / results.length) * 100
    };

    // Category distribution
    const categoryDistribution = results.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average engagement prediction
    const engagementPrediction = results.reduce((sum, r) => sum + r.engagementPrediction, 0) / results.length;

    // Bubble effectiveness (how well target keywords are represented)
    const targetMatches = results.filter(r => 
      targetKeywords.some(keyword => 
        r.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
      )
    ).length;
    const bubbleEffectiveness = (targetMatches / results.length) * 100;

    setInsights({
      avgQuality,
      clickbaitPercentage,
      sentimentDistribution,
      categoryDistribution,
      engagementPrediction: engagementPrediction * 100,
      bubbleEffectiveness
    });
  };

  const getCategoryChartData = () => {
    return Object.entries(insights.categoryDistribution).map(([category, count]) => ({
      name: category,
      value: count,
      percentage: Math.round((count / analyses.length) * 100)
    }));
  };

  const getSentimentChartData = () => [
    { name: 'Positive', value: Math.round(insights.sentimentDistribution.positive), color: '#10B981' },
    { name: 'Neutral', value: Math.round(insights.sentimentDistribution.neutral), color: '#6B7280' },
    { name: 'Negative', value: Math.round(insights.sentimentDistribution.negative), color: '#EF4444' }
  ];

  const getQualityDistribution = () => {
    const ranges = { 'High (0.8+)': 0, 'Medium (0.5-0.8)': 0, 'Low (<0.5)': 0 };
    
    analyses.forEach(analysis => {
      if (analysis.qualityScore >= 0.8) ranges['High (0.8+)']++;
      else if (analysis.qualityScore >= 0.5) ranges['Medium (0.5-0.8)']++;
      else ranges['Low (<0.5)']++;
    });

    return Object.entries(ranges).map(([range, count]) => ({
      name: range,
      value: count,
      percentage: analyses.length > 0 ? Math.round((count / analyses.length) * 100) : 0
    }));
  };

  const getTopKeywords = () => {
    const keywordCounts = new Map<string, number>();
    
    analyses.forEach(analysis => {
      analysis.keywords.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });

    return Array.from(keywordCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">ML Content Analytics</h3>
          {isInitialized && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">
              <CheckCircle className="h-3 w-3" />
              <span>AI Ready</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-400">
            Model Accuracy: {Math.round(modelMetrics.accuracy * 100)}%
          </div>
          {isAnalyzing && (
            <div className="flex items-center space-x-1 text-xs text-blue-400">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-400"></div>
              <span>Analyzing...</span>
            </div>
          )}
        </div>
      </div>

      {!isInitialized ? (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-500 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-400">Initializing ML Content Classifier...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Start automation to see ML analysis</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-700/50 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(insights.avgQuality * 100)}%
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>Avg Quality</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-700/50 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-red-400">
                {Math.round(insights.clickbaitPercentage)}%
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Clickbait</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-700/50 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-green-400">
                {Math.round(insights.engagementPrediction)}%
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Engagement</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-700/50 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(insights.bubbleEffectiveness)}%
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
                <Target className="h-3 w-3" />
                <span>Bubble Effect</span>
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Content Categories</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={getCategoryChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getCategoryChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Sentiment Analysis */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Sentiment Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getSentimentChartData()}>
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
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quality Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Quality Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getQualityDistribution()}>
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
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Keywords */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Top Keywords Detected</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getTopKeywords().map(({ keyword, count }, index) => (
                  <div key={keyword} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                    <span className="text-white text-sm">{keyword}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(count / Math.max(...getTopKeywords().map(k => k.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs w-6">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Analysis Results */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Content Analysis</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {analyses.slice(-5).reverse().map((analysis, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border ${
                    analysis.qualityScore >= 0.8 ? 'bg-green-900/20 border-green-700' :
                    analysis.isClickbait ? 'bg-red-900/20 border-red-700' :
                    'bg-gray-700/30 border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium truncate">
                        {recommendations[analyses.length - 1 - index]?.title || 'Unknown Title'}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                        <span>Category: {analysis.category}</span>
                        <span>Quality: {Math.round(analysis.qualityScore * 100)}%</span>
                        <span>Sentiment: {analysis.sentiment}</span>
                        {analysis.isClickbait && (
                          <span className="text-red-400">Clickbait</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.round(analysis.confidence * 100)}% confidence
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <h5 className="text-purple-300 font-medium text-sm">AI Insights</h5>
                <div className="text-purple-200 text-xs mt-2 space-y-1">
                  <div>• Algorithm zeigt {Math.round(insights.bubbleEffectiveness)}% Übereinstimmung mit Ziel-Keywords</div>
                  <div>• Durchschnittliche Content-Qualität: {Math.round(insights.avgQuality * 100)}%</div>
                  <div>• {Math.round(insights.clickbaitPercentage)}% Clickbait-Content erkannt</div>
                  <div>• Vorhergesagte Engagement-Rate: {Math.round(insights.engagementPrediction)}%</div>
                  <div>• Sentiment-Trend: {
                    insights.sentimentDistribution.positive > 50 ? 'Überwiegend positiv' :
                    insights.sentimentDistribution.negative > 30 ? 'Teilweise negativ' : 'Ausgewogen'
                  }</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};