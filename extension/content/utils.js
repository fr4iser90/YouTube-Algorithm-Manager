function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function humanDelay(min = 1000, max = 5000) {
  const ms = Math.random() * (max - min) + min;
  return delay(ms);
}

async function waitForElement(selector, timeout = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const el = document.querySelector(selector);
    if (el) return el;
    await delay(200);
  }
  throw new Error(`Element ${selector} not found after ${timeout}ms`);
}

async function typeText(element, text) {
  for (const char of text) {
    element.value += char;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    await delay(Math.random() * 150 + 50);
  }
}

function getVideoId(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      return urlObj.searchParams.get('v');
    }
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    return null;
  } catch (e) {
    return null;
  }
}
