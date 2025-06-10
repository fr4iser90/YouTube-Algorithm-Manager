import { useState, useCallback, useEffect } from 'react';
import { BrowserProfile, AlgorithmState } from '@/types';

export const useProfileManagement = (algorithmHistory: AlgorithmState[]) => {
  const [savedProfiles, setSavedProfiles] = useState<BrowserProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<BrowserProfile | null>(null);
  const [currentAlgorithmState, setCurrentAlgorithmState] = useState<AlgorithmState | undefined>(undefined);
  const [showProfileCreate, setShowProfileCreate] = useState(false);
  const [pendingTrainingPreset, setPendingTrainingPreset] = useState<any>(null);

  const loadProfiles = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILES' });
      console.log('📦 Profiles received from background:', response);
      if (response.success) {
        setSavedProfiles(response.profiles);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
    window.addEventListener('profiles-updated', loadProfiles);
    return () => {
      window.removeEventListener('profiles-updated', loadProfiles);
    };
  }, [loadProfiles]);

  const loadProfileData = (profile: BrowserProfile) => {
    try {
      // Set active profile
      setCurrentProfile(profile);
      
      // Load associated algorithm state if available
      const profileAlgorithmState = algorithmHistory.find(state => state.profileId === profile.id);
      setCurrentAlgorithmState(profileAlgorithmState);

      // Update last used timestamp
      const updatedProfile = {
        ...profile,
        lastUsed: new Date()
      };
      
      // Update saved profiles
      setSavedProfiles(prev => 
        prev.map(p => p.id === profile.id ? updatedProfile : p)
      );

      console.log('✅ Profile loaded:', profile.name);
    } catch (err) {
      console.error('❌ Failed to load profile:', err);
    }
  };

  const handleProfileSave = async (profile: BrowserProfile) => {
    // Profil speichern
    const updatedProfiles = [...savedProfiles, profile];
    setSavedProfiles(updatedProfiles);
    setShowProfileCreate(false);

    // Wenn ein Training aussteht -> Starten
    if (pendingTrainingPreset) {
      if (chrome.runtime) {
        const success = await chrome.runtime.sendMessage({
          type: 'START_TRAINING',
          preset: pendingTrainingPreset
        });
        if (success) {
          // Training started
        }
      }
      setPendingTrainingPreset(null);
    }
  };

  return {
    savedProfiles,
    setSavedProfiles,
    profilesLoading,
    currentProfile,
    setCurrentProfile,
    currentAlgorithmState,
    setCurrentAlgorithmState,
    showProfileCreate,
    setShowProfileCreate,
    pendingTrainingPreset,
    setPendingTrainingPreset,
    loadProfileData,
    handleProfileSave
  };
}; 