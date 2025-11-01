/**
 * Parses an ISO 8601 duration string (e.g., "PT15M32S") into a readable format (e.g., "15:32").
 * @param isoDuration The ISO 8601 duration string.
 * @returns A formatted string "HH:MM:SS" or "MM:SS".
 */
export const parseISODuration = (isoDuration: string | undefined): string => {
  if (!isoDuration) return '0:00';

  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);

  if (!matches) return '0:00';

  const hours = matches[1] ? parseInt(matches[1], 10) : 0;
  const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
  const seconds = matches[3] ? parseInt(matches[3], 10) : 0;

  const hStr = String(hours);
  const mStr = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
  const sStr = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${hStr}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
};

/**
 * Formats a raw view count string into a shortened, readable format (e.g., "1.2M views").
 * @param viewCount The raw view count as a string.
 * @returns A formatted string.
 */
export const formatViewCount = (viewCount: string | undefined): string => {
  if (!viewCount) return '0 views';

  const num = parseInt(viewCount, 10);
  if (isNaN(num)) return '0 views';

  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B views';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M views';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K views';
  }
  return num.toLocaleString() + (num === 1 ? ' view' : ' views');
};