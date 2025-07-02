import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Simuleer database data
const mockKlanten = [
  { relatienummer: "1001", naam: "Bedrijf A" },
  { relatienummer: "1002", naam: "Bedrijf B" },
  { relatienummer: "1003", naam: "Bedrijf C" },
];

const mockAbonnementen = {
  "1001": [
    { productnummer: "00M001", productomschrijving: "Standaard Mat", activiteit: "matten", afdeling: "Receptie", ligplaats: "Ingang", aantal: 2, barcode: "0300522" },
    { productnummer: "L001", productomschrijving: "Logo Mat", activiteit: "matten", afdeling: "Algemeen", ligplaats: "Algemeen", aantal: 1, barcode: "0300522" },
    { productnummer: "W001", productomschrijving: "Snelwisser 75 cm", activiteit: "wissers", aantal: 5 },
    { productnummer: "W002", productomschrijving: "Steel glasvezel lavanswisser", activiteit: "wissers", aantal: 3 },
    { productnummer: "W003", productomschrijving: "Opvangbak lavanswisser 75 cm. / 100 cm.", activiteit: "wissers", aantal: 2 },
    { productnummer: "W004", productomschrijving: "Muursteun lavanswisser zwart", activiteit: "wissers", aantal: 1 },
  ],
  "1002": [
    { productnummer: "00M002", productomschrijving: "Standaard Mat", activiteit: "matten", afdeling: "Kantoor", ligplaats: "Hoofdingang", aantal: 3 },
    { productnummer: "W002", productomschrijving: "Wisser Type B", activiteit: "wissers", aantal: 3 },
  ]
};

const mockContactpersonen = {
  "1001": [
    { voornaam: "Jan", tussenvoegsel: "", achternaam: "Jansen", email: "jan@bedrijfa.nl", telefoon: "020-1234567", klantenportaal: "jan.jansen", nog_in_dienst: true, routecontact: true },
    { voornaam: "Piet", tussenvoegsel: "van", achternaam: "Bergen", email: "piet@bedrijfa.nl", telefoon: "020-1234568", klantenportaal: "", nog_in_dienst: true, routecontact: false },
  ],
  "1002": [
    { voornaam: "Anna", tussenvoegsel: "", achternaam: "Smit", email: "anna@bedrijfb.nl", telefoon: "020-1234569", klantenportaal: "anna.smit", nog_in_dienst: true, routecontact: true },
  ]
};

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
  const [mattenIndex, setMattenIndex] = useState(0);
  const [mattenLijst, setMattenLijst] = useState([]);
  const [logomattenLijst, setLogomattenLijst] = useState([]);
  const [wissersTabel, setWissersTabel] = useState([]);
  const [toebehorenTabel, setToebehorenTabel] = useState([]);
  const [contactpersonenData, setContactpersonenData] = useState([]);
  const [inspecties, setInspecties] = useState([]);
  const [mattenData, setMattenData] = useState({});
  const [wissersData, setWissersData] = useState({});

  // Hulpfuncties
  const formatNaam = (voornaam, tussenvoegsel, achternaam) => {
    const v = voornaam || "";
    const t = tussenvoegsel || "";
    const a = achternaam || "";
    return `${v} ${t} ${a}`.replace(/\s+/g, " ").trim();
  };

  const berekenLeeftijd = (barcode) => {
    if (!barcode || barcode.toString().length < 7) {
      return "-";
    }
    try {
      const barcodeStr = barcode.toString().trim();
      if (barcodeStr.length >= 7) {
        const maandDigit = barcodeStr[4];
        const jaarDigits = barcodeStr.slice(5, 7);
        
        const maand = parseInt(maandDigit);
        const jaar = parseInt(jaarDigits);
        
        if (maand < 1 || maand > 12) {
          return `Onbekend (maand ${maand} ongeldig)`;
        }
        
        const volledigJaar = 2000 + jaar;
        const productieDatum = new Date(volledigJaar, maand - 1, 1);
        const vandaag = new Date();
        const leeftijdDagen = Math.floor((vandaag - productieDatum) / (1000 * 60 * 60 * 24));
        const leeftijdMaanden = Math.floor(leeftijdDagen / 30);
        
        if (leeftijdMaanden < 0) {
          return "Onbekend (toekomstige datum)";
        }
        
        if (leeftijdMaanden < 12) {
          return `${leeftijdMaanden} maanden`;
        } else {
          const leeftijdJaren = Math.floor(leeftijdMaanden / 12);
          const resterendeMaanden = leeftijdMaanden % 12;
          if (resterendeMaanden === 0) {
            return `${leeftijdJaren} jaar`;
          } else {
            return `${leeftijdJaren} jaar en ${resterendeMaanden} maanden`;
          }
        }
      } else {
        return "Onbekend (te kort)";
      }
    } catch (e) {
      return `Onbekend (fout: ${e})`;
    }
  };

  const toBool = (val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
      const v = val.trim().toLowerCase();
      return ["true", "ja", "1", "yes"].includes(v);
    }
    if (typeof val === "number") return val === 1;
    return false;
  };

  const boolToJaNee = (val) => {
    return val ? "Ja" : "Nee";
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
      
      // Laad abonnementen
      const abos = mockAbonnementen[nr] || [];
      const mattenAbos = abos.filter(a => a.activiteit === "matten");
      const wissersAbos = abos.filter(a => a.activiteit === "wissers");
      
      // Bouw mattenlijsten
      const standaardMatten = [];
      const logoMatten = [];
      
      for (const abo of mattenAbos) {
        const matInfo = {
          mat_type: abo.productomschrijving,
          afdeling: abo.afdeling || "Algemeen",
          ligplaats: abo.ligplaats || "Algemeen",
          aantal: abo.aantal || 0,
          aanwezig: false,
          schoon_onbeschadigd: true,
          vuilgraad_label: "",
          vuilgraad: 1,
          barcode: abo.barcode || "",
          bezoekritme: abo.bezoekritme || ""
        };
        
        if (abo.productnummer.startsWith("00M")) {
          standaardMatten.push(matInfo);
        } else if (abo.productnummer.startsWith("L")) {
          logoMatten.push(matInfo);
        }
      }
      
      setMattenLijst(standaardMatten);
      setLogomattenLijst(logoMatten);
      
      // Bouw wissers tabel
      const wissers = wissersAbos.map(abo => ({
        "Type wisser": abo.productomschrijving,
        "Aantal aanwezig": 0,
        "Waarvan gebruikt": 0,
        "Vuil percentage": null,
        "In goede staat": true,
        "Opmerking": ""
      }));
      setWissersTabel(wissers);
      
      // Bouw toebehoren tabel
      const toebehoren = wissersAbos.map(abo => ({
        "Type accessoire": abo.productomschrijving,
        "Vervangen": false,
        "Aantal": 0,
        "Opmerking": ""
      }));
      setToebehorenTabel(toebehoren);
      
      // Laad contactpersonen
      const contacten = mockContactpersonen[nr] || [];
      setContactpersonenData(contacten);
      
      // Zoek routecontact
      const routecontact = contacten.find(c => c.routecontact);
      if (routecontact) {
        setContactpersoon({
          naam: formatNaam(routecontact.voornaam, routecontact.tussenvoegsel, routecontact.achternaam),
          email: routecontact.email
        });
      }
      
      // Reset to-do lijsten
      setTodoList([]);
      setKsTodoList([]);
    }
  }, [selectedKlant]);

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

  const handleSaveInspectie = () => {
    // Genereer to-do's
    genereerTodoList();
    
    // Log inspectie (in echte app zou dit naar database gaan)
    const inspectieData = {
      relatienummer,
      klantnaam,
      contactpersoon: contactpersoon.naam,
      contact_email: contactpersoon.email,
      inspecteur,
      datum: inspectieDatum,
      tijd: inspectieTijd,
      matten_data: { matten_lijst: mattenLijst, logomatten_lijst: logomattenLijst },
      wissers_data: { wissers_tabel: wissersTabel, toebehoren_tabel: toebehorenTabel }
    };
    
    console.log("Inspectie opgeslagen:", inspectieData);
    alert("Inspectie succesvol opgeslagen!");
  };

  return (
    <div className="p-2 sm:p-4 max-w-6xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4">Lavans Service App</h1>

      {/* Klantselectie */}
      <div className="mb-4 sm:mb-6">
        <Label htmlFor="klant-select">Selecteer Klant</Label>
        <select
          id="klant-select"
          value={selectedKlant}
          onChange={(e) => setSelectedKlant(e.target.value)}
          className="w-full p-3 sm:p-2 border rounded-md text-base"
        >
          <option value="">Kies een klant...</option>
          {mockKlanten.map(klant => (
            <option key={klant.relatienummer} value={`${klant.relatienummer} - ${klant.naam}`}>
              {klant.relatienummer} - {klant.naam}
            </option>
          ))}
        </select>
      </div>

      {selectedKlant && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 gap-1">
            <TabsTrigger value="inspectie" className="text-xs sm:text-sm">📝 Inspectie</TabsTrigger>
            <TabsTrigger value="todo" className="text-xs sm:text-sm">📝 To-do</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm">👤 Contact</TabsTrigger>
            <TabsTrigger value="rapportage" className="text-xs sm:text-sm">📊 Rapport</TabsTrigger>
          </TabsList>

          <TabsContent value="inspectie">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <h2 className="text-xl font-semibold">Inspectieformulier</h2>
                
                {/* Basis gegevens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inspecteur">Inspecteur</Label>
                    <Input
                      id="inspecteur"
                      value={inspecteur}
                      onChange={(e) => setInspecteur(e.target.value)}
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
                      disabled
                    />
                  </div>
                </div>

                {/* Matten sectie */}
                {mattenLijst.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Matten Inspectie</h3>
                    
                    {/* Concurrent matten */}
                    <div className="space-y-2">
                      <Label>Zien we matten van de concurrent liggen?</Label>
                                           <div className="flex flex-col sm:flex-row gap-4">
                       <label className="flex items-center gap-2">
                         <input 
                           type="radio" 
                           name="concurrent" 
                           value="nee" 
                           defaultChecked 
                           onChange={(e) => {
                             if (e.target.checked) {
                               setMattenData(prev => ({ ...prev, andere_mat_aanwezig: "Nee" }));
                             }
                           }}
                           className="w-5 h-5"
                         />
                         Nee
                       </label>
                       <label className="flex items-center gap-2">
                         <input 
                           type="radio" 
                           name="concurrent" 
                           value="ja" 
                           onChange={(e) => {
                             if (e.target.checked) {
                               setMattenData(prev => ({ ...prev, andere_mat_aanwezig: "Ja" }));
                             }
                           }}
                           className="w-5 h-5"
                         />
                         Ja
                       </label>
                     </div>
                      
                      {mattenData?.andere_mat_aanwezig === "Ja" && (
                        <div className="ml-6 space-y-2">
                          <Label>Van welke concurrent?</Label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            onChange={(e) => {
                              if (e.target.value === "Anders namelijk:") {
                                setMattenData(prev => ({ ...prev, andere_mat_concurrent: "Anders" }));
                              } else {
                                setMattenData(prev => ({ ...prev, andere_mat_concurrent: e.target.value }));
                              }
                            }}
                          >
                            <option value="">Selecteer concurrent...</option>
                            <option value="CWS">CWS</option>
                            <option value="ELIS">ELIS</option>
                            <option value="Quality Service">Quality Service</option>
                            <option value="Vendrig">Vendrig</option>
                            <option value="Mewa">Mewa</option>
                            <option value="Anders namelijk:">Anders namelijk:</option>
                          </select>
                          
                          {mattenData?.andere_mat_concurrent === "Anders" && (
                            <Input
                              placeholder="Welke andere concurrent?"
                              onChange={(e) => {
                                setMattenData(prev => ({ ...prev, andere_mat_concurrent: e.target.value }));
                              }}
                            />
                          )}
                          
                          <div>
                            <Label>Aantal matten van concurrent</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              onChange={(e) => {
                                setMattenData(prev => ({ ...prev, aantal_concurrent: parseInt(e.target.value) || 0 }));
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                                         {/* Standaard matten carrousel */}
                     <div className="space-y-4">
                       <h4 className="font-medium">Standaard Matten</h4>
                       {mattenLijst.length > 0 && (
                         <div className="border rounded-lg p-4">
                           <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                             <span className="font-medium text-center sm:text-left">Mat {mattenIndex + 1} van {mattenLijst.length}</span>
                             <div className="flex gap-2">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setMattenIndex(Math.max(0, mattenIndex - 1))}
                                 disabled={mattenIndex === 0}
                                 className="min-w-[80px]"
                               >
                                 ← Vorige
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setMattenIndex(Math.min(mattenLijst.length - 1, mattenIndex + 1))}
                                 disabled={mattenIndex === mattenLijst.length - 1}
                                 className="min-w-[80px]"
                               >
                                 Volgende →
                               </Button>
                             </div>
                           </div>
                           
                           {mattenLijst[mattenIndex] && (
                             <div className="space-y-4">
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                   <Label>Productomschrijving</Label>
                                   <Input value={mattenLijst[mattenIndex].mat_type} disabled />
                                 </div>
                                 <div>
                                   <Label>Aantal</Label>
                                   <Input
                                     type="number"
                                     value={mattenLijst[mattenIndex].aantal}
                                     onChange={(e) => {
                                       const newMatten = [...mattenLijst];
                                       newMatten[mattenIndex].aantal = parseInt(e.target.value) || 0;
                                       setMattenLijst(newMatten);
                                     }}
                                   />
                                 </div>
                                 <div>
                                   <Label>Afdeling</Label>
                                   <Input
                                     value={mattenLijst[mattenIndex].afdeling}
                                     onChange={(e) => {
                                       const newMatten = [...mattenLijst];
                                       newMatten[mattenIndex].afdeling = e.target.value;
                                       setMattenLijst(newMatten);
                                     }}
                                   />
                                 </div>
                                 <div>
                                   <Label>Ligplaats</Label>
                                   <Input
                                     value={mattenLijst[mattenIndex].ligplaats}
                                     onChange={(e) => {
                                       const newMatten = [...mattenLijst];
                                       newMatten[mattenIndex].ligplaats = e.target.value;
                                       setMattenLijst(newMatten);
                                     }}
                                   />
                                 </div>
                               </div>
                               
                               <div className="flex items-center gap-2">
                                 <Checkbox
                                   checked={mattenLijst[mattenIndex].aanwezig}
                                   onCheckedChange={(checked) => {
                                     const newMatten = [...mattenLijst];
                                     newMatten[mattenIndex].aanwezig = checked;
                                     setMattenLijst(newMatten);
                                   }}
                                 />
                                 <Label>Aanwezig</Label>
                               </div>
                               
                               <div>
                                 <Label>Vuilgraad</Label>
                                 <select
                                   value={mattenLijst[mattenIndex].vuilgraad_label}
                                   onChange={(e) => {
                                     const newMatten = [...mattenLijst];
                                     newMatten[mattenIndex].vuilgraad_label = e.target.value;
                                     setMattenLijst(newMatten);
                                   }}
                                   className="w-full p-2 border rounded-md"
                                 >
                                   <option value="">Selecteer...</option>
                                   <option value="Schoon">Schoon</option>
                                   <option value="Licht vervuild">Licht vervuild</option>
                                   <option value="Sterk vervuild">Sterk vervuild</option>
                                 </select>
                               </div>
                               
                               <div>
                                 <Label>Opmerking</Label>
                                 <textarea
                                   className="w-full p-2 border rounded-md"
                                   rows={2}
                                   placeholder="Eventuele opmerkingen..."
                                   value={mattenLijst[mattenIndex].opmerking || ""}
                                   onChange={(e) => {
                                     const newMatten = [...mattenLijst];
                                     newMatten[mattenIndex].opmerking = e.target.value;
                                     setMattenLijst(newMatten);
                                   }}
                                 />
                               </div>
                             </div>
                           )}
                           
                           {/* Navigatie dots */}
                           {mattenLijst.length > 1 && (
                             <div className="flex justify-center gap-3 mt-4">
                               {mattenLijst.map((_, index) => (
                                 <button
                                   key={index}
                                   onClick={() => setMattenIndex(index)}
                                   className={`w-4 h-4 sm:w-3 sm:h-3 rounded-full touch-manipulation ${
                                     index === mattenIndex ? 'bg-blue-600' : 'bg-gray-300'
                                   }`}
                                 />
                               ))}
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                     
                     {/* Koop matten */}
                     <div className="space-y-2">
                       <Label>Aantal koop matten</Label>
                       <Input
                         type="number"
                         min="0"
                         placeholder="0"
                         onChange={(e) => {
                           setMattenData(prev => ({ ...prev, aantal_koop: parseInt(e.target.value) || 0 }));
                         }}
                       />
                     </div>

                    {/* Logomatten */}
                    {logomattenLijst.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Logomatten</h4>
                        {logomattenLijst.map((mat, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-4">
                            <h5 className="font-medium">Logomat {index + 1}</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label>Productomschrijving</Label>
                                <Input value={mat.mat_type} disabled />
                              </div>
                              <div>
                                <Label>Barcode</Label>
                                <Input
                                  value={mat.barcode}
                                  onChange={(e) => {
                                    const newLogoMatten = [...logomattenLijst];
                                    newLogoMatten[index].barcode = e.target.value;
                                    setLogomattenLijst(newLogoMatten);
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Leeftijd</Label>
                                <Input value={berekenLeeftijd(mat.barcode)} disabled />
                              </div>
                              <div>
                                <Label>Aantal</Label>
                                <Input
                                  type="number"
                                  value={mat.aantal}
                                  onChange={(e) => {
                                    const newLogoMatten = [...logomattenLijst];
                                    newLogoMatten[index].aantal = parseInt(e.target.value) || 0;
                                    setLogomattenLijst(newLogoMatten);
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Afdeling</Label>
                                <Input
                                  value={mat.afdeling}
                                  onChange={(e) => {
                                    const newLogoMatten = [...logomattenLijst];
                                    newLogoMatten[index].afdeling = e.target.value;
                                    setLogomattenLijst(newLogoMatten);
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Ligplaats</Label>
                                <Input
                                  value={mat.ligplaats}
                                  onChange={(e) => {
                                    const newLogoMatten = [...logomattenLijst];
                                    newLogoMatten[index].ligplaats = e.target.value;
                                    setLogomattenLijst(newLogoMatten);
                                  }}
                                />
                              </div>
                              <div className="col-span-2">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={mat.aanwezig}
                                    onCheckedChange={(checked) => {
                                      const newLogoMatten = [...logomattenLijst];
                                      newLogoMatten[index].aanwezig = checked;
                                      setLogomattenLijst(newLogoMatten);
                                    }}
                                  />
                                  <Label>Aanwezig</Label>
                                </div>
                              </div>
                              <div>
                                <Label>Vuilgraad</Label>
                                <select
                                  value={mat.vuilgraad_label}
                                  onChange={(e) => {
                                    const newLogoMatten = [...logomattenLijst];
                                    newLogoMatten[index].vuilgraad_label = e.target.value;
                                    setLogomattenLijst(newLogoMatten);
                                  }}
                                  className="w-full p-2 border rounded-md"
                                >
                                  <option value="">Selecteer...</option>
                                  <option value="Schoon">Schoon</option>
                                  <option value="Licht vervuild">Licht vervuild</option>
                                  <option value="Sterk vervuild">Sterk vervuild</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Wissers sectie */}
                {wissersTabel.length > 0 && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-blue-900 mb-2 mt-6">2.3 Aantal wissers</h2>
                    <div className="space-y-2">
                      <Label>Zien we wissers van concurrenten staan?</Label>
                       <div className="flex flex-col sm:flex-row gap-4">
                         <label className="flex items-center gap-2">
                           <input 
                             type="radio" 
                             name="wissers_concurrent" 
                             value="nee" 
                             defaultChecked 
                             onChange={(e) => {
                               if (e.target.checked) {
                                 setWissersData(prev => ({ ...prev, wissers_concurrent: "Nee" }));
                               }
                             }}
                             className="w-5 h-5"
                           />
                           Nee
                         </label>
                         <label className="flex items-center gap-2">
                           <input 
                             type="radio" 
                             name="wissers_concurrent" 
                             value="ja" 
                             onChange={(e) => {
                               if (e.target.checked) {
                                 setWissersData(prev => ({ ...prev, wissers_concurrent: "Ja" }));
                               }
                             }}
                             className="w-5 h-5"
                           />
                           Ja
                         </label>
                       </div>
                        
                         {wissersData?.wissers_concurrent === "Ja" && (
                           <div className="ml-6 space-y-2">
                             <Label>Welke concurrent(en)?</Label>
                             <Input
                               placeholder="Bijv. CWS, ELIS, etc."
                               onChange={(e) => {
                                 setWissersData(prev => ({ ...prev, wissers_concurrent_toelichting: e.target.value }));
                               }}
                             />
                           </div>
                         )}
                       </div>
                       
                       <div className="space-y-2">
                         <Label>Andere schoonmaakmiddelen</Label>
                         <textarea
                           className="w-full p-2 border rounded-md"
                           rows={3}
                           placeholder="Zie je andere schoonmaakmiddelen staan? (Bezems, wissers van andere leveranciers, etc.)"
                           onChange={(e) => {
                             setWissersData(prev => ({ ...prev, andere_zaken: e.target.value }));
                           }}
                         />
                       </div>

                      {/* Wissers tabel */}
                      <div className="space-y-2">
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="p-2 text-left">Artikel</th>
                                <th className="p-2 text-left">Aantal geteld</th>
                                <th className="p-2 text-left">Waarvan gebruikt</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wissersTabel.map((wisser, index) => (
                                <tr key={index} className="border-t">
                                  <td className="p-2 font-medium">{wisser["Type wisser"]}</td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      value={wisser["Aantal aanwezig"]}
                                      onChange={(e) => {
                                        const newWissers = [...wissersTabel];
                                        newWissers[index]["Aantal aanwezig"] = parseInt(e.target.value) || 0;
                                        setWissersTabel(newWissers);
                                      }}
                                      className="w-20"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      value={wisser["Waarvan gebruikt"]}
                                      onChange={(e) => {
                                        const newWissers = [...wissersTabel];
                                        newWissers[index]["Waarvan gebruikt"] = parseInt(e.target.value) || 0;
                                        setWissersTabel(newWissers);
                                      }}
                                      className="w-20"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Toebehoren tabel */}
                      <h2 className="text-2xl font-bold text-blue-900 mb-2 mt-8">2.4 Stelen en toebehoren</h2>
                      <div className="space-y-2">
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="p-2 text-left">Artikel</th>
                                <th className="p-2 text-left">Vervangen</th>
                                <th className="p-2 text-left">Aantal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {toebehorenTabel.map((toebehoren, index) => (
                                <tr key={index} className="border-t">
                                  <td className="p-2 font-medium">{toebehoren["Type accessoire"]}</td>
                                  <td className="p-2">
                                    <Checkbox
                                      checked={toebehoren.Vervangen}
                                      onCheckedChange={(checked) => {
                                        const newToebehoren = [...toebehorenTabel];
                                        newToebehoren[index].Vervangen = checked;
                                        setToebehorenTabel(newToebehoren);
                                      }}
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      value={toebehoren.Aantal}
                                      onChange={(e) => {
                                        const newToebehoren = [...toebehorenTabel];
                                        newToebehoren[index].Aantal = parseInt(e.target.value) || 0;
                                        setToebehorenTabel(newToebehoren);
                                      }}
                                      className="w-20"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Feedback */}
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback klant</Label>
                  <textarea
                    id="feedback"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Heeft de klant feedback of opmerkingen?"
                  />
                </div>

                                 <Button onClick={handleSaveInspectie} className="w-full p-4 text-base">
                   💾 Sla alles op voor deze klant
                 </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="todo">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">To-do lijst voor servicemedewerkers</h2>
                
                {todoList.map((todo, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
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
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">To-do klantenservice</h3>
                  {klantenserviceTodoList.map((todo, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
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
                
                {contactpersonenData.map((contact, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-medium">
                      {formatNaam(contact.voornaam, contact.tussenvoegsel, contact.achternaam)}
                    </h3>
                    
                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Voornaam</Label>
                        <Input
                          value={contact.voornaam}
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
                          value={contact.tussenvoegsel}
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
                          value={contact.achternaam}
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
                          value={contact.email}
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
                          value={contact.telefoon}
                          onChange={(e) => {
                            const newContacten = [...contactpersonenData];
                            newContacten[index].telefoon = e.target.value;
                            setContactpersonenData(newContacten);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Klantenportaal gebruikersnaam</Label>
                        <Input
                          value={contact.klantenportaal}
                          onChange={(e) => {
                            const newContacten = [...contactpersonenData];
                            newContacten[index].klantenportaal = e.target.value;
                            setContactpersonenData(newContacten);
                          }}
                        />
                      </div>
                    </div>
                    
                                         <div className="flex flex-col sm:flex-row gap-4">
                       <div className="flex items-center gap-2">
                         <Checkbox
                           checked={contact.nog_in_dienst}
                           onCheckedChange={(checked) => {
                             const newContacten = [...contactpersonenData];
                             newContacten[index].nog_in_dienst = checked;
                             setContactpersonenData(newContacten);
                           }}
                         />
                         <Label>Nog in dienst</Label>
                       </div>
                       <div className="flex items-center gap-2">
                         <Checkbox
                           checked={contact.routecontact}
                           onCheckedChange={(checked) => {
                             const newContacten = [...contactpersonenData];
                             newContacten[index].routecontact = checked;
                             setContactpersonenData(newContacten);
                           }}
                         />
                         <Label>Routecontact</Label>
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
                      klantenportaal: "",
                      nog_in_dienst: true,
                      routecontact: false
                    };
                    setContactpersonenData([...contactpersonenData, newContact]);
                  }}
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
                <p className="mb-4">Totaal aantal bezoeken: {inspecties.length}</p>
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
      )}
    </div>
  );
} 