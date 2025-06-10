// YouTube Cookie Management Module
console.log('🍪 Cookie Management Module loaded');

class CookieManager {
  constructor() {
    console.log('🍪 Cookie Manager initialized');
  }

  async handleCookieConsent() {
    try {
      const selectors = [
        // YouTube's latest consent button structure
        'button[aria-label*="Accept"]',
        'button[aria-label*="Akzeptieren"]',
        'button[aria-label*="Alle akzeptieren"]',
        'button[aria-label*="Accept all"]',
        'button[aria-label*="I agree"]',
        'button[aria-label*="Ich stimme zu"]',
        // YouTube's specific button classes
        'button.yt-spec-button-shape-next--filled',
        'button.yt-spec-button-shape-next--call-to-action',
        'div.yt-spec-touch-feedback-shape__fill',
        // Parent elements that might contain the actual button
        'ytd-consent-bump-v2-lightbox button',
        'ytd-consent-bump-v2-lightbox .yt-spec-button-shape-next',
        // Specific button classes
        'button[jsname*="tWT92d"]',
        'button[jsname*="ZUkOIc"]',
        // Form submit buttons
        'form[action*="consent"] button[type="submit"]',
        // Generic consent buttons
        'button.yt-spec-button-shape-next',
        // Cookie banner specific
        'div[aria-modal="true"] button',
        'div[role="dialog"] button'
      ];

      // Try each selector
      for (const selector of selectors) {
        const button = await this.waitForElement(selector, 1000);
        if (button) {
          // Try both click() and mousedown/mouseup events
          button.click();
          button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
          console.log('✅ Cookie consent accepted with selector:', selector);
          return;
        }
      }
      
      console.log('No cookie consent dialog found or already accepted');
    } catch (error) {
      console.log('No cookie consent dialog found or already accepted');
    }
  }

  async waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return null;
  }
}

// Create and export the cookie manager instance
window.cookieManager = new CookieManager(); 