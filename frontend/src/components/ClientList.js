import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Plus, Filter, RotateCcw, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clientService } from '../services/clientService';

const ClientList = ({ clients, loading, onClientDeleted, searchTerm, selectedClientType }) => {
  const [selectedClients, setSelectedClients] = useState([]);
  const [activeTab, setActiveTab] = useState('active');

  const tabs = [
    { id: 'active', label: 'Active Clients', count: clients.filter(c => c.ownership?.relationship_type !== 'prospect').length },
    { id: 'business', label: 'Business', count: clients.filter(c => c.type === 'company').length },
    { id: 'individual', label: 'Individual', count: clients.filter(c => c.type === 'person').length },
    { id: 'prospect', label: 'Prospect', count: clients.filter(c => c.ownership?.relationship_type === 'prospect').length },
    { id: 'groups', label: 'Groups with no portal users', count: 0 },
    { id: 'kc', label: 'KC Operations', count: 0 },
  ];

  const handleDeleteClient = async (clientId, clientName) => {
    if (window.confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      try {
        await clientService.deleteClient(clientId);
        onClientDeleted(clientId);
        toast.success('Client deleted successfully');
      } catch (error) {
        toast.error('Failed to delete client');
        console.error('Delete error:', error);
      }
    }
  };

  const getClientDisplayName = (client) => {
    if (client.type === 'person') {
      return `${client.data.first_name || ''} ${client.data.last_name || ''}`.trim() || 'Unnamed Person';
    } else {
      return client.data.company_name || 'Unnamed Company';
    }
  };

  const getClientContact = (client) => {
    if (client.type === 'person') {
      return client.data.email || '';
    } else {
      return client.data.contact_person || client.data.email || '';
    }
  };

  const getPortalStatus = (client) => {
    // Mock portal status - in real app this would come from backend
    const hasPortal = Math.random() > 0.5;
    return hasPortal ? 'With users' : 'Without users';
  };

  const getClientStatus = () => {
    return 'Client'; // In real app, this could be dynamic
  };

  const getBusinessType = (client) => {
    if (client.type === 'company') {
      if (client.data.size && client.data.size.includes('500')) {
        return 'C-Corporation';
      }
      return 'S-Corporation';
    }
    return '—';
  };

  const filteredClients = clients.filter(client => {
    switch (activeTab) {
      case 'business':
        return client.type === 'company';
      case 'individual':
        return client.type === 'person';
      case 'prospect':
        return client.ownership?.relationship_type === 'prospect';
      case 'active':
      default:
        return client.ownership?.relationship_type !== 'prospect';
    }
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedClients(filteredClients.map(c => c.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectClient = (clientId, checked) => {
    if (checked) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="canopy-spinner mx-auto mb-4"></div>
          <p className="text-canopy-textMuted">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Tabs */}
      <div className="canopy-tabs px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`canopy-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-canopy-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-canopy-textMuted">
            <span>{filteredClients.length} clients</span>
          </div>
          
          <button className="canopy-btn-secondary text-sm flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            Save 1 filter
          </button>
          
          <button className="text-sm text-canopy-blue hover:text-canopy-blueHover">
            <RotateCcw className="h-4 w-4 mr-1 inline" />
            Reset filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="canopy-table">
          <thead>
            <tr>
              <th className="w-12">
                <input
                  type="checkbox"
                  checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-canopy-border"
                />
              </th>
              <th>Client Name</th>
              <th>Client Portal User</th>
              <th>Client Status</th>
              <th>Business Type</th>
              <th>EIN</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12">
                  <div className="text-canopy-textMuted">
                    <Plus className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-medium text-canopy-text mb-2">No clients found</h3>
                    <p className="mb-6">
                      Get started by creating your first client or adjust your search criteria.
                    </p>
                    <Link
                      to="/create"
                      className="canopy-btn-primary inline-flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Client
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const portalStatus = getPortalStatus(client);
                const isSelected = selectedClients.includes(client.id);
                
                return (
                  <tr key={client.id} className="group">
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectClient(client.id, e.target.checked)}
                        className="rounded border-canopy-border"
                      />
                    </td>
                    <td>
                      <Link
                        to={`/client/${client.id}`}
                        className="text-canopy-blue hover:text-canopy-blueHover font-medium"
                      >
                        {getClientDisplayName(client)}
                      </Link>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          portalStatus === 'With users' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-canopy-textMuted">{portalStatus}</span>
                      </div>
                    </td>
                    <td>
                      <span className="canopy-status-indicator canopy-status-active">
                        {getClientStatus()}
                      </span>
                    </td>
                    <td>
                      <span className="text-canopy-textMuted">{getBusinessType(client)}</span>
                    </td>
                    <td>
                      <span className="text-canopy-textMuted">—</span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/client/${client.id}`}
                          className="p-1 text-canopy-textMuted hover:text-canopy-blue rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClient(client.id, getClientDisplayName(client))}
                          className="p-1 text-canopy-textMuted hover:text-red-600 rounded transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-canopy-textMuted hover:text-canopy-text rounded transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredClients.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-canopy-border">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-canopy-textMuted hover:text-canopy-text">←</button>
            <button className="px-3 py-1 text-sm bg-canopy-blue text-white rounded">1</button>
            <button className="px-3 py-1 text-sm text-canopy-textMuted hover:text-canopy-text">2</button>
            <button className="px-3 py-1 text-sm text-canopy-textMuted hover:text-canopy-text">→</button>
          </div>
          
          <div className="flex items-center space-x-2">
            <select className="text-sm border border-canopy-border rounded px-2 py-1">
              <option>50</option>
              <option>100</option>
              <option>200</option>
            </select>
            <span className="text-sm text-canopy-textMuted">per page</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;