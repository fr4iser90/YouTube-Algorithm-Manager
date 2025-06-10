export class ProfileManager {
  constructor() {
    this.profiles = [];
    this.activeProfileId = null;
    console.log('👤 Profile Manager initialized');
  }

  async getProfiles() {
    try {
      const { profiles } = await chrome.storage.local.get('profiles');
      this.profiles = profiles || [];
      console.log('📦 Profiles loaded from storage:', this.profiles);
      return this.profiles;
    } catch (error) {
      console.error('Error getting profiles:', error);
      return [];
    }
  }

  async saveProfiles(profiles) {
    try {
      await chrome.storage.local.set({ profiles });
      this.profiles = profiles;
      console.log('💾 Profiles saved successfully!', this.profiles);
    } catch (error) {
      console.error('Error saving profiles:', error);
    }
  }

  async addProfile(profile) {
    try {
      const profiles = await this.getProfiles();
      profiles.push(profile);
      await this.saveProfiles(profiles);
      return profile;
    } catch (error) {
      console.error('Error adding profile:', error);
      throw error;
    }
  }

  async deleteProfile(profileId) {
    try {
      const profiles = await this.getProfiles();
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      await this.saveProfiles(updatedProfiles);
      
      if (this.activeProfileId === profileId) {
        this.activeProfileId = null;
        await chrome.storage.local.remove('activeProfileId');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }

  async getProfile(profileId) {
    try {
      const profiles = await this.getProfiles();
      return profiles.find(p => p.id === profileId);
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  async switchProfile(profileId) {
    try {
      const profile = await this.getProfile(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      this.activeProfileId = profileId;
      await chrome.storage.local.set({ activeProfileId: profileId });

      // Notify all YouTube tabs about the profile switch
      const tabs = await chrome.tabs.query({ url: '*://*.youtube.com/*' });
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'PROFILE_SWITCHED',
          profileId
        });
      }

      return { success: true, profile };
    } catch (error) {
      console.error('Error switching profile:', error);
      throw error;
    }
  }
}
