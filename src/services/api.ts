import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Flask Default Port
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendMessageToAI = async (message: string, model: string = 'mistral') => {
  try {
    const response = await api.post('/chat', { message, model });
    return response.data;
  } catch (error) {
    console.error('API Error connecting to local Flask server:', error);
    throw error;
  }
};

export default api;
