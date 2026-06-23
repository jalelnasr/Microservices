const axios = require('axios');

class OffreServiceClient {
  constructor() {
    this.baseURL = process.env.OFFRE_SERVICE_URL || 'http://offre-service:8081';
  }

  async offreExists(offreId, token) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/offres/${offreId}/exists`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error checking offre ${offreId}:`, error.message);
      return false;
    }
  }

  async getOffreDetails(offreId, token) {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/offres/${offreId}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching offre ${offreId}:`, error.message);
      return null;
    }
  }
}

module.exports = new OffreServiceClient();
