export class ProfileManager {
  constructor() {
    console.log('👤 Profile Manager initialized');
  }

  async getProfiles() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['profiles'], (result) => {
        console.log('📦 Profiles loaded from storage:', result.profiles);
        resolve(result.profiles || []);
      });
    });
  }

  async saveProfiles(profiles) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ profiles }, () => {
        console.log('💾 Profiles saved successfully!', profiles);
        resolve({ success: true });
      });
    });
  }

  async addProfile(profile) {
    const profiles = await this.getProfiles();
    const updatedProfiles = [...profiles, profile];
    return this.saveProfiles(updatedProfiles);
  }

  async deleteProfile(profileId) {
    const profiles = await this.getProfiles();
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    return this.saveProfiles(updatedProfiles);
  }

  async getProfile(profileId) {
    const profiles = await this.getProfiles();
    return profiles.find(p => p.id === profileId);
  }
}
