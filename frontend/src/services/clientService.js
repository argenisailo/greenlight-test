import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class ClientService {
  async getClients(search = '', clientType = 'all', limit = 50, skip = 0) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      if (clientType && clientType !== 'all') {
        params.append('client_type', clientType);
      }
      
      const response = await apiClient.get(`/api/clients?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      throw error;
    }
  }

  async getClient(clientId) {
    try {
      const response = await apiClient.get(`/api/clients/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch client:', error);
      throw error;
    }
  }

  async createClient(clientData) {
    try {
      const response = await apiClient.post('/api/clients', clientData);
      return response.data;
    } catch (error) {
      console.error('Failed to create client:', error);
      throw error;
    }
  }

  async updateClient(clientId, updateData) {
    try {
      const response = await apiClient.put(`/api/clients/${clientId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update client:', error);
      throw error;
    }
  }

  async deleteClient(clientId) {
    try {
      const response = await apiClient.delete(`/api/clients/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete client:', error);
      throw error;
    }
  }

  async addNote(clientId, noteContent) {
    try {
      const response = await apiClient.post(`/api/clients/${clientId}/notes`, null, {
        params: { note_content: noteContent }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  }

  async addTrackingEntry(clientId, activityType, description, outcome = null) {
    try {
      const response = await apiClient.post(`/api/clients/${clientId}/tracking`, null, {
        params: {
          activity_type: activityType,
          description: description,
          outcome: outcome
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add tracking entry:', error);
      throw error;
    }
  }

  async getSharePointUrl(clientId) {
    try {
      const response = await apiClient.get(`/api/clients/${clientId}/sharepoint-url`);
      return response.data.sharepoint_url;
    } catch (error) {
      console.error('Failed to get SharePoint URL:', error);
      throw error;
    }
  }
}

export const clientService = new ClientService();