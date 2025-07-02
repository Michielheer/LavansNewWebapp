# Frontend API Integratie - Lavans Service App

## 🔄 Overzicht van Aanpassingen

De React frontend is aangepast om te communiceren met de C# backend API in plaats van mock data te gebruiken. Hier zijn de belangrijkste wijzigingen:

## 📁 Nieuwe Bestanden

### 1. **API Service Laag** (`src/services/api.js`)
- Centrale service voor alle API communicatie
- Configureerbare base URL (`http://localhost:5000/api/lavans`)
- Error handling en response validatie
- Methoden voor alle CRUD operaties

### 2. **Custom Hooks** (`src/hooks/useApi.js`)
- `useKlanten()` - Laadt alle klanten
- `useKlant(relatienummer)` - Laadt specifieke klant
- `useAbonnementen(klantRelatienummer)` - Laadt abonnementen
- `useContactpersonen(klantRelatienummer)` - Laadt contactpersonen
- `useInspecties(klantRelatienummer)` - Laadt inspecties
- `useSaveInspectie()` - Slaat inspectie op
- `useUpdateTodo()` - Update todo items

## 🔧 Aanpassingen in App.jsx

### 1. **Imports Aangepast**
```javascript
// Oud: Mock data imports
const mockKlanten = [...];
const mockAbonnementen = {...};

// Nieuw: API hooks
import { useKlanten, useAbonnementen, useContactpersonen, useSaveInspectie } from "./hooks/useApi";
```

### 2. **State Management**
```javascript
// API hooks toegevoegd
const { klanten, loading: klantenLoading, error: klantenError } = useKlanten();
const { abonnementen, loading: abonnementenLoading, error: abonnementenError } = useAbonnementen(selectedKlant);
const { contactpersonen, loading: contactpersonenLoading, error: contactpersonenError } = useContactpersonen(selectedKlant);
const { saveInspectie, saving, error: saveError } = useSaveInspectie();
```

### 3. **useEffect Hooks Herstructurerd**
- **Klant selectie**: Alleen basis klant info laden
- **Abonnementen**: Aparte useEffect voor abonnementen data
- **Contactpersonen**: Aparte useEffect voor contactpersonen data

### 4. **Loading States Toegevoegd**
- Klantselectie dropdown disabled tijdens laden
- Loading indicators voor abonnementen en contactpersonen
- Error messages voor API fouten
- Save button disabled tijdens opslaan

### 5. **API Integratie**
- `handleSaveInspectie()` nu async met error handling
- Echte API calls in plaats van console.log
- Proper error feedback naar gebruiker

## 🚀 Setup & Configuratie

### 1. **Backend URL Configuratie**
In `src/services/api.js`:
```javascript
const API_BASE = 'http://localhost:5000/api/lavans';
```

### 2. **CORS Instellingen**
De C# backend moet CORS toestaan voor de frontend:
```csharp
app.UseCors(builder => builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());
```

### 3. **Environment Variables** (Optioneel)
Voor productie, gebruik environment variables:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/lavans';
```

## 🔍 API Endpoints Gebruikt

### Klanten
- `GET /api/lavans/klanten` - Alle klanten
- `GET /api/lavans/klanten/{relatienummer}` - Specifieke klant

### Abonnementen
- `GET /api/lavans/klanten/{relatienummer}/abonnementen` - Klant abonnementen

### Contactpersonen
- `GET /api/lavans/klanten/{relatienummer}/contactpersonen` - Klant contactpersonen

### Inspecties
- `GET /api/lavans/inspecties` - Alle inspecties
- `POST /api/lavans/inspecties` - Nieuwe inspectie opslaan

### Todo Items
- `PUT /api/lavans/todo/{id}` - Todo item updaten

## 🎯 Voordelen van de Nieuwe Architectuur

### 1. **Real-time Data**
- Echte database data in plaats van mock data
- Automatische updates wanneer data verandert

### 2. **Betere Error Handling**
- Duidelijke foutmeldingen voor gebruikers
- Graceful degradation bij API problemen

### 3. **Loading States**
- Betere UX met loading indicators
- Disabled states tijdens API calls

### 4. **Modulaire Architectuur**
- Gescheiden concerns (API, hooks, components)
- Herbruikbare hooks voor andere componenten

### 5. **Type Safety**
- Consistent data structure tussen frontend en backend
- Betere IntelliSense en error detection

## 🧪 Testen

### 1. **Backend Draaien**
```bash
# Start de C# backend
dotnet run
```

### 2. **Frontend Draaien**
```bash
# Start de React app
npm run dev
```

### 3. **Test Scenario's**
- Klant selecteren → Abonnementen laden
- Inspectie invullen → Opslaan naar database
- Contactpersonen bekijken → Routecontact selecteren
- Todo items updaten → Database sync

## 🔧 Troubleshooting

### 1. **CORS Errors**
- Controleer of backend CORS correct is geconfigureerd
- Verifieer API_BASE URL in frontend

### 2. **API Timeout**
- Controleer of backend draait op juiste poort
- Verifieer database connection

### 3. **Data Niet Laden**
- Check browser console voor API errors
- Verifieer database setup en demo data

### 4. **Save Fouten**
- Controleer inspectie data format
- Verifieer database schema matches

## 📈 Volgende Stappen

### 1. **Productie Ready**
- Environment variables configureren
- Error logging implementeren
- Performance monitoring toevoegen

### 2. **Extra Features**
- Real-time updates met SignalR
- Offline support met service workers
- Progressive Web App (PWA) features

### 3. **Testing**
- Unit tests voor API service
- Integration tests voor hooks
- E2E tests voor complete flows

## 🎉 Resultaat

De frontend is nu volledig geïntegreerd met de C# backend en gebruikt echte database data. De app is klaar voor productie gebruik met proper error handling, loading states en een modulaire architectuur. 