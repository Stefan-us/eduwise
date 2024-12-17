import axios from 'axios';

const BASE_URL = 'http://localhost:50001'; 
const API_URL = `${BASE_URL}/api/resources`; 

const search = async (query, filters = {}, limit = 6) => {
  try {
    const response = await axios.post(`${API_URL}/search`, {
      query,
      filters,
      limit
    });
    return response.data.results;
  } catch (error) {
    console.error('Search service error:', error);
    throw error;
  }
};

export const searchService = {
  search
}; 