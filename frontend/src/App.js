import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Components
import Header from './components/Header';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import CreateClient from './components/CreateClient';
import AuthProvider from './components/AuthProvider';

// Services
import { clientService } from './services/clientService';
import { authService } from './services/authService';

function App() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientType, setSelectedClientType] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        const authResult = await authService.initialize();
        if (authResult.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(authResult.user);
          loadClients();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Load clients
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const clientsData = await clientService.getClients(searchTerm, selectedClientType);
      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedClientType]);

  // Handle real-time search
  useEffect(() => {
    if (isAuthenticated) {
      const debounceTimer = setTimeout(() => {
        loadClients();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, selectedClientType, isAuthenticated, loadClients]);

  const handleLogin = async () => {
    try {
      const result = await authService.login();
      if (result.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(result.user);
        loadClients();
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setClients([]);
      setFilteredClients([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleClientCreated = (newClient) => {
    setClients(prev => [newClient, ...prev]);
    setFilteredClients(prev => [newClient, ...prev]);
  };

  const handleClientUpdated = (updatedClient) => {
    setClients(prev => prev.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
    setFilteredClients(prev => prev.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
  };

  const handleClientDeleted = (clientId) => {
    setClients(prev => prev.filter(client => client.id !== clientId));
    setFilteredClients(prev => prev.filter(client => client.id !== clientId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Client Management System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthProvider onLogin={handleLogin} />
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
          user={user}
          onLogout={handleLogout}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedClientType={selectedClientType}
          onClientTypeChange={setSelectedClientType}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <ClientList 
                  clients={filteredClients}
                  loading={loading}
                  onClientDeleted={handleClientDeleted}
                />
              } 
            />
            <Route 
              path="/create" 
              element={
                <CreateClient 
                  onClientCreated={handleClientCreated}
                />
              } 
            />
            <Route 
              path="/client/:id" 
              element={
                <ClientDetail 
                  onClientUpdated={handleClientUpdated}
                  onClientDeleted={handleClientDeleted}
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;