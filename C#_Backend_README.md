# Lavans C# Backend - Database Integratie

Deze C# backend is ontworpen om direct te integreren met de bestaande Lavans database. Het gebruikt Dapper voor directe SQL queries en biedt een REST API voor de React frontend.

## 🏗️ Architectuur

### Database Service (`LavansDatabaseService.cs`)
- **Directe database toegang** via Dapper
- **Geen Entity Framework** - gebruikt bestaande database structuur
- **Async/Sync methoden** voor flexibiliteit
- **Transactie ondersteuning** voor data integriteit

### API Controller (`LavansApiController.cs`)
- **REST endpoints** voor alle CRUD operaties
- **Error handling** met gestructureerde responses
- **CORS configuratie** voor frontend integratie

### Data Modellen (`LavansDataModels.cs`)
- **Type-safe modellen** voor API responses
- **DTOs** voor data transfer
- **Validatie annotaties** voor data integriteit

## 🚀 Setup

### 1. Database Connection
Voeg je connection string toe aan `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "LavansDatabase": "Server=your-server;Database=LavansDB;Trusted_Connection=true;"
  }
}
```

### 2. Dependencies
Zorg dat je deze NuGet packages hebt:

```xml
<PackageReference Include="Dapper" Version="2.0.123" />
<PackageReference Include="System.Data.SqlClient" Version="4.8.5" />
<PackageReference Include="Microsoft.AspNetCore.Mvc" Version="2.2.0" />
```

### 3. Service Registratie
In je `Startup.cs`:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Voeg de database service toe
    services.ConfigureLavansServices(Configuration);
    
    // Voeg controllers toe
    services.AddControllers();
    
    // Voeg CORS toe
    services.AddCors();
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // CORS policy toepassen
    app.UseCors("AllowReactApp");
    
    app.UseRouting();
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

## 📊 Database Tabellen

De service verwacht deze tabellen in je Lavans database:

### Klanten
```sql
CREATE TABLE Klanten (
    Relatienummer NVARCHAR(50) PRIMARY KEY,
    Naam NVARCHAR(255) NOT NULL,
    Adres NVARCHAR(255),
    Postcode NVARCHAR(10),
    Plaats NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

### Abonnementen
```sql
CREATE TABLE Abonnementen (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Productnummer NVARCHAR(50),
    Productomschrijving NVARCHAR(255),
    Activiteit NVARCHAR(100),
    Afdeling NVARCHAR(100),
    Ligplaats NVARCHAR(50),
    Aantal INT,
    Barcode NVARCHAR(50),
    KlantRelatienummer NVARCHAR(50),
    FOREIGN KEY (KlantRelatienummer) REFERENCES Klanten(Relatienummer)
);
```

### Contactpersonen
```sql
CREATE TABLE Contactpersonen (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Voornaam NVARCHAR(100),
    Tussenvoegsel NVARCHAR(20),
    Achternaam NVARCHAR(100),
    Email NVARCHAR(255),
    Telefoon NVARCHAR(20),
    Klantenportaal BIT DEFAULT 0,
    NogInDienst BIT DEFAULT 1,
    Routecontact BIT DEFAULT 0,
    KlantRelatienummer NVARCHAR(50),
    FOREIGN KEY (KlantRelatienummer) REFERENCES Klanten(Relatienummer)
);
```

### Inspecties
```sql
CREATE TABLE Inspecties (
    Id NVARCHAR(50) PRIMARY KEY,
    KlantRelatienummer NVARCHAR(50),
    Inspecteur NVARCHAR(100),
    InspectieDatum DATE,
    InspectieTijd TIME,
    ContactpersoonNaam NVARCHAR(255),
    ContactpersoonEmail NVARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (KlantRelatienummer) REFERENCES Klanten(Relatienummer)
);
```

### Mat Inspecties
```sql
CREATE TABLE MatInspecties (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Productnummer NVARCHAR(50),
    MatType NVARCHAR(100),
    Afdeling NVARCHAR(100),
    Ligplaats NVARCHAR(50),
    Aantal INT,
    Aanwezig BIT,
    SchoonOnbeschadigd BIT,
    VuilgraadLabel NVARCHAR(50),
    Opmerking NVARCHAR(500),
    InspectieId NVARCHAR(50),
    FOREIGN KEY (InspectieId) REFERENCES Inspecties(Id)
);
```

### Wisser Inspecties
```sql
CREATE TABLE WisserInspecties (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TypeWisser NVARCHAR(100),
    AantalAanwezig INT,
    Opmerking NVARCHAR(500),
    InspectieId NVARCHAR(50),
    FOREIGN KEY (InspectieId) REFERENCES Inspecties(Id)
);
```

### Todo Items
```sql
CREATE TABLE TodoItems (
    Id NVARCHAR(50) PRIMARY KEY,
    Text NVARCHAR(500) NOT NULL,
    Done BIT DEFAULT 0,
    Type NVARCHAR(50),
    InspectieId NVARCHAR(50),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    FOREIGN KEY (InspectieId) REFERENCES Inspecties(Id)
);
```

## 🔌 API Endpoints

### Klanten
- `GET /api/lavans/klanten` - Alle klanten ophalen
- `GET /api/lavans/klanten/{relatienummer}` - Specifieke klant ophalen
- `GET /api/lavans/klanten/{relatienummer}/abonnementen` - Abonnementen van klant
- `GET /api/lavans/klanten/{relatienummer}/contactpersonen` - Contactpersonen van klant

### Inspecties
- `GET /api/lavans/inspecties` - Alle inspecties (optioneel gefilterd op klant)
- `GET /api/lavans/inspecties/{id}` - Specifieke inspectie met details
- `POST /api/lavans/inspecties` - Nieuwe inspectie aanmaken

### Todo Items
- `PUT /api/lavans/todo/{id}` - Todo item updaten

### Rapportages
- `GET /api/lavans/rapportage/{klantRelatienummer}` - Rapportage voor klant

### Utilities
- `GET /api/lavans/leeftijd/{barcode}` - Leeftijd berekenen van product

## 💡 Business Logic

### Automatische Todo Generatie
Bij het opslaan van een inspectie worden automatisch todo items gegenereerd:

1. **Matten inspectie:**
   - Niet aanwezige matten
   - Sterk vervuilde matten
   - Logomaten ouder dan 3 jaar

2. **Wissers inspectie:**
   - Niet aanwezige wissers
   - Opmerkingen bij wissers

### Leeftijd Berekening
Berekent de leeftijd van producten op basis van barcode:
- Maand en jaar worden geëxtraheerd uit barcode
- Leeftijd wordt berekend in jaren en maanden

## 🔧 Configuratie

### Connection String
```json
{
  "ConnectionStrings": {
    "LavansDatabase": "Server=localhost;Database=LavansDB;Trusted_Connection=true;"
  }
}
```

### CORS Policy
```csharp
options.AddPolicy("AllowReactApp", policy =>
{
    policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
          .AllowAnyHeader()
          .AllowAnyMethod();
});
```

## 🚀 Deployment

### Development
```bash
dotnet run
```

### Production
```bash
dotnet publish -c Release
dotnet run --environment Production
```

## 🔍 Troubleshooting

### Database Connection
- Controleer connection string
- Zorg dat SQL Server draait
- Controleer firewall instellingen

### CORS Errors
- Controleer CORS policy in Startup.cs
- Zorg dat frontend URL correct is

### Performance
- Gebruik async methoden waar mogelijk
- Overweeg database indexes voor veel gebruikte queries
- Monitor query performance

## 📝 Voorbeelden

### Inspectie Opslaan
```javascript
const inspectieData = {
    klantRelatienummer: "K001",
    inspecteur: "Jan Jansen",
    inspectieDatum: "2024-01-15",
    inspectieTijd: "09:00",
    contactpersoonNaam: "Piet Pietersen",
    contactpersoonEmail: "piet@bedrijf.nl",
    matten: [
        {
            productnummer: "MAT001",
            matType: "Logo Mat",
            afdeling: "Receptie",
            ligplaats: "A1",
            aantal: 2,
            aanwezig: true,
            schoonOnbeschadigd: true,
            vuilgraadLabel: "Schoon",
            barcode: "1234567890123"
        }
    ],
    wissers: [
        {
            typeWisser: "Grote Wisser",
            aantalAanwezig: 1,
            opmerking: "Goede staat"
        }
    ]
};

fetch('/api/lavans/inspecties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inspectieData)
});
```

### Todo Updaten
```javascript
fetch('/api/lavans/todo/todo-123', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        done: true,
        text: "Bijgewerkte todo tekst"
    })
});
```

## 🔗 Frontend Integratie

De React frontend kan direct communiceren met deze API endpoints. Zorg dat je de juiste base URL gebruikt in je frontend configuratie.

```javascript
// In je React app
const API_BASE = 'http://localhost:5000/api/lavans';

// Voorbeeld API call
const getKlanten = async () => {
    const response = await fetch(`${API_BASE}/klanten`);
    return response.json();
};
```

Deze backend is nu volledig geïntegreerd met je bestaande Lavans database en klaar voor gebruik met de React frontend! 