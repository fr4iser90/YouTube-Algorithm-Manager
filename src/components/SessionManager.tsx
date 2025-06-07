import React, { useState } from 'react';
import { Users, Plus, Trash2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface Session {
  id: string;
  name: string;
  bubbleType: string;
  createdAt: Date;
  isActive: boolean;
}

export const SessionManager: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      name: 'Tech Research Session',
      bubbleType: 'tech',
      createdAt: new Date(),
      isActive: true
    }
  ]);

  const [newSessionName, setNewSessionName] = useState('');

  const createSession = () => {
    if (!newSessionName.trim()) return;
    
    const newSession: Session = {
      id: Date.now().toString(),
      name: newSessionName,
      bubbleType: 'custom',
      createdAt: new Date(),
      isActive: false
    };
    
    setSessions([...sessions, newSession]);
    setNewSessionName('');
  };

  const activateSession = (id: string) => {
    setSessions(sessions.map(session => ({
      ...session,
      isActive: session.id === id
    })));
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(session => session.id !== id));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Session Manager</h3>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            placeholder="New session name..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && createSession()}
          />
          <button
            onClick={createSession}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-lg border transition-all ${
              session.isActive
                ? 'bg-purple-900/30 border-purple-500'
                : 'bg-gray-700 border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className={`h-4 w-4 ${session.isActive ? 'text-purple-400' : 'text-gray-400'}`} />
                <div>
                  <h4 className="font-medium text-white">{session.name}</h4>
                  <p className="text-xs text-gray-400">
                    {session.bubbleType} • {session.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {!session.isActive && (
                  <button
                    onClick={() => activateSession(session.id)}
                    className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  >
                    Activate
                  </button>
                )}
                <button
                  onClick={() => deleteSession(session.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-8">
          <Globe className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No sessions created yet.</p>
        </div>
      )}
    </div>
  );
};