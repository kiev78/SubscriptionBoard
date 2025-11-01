import React from 'react';
import type { Video } from '../types';
import { formatViewCount, parseISODuration } from '../utils/formatters';

interface VideoCardProps {
  video: Video;
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
};

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="block">
      <div className="bg-gray-700/50 rounded-lg overflow-hidden shadow-md group transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <div className="relative">
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-auto object-cover aspect-video" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
              </div>
          </div>
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">{parseISODuration(video.duration)}</span>
        </div>
        <div className="p-3">
          <h3 className="font-bold text-gray-100 leading-tight mb-2 group-hover:text-red-400 transition-colors duration-300 line-clamp-2">
            {video.title}
          </h3>
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>{formatViewCount(video.viewCount)}</span>
            <span>{formatTimeAgo(video.publishedAt)}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default VideoCard;