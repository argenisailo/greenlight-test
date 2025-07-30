// Mock Microsoft Entra ID Authentication Service
class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.token = null;
  }

  async initialize() {
    // Check if user is already authenticated (e.g., from localStorage)
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (savedToken && savedUser) {
      this.token = savedToken;
      this.user = JSON.parse(savedUser);
      this.isAuthenticated = true;
      return { isAuthenticated: true, user: this.user };
    }
    
    return { isAuthenticated: false, user: null };
  }

  async login() {
    try {
      // Mock Microsoft authentication flow
      // In real implementation, this would redirect to Microsoft login
      console.log('Initiating Microsoft Entra ID login...');
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful authentication
      const mockUser = {
        id: 'mock-user-id',
        email: 'user@company.com',
        name: 'John Doe',
        department: 'Sales'
      };
      
      const mockToken = 'mock-token';
      
      // Store authentication data
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      
      this.token = mockToken;
      this.user = mockUser;
      this.isAuthenticated = true;
      
      return { isAuthenticated: true, user: mockUser };
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      // Clear authentication data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }
}

export const authService = new AuthService();