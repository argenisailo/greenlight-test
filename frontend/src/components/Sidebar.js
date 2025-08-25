import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  // CheckSquare, 
  // User, 
  Folder,
  // Clock, 
  // Settings, 
  // BarChart3,
  // FileText,
  // Calendar,
  // MessageCircle
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const sidebarItems = [
    { icon: Users, path: '/', label: 'Clients', active: true },
    { icon: Plus, path: '/create', label: 'Add Client' },
    // { icon: CheckSquare, path: '/tasks', label: 'Tasks' },
    // { icon: User, path: '/contacts', label: 'Contacts' },
    { icon: Folder, path: '/documents', label: 'Documents' },
    // { icon: Clock, path: '/time', label: 'Time Tracking' },
    // { icon: BarChart3, path: '/reports', label: 'Reports' },
    // { icon: FileText, path: '/templates', label: 'Templates' },
    // { icon: Calendar, path: '/calendar', label: 'Calendar' },
    // { icon: MessageCircle, path: '/messages', label: 'Messages' },
    // { icon: Settings, path: '/settings', label: 'Settings' },
  ];

  return (
    <div className="canopy-sidebar">
      {/* Logo */}
      <div className="canopy-sidebar-icon">
        <div className="w-8 h-8 bg-canopy-blue rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white transform rotate-45"></div>
        </div>
      </div>

      {/* Navigation Items */}
      {sidebarItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <div
            key={index}
            className={`canopy-sidebar-icon ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            <Icon className="w-5 h-5" />
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;