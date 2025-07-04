import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useKlanten, useContactpersonen, useSaveInspectie } from "./hooks/useApi";

export default function LavansApp() {
  const [selectedTab, setSelectedTab] = useState("inspectie");
  const [selectedKlant, setSelectedKlant] = useState("");
  const [relatienummer, setRelatienummer] = useState("");
  const [klantnaam, setKlantnaam] = useState("");
  const [inspecteur, setInspecteur] = useState("");
  const [inspectieDatum, setInspectieDatum] = useState(new Date().toISOString().split('T')[0]);
  const [inspectieTijd, setInspectieTijd] = useState("09:00");
  const [contactpersoon, setContactpersoon] = useState({ naam: "", email: "" });
  const [todoList, setTodoList] = useState([]);
  const [klantenserviceTodoList, setKsTodoList] = useState([]);
  const [mattenLijst, setMattenLijst] = useState([]);
  const [logomattenLijst, setLogomattenLijst] = useState([]);
  const [wissersTabel, setWissersTabel] = useState([]);
  const [toebehorenTabel, setToebehorenTabel] = useState([]);
  const [contactpersonenData, setContactpersonenData] = useState([]);
  const [inspecties, setInspecties] = useState([]);
  const [mattenConcurrenten, setMattenConcurrenten] = useState({
    andere_mat_aanwezig: "nee",
    andere_mat_concurrent: "",
    aantal_concurrent: 0
  });
  const [wissersConcurrenten, setWissersConcurrenten] = useState({
    wissers_concurrent: "nee",
    wissers_concurrent_toelichting: "",
    andere_zaken: ""
  });
  const [koopMatten, setKoopMatten] = useState(0);
  const [algemeneOpmerkingen, setAlgemeneOpmerkingen] = useState("");
  const [klanttevredenheid, setKlanttevredenheid] = useState("");
  const [vervolgacties, setVervolgacties] = useState("");
  const [volgendeInspectie, setVolgendeInspectie] = useState("");

  // API hooks
  const { klanten, loading: klantenLoading, error: klantenError } = useKlanten();
  const { contactpersonen, loading: contactpersonenLoading, error: contactpersonenError } = useContactpersonen(relatienummer);
  const { saveInspectie, saving, error: saveError } = useSaveInspectie();

  // Hulpfuncties
  const formatNaam = (voornaam, tussenvoegsel, achternaam) => {
    const v = voornaam || "";
    const t = tussenvoegsel || "";
    const a = achternaam || "";
    return `${v} ${t} ${a}`.replace(/\s+/g, " ").trim();
  };

  const berekenLeeftijd = (barcode) => {
    if (!barcode || barcode.toString().length < 7) return "-";
    try {
      const barcodeStr = barcode.toString().trim();
      if (barcodeStr.length >= 7) {
        const maandDigit = barcodeStr[4];
        const jaarDigits = barcodeStr.slice(5, 7);
        const maand = parseInt(maandDigit);
        const jaar = parseInt(jaarDigits);
        
        if (maand < 1 || maand > 12) return `Onbekend (maand ${maand} ongeldig)`;
        
        const volledigJaar = 2000 + jaar;
        const productieDatum = new Date(volledigJaar, maand - 1, 1);
        const vandaag = new Date();
        const leeftijdDagen = Math.floor((vandaag - productieDatum) / (1000 * 60 * 60 * 24));
        const leeftijdMaanden = Math.floor(leeftijdDagen / 30);
        
        if (leeftijdMaanden < 0) return "Onbekend (toekomstige datum)";
        if (leeftijdMaanden < 12) return `${leeftijdMaanden} maanden`;
        
        const leeftijdJaren = Math.floor(leeftijdMaanden / 12);
        const resterendeMaanden = leeftijdMaanden % 12;
        if (resterendeMaanden === 0) return `${leeftijdJaren} jaar`;
        return `${leeftijdJaren} jaar en ${resterendeMaanden} maanden`;
      }
      return "Onbekend (te kort)";
    } catch (e) {
      return `Onbekend (fout: ${e})`;
    }
  };

  const addTodoAction = (text) => {
    if (!todoList.some(todo => todo.text === text)) {
      setTodoList(prev => [...prev, { text, done: false }]);
    }
  };

  const addKlantenserviceTodo = (text) => {
    if (!klantenserviceTodoList.some(todo => todo.text === text)) {
      setKsTodoList(prev => [...prev, { text, done: false }]);
    }
  };

  const genereerTodoList = () => {
    // Matten (standaard en logo)
    for (const mat of [...mattenLijst, ...logomattenLijst]) {
      const matNaam = mat.mat_type || "Onbekend";
      const afdeling = mat.afdeling || "";
      const ligplaats = mat.ligplaats || "";
      const locatie = afdeling || ligplaats ? ` (${afdeling}, ${ligplaats})` : "";
      
      if (!mat.aanwezig) {
        addTodoAction(`Controleer waarom mat '${matNaam}'${locatie} niet aanwezig is.`);
      }
      if (mat.aantal === 0) {
        addTodoAction(`Controleer of mat '${matNaam}'${locatie} verwijderd moet worden.`);
      }
      if (mat.vuilgraad_label === "Sterk vervuild") {
        addTodoAction(`Mat '${matNaam}'${locatie} vervangen of reinigen (sterk vervuild).`);
      }
      if (!mat.schoon_onbeschadigd) {
        addTodoAction(`Mat '${matNaam}'${locatie} inspecteren op schade.`);
      }
      if (mat.opmerking && mat.opmerking.trim()) {
        addTodoAction(`Controleer opmerking bij mat '${matNaam}'${locatie}: ${mat.opmerking}`);
      }
      if (afdeling === "Algemeen" && ligplaats === "Algemeen") {
        addTodoAction(`Ligplaats controleren en aanpassen in TMS voor mat ${matNaam} (nu: Algemeen/Algemeen).`);
      }
      
      // Jaarcheck logomatten
      if (mat.barcode && matNaam.toLowerCase().includes("logo")) {
        const leeftijdStr = berekenLeeftijd(mat.barcode);
        const match = leeftijdStr.match(/(\d+) jaar/);
        if (match && parseInt(match[1]) >= 3) {
          addTodoAction(`Controleer logomat '${matNaam}' (ouder dan 3 jaar)`);
          addKlantenserviceTodo(`Logomat ouder dan 3 jaar bij klant '${matNaam}': plan nieuwe logomat, check of logo gelijk is gebleven, geef aan dat je een nieuwe gaat bestellen.`);
          
          if (parseInt(match[1]) >= 4) {
            const repScore = mat.representativiteitsscore || 100;
            if (repScore < 70) {
              addTodoAction(`Logomat '${matNaam}'${locatie} moet vervangen worden: ouder dan 4 jaar en representativiteitsscore te laag.`);
            }
          }
        }
      }
    }

    // Wissers
    for (const wisser of wissersTabel) {
      const wisserType = wisser["Type wisser"] || "Onbekend";
      if (wisser["Aantal aanwezig"] === 0) {
        addTodoAction(`Controleer of wisser van type '${wisserType}' verwijderd moet worden.`);
      }
      if (wisser.Opmerking && wisser.Opmerking.trim()) {
        addTodoAction(`Controleer opmerking bij wisser van type '${wisserType}': ${wisser.Opmerking}`);
      }
      
      const vuilPerc = wisser["Vuil percentage"];
      if (vuilPerc !== null && vuilPerc !== undefined) {
        try {
          const perc = parseFloat(vuilPerc);
          if (perc > 70) {
            addTodoAction(`Upsell kans: ${wisserType} heeft hoog verbruik (${perc}% vuil). Overweeg extra wissers aan te bieden.`);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }

    // Toebehoren
    for (const acc of toebehorenTabel) {
      const accType = acc["Type accessoire"] || "Onbekend";
      const aantal = acc["Aantal te vervangen"] || 0;
      if (aantal > 0) {
        addTodoAction(`Vervang ${aantal}x '${accType}' bij wissers.`);
      }
      if (acc.Opmerking && acc.Opmerking.trim()) {
        addTodoAction(`Controleer opmerking bij toebehoren '${accType}': ${acc.Opmerking}`);
      }
    }
  };

  // Laad klantgegevens wanneer een klant wordt geselecteerd
  useEffect(() => {
    if (selectedKlant) {
      const [nr, naam] = selectedKlant.split(" - ");
      setRelatienummer(nr);
      setKlantnaam(naam);
      setTodoList([]);
      setKsTodoList([]);
    }
  }, [selectedKlant]);

  // Laad mock data wanneer een klant wordt geselecteerd
  useEffect(() => {
    if (relatienummer) {
      import('./services/mockData.js').then(({ mockApiService }) => {
        const mattenData = mockApiService.getMattenData(relatienummer);
        const standaardMatten = mattenData.filter(m => !m.mat_type.toLowerCase().includes('logo'));
        const logoMatten = mattenData.filter(m => m.mat_type.toLowerCase().includes('logo'));
        
        setMattenLijst(standaardMatten);
        setLogomattenLijst(logoMatten);
        
        const wissersData = mockApiService.getWissersData(relatienummer);
        setWissersTabel(wissersData);
        
        const toebehorenData = mockApiService.getToebehorenData(relatienummer);
        setToebehorenTabel(toebehorenData);
      });
    }
  }, [relatienummer]);

  // Laad contactpersonen data wanneer beschikbaar
  useEffect(() => {
    if (contactpersonen && contactpersonen.length > 0) {
      setContactpersonenData(contactpersonen);
      
      if (contactpersonen.length > 0) {
        const firstContact = contactpersonen[0];
        setContactpersoon({
          naam: formatNaam(firstContact.voornaam, firstContact.tussenvoegsel, firstContact.achternaam),
          email: firstContact.email
        });
      }
    }
  }, [contactpersonen]);

  // Simuleer ophalen van inspectie data
  useEffect(() => {
    setInspecties([
      { inspecteur: "Roberto", datum: "2024-06-01" },
      { inspecteur: "Roberto", datum: "2024-06-15" },
      { inspecteur: "Jan", datum: "2024-07-01" },
    ]);
  }, []);

  const inspecteurStats = () => {
    const counts = {};
    for (let i of inspecties) {
      counts[i.inspecteur] = (counts[i.inspecteur] || 0) + 1;
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  };

  const handleSaveInspectie = async () => {
    try {
      genereerTodoList();
      
      const inspectieData = {
        relatienummer,
        klantnaam,
        contactpersoon: contactpersoon.naam,
        contact_email: contactpersoon.email,
        inspecteur,
        datum: inspectieDatum,
        tijd: inspectieTijd,
        matten_data: { 
          matten_lijst: mattenLijst, 
          logomatten_lijst: logomattenLijst,
          concurrenten: mattenConcurrenten,
          koop_matten: koopMatten
        },
        wissers_data: { 
          wissers_tabel: wissersTabel, 
          toebehoren_tabel: toebehorenTabel,
          concurrenten: wissersConcurrenten
        },
        feedback_data: {
          algemene_opmerkingen: algemeneOpmerkingen,
          klanttevredenheid,
          vervolgacties,
          volgende_inspectie: volgendeInspectie
        }
      };
      
      await saveInspectie(inspectieData);
      alert("Inspectie succesvol opgeslagen!");
      
    } catch (error) {
      console.error("Fout bij opslaan inspectie:", error);
      alert(`Fout bij opslaan inspectie: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lavans Service App</h1>
                <p className="text-sm text-gray-500">Inspectie & Service Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString('nl-NL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString('nl-NL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Klantselectie */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Klant Selectie</h2>
                <p className="text-sm text-gray-600">Selecteer een klant om de inspectie te starten</p>
              </div>
              {selectedKlant && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Klant geselecteerd</span>
                </div>
              )}
            </div>
            
            <div className="relative">
              <select
                value={selectedKlant}
                onChange={(e) => setSelectedKlant(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg text-base bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={klantenLoading}
              >
                <option value="">{klantenLoading ? "🔄 Laden..." : "📋 Kies een klant..."}</option>
                {klanten.map(klant => (
                  <option key={klant.relatienummer} value={`${klant.relatienummer} - ${klant.bedrijfsnaam}`}>
                    {klant.relatienummer} - {klant.bedrijfsnaam}
                  </option>
                ))}
              </select>
              
              {klantenLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            
            {klantenError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">❌ Fout bij laden klanten: {klantenError}</p>
              </div>
            )}
            
            {selectedKlant && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Geselecteerde klant</p>
                    <p className="text-sm text-blue-700">{selectedKlant}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedKlant && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger 
                    value="inspectie" 
                    className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                  >
                    <span className="flex items-center space-x-2">
                      <span>📝</span>
                      <span className="hidden sm:inline">Inspectie</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="todo" 
                    className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                  >
                    <span className="flex items-center space-x-2">
                      <span>✅</span>
                      <span className="hidden sm:inline">To-do</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="contact" 
                    className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                  >
                    <span className="flex items-center space-x-2">
                      <span>👤</span>
                      <span className="hidden sm:inline">Contact</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rapportage" 
                    className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                  >
                    <span className="flex items-center space-x-2">
                      <span>📊</span>
                      <span className="hidden sm:inline">Rapport</span>
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="inspectie">
                  <Card>
                    <CardContent className="space-y-6 pt-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Inspectieformulier</h2>
                        <Button 
                          onClick={handleSaveInspectie} 
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {saving ? "🔄 Opslaan..." : "💾 Inspectie Opslaan"}
                        </Button>
                      </div>
                      
                      {/* Basis gegevens */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="inspecteur">Inspecteur</Label>
                          <Input
                            id="inspecteur"
                            value={inspecteur}
                            onChange={(e) => setInspecteur(e.target.value)}
                            placeholder="Naam inspecteur"
                          />
                        </div>
                        <div>
                          <Label htmlFor="datum">Datum</Label>
                          <Input
                            id="datum"
                            type="date"
                            value={inspectieDatum}
                            onChange={(e) => setInspectieDatum(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tijd">Tijd</Label>
                          <Input
                            id="tijd"
                            type="time"
                            value={inspectieTijd}
                            onChange={(e) => setInspectieTijd(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact">Contactpersoon</Label>
                          <Input
                            id="contact"
                            value={contactpersoon.naam}
                            onChange={(e) => setContactpersoon({...contactpersoon, naam: e.target.value})}
                            placeholder="Naam contactpersoon"
                          />
                        </div>
                      </div>

                                            {/* Concurrenten Matten */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium mb-3">Concurrenten Matten</h4>
                        <div className="space-y-4">
                          <div>
                            <Label>Zien we matten van de concurrent liggen?</Label>
                            <div className="flex flex-col sm:flex-row gap-4 mt-2">
                              <label className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name="concurrent" 
                                  value="nee" 
                                  checked={mattenConcurrenten.andere_mat_aanwezig === "nee"}
                                  onChange={(e) => {
                                    setMattenConcurrenten(prev => ({ ...prev, andere_mat_aanwezig: e.target.value }));
                                  }}
                                  className="w-4 h-4"
                                />
                                Nee
                              </label>
                              <label className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name="concurrent" 
                                  value="ja" 
                                  checked={mattenConcurrenten.andere_mat_aanwezig === "ja"}
                                  onChange={(e) => {
                                    setMattenConcurrenten(prev => ({ ...prev, andere_mat_aanwezig: e.target.value }));
                                  }}
                                  className="w-4 h-4"
                                />
                                Ja
                              </label>
                            </div>
                          </div>
                          
                          {mattenConcurrenten.andere_mat_aanwezig === "ja" && (
                            <div className="space-y-3 pl-4 border-l-2 border-yellow-300">
                              <div>
                                <Label>Van welke concurrent?</Label>
                                <select
                                  value={mattenConcurrenten.andere_mat_concurrent}
                                  onChange={(e) => {
                                    setMattenConcurrenten(prev => ({ 
                                      ...prev, 
                                      andere_mat_concurrent: e.target.value 
                                    }));
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                                >
                                  <option value="">Selecteer concurrent...</option>
                                  <option value="CWS">CWS</option>
                                  <option value="ELIS">ELIS</option>
                                  <option value="Quality Service">Quality Service</option>
                                  <option value="Vendrig">Vendrig</option>
                                  <option value="Mewa">Mewa</option>
                                  <option value="Anders">Anders namelijk:</option>
                                </select>
                                
                                {mattenConcurrenten.andere_mat_concurrent === "Anders" && (
                                  <Input
                                    placeholder="Welke andere concurrent?"
                                    value={mattenConcurrenten.andere_mat_concurrent}
                                    onChange={(e) => {
                                      setMattenConcurrenten(prev => ({ 
                                        ...prev, 
                                        andere_mat_concurrent: e.target.value 
                                      }));
                                    }}
                                    className="mt-2"
                                  />
                                )}
                              </div>
                              
                              <div>
                                <Label>Aantal matten van concurrent</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  value={mattenConcurrenten.aantal_concurrent}
                                  onChange={(e) => {
                                    setMattenConcurrenten(prev => ({ 
                                      ...prev, 
                                      aantal_concurrent: parseInt(e.target.value) || 0 
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Koop Matten */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium mb-3">Koop Matten</h4>
                        <div>
                          <Label>Aantal koop matten</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={koopMatten}
                            onChange={(e) => setKoopMatten(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      {/* Matten Sectie */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Matten Overzicht</h3>
                        
                        {/* Standaard Matten */}
                        {mattenLijst.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium mb-3">Standaard Matten</h4>
                            <div className="space-y-3">
                              {mattenLijst.map((mat, index) => (
                                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium">{mat.mat_type}</h5>
                                    <span className="text-sm text-gray-500">{mat.afdeling} - {mat.ligplaats}</span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                      <Label>Aantal</Label>
                                      <Input
                                        type="number"
                                        value={mat.aantal}
                                        onChange={(e) => {
                                          const updated = [...mattenLijst];
                                          updated[index].aantal = parseInt(e.target.value) || 0;
                                          setMattenLijst(updated);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label>Aanwezig</Label>
                                      <select
                                        value={mat.aanwezig ? "ja" : "nee"}
                                        onChange={(e) => {
                                          const updated = [...mattenLijst];
                                          updated[index].aanwezig = e.target.value === "ja";
                                          setMattenLijst(updated);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      >
                                        <option value="ja">Ja</option>
                                        <option value="nee">Nee</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label>Vuilgraad</Label>
                                      <select
                                        value={mat.vuilgraad_label || ""}
                                        onChange={(e) => {
                                          const updated = [...mattenLijst];
                                          updated[index].vuilgraad_label = e.target.value;
                                          setMattenLijst(updated);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      >
                                        <option value="">Selecteer</option>
                                        <option value="Schoon">Schoon</option>
                                        <option value="Licht vervuild">Licht vervuild</option>
                                        <option value="Vervuild">Vervuild</option>
                                        <option value="Sterk vervuild">Sterk vervuild</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label>Schoon & Onbeschadigd</Label>
                                      <select
                                        value={mat.schoon_onbeschadigd ? "ja" : "nee"}
                                        onChange={(e) => {
                                          const updated = [...mattenLijst];
                                          updated[index].schoon_onbeschadigd = e.target.value === "ja";
                                          setMattenLijst(updated);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      >
                                        <option value="ja">Ja</option>
                                        <option value="nee">Nee</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <Label>Opmerking</Label>
                                    <Input
                                      value={mat.opmerking || ""}
                                      onChange={(e) => {
                                        const updated = [...mattenLijst];
                                        updated[index].opmerking = e.target.value;
                                        setMattenLijst(updated);
                                      }}
                                      placeholder="Optionele opmerking"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Logo Matten */}
                        {logomattenLijst.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium mb-3">Logo Matten</h4>
                            <div className="space-y-3">
                              {logomattenLijst.map((mat, index) => (
                                <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium">{mat.mat_type}</h5>
                                    <span className="text-sm text-blue-600">{mat.afdeling} - {mat.ligplaats}</span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                      <Label>Barcode</Label>
                                      <Input
                                        value={mat.barcode || ""}
                                        onChange={(e) => {
                                          const updated = [...logomattenLijst];
                                          updated[index].barcode = e.target.value;
                                          setLogomattenLijst(updated);
                                        }}
                                        placeholder="Scan barcode"
                                      />
                                    </div>
                                    <div>
                                      <Label>Leeftijd</Label>
                                      <Input
                                        value={mat.barcode ? berekenLeeftijd(mat.barcode) : "-"}
                                        disabled
                                        className="bg-gray-50"
                                      />
                                    </div>
                                    <div>
                                      <Label>Aantal</Label>
                                      <Input
                                        type="number"
                                        value={mat.aantal}
                                        onChange={(e) => {
                                          const updated = [...logomattenLijst];
                                          updated[index].aantal = parseInt(e.target.value) || 0;
                                          setLogomattenLijst(updated);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label>Aanwezig</Label>
                                      <select
                                        value={mat.aanwezig ? "ja" : "nee"}
                                        onChange={(e) => {
                                          const updated = [...logomattenLijst];
                                          updated[index].aanwezig = e.target.value === "ja";
                                          setLogomattenLijst(updated);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      >
                                        <option value="ja">Ja</option>
                                        <option value="nee">Nee</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label>Vuilgraad</Label>
                                      <select
                                        value={mat.vuilgraad_label || ""}
                                        onChange={(e) => {
                                          const updated = [...logomattenLijst];
                                          updated[index].vuilgraad_label = e.target.value;
                                          setLogomattenLijst(updated);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      >
                                        <option value="">Selecteer</option>
                                        <option value="Schoon">Schoon</option>
                                        <option value="Licht vervuild">Licht vervuild</option>
                                        <option value="Vervuild">Vervuild</option>
                                        <option value="Sterk vervuild">Sterk vervuild</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label>Schoon & Onbeschadigd</Label>
                                      <select
                                        value={mat.schoon_onbeschadigd ? "ja" : "nee"}
                                        onChange={(e) => {
                                          const updated = [...logomattenLijst];
                                          updated[index].schoon_onbeschadigd = e.target.value === "ja";
                                          setLogomattenLijst(updated);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      >
                                        <option value="ja">Ja</option>
                                        <option value="nee">Nee</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <Label>Opmerking</Label>
                                    <Input
                                      value={mat.opmerking || ""}
                                      onChange={(e) => {
                                        const updated = [...logomattenLijst];
                                        updated[index].opmerking = e.target.value;
                                        setLogomattenLijst(updated);
                                      }}
                                      placeholder="Optionele opmerking"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                       {/* Concurrenten Wissers */}
                       <div className="bg-gray-50 rounded-lg p-4 mb-6">
                         <h4 className="font-medium mb-3">Concurrenten Wissers</h4>
                         <div className="space-y-4">
                           <div>
                             <Label>Zien we wissers van concurrenten staan?</Label>
                             <div className="flex flex-col sm:flex-row gap-4 mt-2">
                               <label className="flex items-center gap-2">
                                 <input 
                                   type="radio" 
                                   name="wissers_concurrent" 
                                   value="nee" 
                                   checked={wissersConcurrenten.wissers_concurrent === "nee"}
                                   onChange={(e) => {
                                     setWissersConcurrenten(prev => ({ ...prev, wissers_concurrent: e.target.value }));
                                   }}
                                   className="w-4 h-4"
                                 />
                                 Nee
                               </label>
                               <label className="flex items-center gap-2">
                                 <input 
                                   type="radio" 
                                   name="wissers_concurrent" 
                                   value="ja" 
                                   checked={wissersConcurrenten.wissers_concurrent === "ja"}
                                   onChange={(e) => {
                                     setWissersConcurrenten(prev => ({ ...prev, wissers_concurrent: e.target.value }));
                                   }}
                                   className="w-4 h-4"
                                 />
                                 Ja
                               </label>
                             </div>
                           </div>
                           
                           {wissersConcurrenten.wissers_concurrent === "ja" && (
                             <div className="space-y-3 pl-4 border-l-2 border-orange-300">
                               <div>
                                 <Label>Welke concurrent(en)?</Label>
                                 <Input
                                   placeholder="Bijv. CWS, ELIS, etc."
                                   value={wissersConcurrenten.wissers_concurrent_toelichting}
                                   onChange={(e) => {
                                     setWissersConcurrenten(prev => ({ 
                                       ...prev, 
                                       wissers_concurrent_toelichting: e.target.value 
                                     }));
                                   }}
                                 />
                               </div>
                             </div>
                           )}
                           
                           <div>
                             <Label>Andere schoonmaakmiddelen</Label>
                             <textarea
                               className="w-full p-3 border border-gray-300 rounded-md"
                               rows={3}
                               placeholder="Zie je andere schoonmaakmiddelen staan? (Bezems, wissers van andere leveranciers, etc.)"
                               value={wissersConcurrenten.andere_zaken}
                               onChange={(e) => {
                                 setWissersConcurrenten(prev => ({ 
                                   ...prev, 
                                   andere_zaken: e.target.value 
                                 }));
                               }}
                             />
                           </div>
                         </div>
                       </div>

                       {/* Wissers Sectie */}
                       <div className="space-y-4">
                         <h3 className="text-lg font-medium text-gray-900">Wissers Overzicht</h3>
                         <div className="space-y-3">
                           {wissersTabel.map((wisser, index) => (
                             <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                               <div className="flex items-center justify-between mb-3">
                                 <h4 className="font-medium">{wisser["Type wisser"]}</h4>
                               </div>
                               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                 <div>
                                   <Label>Aantal aanwezig</Label>
                                   <Input
                                     type="number"
                                     value={wisser["Aantal aanwezig"]}
                                     onChange={(e) => {
                                       const updated = [...wissersTabel];
                                       updated[index]["Aantal aanwezig"] = parseInt(e.target.value) || 0;
                                       setWissersTabel(updated);
                                     }}
                                   />
                                 </div>
                                 <div>
                                   <Label>Vuil percentage</Label>
                                   <Input
                                     type="number"
                                     value={wisser["Vuil percentage"] || ""}
                                     onChange={(e) => {
                                       const updated = [...wissersTabel];
                                       updated[index]["Vuil percentage"] = parseInt(e.target.value) || null;
                                       setWissersTabel(updated);
                                     }}
                                     placeholder="0-100"
                                   />
                                 </div>
                                 <div>
                                   <Label>In goede staat</Label>
                                   <select
                                     value={wisser["In goede staat"] ? "ja" : "nee"}
                                     onChange={(e) => {
                                       const updated = [...wissersTabel];
                                       updated[index]["In goede staat"] = e.target.value === "ja";
                                       setWissersTabel(updated);
                                     }}
                                     className="w-full p-2 border border-gray-300 rounded-md"
                                   >
                                     <option value="ja">Ja</option>
                                     <option value="nee">Nee</option>
                                   </select>
                                 </div>
                                 <div>
                                   <Label>Opmerking</Label>
                                   <Input
                                     value={wisser.Opmerking || ""}
                                     onChange={(e) => {
                                       const updated = [...wissersTabel];
                                       updated[index].Opmerking = e.target.value;
                                       setWissersTabel(updated);
                                     }}
                                     placeholder="Optionele opmerking"
                                   />
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* Toebehoren Sectie */}
                       <div className="space-y-4">
                         <h3 className="text-lg font-medium text-gray-900">Toebehoren</h3>
                         <div className="space-y-3">
                           {toebehorenTabel.map((toebehoren, index) => (
                             <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                               <div className="flex items-center justify-between mb-3">
                                 <h4 className="font-medium">{toebehoren["Type accessoire"]}</h4>
                               </div>
                               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                 <div>
                                   <Label>Vervangen</Label>
                                   <select
                                     value={toebehoren.Vervangen ? "ja" : "nee"}
                                     onChange={(e) => {
                                       const updated = [...toebehorenTabel];
                                       updated[index].Vervangen = e.target.value === "ja";
                                       setToebehorenTabel(updated);
                                     }}
                                     className="w-full p-2 border border-gray-300 rounded-md"
                                   >
                                     <option value="ja">Ja</option>
                                     <option value="nee">Nee</option>
                                   </select>
                                 </div>
                                 <div>
                                   <Label>Aantal</Label>
                                   <Input
                                     type="number"
                                     value={toebehoren.Aantal || 0}
                                     onChange={(e) => {
                                       const updated = [...toebehorenTabel];
                                       updated[index].Aantal = parseInt(e.target.value) || 0;
                                       setToebehorenTabel(updated);
                                     }}
                                   />
                                 </div>
                                 <div>
                                   <Label>Opmerking</Label>
                                   <Input
                                     value={toebehoren.Opmerking || ""}
                                     onChange={(e) => {
                                       const updated = [...toebehorenTabel];
                                       updated[index].Opmerking = e.target.value;
                                       setToebehorenTabel(updated);
                                     }}
                                     placeholder="Optionele opmerking"
                                   />
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* Feedback & Opmerkingen Sectie */}
                       <div className="bg-gray-50 rounded-lg p-6">
                         <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback & Algemene Opmerkingen</h3>
                         <div className="space-y-4">
                           <div>
                             <Label>Algemene opmerkingen over de inspectie</Label>
                             <textarea
                               className="w-full p-3 border border-gray-300 rounded-md"
                               rows={4}
                               placeholder="Heeft u algemene opmerkingen over de inspectie? Bijvoorbeeld over de staat van de locatie, bijzondere omstandigheden, of andere relevante informatie..."
                               value={algemeneOpmerkingen}
                               onChange={(e) => setAlgemeneOpmerkingen(e.target.value)}
                             />
                           </div>
                           
                           <div>
                             <Label>Klanttevredenheid</Label>
                             <select
                               value={klanttevredenheid}
                               onChange={(e) => setKlanttevredenheid(e.target.value)}
                               className="w-full p-2 border border-gray-300 rounded-md"
                             >
                               <option value="">Selecteer tevredenheid...</option>
                               <option value="zeer_tevreden">Zeer tevreden</option>
                               <option value="tevreden">Tevreden</option>
                               <option value="neutraal">Neutraal</option>
                               <option value="ontevreden">Ontevreden</option>
                               <option value="zeer_ontevreden">Zeer ontevreden</option>
                             </select>
                           </div>
                           
                           <div>
                             <Label>Vervolgacties</Label>
                             <textarea
                               className="w-full p-3 border border-gray-300 rounded-md"
                               rows={3}
                               placeholder="Welke vervolgacties zijn nodig? Bijvoorbeeld: extra service, vervanging van materialen, contact met klant, etc."
                               value={vervolgacties}
                               onChange={(e) => setVervolgacties(e.target.value)}
                             />
                           </div>
                           
                           <div>
                             <Label>Datum volgende inspectie</Label>
                             <Input
                               type="date"
                               value={volgendeInspectie}
                               onChange={(e) => setVolgendeInspectie(e.target.value)}
                               className="w-full"
                             />
                           </div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </TabsContent>

                <TabsContent value="todo">
                  <Card>
                    <CardContent className="space-y-6 pt-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">To-do Lijst</h2>
                        <Button 
                          onClick={genereerTodoList}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          🔄 Genereer To-do's
                        </Button>
                      </div>

                      {/* Inspectie To-do's */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Inspectie To-do's</h3>
                        <div className="space-y-2">
                          {todoList.map((todo, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <Checkbox
                                checked={todo.done}
                                onCheckedChange={(val) => {
                                  const updated = [...todoList];
                                  updated[index].done = val;
                                  setTodoList(updated);
                                }}
                              />
                              <Input
                                value={todo.text}
                                onChange={(e) => {
                                  const updated = [...todoList];
                                  updated[index].text = e.target.value;
                                  setTodoList(updated);
                                }}
                                className={todo.done ? "line-through text-gray-500" : ""}
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setTodoList(todoList.filter((_, i) => i !== index))}
                              >
                                🗑️
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Klantenservice To-do's */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Klantenservice To-do's</h3>
                        <div className="space-y-2">
                          {klantenserviceTodoList.map((todo, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                              <Checkbox
                                checked={todo.done}
                                onCheckedChange={(val) => {
                                  const updated = [...klantenserviceTodoList];
                                  updated[index].done = val;
                                  setKsTodoList(updated);
                                }}
                              />
                              <Input
                                value={todo.text}
                                onChange={(e) => {
                                  const updated = [...klantenserviceTodoList];
                                  updated[index].text = e.target.value;
                                  setKsTodoList(updated);
                                }}
                                className={todo.done ? "line-through text-gray-500" : ""}
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setKsTodoList(klantenserviceTodoList.filter((_, i) => i !== index))}
                              >
                                🗑️
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact">
                  <Card>
                    <CardContent className="space-y-4 pt-6">
                      <h2 className="text-xl font-semibold">Contactpersoon beheren</h2>
                      <p className="text-sm text-gray-600">
                        Controleer hieronder of de juiste contactpersonen in het systeem staan. 
                        Pas aan waar nodig. Als alles klopt, hoef je niets te doen.
                      </p>
                      
                      {contactpersonenLoading && (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-gray-600">Laden van contactpersonen...</p>
                        </div>
                      )}

                      {contactpersonenError && (
                        <div className="text-center py-8">
                          <p className="text-red-500">❌ Fout bij laden contactpersonen: {contactpersonenError}</p>
                        </div>
                      )}

                      {!contactpersonenLoading && !contactpersonenError && contactpersonenData.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-600">Geen contactpersonen gevonden voor deze klant.</p>
                        </div>
                      )}
                      
                      {!contactpersonenLoading && !contactpersonenError && contactpersonenData.map((contact, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4 bg-white">
                          <h3 className="font-medium">
                            {formatNaam(contact.voornaam, contact.tussenvoegsel, contact.achternaam)}
                          </h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Voornaam</Label>
                              <Input
                                value={contact.voornaam || ""}
                                onChange={(e) => {
                                  const newContacten = [...contactpersonenData];
                                  newContacten[index].voornaam = e.target.value;
                                  setContactpersonenData(newContacten);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Tussenvoegsel</Label>
                              <Input
                                value={contact.tussenvoegsel || ""}
                                onChange={(e) => {
                                  const newContacten = [...contactpersonenData];
                                  newContacten[index].tussenvoegsel = e.target.value;
                                  setContactpersonenData(newContacten);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Achternaam</Label>
                              <Input
                                value={contact.achternaam || ""}
                                onChange={(e) => {
                                  const newContacten = [...contactpersonenData];
                                  newContacten[index].achternaam = e.target.value;
                                  setContactpersonenData(newContacten);
                                }}
                              />
                            </div>
                            <div>
                              <Label>E-mailadres</Label>
                              <Input
                                value={contact.email || ""}
                                onChange={(e) => {
                                  const newContacten = [...contactpersonenData];
                                  newContacten[index].email = e.target.value;
                                  setContactpersonenData(newContacten);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Telefoonnummer</Label>
                              <Input
                                value={contact.telefoon || ""}
                                onChange={(e) => {
                                  const newContacten = [...contactpersonenData];
                                  newContacten[index].telefoon = e.target.value;
                                  setContactpersonenData(newContacten);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Functie</Label>
                              <Input
                                value={contact.functie || ""}
                                onChange={(e) => {
                                  const newContacten = [...contactpersonenData];
                                  newContacten[index].functie = e.target.value;
                                  setContactpersonenData(newContacten);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        onClick={() => {
                          const newContact = {
                            voornaam: "",
                            tussenvoegsel: "",
                            achternaam: "",
                            email: "",
                            telefoon: "",
                            functie: ""
                          };
                          setContactpersonenData([...contactpersonenData, newContact]);
                        }}
                        className="w-full"
                      >
                        ➕ Nieuwe contactpersoon toevoegen
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="rapportage">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Management Rapportage</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Totaal bezoeken</p>
                          <p className="text-2xl font-bold text-blue-900">{inspecties.length}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Vandaag</p>
                          <p className="text-2xl font-bold text-green-900">
                            {inspecties.filter(i => i.datum === new Date().toISOString().split('T')[0]).length}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-600 font-medium">Deze week</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {inspecties.filter(i => {
                              const inspectieDate = new Date(i.datum);
                              const weekAgo = new Date();
                              weekAgo.setDate(weekAgo.getDate() - 7);
                              return inspectieDate >= weekAgo;
                            }).length}
                          </p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={inspecteurStats()}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#1E3A8A" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 