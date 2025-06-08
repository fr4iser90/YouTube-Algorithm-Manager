// This script is only executed on the YouTube history page.

(async function() {
  console.log('📜 History analyzer script started.');

  console.log('📜 Starting definitive smart scroll for history...');
  let lastVideoCount = 0;
  let consecutiveStops = 0;
  const maxConsecutiveStops = 3; // Stop after 3 scrolls with no new videos

  for (let i = 0; i < 300; i++) { // Very generous limit
    lastVideoCount = document.querySelectorAll('#video-title').length;
    
    // Scroll the main document element
    window.scrollTo(0, document.documentElement.scrollHeight);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newVideoCount = document.querySelectorAll('#video-title').length;

    if (newVideoCount > lastVideoCount) {
      console.log(`📜 Found more history videos. Count: ${newVideoCount}`);
      consecutiveStops = 0;
    } else {
      consecutiveStops++;
      console.log(`📜 History video count unchanged. Stop attempt ${consecutiveStops} of ${maxConsecutiveStops}.`);
      if (consecutiveStops >= maxConsecutiveStops) {
        console.log('📜 End of history page reached. Stopping scroll.');
        break;
      }
    }
  }

  const titles = [];
  document.querySelectorAll('#video-title').forEach(el => {
    if (el.textContent) {
      titles.push(el.textContent.trim());
    }
  });

  console.log(`Found ${titles.length} videos in history.`);

  chrome.runtime.sendMessage({
    type: 'HISTORY_ANALYSIS_COMPLETE',
    results: {
      historyVideos: titles
    }
  });
})();
