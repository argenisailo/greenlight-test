import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Plus, LogOut, User, MoreHorizontal } from 'lucide-react';

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
    <div className="canopy-header">
      <div className="flex items-center justify-between">
        {/* Page Title and Add Button */}
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="canopy-page-title">Clients</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search - Only show on home page */}
            {isHomePage && (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-canopy-textMuted" />
                  <input
                    type="text"
                    placeholder="Search clients"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="canopy-search-input pl-10 w-80"
                  />
                </div>
              </div>
            )}

            {/* Add Client Button */}
            <Link
              to="/create"
              className="canopy-btn-primary flex items-center"
            >
              Add client
            </Link>

            {/* More Actions */}
            <button className="canopy-sidebar-icon">
              <MoreHorizontal className="h-5 w-5 text-canopy-textMuted" />
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-canopy-textMuted">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.name || 'User'}</span>
              </div>
              
              <button
                onClick={onLogout}
                className="p-2 text-canopy-textMuted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;