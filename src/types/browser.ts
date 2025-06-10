import { BrowserProfile } from './profile';

export interface BrowserSettings {
  useIncognito: boolean;
  muteAudio: boolean;
  speed: number;
  blockAds: boolean;
  userAgent: string;
  viewport: { width: number; height: number };
  profileLoadStrategy: 'fresh' | 'restore' | 'quick';
  profileManagement: 'isolated' | 'shared' | 'profile-based';
  autoBackup: boolean;
}

export interface AnonymousConfig {
  enabled: boolean;
  rotateUserAgent: boolean;
  profiles: BrowserProfile[];
  activeProfile: string | null;
  useVPN: boolean;
  randomizeViewport: boolean;
  disableWebRTC: boolean;
  spoofTimezone: boolean;
  blockTracking: boolean;
  autoSaveProfiles: boolean;
  quickLoadEnabled: boolean;
}
