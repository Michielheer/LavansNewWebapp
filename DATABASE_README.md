# Lavans Service App - Lokale Database Setup

Deze app gebruikt een lokale SQLite database voor ontwikkeling en testen. Dit geeft ons volledige controle over de database structuur en maakt het makkelijk om demo data toe te voegen.

## 🗄️ Database Schema

De database bevat de volgende tabellen:

### Klanten
- **Relatienummer** (TEXT, PRIMARY KEY)
- **Naam** (TEXT, NOT NULL)
- **Adres** (TEXT)
- **Postcode** (TEXT)
- **Plaats** (TEXT)
- **Telefoon** (TEXT)
- **Email** (TEXT)
- **CreatedAt** (DATETIME)

### Abonnementen
- **Id** (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- **Productnummer** (TEXT)
- **Productomschrijving** (TEXT)
- **Activiteit** (TEXT)
- **Afdeling** (TEXT)
- **Ligplaats** (TEXT)
- **Aantal** (INTEGER)
- **Barcode** (TEXT)
- **KlantRelatienummer** (TEXT, FOREIGN KEY)

### Contactpersonen
- **Id** (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- **Voornaam** (TEXT)
- **Tussenvoegsel** (TEXT)
- **Achternaam** (TEXT)
- **Email** (TEXT)
- **Telefoon** (TEXT)
- **Klantenportaal** (TEXT)
- **NogInDienst** (BOOLEAN)
- **Routecontact** (BOOLEAN)
- **KlantRelatienummer** (TEXT, FOREIGN KEY)

### Inspecties
- **Id** (TEXT, PRIMARY KEY)
- **KlantRelatienummer** (TEXT, FOREIGN KEY)
- **Inspecteur** (TEXT)
- **InspectieDatum** (DATE)
- **InspectieTijd** (TIME)
- **ContactpersoonNaam** (TEXT)
- **ContactpersoonEmail** (TEXT)
- **AndereMatAanwezig** (TEXT)
- **AndereMatConcurrent** (TEXT)
- **AantalConcurrent** (INTEGER)
- **Feedback** (TEXT)
- **CreatedAt** (DATETIME)

### MatInspecties
- **Id** (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- **Productnummer** (TEXT)
- **MatType** (TEXT)
- **Afdeling** (TEXT)
- **Ligplaats** (TEXT)
- **Aantal** (INTEGER)
- **Aanwezig** (BOOLEAN)
- **SchoonOnbeschadigd** (BOOLEAN)
- **VuilgraadLabel** (TEXT)
- **Opmerking** (TEXT)
- **Barcode** (TEXT)
- **InspectieId** (TEXT, FOREIGN KEY)

### WisserInspecties
- **Id** (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- **TypeWisser** (TEXT)
- **AantalAanwezig** (INTEGER)
- **Opmerking** (TEXT)
- **InspectieId** (TEXT, FOREIGN KEY)

### TodoItems
- **Id** (TEXT, PRIMARY KEY)
- **Text** (TEXT, NOT NULL)
- **Done** (BOOLEAN)
- **Type** (TEXT)
- **InspectieId** (TEXT, FOREIGN KEY)
- **CreatedAt** (DATETIME)
- **UpdatedAt** (DATETIME)

## 🚀 Setup

### 1. Database Initialiseren

```bash
# Python script uitvoeren
python setup_database.py
```

Of handmatig met SQLite:

```bash
# SQLite database aanmaken
sqlite3 lavans.db < database_setup.sql
```

### 2. Database Verifiëren

```bash
# Database openen
sqlite3 lavans.db

# Tabellen bekijken
.tables

# Demo data bekijken
SELECT * FROM Klanten;
SELECT * FROM Abonnementen;
SELECT * FROM Contactpersonen;

# Database sluiten
.quit
```

### 3. C# Backend Configuratie

De connection string is al geconfigureerd in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "LavansDatabase": "Data Source=lavans.db"
  }
}
```

## 📊 Demo Data

De database wordt geïnitialiseerd met demo data:

### Klanten
- K001 - Bedrijf A BV (Amsterdam)
- K002 - Bedrijf B NV (Rotterdam)
- K003 - Bedrijf C BV (Den Haag)
- K004 - Bedrijf D NV (Utrecht)
- K005 - Bedrijf E BV (Eindhoven)

### Abonnementen
- Logo Matten en Standaard Matten
- Grote en Kleine Wissers
- Verschillende afdelingen en ligplaatsen

### Contactpersonen
- Jan Jansen (routecontact voor K001)
- Piet van der Pietersen (K001)
- Marie de Vries (routecontact voor K002)
- Klaas Bakker (routecontact voor K003)
- Anna van Bergen (K004)

### Voorbeeld Inspectie
- INS001 - Inspectie bij K001 op 15-01-2024
- Met mat inspecties en wisser inspecties
- Met gegenereerde todo items

## 🔧 Database Beheer

### Database Resetten

```bash
# Database verwijderen en opnieuw aanmaken
python setup_database.py
```

### Backup Maken

```bash
# Database backup maken
sqlite3 lavans.db ".backup lavans_backup.db"
```

### Database Restoren

```bash
# Database restoren van backup
cp lavans_backup.db lavans.db
```

## 📝 SQLite Commands

### Database Openen
```bash
sqlite3 lavans.db
```

### Tabellen Bekijken
```sql
.tables
```

### Schema Bekijken
```sql
.schema Klanten
```

### Data Bekijken
```sql
SELECT * FROM Klanten;
SELECT * FROM Inspecties;
```

### Database Sluiten
```sql
.quit
```

## 🔍 Troubleshooting

### Database Bestand Niet Gevonden
- Controleer of `setup_database.py` is uitgevoerd
- Controleer of `lavans.db` bestaat in de project root

### Permission Errors
- Controleer schrijfrechten in de project directory
- Voer script uit met admin rechten indien nodig

### SQLite Niet Geïnstalleerd
- macOS: `brew install sqlite3`
- Ubuntu: `sudo apt-get install sqlite3`
- Windows: Download van sqlite.org

## 🎯 Voordelen van Lokale Database

1. **Controle**: Volledige controle over schema en data
2. **Snelheid**: Geen netwerk latency
3. **Veiligheid**: Geen risico's voor productie data
4. **Flexibiliteit**: Makkelijk aanpassen voor ontwikkeling
5. **Demo Data**: Relevante test data beschikbaar
6. **Portabiliteit**: Database is een enkel bestand

De lokale database maakt het mogelijk om de app volledig te testen zonder afhankelijkheden van externe systemen! 