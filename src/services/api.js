const API_BASE_URL = 'http://localhost:8085/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data?.message || data || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ===================
  // Game Management APIs
  // ===================

  // Create a new game
  async createGame(gameId) {
    return this.request('/games/create', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    });
  }

  // Get current active game
  async getCurrentGame() {
    return this.request('/games/current');
  }

  async getGameHistory(page = 0, size = 15) {
    try {
        const token = localStorage.getItem('authToken'); // or however you store the token
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        
      const response = await fetch(`${this.baseURL}/games/history?page=${page}&size=${size}`, {
        method: 'GET',
        headers: headers,
      });

        console.log('Game history response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Game history error response:', errorText);
            
            if (response.status === 403) {
                throw new Error('Access denied to game history');
            } else if (response.status === 404) {
                throw new Error('Game history endpoint not found');
            } else if (response.status === 500) {
                throw new Error('Server error while fetching game history');
            }
            
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Game history data:', data);
        
        // Handle different response formats
        if (data.content && Array.isArray(data.content)) {
            return data.content; // Spring Boot Page response
        } else if (Array.isArray(data)) {
            return data; // Direct array response
        } else if (data.data && Array.isArray(data.data)) {
            return data.data; // Wrapped in data property
        }
        
        console.warn('Unexpected game history response format:', data);
        return [];
    } catch (error) {
        console.error('Failed to fetch game history:', error);
        throw error;
    }
}

  // Get game by ID
  async getGameById(gameId) {
    return this.request(`/games/${gameId}`);
  }

  // Complete a game
  async completeGame(gameId, winningColor = null) {
    return this.request(`/games/${gameId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ winningColor }),
    });
  }

  // Update game totals when bet is placed
  async updateGameTotals(gameId, color, amount) {
    return this.request(`/games/${gameId}/update-totals`, {
      method: 'POST',
      body: JSON.stringify({
        color: color.toUpperCase(), // Convert to enum format
        amount: amount
      }),
    });
  }

  // Get game stats
  async getGameStats(gameId) {
    return this.request(`/games/${gameId}/stats`);
  }

  // ===============
  // Betting APIs (keeping your original structure)
  // ===============

  async placeBet(betData) {
    return this.request('/bets/place', {
      method: 'POST',
      body: JSON.stringify(betData),
    });
  }

  async getUserBets(userId, page = 0, size = 10) {
    return this.request(`/bets/user/${userId}?page=${page}&size=${size}`);
  }

  async getBetsByGame(gameId) {
    return this.request(`/bets/game/${gameId}`);
  }

  // ===================
  // Authentication APIs
  // ===================

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const res = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Login failed');
    }

    // Expect JSON response with user object
    const userData = await res.json();
    
    // Validate required fields
    if (!userData.id || !userData.token) {
      throw new Error('Invalid response: missing user ID or token');
    }

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);

    return userData;
  }


  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // ==================
  // User Profile APIs
  // ==================

  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUserProfile(userId, profileData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserBalance(userId) {
    return this.request(`/users/${userId}/balance`);
  }

  async addMoney(userId, amount) {
    return this.request(`/users/${userId}/add-money`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async withdrawMoney(userId, amount) {
    return this.request(`/users/${userId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // ====================
  // User Statistics APIs
  // ====================

  async getUserStats(userId) {
    return this.request(`/users/${userId}/stats`);
  }

  async getActivePlayers() {
    return this.request('/games/active-players');
  }
  getToken() {
    return localStorage.getItem('token') || JSON.parse(localStorage.getItem('user') || '{}')?.token;
  }

  getUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user || !user.id) {
        throw new Error('User not found or missing ID');
      }
      return user.id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw new Error('Unable to get user ID. Please login again.');
    }
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  clearUserData() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  async getUserBalance(userId) {
    // Try to get token from multiple places
    let token = localStorage.getItem('token');
    
    // If not found, try to get from user object
    if (!token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                token = user.token;
                console.log("Token from user object:", token);
            } catch (error) {
                console.error('Error parsing user from localStorage:', error);
            }
        }
    }
    
    console.log("Final token being used:", token);
    console.log("Token length:", token ? token.length : 0);
    console.log("UserId:", userId);

    if (!token) {
        throw new Error('No authentication token found');
    }

    // Test token format
    if (token && token.includes('.')) {
        const parts = token.split('.');
        console.log("JWT parts count:", parts.length);
        if (parts.length === 3) {
            try {
                const payload = JSON.parse(atob(parts[1]));
                console.log("JWT payload:", payload);
                console.log("Token expiry:", new Date(payload.exp * 1000));
                console.log("Current time:", new Date());
            } catch (e) {
                console.log("Could not decode JWT payload");
            }
        }
    }

    const requestUrl = `${API_BASE_URL}/users/${userId}/balance`;
    console.log("Making request to:", requestUrl);

    const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    console.log("Balance API response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
        console.error("Status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch balance: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Balance API response data:", data);
    return data.balance || data;
  }
}

export const apiService = new ApiService();
export default apiService;