// YouTube Ad Detection Module
console.log('🎯 Ad Detection Module loaded');

class AdDetector {
  constructor() {
    // Ad container selectors
    this.adSelectors = [
      '.ytp-ad-player-overlay',           // Ad overlay
      '.ytp-ad-overlay-container',        // Ad overlay container
      '.ytp-ad-overlay-slot',             // Ad overlay slot
      '.ytp-ad-module',                   // Ad module
      '.ytp-ad-preview-container',        // Ad preview
      '.ytp-ad-preview-slot',             // Ad preview slot
      '.ytp-ad-skip-button-container',    // Skip button container
      '.ytp-ad-skip-button-modern',       // Modern skip button
      '.ytp-ad-skip-button',              // Classic skip button
      '.ytp-skip-ad-button',              // Skip button
      '.ytp-skip-ad-button__text',        // Skip button text
      '.ytp-ad-overlay-close-button',     // Close button
      'div[id="player-ads"]',             // Player ads
      'div[id="masthead-ad"]',            // Masthead ad
      'div[id="player-overlay"]',         // Player overlay
      'div[class*="ytp-ad-"]',            // Any ytp-ad class
      'div[class*="ytp-ad"]',             // Any ytp-ad class
      'div[id*="ad-"]',                   // Any ad id
      'div[class*="ad-"]',                // Any ad class
      'div[class*="advertisement"]',      // Advertisement class
      'div[class*="ad-container"]',       // Ad container
      'div[class*="ad-slot"]',            // Ad slot
      'div[class*="ad-overlay"]',         // Ad overlay
      'div[class*="ad-player"]',          // Ad player
      'div[class*="ad-module"]',          // Ad module
      'div[class*="ad-preview"]',         // Ad preview
      'div[class*="ad-skip"]',            // Ad skip
      'div[class*="ad-close"]',           // Ad close
      'div[class*="ad-text"]',            // Ad text
      'div[class*="ad-title"]',           // Ad title
      'div[class*="ad-description"]',     // Ad description
      'div[class*="ad-duration"]',        // Ad duration
      'div[class*="ad-progress"]',        // Ad progress
      'div[class*="ad-controls"]',        // Ad controls
      'div[class*="ad-buttons"]',         // Ad buttons
      'div[class*="ad-button"]',          // Ad button
      'div[class*="ad-icon"]',            // Ad icon
      'div[class*="ad-logo"]',            // Ad logo
      'div[class*="ad-brand"]',           // Ad brand
      'div[class*="ad-creator"]',         // Ad creator
      'div[class*="ad-sponsor"]',         // Ad sponsor
      'div[class*="ad-sponsored"]',       // Ad sponsored
      'div[class*="ad-promoted"]',        // Ad promoted
      'div[class*="ad-featured"]',        // Ad featured
      'div[class*="ad-recommended"]',     // Ad recommended
      'div[class*="ad-suggested"]',       // Ad suggested
      'div[class*="ad-related"]',         // Ad related
      'div[class*="ad-similar"]',          // Ad similar
      'div[class*="ad-more"]',             // Ad more
      'div[class*="ad-next"]',             // Ad next
      'div[class*="ad-previous"]',         // Ad previous
      'div[class*="ad-up-next"]',          // Ad up next
      'div[class*="ad-autoplay"]',         // Ad autoplay
      'div[class*="ad-skip-button"]',      // Ad skip button
      'div[class*="ad-close-button"]',     // Ad close button
      'div[class*="ad-mute-button"]',      // Ad mute button
      'div[class*="ad-unmute-button"]',    // Ad unmute button
      'div[class*="ad-volume-button"]',    // Ad volume button
      'div[class*="ad-fullscreen-button"]', // Ad fullscreen button
      'div[class*="ad-pause-button"]',     // Ad pause button
      'div[class*="ad-play-button"]',      // Ad play button
      'div[class*="ad-replay-button"]',    // Ad replay button
      'div[class*="ad-settings-button"]',  // Ad settings button
      'div[class*="ad-quality-button"]',   // Ad quality button
      'div[class*="ad-speed-button"]',     // Ad speed button
      'div[class*="ad-caption-button"]',   // Ad caption button
      'div[class*="ad-subtitle-button"]',  // Ad subtitle button
      'div[class*="ad-audio-button"]',     // Ad audio button
      'div[class*="ad-video-button"]',     // Ad video button
      'div[class*="ad-picture-button"]',   // Ad picture button
      'div[class*="ad-info-button"]',      // Ad info button
      'div[class*="ad-help-button"]',      // Ad help button
      'div[class*="ad-feedback-button"]',  // Ad feedback button
      'div[class*="ad-report-button"]',    // Ad report button
      'div[class*="ad-share-button"]',     // Ad share button
      'div[class*="ad-embed-button"]',     // Ad embed button
      'div[class*="ad-download-button"]',  // Ad download button
      'div[class*="ad-save-button"]',      // Ad save button
      'div[class*="ad-like-button"]',      // Ad like button
      'div[class*="ad-dislike-button"]',   // Ad dislike button
      'div[class*="ad-comment-button"]',   // Ad comment button
      'div[class*="ad-subscribe-button"]', // Ad subscribe button
      'div[class*="ad-notify-button"]',    // Ad notify button
      'div[class*="ad-bell-button"]',      // Ad bell button
      'div[class*="ad-menu-button"]',      // Ad menu button
      'div[class*="ad-more-button"]',      // Ad more button
      'div[class*="ad-options-button"]',   // Ad options button
      'div[class*="ad-settings-button"]',  // Ad settings button
      'div[class*="ad-preferences-button"]', // Ad preferences button
      'div[class*="ad-account-button"]',   // Ad account button
      'div[class*="ad-profile-button"]',   // Ad profile button
      'div[class*="ad-login-button"]',     // Ad login button
      'div[class*="ad-signup-button"]',    // Ad signup button
      'div[class*="ad-register-button"]',  // Ad register button
      'div[class*="ad-join-button"]',      // Ad join button
      'div[class*="ad-create-button"]',    // Ad create button
      'div[class*="ad-add-button"]',       // Ad add button
      'div[class*="ad-remove-button"]',    // Ad remove button
      'div[class*="ad-delete-button"]',    // Ad delete button
      'div[class*="ad-edit-button"]',      // Ad edit button
      'div[class*="ad-update-button"]',    // Ad update button
      'div[class*="ad-change-button"]',    // Ad change button
      'div[class*="ad-modify-button"]',    // Ad modify button
      'div[class*="ad-customize-button"]', // Ad customize button
      'div[class*="ad-personalize-button"]', // Ad personalize button
      'div[class*="ad-tailor-button"]',    // Ad tailor button
      'div[class*="ad-adapt-button"]',     // Ad adapt button
      'div[class*="ad-adjust-button"]',    // Ad adjust button
      'div[class*="ad-configure-button"]', // Ad configure button
      'div[class*="ad-setup-button"]',     // Ad setup button
      'div[class*="ad-install-button"]',   // Ad install button
      'div[class*="ad-download-button"]',  // Ad download button
      'div[class*="ad-update-button"]',    // Ad update button
      'div[class*="ad-upgrade-button"]',   // Ad upgrade button
      'div[class*="ad-install-button"]',   // Ad install button
      'div[class*="ad-download-button"]',  // Ad download button
      'div[class*="ad-update-button"]',    // Ad update button
      'div[class*="ad-upgrade-button"]',   // Ad upgrade button
      'div[class*="ad-install-button"]',   // Ad install button
      'div[class*="ad-download-button"]',  // Ad download button
      'div[class*="ad-update-button"]',    // Ad update button
      'div[class*="ad-upgrade-button"]'    // Ad upgrade button
    ];

    // Skip button selectors
    this.skipSelectors = [
      '.ytp-skip-ad-button__text',        // New YouTube skip button text
      '.ytp-ad-skip-button',              // Skip button container
      '.ytp-ad-skip-button-modern',       // Modern skip button
      '.ytp-skip-ad-button',              // Skip button
      'button[aria-label="Skip Ad"]',     // English skip button
      'button[aria-label="Werbung überspringen"]', // German skip button
      'button[aria-label="Skip"]',        // Generic skip button
      'button[aria-label="Überspringen"]', // German generic skip button
      'button.ytp-ad-skip-button',        // Button with class
      'button.ytp-ad-skip-button-container', // Button container
      'div.ytp-ad-skip-button-container button', // Container button
      'button[aria-label*="Skip"]',       // Any skip button
      'button[aria-label*="Überspringen"]', // Any German skip button
      '.ytp-ad-overlay-close-button',     // Close button
      'button[aria-label="Close ad"]',    // English close button
      'button[aria-label="Werbung schließen"]' // German close button
    ];

    // Ad text indicators
    this.adTextIndicators = [
      'Ad',
      'Werbung',
      'Advertisement',
      'Sponsored',
      'Gesponsert',
      'Promoted',
      'Beworben',
      'Featured',
      'Hervorgehoben',
      'Recommended',
      'Empfohlen',
      'Suggested',
      'Vorgeschlagen',
      'Related',
      'Verwandt',
      'Similar',
      'Ähnlich',
      'More',
      'Mehr',
      'Next',
      'Nächste',
      'Previous',
      'Vorherige',
      'Up next',
      'Als nächstes',
      'Autoplay',
      'Automatisch abspielen',
      'Skip',
      'Überspringen',
      'Close',
      'Schließen',
      'Mute',
      'Stummschalten',
      'Unmute',
      'Stummschaltung aufheben',
      'Volume',
      'Lautstärke',
      'Fullscreen',
      'Vollbild',
      'Pause',
      'Pause',
      'Play',
      'Abspielen',
      'Replay',
      'Wiederholen',
      'Settings',
      'Einstellungen',
      'Quality',
      'Qualität',
      'Speed',
      'Geschwindigkeit',
      'Caption',
      'Untertitel',
      'Subtitle',
      'Untertitel',
      'Audio',
      'Audio',
      'Video',
      'Video',
      'Picture',
      'Bild',
      'Info',
      'Info',
      'Help',
      'Hilfe',
      'Feedback',
      'Feedback',
      'Report',
      'Melden',
      'Share',
      'Teilen',
      'Embed',
      'Einbetten',
      'Download',
      'Herunterladen',
      'Save',
      'Speichern',
      'Like',
      'Gefällt mir',
      'Dislike',
      'Gefällt mir nicht',
      'Comment',
      'Kommentar',
      'Subscribe',
      'Abonnieren',
      'Notify',
      'Benachrichtigen',
      'Bell',
      'Glocke',
      'Menu',
      'Menü',
      'More',
      'Mehr',
      'Options',
      'Optionen',
      'Settings',
      'Einstellungen',
      'Preferences',
      'Voreinstellungen',
      'Account',
      'Konto',
      'Profile',
      'Profil',
      'Login',
      'Anmelden',
      'Signup',
      'Registrieren',
      'Register',
      'Registrieren',
      'Join',
      'Beitreten',
      'Create',
      'Erstellen',
      'Add',
      'Hinzufügen',
      'Remove',
      'Entfernen',
      'Delete',
      'Löschen',
      'Edit',
      'Bearbeiten',
      'Update',
      'Aktualisieren',
      'Change',
      'Ändern',
      'Modify',
      'Anpassen',
      'Customize',
      'Anpassen',
      'Personalize',
      'Personalisieren',
      'Tailor',
      'Anpassen',
      'Adapt',
      'Anpassen',
      'Adjust',
      'Anpassen',
      'Configure',
      'Konfigurieren',
      'Setup',
      'Einrichten',
      'Install',
      'Installieren',
      'Download',
      'Herunterladen',
      'Update',
      'Aktualisieren',
      'Upgrade',
      'Upgraden'
    ];
  }

  startAdDetection(video) {
    // Check for ads every 500ms
    let adSkipInterval = setInterval(() => {
      this.trySkipAd(video);
    }, 500);

    return adSkipInterval;
  }

  isAdPresent() {
    // Check for ad containers
    for (const selector of this.adSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element.offsetParent !== null) {
          return true;
        }
      }
    }

    // Check for ad text
    const pageText = document.body.innerText.toLowerCase();
    for (const indicator of this.adTextIndicators) {
      if (pageText.includes(indicator.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  trySkipAd(video) {
    // First check if an ad is present
    if (!this.isAdPresent()) {
      return;
    }

    // Try to find and click any skip button
    for (const selector of this.skipSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element.offsetParent !== null) { // Check if element is visible
          try {
            // If we found the text element, click its parent button
            const button = element.closest('button') || element;
            if (button) {
              // Try multiple click methods
              button.click();
              button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
              button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
              button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
              
              // Also try to focus and press Enter
              button.focus();
              button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
              
              // Try to click the parent if it's a text element
              if (element.classList.contains('ytp-skip-ad-button__text')) {
                const parentButton = element.closest('.ytp-ad-skip-button');
                if (parentButton) {
                  parentButton.click();
                  parentButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                  parentButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                  parentButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                }
              }
              
              console.log('✅ Ad skip attempted with:', selector);
              break;
            }
          } catch (err) {
            console.log('Skip attempt failed:', err);
          }
        }
      }
    }

    // Also try to skip video ads by seeking
    if (video.duration && video.duration > 0) {
      // For short videos (likely ads)
      if (video.duration < 30) {
        try {
          video.currentTime = video.duration - 0.1;
          console.log('✅ Tried to seek to end of short video');
        } catch (err) {
          console.log('Could not seek video:', err);
        }
      }
      
      // For longer ads, try to skip to last 5 seconds
      if (video.duration > 30 && video.duration < 60) {
        try {
          video.currentTime = video.duration - 5;
          console.log('✅ Tried to skip to last 5 seconds');
        } catch (err) {
          console.log('Could not seek video:', err);
        }
      }
    }

    // Try to mute and speed up ads
    if (video.muted === false) {
      video.muted = true;
    }
    if (video.playbackRate < 2) {
      video.playbackRate = 2;
    }
  }
}

// Create and export the detector instance
window.adDetector = new AdDetector();
