// This script is only executed on the YouTube history page.

(async function() {
  console.log('📜 History analyzer script started.');

  // Scroll down to load more videos
  for (let i = 0; i < 5; i++) {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const titles = [];
  // Find all title elements, which is a more robust approach.
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
