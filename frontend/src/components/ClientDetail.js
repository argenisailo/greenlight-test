import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Edit, 
  Save, 
  X, 
  Plus,
  ExternalLink,
  Calculator,
  FileText,
  Key,
  MessageSquare,
  Activity,
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clientService } from '../services/clientService';

const ClientDetail = ({ onClientUpdated, onClientDeleted }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('data');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newNote, setNewNote] = useState('');
  const [newTracking, setNewTracking] = useState({ activity_type: '', description: '', outcome: '' });

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const clientData = await clientService.getClient(id);
      setClient(clientData);
      setEditData(clientData);
    } catch (error) {
      toast.error('Failed to load client');
      console.error('Load client error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updatedClient = await clientService.updateClient(id, {
        type: editData.type,
        data: editData.data,
        quickbooks: editData.quickbooks,
        credentials: editData.credentials,
        ownership: editData.ownership
      });
      
      setClient(updatedClient);
      setIsEditing(false);
      onClientUpdated(updatedClient);
      toast.success('Client updated successfully');
    } catch (error) {
      toast.error('Failed to update client');
      console.error('Update error:', error);
    }
  };

  const handleDelete = async () => {
    const clientName = client.type === 'person' 
      ? `${client.data.first_name} ${client.data.last_name}`
      : client.data.company_name;
      
    if (window.confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      try {
        await clientService.deleteClient(id);
        onClientDeleted(id);
        toast.success('Client deleted successfully');
        navigate('/');
      } catch (error) {
        toast.error('Failed to delete client');
        console.error('Delete error:', error);
      }
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    try {
      await clientService.addNote(id, newNote);
      setNewNote('');
      loadClient(); // Reload to get updated notes
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
      console.error('Add note error:', error);
    }
  };

  const handleAddTracking = async (e) => {
    e.preventDefault();
    if (!newTracking.activity_type || !newTracking.description) return;
    
    try {
      await clientService.addTrackingEntry(
        id, 
        newTracking.activity_type, 
        newTracking.description, 
        newTracking.outcome || null
      );
      setNewTracking({ activity_type: '', description: '', outcome: '' });
      loadClient(); // Reload to get updated tracking
      toast.success('Tracking entry added successfully');
    } catch (error) {
      toast.error('Failed to add tracking entry');
      console.error('Add tracking error:', error);
    }
  };

  const handleOpenSharePoint = async () => {
    try {
      const sharePointUrl = await clientService.getSharePointUrl(id);
      window.open(sharePointUrl, '_blank');
      toast.success('Opening SharePoint documents...');
    } catch (error) {
      toast.error('Failed to open SharePoint');
      console.error('SharePoint error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClientDisplayName = () => {
    if (!client) return '';
    return client.type === 'person' 
      ? `${client.data.first_name || ''} ${client.data.last_name || ''}`.trim()
      : client.data.company_name || 'Unnamed Company';
  };

  const tabs = [
    { id: 'data', label: 'Data', icon: client?.type === 'person' ? User : Building2 },
    { id: 'quickbooks', label: 'QuickBooks', icon: Calculator },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'credentials', label: 'Credentials', icon: Key },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
    { id: 'tracking', label: 'Tracking', icon: Activity },
    { id: 'ownership', label: 'Ownership', icon: Users }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Client not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${
              client.type === 'person' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
            }`}>
              {client.type === 'person' ? (
                <User className="h-6 w-6" />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getClientDisplayName()}</h1>
              <p className="text-gray-600 mt-1">
                {client.type === 'person' ? 'Individual Client' : 'Company Client'} • 
                Created {formatDate(client.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {/* Show counts for notes and tracking */}
                  {tab.id === 'notes' && client.notes?.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {client.notes.length}
                    </span>
                  )}
                  {tab.id === 'tracking' && client.tracking?.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {client.tracking.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {client.type === 'person' ? 'Personal Information' : 'Company Information'}
              </h3>
              
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {client.type === 'person' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={editData.data?.first_name || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            data: { ...editData.data, first_name: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={editData.data?.last_name || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            data: { ...editData.data, last_name: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input
                          type="text"
                          value={editData.data?.company || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            data: { ...editData.data, company: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                        <input
                          type="text"
                          value={editData.data?.position || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            data: { ...editData.data, position: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        <input
                          type="text"
                          value={editData.data?.company_name || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            data: { ...editData.data, company_name: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                        <input
                          type="text"
                          value={editData.data?.contact_person || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            data: { ...editData.data, contact_person: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          value={editData.data?.website || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            data: { ...editData.data, website: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                        <input
                          type="text"
                          value={editData.data?.industry || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            data: { ...editData.data, industry: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Common fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editData.data?.email || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        data: { ...editData.data, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editData.data?.phone || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        data: { ...editData.data, phone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={editData.data?.address || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        data: { ...editData.data, address: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(client.data).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <div key={key}>
                        <dt className="text-sm font-medium text-gray-500 capitalize">
                          {key.replace('_', ' ')}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* QuickBooks Tab */}
          {activeTab === 'quickbooks' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">QuickBooks Integration</h3>
              
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
                    <input
                      type="text"
                      value={editData.quickbooks?.customer_id || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        quickbooks: { ...editData.quickbooks, customer_id: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                    <input
                      type="text"
                      value={editData.quickbooks?.payment_terms || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        quickbooks: { ...editData.quickbooks, payment_terms: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                    <input
                      type="text"
                      value={editData.quickbooks?.tax_id || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        quickbooks: { ...editData.quickbooks, tax_id: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credit Limit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.quickbooks?.credit_limit || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        quickbooks: { ...editData.quickbooks, credit_limit: parseFloat(e.target.value) || null }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Balance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.quickbooks?.account_balance || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        quickbooks: { ...editData.quickbooks, account_balance: parseFloat(e.target.value) || null }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                    <textarea
                      value={editData.quickbooks?.billing_address || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        quickbooks: { ...editData.quickbooks, billing_address: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {client.quickbooks && Object.keys(client.quickbooks).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(client.quickbooks).map(([key, value]) => {
                        if (!value) return null;
                        return (
                          <div key={key}>
                            <dt className="text-sm font-medium text-gray-500 capitalize">
                              {key.replace('_', ' ')}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {typeof value === 'number' && (key.includes('balance') || key.includes('limit')) 
                                ? `$${value.toFixed(2)}` 
                                : value}
                            </dd>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No QuickBooks data available</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                <button
                  onClick={handleOpenSharePoint}
                  className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open SharePoint
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">SharePoint Integration</h4>
                <p className="text-gray-600 mb-4">
                  All client documents are managed through SharePoint. Click the button above to access the dedicated folder for this client.
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>📁 Organized folder structure</p>
                  <p>🔒 Enterprise-grade security</p>
                  <p>👥 Collaborative editing</p>
                </div>
              </div>
            </div>
          )}

          {/* Credentials Tab */}
          {activeTab === 'credentials' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Credentials & Access</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Key className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Credential management features will be integrated with Azure Key Vault for secure storage.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center py-8">
                <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Secure Credential Storage</h4>
                <p className="text-gray-600">
                  This section will integrate with Azure Key Vault to securely store and manage client credentials, API keys, and certificates.
                </p>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              </div>
              
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add New Note</label>
                <div className="flex space-x-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter your note here..."
                    rows={3}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </button>
                </div>
              </form>
              
              {/* Notes List */}
              <div className="space-y-4">
                {client.notes && client.notes.length > 0 ? (
                  client.notes.map((note) => (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{note.created_by}</span>
                          <span className="text-xs text-gray-500">{formatDate(note.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{note.content}</p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {note.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No notes yet. Add your first note above.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Activity Tracking</h3>
              </div>
              
              {/* Add Tracking Form */}
              <form onSubmit={handleAddTracking} className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Add New Activity</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <select
                      value={newTracking.activity_type}
                      onChange={(e) => setNewTracking({ ...newTracking, activity_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Activity Type</option>
                      <option value="call">Phone Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="proposal">Proposal</option>
                      <option value="contract">Contract</option>
                      <option value="payment">Payment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={newTracking.description}
                      onChange={(e) => setNewTracking({ ...newTracking, description: e.target.value })}
                      placeholder="Description of the activity..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newTracking.outcome}
                    onChange={(e) => setNewTracking({ ...newTracking, outcome: e.target.value })}
                    placeholder="Outcome (optional)..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </button>
                </div>
              </form>
              
              {/* Tracking List */}
              <div className="space-y-4">
                {client.tracking && client.tracking.length > 0 ? (
                  client.tracking.map((entry) => (
                    <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            entry.activity_type === 'call' ? 'bg-blue-100 text-blue-800' :
                            entry.activity_type === 'email' ? 'bg-green-100 text-green-800' :
                            entry.activity_type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.activity_type}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{entry.created_by}</span>
                          <span className="text-xs text-gray-500">{formatDate(entry.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{entry.description}</p>
                      {entry.outcome && (
                        <div className="bg-gray-50 rounded p-2">
                          <span className="text-xs font-medium text-gray-600">Outcome: </span>
                          <span className="text-sm text-gray-700">{entry.outcome}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No activities tracked yet. Add your first activity above.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ownership Tab */}
          {activeTab === 'ownership' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Ownership & Management</h3>
              
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Owner</label>
                    <input
                      type="text"
                      value={editData.ownership?.primary_owner || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        ownership: { ...editData.ownership, primary_owner: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={editData.ownership?.department || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        ownership: { ...editData.ownership, department: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Manager</label>
                    <input
                      type="text"
                      value={editData.ownership?.account_manager || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        ownership: { ...editData.ownership, account_manager: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship Type</label>
                    <select
                      value={editData.ownership?.relationship_type || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        ownership: { ...editData.ownership, relationship_type: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="prospect">Prospect</option>
                      <option value="active">Active Client</option>
                      <option value="dormant">Dormant</option>
                      <option value="partner">Partner</option>
                      <option value="vendor">Vendor</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  {client.ownership ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(client.ownership).map(([key, value]) => {
                        if (!value || key === 'secondary_owners') return null;
                        return (
                          <div key={key}>
                            <dt className="text-sm font-medium text-gray-500 capitalize">
                              {key.replace('_', ' ')}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No ownership information available</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;