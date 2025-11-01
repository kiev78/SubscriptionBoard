import React, { useState, useEffect } from 'react';
import type { Channel } from './types';
import { fetchYouTubeData } from './services/youtubeService';
import ChannelColumn from './components/ChannelColumn';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './components/Login';

// --- IMPORTANT SETUP ---
// To fix the "unauthorized" error, you must configure your Google OAuth Client ID.
// 1. Go to the Google Cloud Console: https://console.cloud.google.com/
// 2. Create a new project or select an existing one.
// 3. Enable the "YouTube Data API v3":
//    - Go to "APIs & Services" -> "Library".
//    - Search for "YouTube Data API v3" and click "Enable".
// 4. Create OAuth credentials:
//    - Go to "APIs & Services" -> "Credentials".
//    - Click "Create Credentials" -> "OAuth client ID".
//    - Select "Web application" as the application type.
//    - Under "Authorized JavaScript origins", add the URL where your app is running.
//      This is a critical step. For local development, it might be http://localhost:xxxx
//      or a specific URL provided by your development environment.
// 5. Copy the "Client ID" that is generated and paste it below, replacing the placeholder.
//    DO NOT use a Client Secret in this client-side application.
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

declare global {
  interface Window {
    google: any;
  }
}

const App: React.FC = () => {
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('yt-token'));
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    if (CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
      setError('Error: Google Client ID is not configured. Please follow the setup instructions in App.tsx.');
      return;
    }
    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      setError("Google Auth is not ready. Please try again in a moment.");
    }
  };

  const handleLogout = () => {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        setAccessToken(null);
        localStorage.removeItem('yt-token');
        setChannels([]);
        setError(null);
      });
    }
  };
  
  useEffect(() => {
    const initializeGsi = () => {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: YOUTUBE_SCOPE,
          callback: (tokenResponse: any) => {
            if (tokenResponse.error) {
              setError(`Google Auth Error: ${tokenResponse.error_description || tokenResponse.error}. Please check your Client ID and Authorized Origins in the Google Cloud Console.`);
              return;
            }
            localStorage.setItem('yt-token', tokenResponse.access_token);
            setAccessToken(tokenResponse.access_token);
          },
        });
        setTokenClient(client);
      }
    };
    
    // The GSI script is loaded asynchronously, so we need to wait for it.
    if (window.google) {
      initializeGsi();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      script?.addEventListener('load', initializeGsi);
    }

  }, []);

  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    if (CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
      setError('Please configure your Google Client ID in App.tsx to connect to YouTube.');
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchYouTubeData(accessToken);
        const sortedData = data.sort((a, b) => 
          new Date(b.latestVideo.publishedAt).getTime() - new Date(a.latestVideo.publishedAt).getTime()
        );
        setChannels(sortedData);
      } catch (err: any) {
        console.error(err);
        if (err.message === 'AUTH_ERROR') {
          handleLogout();
          setError('Your session has expired. Please connect again.');
        } else {
          setError('Failed to fetch YouTube data. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [accessToken]);
  
  if (!accessToken) {
    return <Login onLoginClick={handleLogin} error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <header className="px-4 py-3 border-b border-gray-700 shadow-md bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.582 7.042c-.22-.812-.862-1.455-1.674-1.674C18.25 5 12 5 12 5s-6.25 0-7.908.368c-.812.219-1.454.862-1.674 1.674C2 8.692 2 12 2 12s0 3.308.368 4.958c.22.812.862 1.455 1.674 1.674C5.75 19 12 19 12 19s6.25 0 7.908-.368c.812-.219 1.454-.862 1.674-1.674C22 15.308 22 12 22 12s0-3.308-.418-4.958zM10 15.464V8.536L16 12l-6 3.464z" />
                </svg>
                <h1 className="text-xl font-bold tracking-wider">Subscription Board</h1>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors duration-200"
            >
              Logout
            </button>
        </div>
      </header>
      
      <main className="flex-grow flex overflow-hidden">
        {isLoading && <LoadingSpinner />}
        {error && !isLoading && (
          <div className="w-full flex items-center justify-center p-4">
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
              <p className="font-bold">An Error Occurred</p>
              <p>{error}</p>
            </div>
          </div>
        )}
        {!isLoading && !error && (
          <div className="flex-grow flex p-4 space-x-4 overflow-x-auto overflow-y-hidden">
            {channels.map((channel) => (
              <ChannelColumn key={channel.channelId} channel={channel} />
            ))}
            {channels.length === 0 && (
                <div className="w-full flex items-center justify-center text-gray-400">
                    <p>No subscriptions found or videos posted recently by your subscriptions.</p>
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;