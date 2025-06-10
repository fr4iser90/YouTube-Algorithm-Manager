function calculateVideoScore(videoElement, preset) {
  const titleElement = videoElement.querySelector('#video-title');
  const channelElement = videoElement.querySelector('#channel-name a');
  const meta = videoElement.querySelector('#metadata-line span');
  
  const title = titleElement?.textContent?.trim().toLowerCase() || '';
  const channel = channelElement?.textContent?.trim().toLowerCase() || '';
  const viewsText = meta?.textContent?.toLowerCase() || '';

  let views = 0;
  if (viewsText.includes('k')) {
    views = parseFloat(viewsText.replace('k', '')) * 1000;
  } else if (viewsText.includes('m')) {
    views = parseFloat(viewsText.replace('m', '')) * 1000000;
  } else {
    views = parseInt(viewsText.replace(/\D/g, '')) || 0;
  }

  let score = 0;

  // 1. Keyword Scoring
  if (preset.targetKeywords) {
    for (const keyword of preset.targetKeywords) {
      if (title.includes(keyword.toLowerCase())) {
        score += 15; // Increased weight for target keywords
      }
    }
  }
  if (preset.avoidKeywords) {
    for (const keyword of preset.avoidKeywords) {
      if (title.includes(keyword.toLowerCase())) {
        score -= 30; // Increased penalty for avoided keywords
      }
    }
  }

  // 2. Channel Preferences Scoring
  if (preset.channelPreferences) {
    for (const pref of preset.channelPreferences) {
      if (channel.includes(pref.channelName.toLowerCase())) {
        if (pref.action === 'avoid' || pref.action === 'block') {
          score -= 1000; // Drastic penalty to ensure avoidance
        } else if (pref.action === 'prioritize') {
          score += 50;
        }
      }
    }
  }

  // 3. Quality Scoring
  if (views < 1000) {
    score -= 50; // Penalize very low view counts
  }
  if (views > 100000) {
      score += 5; // Slightly reward popular videos
  }

  // 4. Negative Keyword Pairings (e.g., "deutschland" + "afd")
  if (preset.negativePairs) {
      for(const pair of preset.negativePairs) {
          if(pair.every(keyword => title.includes(keyword.toLowerCase()))) {
              score -= 500; // Heavy penalty for unwanted combinations
          }
      }
  }

  return { video: videoElement, score, title, channel };
}
