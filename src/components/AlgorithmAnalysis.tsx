import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlgorithmState, CategoryDistribution } from '../types';
import { TrendingUp, Eye, Target } from 'lucide-react';

interface AlgorithmAnalysisProps {
  currentState?: AlgorithmState;
  historicalData: AlgorithmState[];
}

export const AlgorithmAnalysis: React.FC<AlgorithmAnalysisProps> = ({
  currentState,
  historicalData
}) => {
  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

  if (!currentState) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Algorithm Analysis</h3>
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No algorithm data available. Train a preset to see analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Algorithm Analysis</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Content Categories</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={currentState.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }: CategoryDistribution) => `${category} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {currentState.categoryDistribution.map((entry: CategoryDistribution, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Profile Strength Over Time</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={historicalData.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                stroke="#9CA3AF"
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  color: '#F3F4F6'
                }}
              />
              <Bar dataKey="trainingProgress" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Eye className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-gray-400">Profile Score</span>
          </div>
          <div className="text-xl font-bold text-white">{currentState.trainingProgress}%</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-xs text-gray-400">Recommendations</span>
          </div>
          <div className="text-xl font-bold text-white">{currentState.recommendations.length}</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Target className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-gray-400">Sentiment</span>
          </div>
          <div className={`text-xl font-bold capitalize ${
            currentState.contentAnalysis.sentiment === 'positive' ? 'text-green-400' :
            currentState.contentAnalysis.sentiment === 'negative' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {currentState.contentAnalysis.sentiment}
          </div>
        </div>
      </div>
    </div>
  );
};