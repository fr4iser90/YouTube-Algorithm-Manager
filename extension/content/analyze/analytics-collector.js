// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_CHANNEL_DATA':
      sendResponse(getChannelDataFromPage(request.channelId));
      break;
    case 'GET_VIDEO_DATA':
      sendResponse(getVideoDataFromPage(request.videoId));
      break;
    case 'GET_SUBSCRIBED_CHANNELS':
      sendResponse(getSubscribedChannelsFromPage());
      break;
  }
  return true; // Keep the message channel open for async response
});

function getChannelDataFromPage(channelId) {
  // Get channel data from the current page
  const channelData = {
    subscribers: getSubscriberCount(),
    videos: getVideoCount(),
    views: getTotalViews(),
    joined: getJoinDate(),
    description: getChannelDescription()
  };
  return channelData;
}

function getVideoDataFromPage(videoId) {
  // Get video data from the current page
  const videoData = {
    views: getViewCount(),
    likes: getLikeCount(),
    comments: getCommentCount(),
    duration: getVideoDuration(),
    uploadDate: getUploadDate(),
    description: getVideoDescription()
  };
  return videoData;
}

function getSubscribedChannelsFromPage() {
  // Get list of subscribed channels
  const channels = [];
  document.querySelectorAll('ytd-channel-renderer').forEach(channel => {
    const channelId = channel.getAttribute('channel-id');
    const channelName = channel.querySelector('#channel-title').textContent.trim();
    channels.push({ id: channelId, name: channelName });
  });
  return channels;
}

// Helper functions for data extraction
function getSubscriberCount() {
  const subCount = document.querySelector('#subscriber-count');
  return subCount ? subCount.textContent.trim() : '0';
}

function getVideoCount() {
  const videoCount = document.querySelector('#video-count');
  return videoCount ? videoCount.textContent.trim() : '0';
}

function getTotalViews() {
  const viewCount = document.querySelector('#view-count');
  return viewCount ? viewCount.textContent.trim() : '0';
}

function getJoinDate() {
  const joinDate = document.querySelector('#join-date');
  return joinDate ? joinDate.textContent.trim() : '';
}

function getChannelDescription() {
  const description = document.querySelector('#description');
  return description ? description.textContent.trim() : '';
}

function getViewCount() {
  const viewCount = document.querySelector('#count .view-count');
  return viewCount ? viewCount.textContent.trim() : '0';
}

function getLikeCount() {
  const likeCount = document.querySelector('#top-level-buttons-computed button:first-child');
  return likeCount ? likeCount.textContent.trim() : '0';
}

function getCommentCount() {
  const commentCount = document.querySelector('#comments #count');
  return commentCount ? commentCount.textContent.trim() : '0';
}

function getVideoDuration() {
  const duration = document.querySelector('.ytp-time-duration');
  return duration ? duration.textContent.trim() : '';
}

function getUploadDate() {
  const uploadDate = document.querySelector('#info-strings yt-formatted-string');
  return uploadDate ? uploadDate.textContent.trim() : '';
}

function getVideoDescription() {
  const description = document.querySelector('#description-inline-expander');
  return description ? description.textContent.trim() : '';
} 