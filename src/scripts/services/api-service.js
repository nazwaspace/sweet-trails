import CONFIG from '../config';
import AuthService from './auth-service';

const ApiService = {
  async register({ name, email, password }) {
    const response = await fetch(CONFIG.BASE_URL + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  async login({ email, password }) {
    const response = await fetch(CONFIG.BASE_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getStories() {
    const response = await fetch(CONFIG.BASE_URL + '/stories?location=1', {
      headers: { Authorization: `Bearer ${AuthService.getToken()}` },
    });

    if (response.status === 401) {
      AuthService.removeToken();
      throw new Error('Token invalid or expired.');
    }

    return response.json();
  },

  async addStory(formData) {
    const response = await fetch(CONFIG.BASE_URL + '/stories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${AuthService.getToken()}` },
      body: formData,
    });

    if (response.status === 401) {
      AuthService.removeToken();
      throw new Error('Token invalid or expired.');
    }

    return response.json();
  },
};

export default ApiService;
