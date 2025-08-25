import React from 'react';
import { ArrowRight } from 'lucide-react';

const AuthProvider = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-canopy-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            {/* Canopy-style logo */}
            <div className="mx-auto w-16 h-16 bg-canopy-blue rounded-lg flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-2 border-white transform rotate-45"></div>
            </div>
            <h1 className="text-2xl font-semibold text-canopy-text mb-2">
              Greenlight App
            </h1>
            <p className="text-canopy-textMuted">
              Sign in with your Microsoft account to access your clients
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center px-4 py-3 bg-canopy-blue hover:bg-canopy-blueHover text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-canopy-blue focus:ring-offset-2"
            >
              <img 
                src="https://developer.microsoft.com/favicon.ico" 
                alt="Microsoft" 
                className="w-5 h-5 mr-3"
              />
              Sign in with Microsoft
              <ArrowRight className="ml-3 h-4 w-4" />
            </button>

            <div className="text-center">
              <p className="text-sm text-canopy-textMuted">
                Demo Mode: Click above to continue with mock authentication
              </p>
            </div>
          </div>

          {/* <div className="mt-8 pt-6 border-t border-canopy-border">
            <div className="text-xs text-canopy-textMuted text-center space-y-1">
              <p>🔒 Secure enterprise authentication</p>
              <p>📊 Client management with real-time search</p>
              <p>📁 SharePoint integration for documents</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AuthProvider;