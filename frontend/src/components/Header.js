import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Plus, Users, LogOut, User } from 'lucide-react';

const Header = ({ 
  user, 
  onLogout, 
  searchTerm, 
  onSearchChange, 
  selectedClientType, 
  onClientTypeChange 
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                Client Manager
              </span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isHomePage 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Clients
              </Link>
              <Link 
                to="/create" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/create'
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Add Client
              </Link>
            </nav>
          </div>

          {/* Search and Filters - Only show on home page */}
          {isHomePage && (
            <div className="flex-1 max-w-2xl mx-8">
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients by name, email, company..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Client Type Filter */}
                <select
                  value={selectedClientType}
                  onChange={(e) => onClientTypeChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="person">Persons</option>
                  <option value="company">Companies</option>
                </select>
              </div>
            </div>
          )}

          {/* User Menu and Actions */}
          <div className="flex items-center space-x-4">
            {/* Add Client Button - Mobile */}
            <Link
              to="/create"
              className="md:hidden p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
            </Link>

            {/* Add Client Button - Desktop */}
            <Link
              to="/create"
              className="hidden md:flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.name || 'User'}</span>
              </div>
              
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;