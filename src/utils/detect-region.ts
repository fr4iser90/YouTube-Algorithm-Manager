/**
 * Detects the user's region based on YouTube settings and IP geolocation
 * @returns {Promise<string>} Region code (e.g., 'US', 'DE', 'JP')
 */
export async function detectRegion(): Promise<string> {
  // First try to get region from YouTube interface
  const ytRegionElement = document.querySelector('meta[property="og:locale:alternate"]');
  if (ytRegionElement) {
    const ytRegion = ytRegionElement.getAttribute('content');
    if (ytRegion) {
      return ytRegion.split('_')[1]; // Convert 'en_US' to 'US'
    }
  }

  // Try to get region from YouTube's gl parameter
  const urlParams = new URLSearchParams(window.location.search);
  const glParam = urlParams.get('gl');
  if (glParam) {
    return glParam.toUpperCase();
  }

  // Fallback to browser's timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const regionMap: Record<string, string> = {
    'America/New_York': 'US',
    'America/Los_Angeles': 'US',
    'Europe/Berlin': 'DE',
    'Europe/London': 'GB',
    'Asia/Tokyo': 'JP',
    'Asia/Shanghai': 'CN',
    'Europe/Paris': 'FR',
    'Europe/Rome': 'IT',
    'Europe/Madrid': 'ES',
    'Europe/Moscow': 'RU'
  };
  return regionMap[timezone] || 'US';
}

/**
 * Gets the country flag emoji for a region code
 * @param {string} regionCode - Region code (e.g., 'US', 'DE', 'JP')
 * @returns {string} Country flag emoji
 */
export function getRegionFlag(regionCode: string): string {
  const flagMap: Record<string, string> = {
    US: '🇺🇸',
    DE: '🇩🇪',
    GB: '🇬🇧',
    JP: '🇯🇵',
    CN: '🇨🇳',
    FR: '🇫🇷',
    IT: '🇮🇹',
    ES: '🇪🇸',
    RU: '🇷🇺',
    KR: '🇰🇷'
  };
  return flagMap[regionCode] || '🌐';
} 