// API Service voor communicatie met C# backend
const API_BASE = 'http://localhost:5000/api/lavans';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  // Helper voor API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Klanten API
  async getKlanten() {
    return this.apiCall('/klanten');
  }

  async getKlant(relatienummer) {
    return this.apiCall(`/klanten/${relatienummer}`);
  }

  async getAbonnementen(klantRelatienummer) {
    return this.apiCall(`/klanten/${klantRelatienummer}/abonnementen`);
  }

  async getContactpersonen(klantRelatienummer) {
    return this.apiCall(`/klanten/${klantRelatienummer}/contactpersonen`);
  }

  // Inspecties API
  async getInspecties(klantRelatienummer = null) {
    const endpoint = klantRelatienummer 
      ? `/inspecties?klantRelatienummer=${klantRelatienummer}`
      : '/inspecties';
    return this.apiCall(endpoint);
  }

  async getInspectie(inspectieId) {
    return this.apiCall(`/inspecties/${inspectieId}`);
  }

  async saveInspectie(inspectieData) {
    return this.apiCall('/inspecties', {
      method: 'POST',
      body: JSON.stringify(inspectieData)
    });
  }

  // Todo API
  async updateTodo(todoId, done, text = null) {
    return this.apiCall(`/todo/${todoId}`, {
      method: 'PUT',
      body: JSON.stringify({ done, text })
    });
  }

  // Rapportage API
  async getRapportage(klantRelatienummer, startDatum, eindDatum) {
    const params = new URLSearchParams({
      startDatum: startDatum.toISOString().split('T')[0],
      eindDatum: eindDatum.toISOString().split('T')[0]
    });
    return this.apiCall(`/rapportage/${klantRelatienummer}?${params}`);
  }

  // Utilities API
  async berekenLeeftijd(barcode) {
    return this.apiCall(`/leeftijd/${barcode}`);
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 