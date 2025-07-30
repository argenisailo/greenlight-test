import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';

const AuthProvider = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Client Management System
            </h1>
            <p className="text-gray-600">
              Sign in with your Microsoft account to access your clients
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
              <p className="text-sm text-gray-500">
                Demo Mode: Click above to continue with mock authentication
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>🔒 Secure enterprise authentication</p>
              <p>📊 Client management with real-time search</p>
              <p>📁 SharePoint integration for documents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthProvider;