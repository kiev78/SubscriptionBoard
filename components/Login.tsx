import React from 'react';

interface LoginProps {
  onLoginClick: () => void;
  error: string | null;
}

const Login: React.FC<LoginProps> = ({ onLoginClick, error }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-md">
        <div className="flex justify-center items-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mr-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.582 7.042c-.22-.812-.862-1.455-1.674-1.674C18.25 5 12 5 12 5s-6.25 0-7.908.368c-.812.219-1.454.862-1.674 1.674C2 8.692 2 12 2 12s0 3.308.368 4.958c.22.812.862 1.455 1.674 1.674C5.75 19 12 19 12 19s6.25 0 7.908-.368c.812-.219 1.454-.862 1.674-1.674C22 15.308 22 12 22 12s0-3.308-.418-4.958zM10 15.464V8.536L16 12l-6 3.464z" />
          </svg>
          <h1 className="text-4xl font-bold tracking-wider">Subscription Board</h1>
        </div>
        <p className="text-gray-400 mb-8">
          View your YouTube subscriptions in a Trello-style board. Connect your account to get started.
        </p>
        <button
          onClick={onLoginClick}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center text-lg shadow-lg hover:shadow-red-500/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Connect YouTube Account
        </button>
        {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                <p>{error}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Login;