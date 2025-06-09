import { BrowserProfile } from './profile';

export interface BrowserSettings {
  useIncognito: boolean;
  muteAudio: boolean;
  speed: number;
  clearCookies: boolean;
  blockAds: boolean;
  userAgent: string;
  viewport: { width: number; height: number };
  cookiePersistence: 'none' | 'session' | 'persistent';
  profileLoadStrategy: 'fresh' | 'restore' | 'quick';
  profileManagement: 'isolated' | 'shared' | 'profile-based';
  autoBackup: boolean;
}

export interface AnonymousConfig {
  enabled: boolean;
  rotateUserAgent: boolean;
  cookieStrategy: 'persist' | 'session' | 'clear' | 'rotate';
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
