
export interface Video {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
}

export interface Channel {
  channelName: string;
  channelId: string;
  channelThumbnailUrl: string;
  latestVideo: Video;
}
