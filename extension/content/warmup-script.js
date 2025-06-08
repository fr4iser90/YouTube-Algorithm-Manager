// This script is injected into a new tab to "warm up" the session.

(async function() {
  console.log('🔥 Starting browser warm-up...');

  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'WARM_UP_BROWSER') {
      const { keywords } = message;
      console.log(' Warming up with keywords:', keywords);

      for (const keyword of keywords) {
        if (!keyword) continue;
        try {
          // Navigate to the search results page for each keyword.
          // We don't need to wait for the page to fully load.
          window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
          // A short delay to ensure the navigation is registered.
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (error) {
          console.error(`Error warming up with keyword "${keyword}":`, error);
        }
      }

      // After cycling through all keywords, navigate to the homepage.
      console.log('✅ Warm-up complete. Navigating to homepage.');
      window.location.href = 'https://www.youtube.com/';
      sendResponse({ success: true });
    }
  });
})();
