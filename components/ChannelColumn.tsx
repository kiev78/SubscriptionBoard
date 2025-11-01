import React from 'react';
import type { Channel } from '../types';
import VideoCard from './VideoCard';

interface ChannelColumnProps {
  channel: Channel;
}

const ChannelColumn: React.FC<ChannelColumnProps> = ({ channel }) => {
  return (
    <div className="flex-shrink-0 w-80 md:w-96 bg-gray-800 rounded-xl shadow-lg flex flex-col h-min">
      <div className="p-4 flex items-center space-x-3 border-b border-gray-700">
        <img
          src={channel.channelThumbnailUrl}
          alt={`${channel.channelName} thumbnail`}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
        />
        <h2 className="font-semibold text-gray-200 truncate">{channel.channelName}</h2>
      </div>
      <div className="p-2">
        <VideoCard video={channel.latestVideo} channelName={channel.channelName} />
      </div>
    </div>
  );
};

export default ChannelColumn;
