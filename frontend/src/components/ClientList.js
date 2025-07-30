import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, User, Mail, Phone, MapPin, Calendar, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clientService } from '../services/clientService';

const ClientList = ({ clients, loading, onClientDeleted }) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getClientDisplayName = (client) => {
    if (client.type === 'person') {
      return `${client.data.first_name || ''} ${client.data.last_name || ''}`.trim();
    } else {
      return client.data.company_name || 'Unnamed Company';
    }
  };

  const getClientSubtitle = (client) => {
    if (client.type === 'person') {
      return client.data.company || client.data.email || '';
    } else {
      return client.data.contact_person || client.data.email || '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
        <p className="text-gray-600 mb-6">
          Get started by creating your first client or adjust your search criteria.
        </p>
        <Link
          to="/create"
          className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <User className="h-4 w-4 mr-2" />
          Add Your First Client
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
          <p className="text-gray-600 mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="client-card group">
            {/* Client Type Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                client.type === 'person' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {client.type === 'person' ? (
                  <User className="h-3 w-3 mr-1" />
                ) : (
                  <Building2 className="h-3 w-3 mr-1" />
                )}
                {client.type === 'person' ? 'Person' : 'Company'}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/client/${client.id}`}
                  className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDeleteClient(client.id, getClientDisplayName(client))}
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Client"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Client Info */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {getClientDisplayName(client)}
                </h3>
                {getClientSubtitle(client) && (
                  <p className="text-sm text-gray-600">
                    {getClientSubtitle(client)}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                {client.data.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{client.data.email}</span>
                  </div>
                )}
                
                {client.data.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{client.data.phone}</span>
                  </div>
                )}
                
                {client.data.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{client.data.address}</span>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Created {formatDate(client.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {client.notes && client.notes.length > 0 && (
                      <span>{client.notes.length} note{client.notes.length !== 1 ? 's' : ''}</span>
                    )}
                    {client.tracking && client.tracking.length > 0 && (
                      <span>{client.tracking.length} event{client.tracking.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Click to View */}
            <Link 
              to={`/client/${client.id}`}
              className="absolute inset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label={`View details for ${getClientDisplayName(client)}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientList;