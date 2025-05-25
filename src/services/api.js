import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const progressAPI = {
  async getProgress(userId, videoId) {
    try {
      const response = await api.get(`/progress/${userId}/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  },

  async updateProgress(userId, videoId, progressData) {
    try {
      const response = await api.post(`/progress/${userId}/${videoId}`, progressData);
      return response.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

export default progressAPI;
