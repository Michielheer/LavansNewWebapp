// Mock data service voor frontend zonder backend
export const mockData = {
  klanten: [
    {
      relatienummer: "K001",
      bedrijfsnaam: "Bedrijf A BV",
      adres: "Hoofdstraat 123",
      postcode: "1234 AB",
      plaats: "Amsterdam",
      telefoon: "020-1234567",
      email: "info@bedrijfa.nl"
    },
    {
      relatienummer: "K002", 
      bedrijfsnaam: "Bedrijf B NV",
      adres: "Industrieweg 456",
      postcode: "5678 CD",
      plaats: "Rotterdam",
      telefoon: "010-9876543",
      email: "contact@bedrijfb.nl"
    },
    {
      relatienummer: "K003",
      bedrijfsnaam: "Bedrijf C BV",
      adres: "Kantoorlaan 789",
      postcode: "9012 EF",
      plaats: "Den Haag",
      telefoon: "070-5551234",
      email: "info@bedrijfc.nl"
    }
  ],

  abonnementen: {
    "K001": [
      {
        id: 1,
        naam: "Basis Abonnement",
        startDatum: "2024-01-01",
        eindDatum: "2024-12-31",
        status: "Actief",
        type: "Matten & Wissers"
      },
      {
        id: 2,
        naam: "Premium Abonnement",
        startDatum: "2024-01-01", 
        eindDatum: "2024-12-31",
        status: "Actief",
        type: "Volledig Pakket"
      }
    ],
    "K002": [
      {
        id: 3,
        naam: "Standaard Abonnement",
        startDatum: "2024-02-01",
        eindDatum: "2024-12-31",
        status: "Actief",
        type: "Matten"
      }
    ],
    "K003": [
      {
        id: 4,
        naam: "Basis Abonnement",
        startDatum: "2024-03-01",
        eindDatum: "2024-12-31",
        status: "Actief",
        type: "Wissers"
      }
    ]
  },

  contactpersonen: {
    "K001": [
      {
        id: 1,
        voornaam: "Jan",
        tussenvoegsel: "",
        achternaam: "Jansen",
        functie: "Facility Manager",
        telefoon: "020-1234567",
        email: "j.jansen@bedrijfa.nl"
      },
      {
        id: 2,
        voornaam: "Piet",
        tussenvoegsel: "van der",
        achternaam: "Berg",
        functie: "Receptionist",
        telefoon: "020-1234568",
        email: "p.vanderberg@bedrijfa.nl"
      }
    ],
    "K002": [
      {
        id: 3,
        voornaam: "Marie",
        tussenvoegsel: "",
        achternaam: "de Vries",
        functie: "Office Manager",
        telefoon: "010-9876543",
        email: "m.devries@bedrijfb.nl"
      }
    ],
    "K003": [
      {
        id: 4,
        voornaam: "Klaas",
        tussenvoegsel: "",
        achternaam: "Bakker",
        functie: "Facility Coordinator",
        telefoon: "070-5551234",
        email: "k.bakker@bedrijfc.nl"
      }
    ]
  },

  inspecties: [
    {
      id: 1,
      klantRelatienummer: "K001",
      inspecteur: "John Doe",
      datum: "2024-01-15",
      tijd: "09:00",
      status: "Voltooid",
      opmerkingen: "Alle matten in goede staat"
    },
    {
      id: 2,
      klantRelatienummer: "K002", 
      inspecteur: "Jane Smith",
      datum: "2024-01-20",
      tijd: "14:00",
      status: "Voltooid",
      opmerkingen: "Wissers moeten vervangen worden"
    }
  ],

  matten: {
    "K001": [
      {
        id: 1,
        mat_type: "Entree Mat",
        afdeling: "Receptie",
        ligplaats: "Hoofdingang",
        aantal: 2,
        aanwezig: true,
        schoon_onbeschadigd: true,
        vuilgraad_label: "Schoon",
        barcode: "202401001",
        representativiteitsscore: 95,
        opmerking: ""
      },
      {
        id: 2,
        mat_type: "Logo Mat",
        afdeling: "Algemeen",
        ligplaats: "Algemeen",
        aantal: 1,
        aanwezig: true,
        schoon_onbeschadigd: true,
        vuilgraad_label: "Licht vervuild",
        barcode: "202101002",
        representativiteitsscore: 85,
        opmerking: ""
      }
    ],
    "K002": [
      {
        id: 3,
        mat_type: "Entree Mat",
        afdeling: "Receptie",
        ligplaats: "Ingang",
        aantal: 1,
        aanwezig: true,
        schoon_onbeschadigd: true,
        vuilgraad_label: "Schoon",
        barcode: "202402001",
        representativiteitsscore: 90,
        opmerking: ""
      }
    ]
  },

  wissers: {
    "K001": [
      {
        id: 1,
        "Type wisser": "Standaard Wisser",
        "Aantal aanwezig": 5,
        "Vuil percentage": 30,
        "Opmerking": ""
      },
      {
        id: 2,
        "Type wisser": "Premium Wisser",
        "Aantal aanwezig": 3,
        "Vuil percentage": 75,
        "Opmerking": "Hoog verbruik"
      }
    ],
    "K002": [
      {
        id: 3,
        "Type wisser": "Standaard Wisser",
        "Aantal aanwezig": 2,
        "Vuil percentage": 45,
        "Opmerking": ""
      }
    ]
  },

  toebehoren: {
    "K001": [
      {
        id: 1,
        "Type accessoire": "Wisserbladen",
        "Aantal te vervangen": 2,
        "Opmerking": ""
      },
      {
        id: 2,
        "Type accessoire": "Handgrepen",
        "Aantal te vervangen": 0,
        "Opmerking": "In goede staat"
      }
    ],
    "K002": [
      {
        id: 3,
        "Type accessoire": "Wisserbladen",
        "Aantal te vervangen": 1,
        "Opmerking": ""
      }
    ]
  }
};

// Mock API service
export class MockApiService {
  constructor() {
    this.data = mockData;
  }

  // Simuleer API delay
  async delay(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getKlanten() {
    await this.delay();
    return this.data.klanten;
  }

  async getKlant(relatienummer) {
    await this.delay();
    return this.data.klanten.find(k => k.relatienummer === relatienummer);
  }

  async getAbonnementen(klantRelatienummer) {
    await this.delay();
    return this.data.abonnementen[klantRelatienummer] || [];
  }

  async getContactpersonen(klantRelatienummer) {
    await this.delay();
    return this.data.contactpersonen[klantRelatienummer] || [];
  }

  async getInspecties(klantRelatienummer = null) {
    await this.delay();
    if (klantRelatienummer) {
      return this.data.inspecties.filter(i => i.klantRelatienummer === klantRelatienummer);
    }
    return this.data.inspecties;
  }

  async getInspectie(inspectieId) {
    await this.delay();
    return this.data.inspecties.find(i => i.id === inspectieId);
  }

  async saveInspectie(inspectieData) {
    await this.delay();
    const newInspectie = {
      id: Date.now(),
      ...inspectieData,
      status: "Voltooid"
    };
    this.data.inspecties.push(newInspectie);
    return newInspectie;
  }

  async updateTodo(todoId, done, text = null) {
    await this.delay();
    return { success: true, message: "Todo updated" };
  }

  async getRapportage(klantRelatienummer, startDatum, eindDatum) {
    await this.delay();
    return {
      klant: this.data.klanten.find(k => k.relatienummer === klantRelatienummer),
      periode: { startDatum, eindDatum },
      inspecties: this.data.inspecties.filter(i => i.klantRelatienummer === klantRelatienummer),
      statistieken: {
        totaalInspecties: 5,
        gemiddeldeScore: 85,
        problemenGevonden: 2
      }
    };
  }

  async berekenLeeftijd(barcode) {
    await this.delay();
    if (!barcode || barcode.toString().length < 7) {
      return { leeftijd: "Onbekend" };
    }
    
    const barcodeStr = barcode.toString().trim();
    if (barcodeStr.length >= 7) {
      const maandDigit = barcodeStr[4];
      const jaarDigits = barcodeStr.slice(5, 7);
      
      const maand = parseInt(maandDigit);
      const jaar = parseInt(jaarDigits);
      
      if (maand < 1 || maand > 12) {
        return { leeftijd: "Onbekend (ongeldige maand)" };
      }
      
      const volledigJaar = 2000 + jaar;
      const productieDatum = new Date(volledigJaar, maand - 1, 1);
      const vandaag = new Date();
      const leeftijdDagen = Math.floor((vandaag - productieDatum) / (1000 * 60 * 60 * 24));
      const leeftijdMaanden = Math.floor(leeftijdDagen / 30);
      
      if (leeftijdMaanden < 0) {
        return { leeftijd: "Onbekend (toekomstige datum)" };
      }
      
      if (leeftijdMaanden < 12) {
        return { leeftijd: `${leeftijdMaanden} maanden` };
      } else {
        const leeftijdJaren = Math.floor(leeftijdMaanden / 12);
        const resterendeMaanden = leeftijdMaanden % 12;
        if (resterendeMaanden === 0) {
          return { leeftijd: `${leeftijdJaren} jaar` };
        } else {
          return { leeftijd: `${leeftijdJaren} jaar en ${resterendeMaanden} maanden` };
        }
      }
    }
    
    return { leeftijd: "Onbekend" };
  }

  // Mock data voor inspectie componenten
  getMattenData(klantRelatienummer) {
    return this.data.matten[klantRelatienummer] || [];
  }

  getWissersData(klantRelatienummer) {
    return this.data.wissers[klantRelatienummer] || [];
  }

  getToebehorenData(klantRelatienummer) {
    return this.data.toebehoren[klantRelatienummer] || [];
  }
}

// Export singleton instance
export const mockApiService = new MockApiService();
export default mockApiService; 