import React, { useState } from 'react';
import type { Video } from '../types';
import { formatViewCount, parseISODuration } from '../utils/formatters';
import { summarizeVideo } from '../services/geminiService';

interface VideoCardProps {
  video: Video;
  channelName: string;
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

const VideoCard: React.FC<VideoCardProps> = ({ video, channelName }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const handleSummarizeClick = async () => {
    if (summary) {
      setSummary(null);
      setSummaryError(null);
      return;
    }

    setIsSummarizing(true);
    setSummaryError(null);
    try {
      const result = await summarizeVideo(video.title, channelName);
      setSummary(result);
    } catch (error) {
      setSummaryError("Could not generate summary. Please try again.");
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="bg-gray-700/50 rounded-lg overflow-hidden shadow-md group transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="block">
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
      </a>
      <div className="p-3">
        <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="block">
          <h3 className="font-bold text-gray-100 leading-tight mb-2 group-hover:text-red-400 transition-colors duration-300 line-clamp-2">
            {video.title}
          </h3>
        </a>
        <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
          <span>{formatViewCount(video.viewCount)}</span>
          <span>{formatTimeAgo(video.publishedAt)}</span>
        </div>

        {/* --- AI Summary Section --- */}
        <button
          onClick={handleSummarizeClick}
          disabled={isSummarizing}
          className="w-full text-xs font-semibold py-1.5 px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-2
            bg-gray-600/70 hover:bg-gray-600 text-gray-200
            disabled:bg-gray-500 disabled:cursor-not-allowed"
          aria-live="polite"
        >
          {isSummarizing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Summarizing...
            </>
          ) : summary ? 'Hide Summary' : 'Summarize with AI ✨' }
        </button>

        {summary && (
          <div className="mt-3 p-3 bg-gray-900/40 rounded-md text-xs text-gray-300 border border-gray-600/50" role="status">
            <p className="font-bold mb-1 text-gray-200">AI Summary</p>
            <p className="leading-relaxed">{summary}</p>
          </div>
        )}

        {summaryError && (
          <div className="mt-3 p-2 bg-red-900/50 rounded-md text-xs text-red-200 text-center" role="alert">
            <p>{summaryError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
