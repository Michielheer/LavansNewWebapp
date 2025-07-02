using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace LavansBackendTest
{
    // Data Models
    public class Klant
    {
        public string Relatienummer { get; set; }
        public string Naam { get; set; }
        public string Adres { get; set; }
        public string Postcode { get; set; }
        public string Plaats { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class Abonnement
    {
        public string Productnummer { get; set; }
        public string Productomschrijving { get; set; }
        public string Activiteit { get; set; }
        public string Afdeling { get; set; }
        public string Ligplaats { get; set; }
        public int Aantal { get; set; }
        public string Barcode { get; set; }
        public string KlantRelatienummer { get; set; }
    }

    public class Contactpersoon
    {
        public string Voornaam { get; set; }
        public string Tussenvoegsel { get; set; }
        public string Achternaam { get; set; }
        public string Email { get; set; }
        public string Telefoon { get; set; }
        public string Klantenportaal { get; set; }
        public bool NogInDienst { get; set; }
        public bool Routecontact { get; set; }
        public string KlantRelatienummer { get; set; }
    }

    public class Inspectie
    {
        public string Id { get; set; }
        public string KlantRelatienummer { get; set; }
        public string Inspecteur { get; set; }
        public DateTime InspectieDatum { get; set; }
        public string InspectieTijd { get; set; }
        public string ContactpersoonNaam { get; set; }
        public string ContactpersoonEmail { get; set; }
        public List<MatInspectie> Matten { get; set; } = new List<MatInspectie>();
        public List<WisserInspectie> Wissers { get; set; } = new List<WisserInspectie>();
        public List<TodoItem> TodoList { get; set; } = new List<TodoItem>();
        public DateTime CreatedAt { get; set; }
    }

    public class MatInspectie
    {
        public string Productnummer { get; set; }
        public string MatType { get; set; }
        public string Afdeling { get; set; }
        public string Ligplaats { get; set; }
        public int Aantal { get; set; }
        public bool Aanwezig { get; set; }
        public bool SchoonOnbeschadigd { get; set; }
        public string VuilgraadLabel { get; set; }
        public int Representativiteitsscore { get; set; }
        public string Barcode { get; set; }
        public string Opmerking { get; set; }
    }

    public class WisserInspectie
    {
        public string TypeWisser { get; set; }
        public int AantalAanwezig { get; set; }
        public int VuilPercentage { get; set; }
        public string Opmerking { get; set; }
    }

    public class TodoItem
    {
        public string Id { get; set; }
        public string Text { get; set; }
        public bool Done { get; set; }
        public string Type { get; set; } // "inspectie" of "klantenservice"
        public DateTime CreatedAt { get; set; }
    }

    // Business Logic Services
    public class LavansService
    {
        private List<Klant> _klanten;
        private List<Abonnement> _abonnementen;
        private List<Contactpersoon> _contactpersonen;
        private List<Inspectie> _inspecties;

        public LavansService()
        {
            InitializeMockData();
        }

        private void InitializeMockData()
        {
            // Mock klanten
            _klanten = new List<Klant>
            {
                new Klant { Relatienummer = "1001", Naam = "Bedrijf A", Adres = "Hoofdstraat 1", Postcode = "1000 AA", Plaats = "Amsterdam", CreatedAt = DateTime.Now.AddDays(-365) },
                new Klant { Relatienummer = "1002", Naam = "Bedrijf B", Adres = "Kerkstraat 15", Postcode = "2000 BB", Plaats = "Rotterdam", CreatedAt = DateTime.Now.AddDays(-180) },
                new Klant { Relatienummer = "1003", Naam = "Bedrijf C", Adres = "Industrieweg 42", Postcode = "3000 CC", Plaats = "Den Haag", CreatedAt = DateTime.Now.AddDays(-90) }
            };

            // Mock abonnementen
            _abonnementen = new List<Abonnement>
            {
                new Abonnement { Productnummer = "00M001", Productomschrijving = "Standaard Mat", Activiteit = "matten", Afdeling = "Receptie", Ligplaats = "Ingang", Aantal = 2, Barcode = "0300522", KlantRelatienummer = "1001" },
                new Abonnement { Productnummer = "L001", Productomschrijving = "Logo Mat", Activiteit = "matten", Afdeling = "Algemeen", Ligplaats = "Algemeen", Aantal = 1, Barcode = "0300522", KlantRelatienummer = "1001" },
                new Abonnement { Productnummer = "W001", Productomschrijving = "Snelwisser 75 cm", Activiteit = "wissers", Aantal = 5, KlantRelatienummer = "1001" },
                new Abonnement { Productnummer = "00M002", Productomschrijving = "Standaard Mat", Activiteit = "matten", Afdeling = "Kantoor", Ligplaats = "Hoofdingang", Aantal = 3, KlantRelatienummer = "1002" }
            };

            // Mock contactpersonen
            _contactpersonen = new List<Contactpersoon>
            {
                new Contactpersoon { Voornaam = "Jan", Achternaam = "Jansen", Email = "jan@bedrijfa.nl", Telefoon = "020-1234567", Klantenportaal = "jan.jansen", NogInDienst = true, Routecontact = true, KlantRelatienummer = "1001" },
                new Contactpersoon { Voornaam = "Piet", Tussenvoegsel = "van", Achternaam = "Bergen", Email = "piet@bedrijfa.nl", Telefoon = "020-1234568", NogInDienst = true, Routecontact = false, KlantRelatienummer = "1001" },
                new Contactpersoon { Voornaam = "Anna", Achternaam = "Smit", Email = "anna@bedrijfb.nl", Telefoon = "020-1234569", Klantenportaal = "anna.smit", NogInDienst = true, Routecontact = true, KlantRelatienummer = "1002" }
            };

            _inspecties = new List<Inspectie>();
        }

        // API Methods
        public List<Klant> GetKlanten()
        {
            return _klanten;
        }

        public Klant GetKlant(string relatienummer)
        {
            return _klanten.FirstOrDefault(k => k.Relatienummer == relatienummer);
        }

        public List<Abonnement> GetAbonnementen(string klantRelatienummer)
        {
            return _abonnementen.Where(a => a.KlantRelatienummer == klantRelatienummer).ToList();
        }

        public List<Contactpersoon> GetContactpersonen(string klantRelatienummer)
        {
            return _contactpersonen.Where(c => c.KlantRelatienummer == klantRelatienummer).ToList();
        }

        public string BerekenLeeftijd(string barcode)
        {
            if (string.IsNullOrEmpty(barcode) || barcode.Length < 7)
                return "-";

            try
            {
                var maandDigit = barcode[4];
                var jaarDigits = barcode.Substring(5, 2);

                if (!int.TryParse(maandDigit.ToString(), out int maand) || 
                    !int.TryParse(jaarDigits, out int jaar))
                    return "Onbekend (ongeldige barcode)";

                if (maand < 1 || maand > 12)
                    return $"Onbekend (maand {maand} ongeldig)";

                var volledigJaar = 2000 + jaar;
                var productieDatum = new DateTime(volledigJaar, maand, 1);
                var vandaag = DateTime.Now;
                var leeftijdDagen = (vandaag - productieDatum).Days;
                var leeftijdMaanden = leeftijdDagen / 30;

                if (leeftijdMaanden < 0)
                    return "Onbekend (toekomstige datum)";

                if (leeftijdMaanden < 12)
                    return $"{leeftijdMaanden} maanden";
                else
                {
                    var leeftijdJaren = leeftijdMaanden / 12;
                    var resterendeMaanden = leeftijdMaanden % 12;
                    return resterendeMaanden == 0 ? $"{leeftijdJaren} jaar" : $"{leeftijdJaren} jaar en {resterendeMaanden} maanden";
                }
            }
            catch (Exception ex)
            {
                return $"Onbekend (fout: {ex.Message})";
            }
        }

        public List<TodoItem> GenereerTodoList(Inspectie inspectie)
        {
            var todoList = new List<TodoItem>();

            // Matten inspectie
            foreach (var mat in inspectie.Matten)
            {
                var matNaam = string.IsNullOrEmpty(mat.MatType) ? "Onbekend" : mat.MatType;
                var afdeling = mat.Afdeling ?? "";
                var ligplaats = mat.Ligplaats ?? "";
                var locatie = !string.IsNullOrEmpty(afdeling) || !string.IsNullOrEmpty(ligplaats) 
                    ? $" ({afdeling}, {ligplaats})" : "";

                if (!mat.Aanwezig)
                {
                    todoList.Add(new TodoItem
                    {
                        Id = Guid.NewGuid().ToString(),
                        Text = $"Controleer waarom mat '{matNaam}'{locatie} niet aanwezig is.",
                        Done = false,
                        Type = "inspectie",
                        CreatedAt = DateTime.Now
                    });
                }

                if (mat.Aantal == 0)
                {
                    todoList.Add(new TodoItem
                    {
                        Id = Guid.NewGuid().ToString(),
                        Text = $"Controleer of mat '{matNaam}'{locatie} verwijderd moet worden.",
                        Done = false,
                        Type = "inspectie",
                        CreatedAt = DateTime.Now
                    });
                }

                if (mat.VuilgraadLabel == "Sterk vervuild")
                {
                    todoList.Add(new TodoItem
                    {
                        Id = Guid.NewGuid().ToString(),
                        Text = $"Mat '{matNaam}'{locatie} vervangen of reinigen (sterk vervuild).",
                        Done = false,
                        Type = "inspectie",
                        CreatedAt = DateTime.Now
                    });
                }

                // Logomat leeftijd check
                if (!string.IsNullOrEmpty(mat.Barcode) && matNaam.ToLower().Contains("logo"))
                {
                    var leeftijdStr = BerekenLeeftijd(mat.Barcode);
                    var match = System.Text.RegularExpressions.Regex.Match(leeftijdStr, @"(\d+) jaar");
                    if (match.Success && int.Parse(match.Groups[1].Value) >= 3)
                    {
                        todoList.Add(new TodoItem
                        {
                            Id = Guid.NewGuid().ToString(),
                            Text = $"Controleer logomat '{matNaam}' (ouder dan 3 jaar)",
                            Done = false,
                            Type = "inspectie",
                            CreatedAt = DateTime.Now
                        });

                        todoList.Add(new TodoItem
                        {
                            Id = Guid.NewGuid().ToString(),
                            Text = $"Logomat ouder dan 3 jaar bij klant '{matNaam}': plan nieuwe logomat, check of logo gelijk is gebleven, geef aan dat je een nieuwe gaat bestellen.",
                            Done = false,
                            Type = "klantenservice",
                            CreatedAt = DateTime.Now
                        });
                    }
                }
            }

            // Wissers inspectie
            foreach (var wisser in inspectie.Wissers)
            {
                var wisserType = string.IsNullOrEmpty(wisser.TypeWisser) ? "Onbekend" : wisser.TypeWisser;

                if (wisser.AantalAanwezig == 0)
                {
                    todoList.Add(new TodoItem
                    {
                        Id = Guid.NewGuid().ToString(),
                        Text = $"Controleer of wisser van type '{wisserType}' verwijderd moet worden.",
                        Done = false,
                        Type = "inspectie",
                        CreatedAt = DateTime.Now
                    });
                }

                if (!string.IsNullOrEmpty(wisser.Opmerking))
                {
                    todoList.Add(new TodoItem
                    {
                        Id = Guid.NewGuid().ToString(),
                        Text = $"Controleer opmerking bij wisser van type '{wisserType}': {wisser.Opmerking}",
                        Done = false,
                        Type = "inspectie",
                        CreatedAt = DateTime.Now
                    });
                }
            }

            return todoList;
        }

        public Inspectie SaveInspectie(Inspectie inspectie)
        {
            inspectie.Id = Guid.NewGuid().ToString();
            inspectie.CreatedAt = DateTime.Now;
            inspectie.TodoList = GenereerTodoList(inspectie);
            
            _inspecties.Add(inspectie);
            return inspectie;
        }

        public List<Inspectie> GetInspecties(string klantRelatienummer = null)
        {
            if (string.IsNullOrEmpty(klantRelatienummer))
                return _inspecties;

            return _inspecties.Where(i => i.KlantRelatienummer == klantRelatienummer).ToList();
        }

        public object GetRapportage(string klantRelatienummer, DateTime startDatum, DateTime eindDatum)
        {
            var inspecties = _inspecties
                .Where(i => i.KlantRelatienummer == klantRelatienummer && 
                           i.InspectieDatum >= startDatum && 
                           i.InspectieDatum <= eindDatum)
                .ToList();

            var klant = GetKlant(klantRelatienummer);

            return new
            {
                Klant = klant,
                Periode = new { Start = startDatum, Eind = eindDatum },
                AantalInspecties = inspecties.Count,
                LaatsteInspectie = inspecties.OrderByDescending(i => i.InspectieDatum).FirstOrDefault(),
                MattenStatistieken = new
                {
                    TotaalAantal = inspecties.Sum(i => i.Matten.Count),
                    GemiddeldAanwezig = inspecties.Any() ? inspectie.Matten.Average(m => m.Aanwezig ? 1 : 0) : 0,
                    SterkVervuild = inspecties.Sum(i => i.Matten.Count(m => m.VuilgraadLabel == "Sterk vervuild"))
                },
                WissersStatistieken = new
                {
                    TotaalAantal = inspecties.Sum(i => i.Wissers.Count),
                    GemiddeldAanwezig = inspecties.Any() ? inspectie.Wissers.Average(w => w.AantalAanwezig) : 0
                }
            };
        }
    }

    // Test Program
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== Lavans Backend Test ===\n");

            var service = new LavansService();

            // Test 1: Klanten ophalen
            Console.WriteLine("1. Klanten ophalen:");
            var klanten = service.GetKlanten();
            foreach (var klant in klanten)
            {
                Console.WriteLine($"  - {klant.Relatienummer}: {klant.Naam}");
            }

            // Test 2: Abonnementen ophalen
            Console.WriteLine("\n2. Abonnementen voor klant 1001:");
            var abonnementen = service.GetAbonnementen("1001");
            foreach (var abonnement in abonnementen)
            {
                Console.WriteLine($"  - {abonnement.Productnummer}: {abonnement.Productomschrijving}");
            }

            // Test 3: Leeftijd berekenen
            Console.WriteLine("\n3. Leeftijd berekenen:");
            var barcodes = new[] { "0300522", "0300523", "0300524" };
            foreach (var barcode in barcodes)
            {
                var leeftijd = service.BerekenLeeftijd(barcode);
                Console.WriteLine($"  - Barcode {barcode}: {leeftijd}");
            }

            // Test 4: Inspectie maken
            Console.WriteLine("\n4. Inspectie maken:");
            var inspectie = new Inspectie
            {
                KlantRelatienummer = "1001",
                Inspecteur = "Jan de Inspecteur",
                InspectieDatum = DateTime.Now,
                InspectieTijd = "09:00",
                ContactpersoonNaam = "Jan Jansen",
                ContactpersoonEmail = "jan@bedrijfa.nl",
                Matten = new List<MatInspectie>
                {
                    new MatInspectie
                    {
                        Productnummer = "00M001",
                        MatType = "Standaard Mat",
                        Afdeling = "Receptie",
                        Ligplaats = "Ingang",
                        Aantal = 2,
                        Aanwezig = true,
                        SchoonOnbeschadigd = true,
                        VuilgraadLabel = "Schoon",
                        Barcode = "0300522"
                    },
                    new MatInspectie
                    {
                        Productnummer = "L001",
                        MatType = "Logo Mat",
                        Afdeling = "Algemeen",
                        Ligplaats = "Algemeen",
                        Aantal = 1,
                        Aanwezig = false,
                        SchoonOnbeschadigd = false,
                        VuilgraadLabel = "Sterk vervuild",
                        Barcode = "0300523"
                    }
                },
                Wissers = new List<WisserInspectie>
                {
                    new WisserInspectie
                    {
                        TypeWisser = "Snelwisser 75 cm",
                        AantalAanwezig = 5,
                        VuilPercentage = 20
                    }
                }
            };

            var opgeslagenInspectie = service.SaveInspectie(inspectie);
            Console.WriteLine($"  Inspectie opgeslagen met ID: {opgeslagenInspectie.Id}");
            Console.WriteLine($"  Aantal todo items gegenereerd: {opgeslagenInspectie.TodoList.Count}");

            // Test 5: Todo items tonen
            Console.WriteLine("\n5. Todo items:");
            foreach (var todo in opgeslagenInspectie.TodoList)
            {
                Console.WriteLine($"  - [{todo.Type}] {todo.Text}");
            }

            // Test 6: Rapportage
            Console.WriteLine("\n6. Rapportage:");
            var rapportage = service.GetRapportage("1001", DateTime.Now.AddDays(-30), DateTime.Now);
            var rapportageJson = JsonSerializer.Serialize(rapportage, new JsonSerializerOptions { WriteIndented = true });
            Console.WriteLine(rapportageJson);

            Console.WriteLine("\n=== Test voltooid ===");
        }
    }
} 