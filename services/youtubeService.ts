import type { Channel } from '../types';

const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Simplified types for API responses
interface YouTubeSubscription {
  snippet: {
    title: string;
    resourceId: { channelId: string };
    thumbnails: { default: { url: string } };
  };
}

interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: { high?: { url: string }; standard?: {url: string}; medium?: {url: string} };
  };
  contentDetails: { duration: string };
  statistics: { viewCount: string };
}

async function apiFetch(url: string, token: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('AUTH_ERROR');
    }
    const errorData = await response.json();
    console.error("YouTube API Error:", errorData);
    throw new Error(`Failed to fetch data: ${errorData.error?.message || response.statusText}`);
  }
  return response.json();
}

export async function fetchYouTubeData(token: string): Promise<Channel[]> {
  // 1. Fetch first page of subscriptions (up to 12)
  const subsData = await apiFetch(`${API_BASE_URL}/subscriptions?part=snippet&mine=true&maxResults=12&order=alphabetical`, token);
  const subscriptions: YouTubeSubscription[] = subsData.items || [];

  if (subscriptions.length === 0) {
    return [];
  }
  
  const channelIds = subscriptions.map(sub => sub.snippet.resourceId.channelId);

  // 2. For each channel, find the latest video ID using the search endpoint
  const searchPromises = channelIds.map(channelId =>
    apiFetch(`${API_BASE_URL}/search?part=id&channelId=${channelId}&maxResults=1&order=date&type=video`, token)
  );
  const searchResults = await Promise.all(searchPromises);
  const videoIds = searchResults
    .map(result => result.items?.[0]?.id?.videoId)
    .filter((id): id is string => !!id);

  if (videoIds.length === 0) {
    return [];
  }

  // 3. Fetch full details for all found video IDs in a single batch request
  const videoDetailsData = await apiFetch(`${API_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(',')}`, token);
  const videoDetailsMap = new Map<string, YouTubeVideoDetails>();
  (videoDetailsData.items || []).forEach((item: YouTubeVideoDetails) => {
    videoDetailsMap.set(item.id, item);
  });
  
  // 4. Combine subscription and video data into the final Channel[] structure
  const channels: Channel[] = subscriptions.map(sub => {
    const channelId = sub.snippet.resourceId.channelId;
    const searchResultForChannel = searchResults[channelIds.indexOf(channelId)];
    const videoId = searchResultForChannel?.items?.[0]?.id?.videoId;

    if (!videoId) return null;

    const videoDetails = videoDetailsMap.get(videoId);
    if (!videoDetails) return null;
    
    // Pick the best available thumbnail
    const thumbnail = videoDetails.snippet.thumbnails.high ?? videoDetails.snippet.thumbnails.standard ?? videoDetails.snippet.thumbnails.medium;

    return {
      channelId: channelId,
      channelName: sub.snippet.title,
      channelThumbnailUrl: sub.snippet.thumbnails.default.url,
      latestVideo: {
        videoId: videoDetails.id,
        title: videoDetails.snippet.title,
        thumbnailUrl: thumbnail?.url || '',
        publishedAt: videoDetails.snippet.publishedAt,
        viewCount: videoDetails.statistics.viewCount,
        duration: videoDetails.contentDetails.duration,
      }
    };
  }).filter((c): c is Channel => c !== null);

  return channels;
}