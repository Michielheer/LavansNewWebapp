// Mock API Service voor frontend zonder backend
import { mockApiService } from './mockData.js';

class ApiService {
  constructor() {
    this.mockService = mockApiService;
  }

  // Helper voor mock API calls
  async apiCall(endpoint, options = {}) {
    // Simuleer API endpoint routing
    if (endpoint === '/klanten') {
      return this.mockService.getKlanten();
    } else if (endpoint.startsWith('/klanten/') && endpoint.includes('/abonnementen')) {
      const relatienummer = endpoint.split('/')[2];
      return this.mockService.getAbonnementen(relatienummer);
    } else if (endpoint.startsWith('/klanten/') && endpoint.includes('/contactpersonen')) {
      const relatienummer = endpoint.split('/')[2];
      return this.mockService.getContactpersonen(relatienummer);
    } else if (endpoint.startsWith('/klanten/')) {
      const relatienummer = endpoint.split('/')[2];
      return this.mockService.getKlant(relatienummer);
    } else if (endpoint === '/inspecties') {
      return this.mockService.getInspecties();
    } else if (endpoint.startsWith('/inspecties/')) {
      const id = endpoint.split('/')[2];
      return this.mockService.getInspectie(parseInt(id));
    } else if (endpoint === '/inspecties' && options.method === 'POST') {
      return this.mockService.saveInspectie(JSON.parse(options.body));
    } else if (endpoint.startsWith('/todo/') && options.method === 'PUT') {
      const id = endpoint.split('/')[2];
      const data = JSON.parse(options.body);
      return this.mockService.updateTodo(id, data.done, data.text);
    } else if (endpoint.startsWith('/rapportage/')) {
      const relatienummer = endpoint.split('/')[2];
      const params = new URLSearchParams(endpoint.split('?')[1]);
      const startDatum = new Date(params.get('startDatum'));
      const eindDatum = new Date(params.get('eindDatum'));
      return this.mockService.getRapportage(relatienummer, startDatum, eindDatum);
    } else if (endpoint.startsWith('/leeftijd/')) {
      const barcode = endpoint.split('/')[2];
      return this.mockService.berekenLeeftijd(barcode);
    }
    
    throw new Error(`Unknown endpoint: ${endpoint}`);
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