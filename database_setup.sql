-- Lavans Service App Database Schema
-- SQLite database voor lokale ontwikkeling

-- Klanten tabel
CREATE TABLE IF NOT EXISTS Klanten (
    Relatienummer TEXT PRIMARY KEY,
    Naam TEXT NOT NULL,
    Adres TEXT,
    Postcode TEXT,
    Plaats TEXT,
    Telefoon TEXT,
    Email TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Abonnementen tabel (producten per klant)
CREATE TABLE IF NOT EXISTS Abonnementen (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Productnummer TEXT,
    Productomschrijving TEXT,
    Activiteit TEXT,
    Afdeling TEXT,
    Ligplaats TEXT,
    Aantal INTEGER DEFAULT 0,
    Barcode TEXT,
    KlantRelatienummer TEXT,
    FOREIGN KEY (KlantRelatienummer) REFERENCES Klanten(Relatienummer)
);

-- Contactpersonen tabel
CREATE TABLE IF NOT EXISTS Contactpersonen (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Voornaam TEXT,
    Tussenvoegsel TEXT,
    Achternaam TEXT,
    Email TEXT,
    Telefoon TEXT,
    Klantenportaal TEXT,
    NogInDienst BOOLEAN DEFAULT 1,
    Routecontact BOOLEAN DEFAULT 0,
    KlantRelatienummer TEXT,
    FOREIGN KEY (KlantRelatienummer) REFERENCES Klanten(Relatienummer)
);

-- Inspecties hoofdtabel
CREATE TABLE IF NOT EXISTS Inspecties (
    Id TEXT PRIMARY KEY,
    KlantRelatienummer TEXT,
    Inspecteur TEXT,
    InspectieDatum DATE,
    InspectieTijd TIME,
    ContactpersoonNaam TEXT,
    ContactpersoonEmail TEXT,
    AndereMatAanwezig TEXT DEFAULT 'Nee',
    AndereMatConcurrent TEXT,
    AantalConcurrent INTEGER DEFAULT 0,
    Feedback TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (KlantRelatienummer) REFERENCES Klanten(Relatienummer)
);

-- Mat inspecties tabel
CREATE TABLE IF NOT EXISTS MatInspecties (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Productnummer TEXT,
    MatType TEXT,
    Afdeling TEXT,
    Ligplaats TEXT,
    Aantal INTEGER DEFAULT 0,
    Aanwezig BOOLEAN DEFAULT 1,
    SchoonOnbeschadigd BOOLEAN DEFAULT 1,
    VuilgraadLabel TEXT DEFAULT 'Schoon',
    Opmerking TEXT,
    Barcode TEXT,
    InspectieId TEXT,
    FOREIGN KEY (InspectieId) REFERENCES Inspecties(Id)
);

-- Wisser inspecties tabel
CREATE TABLE IF NOT EXISTS WisserInspecties (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    TypeWisser TEXT,
    AantalAanwezig INTEGER DEFAULT 0,
    Opmerking TEXT,
    InspectieId TEXT,
    FOREIGN KEY (InspectieId) REFERENCES Inspecties(Id)
);

-- Todo items tabel
CREATE TABLE IF NOT EXISTS TodoItems (
    Id TEXT PRIMARY KEY,
    Text TEXT NOT NULL,
    Done BOOLEAN DEFAULT 0,
    Type TEXT DEFAULT 'inspectie',
    InspectieId TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME,
    FOREIGN KEY (InspectieId) REFERENCES Inspecties(Id)
);

-- Indexes voor performance
CREATE INDEX IF NOT EXISTS idx_klanten_relatienummer ON Klanten(Relatienummer);
CREATE INDEX IF NOT EXISTS idx_abonnementen_klant ON Abonnementen(KlantRelatienummer);
CREATE INDEX IF NOT EXISTS idx_contactpersonen_klant ON Contactpersonen(KlantRelatienummer);
CREATE INDEX IF NOT EXISTS idx_inspecties_klant ON Inspecties(KlantRelatienummer);
CREATE INDEX IF NOT EXISTS idx_inspecties_datum ON Inspecties(InspectieDatum);
CREATE INDEX IF NOT EXISTS idx_matinspecties_inspectie ON MatInspecties(InspectieId);
CREATE INDEX IF NOT EXISTS idx_wisserinspecties_inspectie ON WisserInspecties(InspectieId);
CREATE INDEX IF NOT EXISTS idx_todoitems_inspectie ON TodoItems(InspectieId);

-- Demo data voor ontwikkeling
INSERT OR IGNORE INTO Klanten (Relatienummer, Naam, Adres, Postcode, Plaats, Telefoon, Email) VALUES
('K001', 'Bedrijf A BV', 'Hoofdstraat 1', '1000 AA', 'Amsterdam', '020-1234567', 'info@bedrijfa.nl'),
('K002', 'Bedrijf B NV', 'Industrieweg 15', '2000 BB', 'Rotterdam', '010-7654321', 'contact@bedrijfb.nl'),
('K003', 'Bedrijf C BV', 'Kantoorlaan 42', '3000 CC', 'Den Haag', '070-1122334', 'info@bedrijfc.nl'),
('K004', 'Bedrijf D NV', 'Zakelijkeplein 8', '4000 DD', 'Utrecht', '030-4433221', 'contact@bedrijfd.nl'),
('K005', 'Bedrijf E BV', 'Handelsweg 123', '5000 EE', 'Eindhoven', '040-5566778', 'info@bedrijfe.nl');

INSERT OR IGNORE INTO Abonnementen (Productnummer, Productomschrijving, Activiteit, Afdeling, Ligplaats, Aantal, Barcode, KlantRelatienummer) VALUES
('MAT001', 'Logo Mat 60x90', 'Matten', 'Receptie', 'Ingang', 2, '1234567890123', 'K001'),
('MAT002', 'Standaard Mat 60x90', 'Matten', 'Receptie', 'Ingang', 1, '1234567890124', 'K001'),
('WIS001', 'Grote Wisser 75cm', 'Wissers', 'Receptie', 'Kast', 3, NULL, 'K001'),
('MAT003', 'Logo Mat 60x90', 'Matten', 'Receptie', 'Ingang', 1, '1234567890125', 'K002'),
('WIS002', 'Kleine Wisser 45cm', 'Wissers', 'Receptie', 'Kast', 2, NULL, 'K002'),
('MAT004', 'Standaard Mat 60x90', 'Matten', 'Receptie', 'Ingang', 2, '1234567890126', 'K003'),
('WIS003', 'Grote Wisser 75cm', 'Wissers', 'Receptie', 'Kast', 1, NULL, 'K003');

INSERT OR IGNORE INTO Contactpersonen (Voornaam, Tussenvoegsel, Achternaam, Email, Telefoon, Klantenportaal, NogInDienst, Routecontact, KlantRelatienummer) VALUES
('Jan', NULL, 'Jansen', 'jan@bedrijfa.nl', '06-12345678', 'jan.jansen', 1, 1, 'K001'),
('Piet', 'van der', 'Pietersen', 'piet@bedrijfa.nl', '06-87654321', 'piet.pietersen', 1, 0, 'K001'),
('Marie', NULL, 'de Vries', 'marie@bedrijfb.nl', '06-11223344', 'marie.devries', 1, 1, 'K002'),
('Klaas', NULL, 'Bakker', 'klaas@bedrijfc.nl', '06-44332211', 'klaas.bakker', 1, 1, 'K003'),
('Anna', 'van', 'Bergen', 'anna@bedrijfd.nl', '06-55667788', 'anna.bergen', 1, 0, 'K004');

-- Voorbeeld inspectie
INSERT OR IGNORE INTO Inspecties (Id, KlantRelatienummer, Inspecteur, InspectieDatum, InspectieTijd, ContactpersoonNaam, ContactpersoonEmail, AndereMatAanwezig, AndereMatConcurrent, AantalConcurrent) VALUES
('INS001', 'K001', 'Jan de Inspecteur', '2024-01-15', '09:00', 'Jan Jansen', 'jan@bedrijfa.nl', 'Nee', NULL, 0);

-- Voorbeeld mat inspecties
INSERT OR IGNORE INTO MatInspecties (Productnummer, MatType, Afdeling, Ligplaats, Aantal, Aanwezig, SchoonOnbeschadigd, VuilgraadLabel, Barcode, InspectieId) VALUES
('MAT001', 'Logo Mat 60x90', 'Receptie', 'Ingang', 2, 1, 1, 'Schoon', '1234567890123', 'INS001'),
('MAT002', 'Standaard Mat 60x90', 'Receptie', 'Ingang', 1, 1, 0, 'Vervuild', '1234567890124', 'INS001');

-- Voorbeeld wisser inspecties
INSERT OR IGNORE INTO WisserInspecties (TypeWisser, AantalAanwezig, Opmerking, InspectieId) VALUES
('Grote Wisser 75cm', 3, 'Goede staat', 'INS001');

-- Voorbeeld todo items
INSERT OR IGNORE INTO TodoItems (Id, Text, Done, Type, InspectieId) VALUES
('TODO001', 'Controleer waarom standaard mat vervuild is', 0, 'inspectie', 'INS001'),
('TODO002', 'Plan nieuwe logomat voor klant K001 (ouder dan 3 jaar)', 0, 'klantenservice', 'INS001'); 