import React, { useState } from 'react';
import { Users, Plus, Trash2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrowserProfile } from '@/types';

interface Profile {
  id: string;
  name: string;
  category: string;
  createdAt: Date;
  isActive: boolean;
}

export const ProfileController: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: '1',
      name: 'Tech Research Profile',
      category: 'tech',
      createdAt: new Date(),
      isActive: true
    }
  ]);

  const [newProfileName, setNewProfileName] = useState('');

  const createProfile = () => {
    if (!newProfileName.trim()) return;
    
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: newProfileName,
      category: 'custom',
      createdAt: new Date(),
      isActive: false
    };
    
    setProfiles([...profiles, newProfile]);
    setNewProfileName('');
  };

  const activateProfile = (id: string) => {
    setProfiles(profiles.map(profile => ({
      ...profile,
      isActive: profile.id === id
    })));
  };

  const deleteProfile = (id: string) => {
    setProfiles(profiles.filter(profile => profile.id !== id));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Profile Manager</h3>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder="New profile name..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && createProfile()}
          />
          <button
            onClick={createProfile}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`p-4 rounded-lg ${
              profile.isActive
                ? 'bg-purple-900/50 border-purple-500'
                : 'bg-gray-800/50 border-gray-700'
            } border`}
          >
            <div className="flex items-center gap-2">
              <Globe className={`h-4 w-4 ${profile.isActive ? 'text-purple-400' : 'text-gray-400'}`} />
              <div>
                <h4 className="font-medium text-white">{profile.name}</h4>
                <p className="text-sm text-gray-400">
                  {profile.category} • {profile.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            {!profile.isActive && (
              <button
                onClick={() => activateProfile(profile.id)}
                className="mt-2 text-sm text-purple-400 hover:text-purple-300"
              >
                Activate
              </button>
            )}
            <button
              onClick={() => deleteProfile(profile.id)}
              className="mt-2 text-sm text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-8">
          <Globe className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No profiles created yet.</p>
        </div>
      )}
    </div>
  );
};