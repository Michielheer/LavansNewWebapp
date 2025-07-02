using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.Sqlite;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Dapper;

namespace LavansApi.Services
{
    public class LavansDatabaseService
    {
        private readonly string _connectionString;

        public LavansDatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("LavansDatabase") ?? "Data Source=lavans.db";
        }

        // Directe database queries naar lokale SQLite database
        public async Task<IEnumerable<dynamic>> GetKlantenAsync()
        {
            using var connection = new SqliteConnection(_connectionString);
            return await connection.QueryAsync(@"
                SELECT 
                    Relatienummer,
                    Naam,
                    Adres,
                    Postcode,
                    Plaats,
                    Telefoon,
                    Email,
                    CreatedAt
                FROM Klanten 
                ORDER BY Naam");
        }

        public async Task<dynamic> GetKlantAsync(string relatienummer)
        {
            using var connection = new SqliteConnection(_connectionString);
            return await connection.QueryFirstOrDefaultAsync(@"
                SELECT 
                    Relatienummer,
                    Naam,
                    Adres,
                    Postcode,
                    Plaats,
                    Telefoon,
                    Email,
                    CreatedAt
                FROM Klanten 
                WHERE Relatienummer = @Relatienummer", 
                new { Relatienummer = relatienummer });
        }

        public async Task<IEnumerable<dynamic>> GetAbonnementenAsync(string klantRelatienummer)
        {
            using var connection = new SqliteConnection(_connectionString);
            return await connection.QueryAsync(@"
                SELECT 
                    Id,
                    Productnummer,
                    Productomschrijving,
                    Activiteit,
                    Afdeling,
                    Ligplaats,
                    Aantal,
                    Barcode,
                    KlantRelatienummer
                FROM Abonnementen 
                WHERE KlantRelatienummer = @KlantRelatienummer",
                new { KlantRelatienummer = klantRelatienummer });
        }

        public async Task<IEnumerable<dynamic>> GetContactpersonenAsync(string klantRelatienummer)
        {
            using var connection = new SqliteConnection(_connectionString);
            return await connection.QueryAsync(@"
                SELECT 
                    Id,
                    Voornaam,
                    Tussenvoegsel,
                    Achternaam,
                    Email,
                    Telefoon,
                    Klantenportaal,
                    NogInDienst,
                    Routecontact,
                    KlantRelatienummer
                FROM Contactpersonen 
                WHERE KlantRelatienummer = @KlantRelatienummer AND NogInDienst = 1
                ORDER BY Voornaam, Achternaam",
                new { KlantRelatienummer = klantRelatienummer });
        }

        public async Task<IEnumerable<dynamic>> GetInspectiesAsync(string klantRelatienummer = null)
        {
            using var connection = new SqliteConnection(_connectionString);
            var sql = @"
                SELECT 
                    i.Id,
                    i.KlantRelatienummer,
                    k.Naam as KlantNaam,
                    i.Inspecteur,
                    i.InspectieDatum,
                    i.InspectieTijd,
                    i.ContactpersoonNaam,
                    i.ContactpersoonEmail,
                    i.AndereMatAanwezig,
                    i.AndereMatConcurrent,
                    i.AantalConcurrent,
                    i.Feedback,
                    i.CreatedAt
                FROM Inspecties i
                INNER JOIN Klanten k ON i.KlantRelatienummer = k.Relatienummer";

            if (!string.IsNullOrEmpty(klantRelatienummer))
            {
                sql += " WHERE i.KlantRelatienummer = @KlantRelatienummer";
                return await connection.QueryAsync(sql, new { KlantRelatienummer = klantRelatienummer });
            }

            sql += " ORDER BY i.InspectieDatum DESC";
            return await connection.QueryAsync(sql);
        }

        public async Task<dynamic> GetInspectieDetailsAsync(string inspectieId)
        {
            using var connection = new SqliteConnection(_connectionString);
            
            // Hoofdinspectie
            var inspectie = await connection.QueryFirstOrDefaultAsync(@"
                SELECT 
                    i.*,
                    k.Naam as KlantNaam
                FROM Inspecties i
                INNER JOIN Klanten k ON i.KlantRelatienummer = k.Relatienummer
                WHERE i.Id = @InspectieId",
                new { InspectieId = inspectieId });

            if (inspectie == null) return null;

            // Matten
            var matten = await connection.QueryAsync(@"
                SELECT * FROM MatInspecties 
                WHERE InspectieId = @InspectieId",
                new { InspectieId = inspectieId });

            // Wissers
            var wissers = await connection.QueryAsync(@"
                SELECT * FROM WisserInspecties 
                WHERE InspectieId = @InspectieId",
                new { InspectieId = inspectieId });

            // Todo items
            var todos = await connection.QueryAsync(@"
                SELECT * FROM TodoItems 
                WHERE InspectieId = @InspectieId
                ORDER BY CreatedAt",
                new { InspectieId = inspectieId });

            return new
            {
                Inspectie = inspectie,
                Matten = matten,
                Wissers = wissers,
                TodoItems = todos
            };
        }

        public async Task<string> SaveInspectieAsync(dynamic inspectieData)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                // Hoofdinspectie opslaan
                var inspectieId = Guid.NewGuid().ToString();
                await connection.ExecuteAsync(@"
                    INSERT INTO Inspecties (
                        Id, KlantRelatienummer, Inspecteur, InspectieDatum, 
                        InspectieTijd, ContactpersoonNaam, ContactpersoonEmail, 
                        AndereMatAanwezig, AndereMatConcurrent, AantalConcurrent, Feedback, CreatedAt
                    ) VALUES (
                        @Id, @KlantRelatienummer, @Inspecteur, @InspectieDatum,
                        @InspectieTijd, @ContactpersoonNaam, @ContactpersoonEmail,
                        @AndereMatAanwezig, @AndereMatConcurrent, @AantalConcurrent, @Feedback, @CreatedAt
                    )",
                    new
                    {
                        Id = inspectieId,
                        inspectieData.KlantRelatienummer,
                        inspectieData.Inspecteur,
                        inspectieData.InspectieDatum,
                        inspectieData.InspectieTijd,
                        inspectieData.ContactpersoonNaam,
                        inspectieData.ContactpersoonEmail,
                        inspectieData.AndereMatAanwezig,
                        inspectieData.AndereMatConcurrent,
                        inspectieData.AantalConcurrent,
                        inspectieData.Feedback,
                        CreatedAt = DateTime.Now
                    }, transaction);

                // Matten opslaan
                if (inspectieData.Matten != null)
                {
                    foreach (var mat in inspectieData.Matten)
                    {
                        await connection.ExecuteAsync(@"
                            INSERT INTO MatInspecties (
                                Productnummer, MatType, Afdeling, Ligplaats, Aantal,
                                Aanwezig, SchoonOnbeschadigd, VuilgraadLabel, 
                                Barcode, Opmerking, InspectieId
                            ) VALUES (
                                @Productnummer, @MatType, @Afdeling, @Ligplaats, @Aantal,
                                @Aanwezig, @SchoonOnbeschadigd, @VuilgraadLabel,
                                @Barcode, @Opmerking, @InspectieId
                            )",
                            new
                            {
                                mat.Productnummer,
                                mat.MatType,
                                mat.Afdeling,
                                mat.Ligplaats,
                                mat.Aantal,
                                mat.Aanwezig,
                                mat.SchoonOnbeschadigd,
                                mat.VuilgraadLabel,
                                mat.Barcode,
                                mat.Opmerking,
                                InspectieId = inspectieId
                            }, transaction);
                    }
                }

                // Wissers opslaan
                if (inspectieData.Wissers != null)
                {
                    foreach (var wisser in inspectieData.Wissers)
                    {
                        await connection.ExecuteAsync(@"
                            INSERT INTO WisserInspecties (
                                TypeWisser, AantalAanwezig, Opmerking, InspectieId
                            ) VALUES (
                                @TypeWisser, @AantalAanwezig, @Opmerking, @InspectieId
                            )",
                            new
                            {
                                wisser.TypeWisser,
                                wisser.AantalAanwezig,
                                wisser.Opmerking,
                                InspectieId = inspectieId
                            }, transaction);
                    }
                }

                // Todo items genereren en opslaan
                var todoItems = GenerateTodoItems(inspectieData);
                foreach (var todo in todoItems)
                {
                    await connection.ExecuteAsync(@"
                        INSERT INTO TodoItems (
                            Id, Text, Done, Type, CreatedAt, InspectieId
                        ) VALUES (
                            @Id, @Text, @Done, @Type, @CreatedAt, @InspectieId
                        )",
                        new
                        {
                            Id = Guid.NewGuid().ToString(),
                            todo.Text,
                            Done = false,
                            todo.Type,
                            CreatedAt = DateTime.Now,
                            InspectieId = inspectieId
                        }, transaction);
                }

                transaction.Commit();
                return inspectieId;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<object> GetRapportageAsync(string klantRelatienummer, DateTime startDatum, DateTime eindDatum)
        {
            using var connection = new SqliteConnection(_connectionString);
            
            // Klantgegevens
            var klant = await GetKlantAsync(klantRelatienummer);

            // Inspecties in periode
            var inspecties = await connection.QueryAsync(@"
                SELECT * FROM Inspecties 
                WHERE KlantRelatienummer = @KlantRelatienummer 
                AND InspectieDatum BETWEEN @StartDatum AND @EindDatum
                ORDER BY InspectieDatum DESC",
                new { KlantRelatienummer = klantRelatienummer, StartDatum = startDatum, EindDatum = eindDatum });

            // Statistieken
            var mattenStats = await connection.QueryFirstOrDefaultAsync(@"
                SELECT 
                    COUNT(*) as TotaalAantal,
                    AVG(CAST(Aanwezig as FLOAT)) as GemiddeldAanwezig,
                    COUNT(CASE WHEN VuilgraadLabel = 'Sterk vervuild' THEN 1 END) as SterkVervuild
                FROM MatInspecties mi
                INNER JOIN Inspecties i ON mi.InspectieId = i.Id
                WHERE i.KlantRelatienummer = @KlantRelatienummer 
                AND i.InspectieDatum BETWEEN @StartDatum AND @EindDatum",
                new { KlantRelatienummer = klantRelatienummer, StartDatum = startDatum, EindDatum = eindDatum });

            var wissersStats = await connection.QueryFirstOrDefaultAsync(@"
                SELECT 
                    COUNT(*) as TotaalAantal,
                    AVG(CAST(AantalAanwezig as FLOAT)) as GemiddeldAanwezig
                FROM WisserInspecties wi
                INNER JOIN Inspecties i ON wi.InspectieId = i.Id
                WHERE i.KlantRelatienummer = @KlantRelatienummer 
                AND i.InspectieDatum BETWEEN @StartDatum AND @EindDatum",
                new { KlantRelatienummer = klantRelatienummer, StartDatum = startDatum, EindDatum = eindDatum });

            return new
            {
                Klant = klant,
                Periode = new { Start = startDatum, Eind = eindDatum },
                AantalInspecties = inspecties.Count(),
                LaatsteInspectie = inspecties.FirstOrDefault(),
                MattenStatistieken = mattenStats,
                WissersStatistieken = wissersStats
            };
        }

        // Business logic functies
        private List<dynamic> GenerateTodoItems(dynamic inspectieData)
        {
            var todoItems = new List<dynamic>();

            // Matten inspectie
            if (inspectieData.Matten != null)
            {
                foreach (var mat in inspectieData.Matten)
                {
                    var matNaam = mat.MatType ?? "Onbekend";
                    var afdeling = mat.Afdeling ?? "";
                    var ligplaats = mat.Ligplaats ?? "";
                    var locatie = !string.IsNullOrEmpty(afdeling) || !string.IsNullOrEmpty(ligplaats) 
                        ? $" ({afdeling}, {ligplaats})" : "";

                    if (!mat.Aanwezig)
                    {
                        todoItems.Add(new
                        {
                            Text = $"Controleer waarom mat '{matNaam}'{locatie} niet aanwezig is.",
                            Type = "inspectie"
                        });
                    }

                    if (mat.Aantal == 0)
                    {
                        todoItems.Add(new
                        {
                            Text = $"Controleer of mat '{matNaam}'{locatie} verwijderd moet worden.",
                            Type = "inspectie"
                        });
                    }

                    if (mat.VuilgraadLabel == "Sterk vervuild")
                    {
                        todoItems.Add(new
                        {
                            Text = $"Mat '{matNaam}'{locatie} vervangen of reinigen (sterk vervuild).",
                            Type = "inspectie"
                        });
                    }

                    // Logomat leeftijd check
                    if (!string.IsNullOrEmpty(mat.Barcode) && matNaam.ToLower().Contains("logo"))
                    {
                        var leeftijdStr = BerekenLeeftijd(mat.Barcode);
                        var match = System.Text.RegularExpressions.Regex.Match(leeftijdStr, @"(\d+) jaar");
                        if (match.Success && int.Parse(match.Groups[1].Value) >= 3)
                        {
                            todoItems.Add(new
                            {
                                Text = $"Controleer logomat '{matNaam}' (ouder dan 3 jaar)",
                                Type = "inspectie"
                            });

                            todoItems.Add(new
                            {
                                Text = $"Logomat ouder dan 3 jaar bij klant '{matNaam}': plan nieuwe logomat, check of logo gelijk is gebleven, geef aan dat je een nieuwe gaat bestellen.",
                                Type = "klantenservice"
                            });
                        }
                    }
                }
            }

            // Wissers inspectie
            if (inspectieData.Wissers != null)
            {
                foreach (var wisser in inspectieData.Wissers)
                {
                    var wisserType = wisser.TypeWisser ?? "Onbekend";

                    if (wisser.AantalAanwezig == 0)
                    {
                        todoItems.Add(new
                        {
                            Text = $"Controleer of wisser van type '{wisserType}' verwijderd moet worden.",
                            Type = "inspectie"
                        });
                    }

                    if (!string.IsNullOrEmpty(wisser.Opmerking))
                    {
                        todoItems.Add(new
                        {
                            Text = $"Controleer opmerking bij wisser van type '{wisserType}': {wisser.Opmerking}",
                            Type = "inspectie"
                        });
                    }
                }
            }

            return todoItems;
        }

        public async Task<object> UpdateTodoAsync(string todoId, bool done, string text = null)
        {
            using var connection = new SqliteConnection(_connectionString);
            
            // Eerst controleren of de todo bestaat
            var existingTodo = await connection.QueryFirstOrDefaultAsync(@"
                SELECT * FROM TodoItems WHERE Id = @TodoId",
                new { TodoId = todoId });

            if (existingTodo == null)
                return null;

            // Update de todo
            var updateSql = "UPDATE TodoItems SET Done = @Done, UpdatedAt = @UpdatedAt";
            object parameters;

            if (!string.IsNullOrEmpty(text))
            {
                updateSql += ", Text = @Text";
                parameters = new { TodoId = todoId, Done = done, Text = text, UpdatedAt = DateTime.Now };
            }
            else
            {
                parameters = new { TodoId = todoId, Done = done, UpdatedAt = DateTime.Now };
            }

            updateSql += " WHERE Id = @TodoId";

            await connection.ExecuteAsync(updateSql, parameters);

            // Haal de bijgewerkte todo op en retourneer alleen de verwachte velden
            var updatedTodo = await connection.QueryFirstOrDefaultAsync(@"
                SELECT Id, Done, UpdatedAt FROM TodoItems WHERE Id = @TodoId",
                new { TodoId = todoId });

            return updatedTodo;
        }

        // Sync wrappers voor de controller
        public IEnumerable<dynamic> GetKlanten() => GetKlantenAsync().Result;
        public dynamic GetKlant(string relatienummer) => GetKlantAsync(relatienummer).Result;
        public IEnumerable<dynamic> GetAbonnementen(string klantRelatienummer) => GetAbonnementenAsync(klantRelatienummer).Result;
        public IEnumerable<dynamic> GetContactpersonen(string klantRelatienummer) => GetContactpersonenAsync(klantRelatienummer).Result;
        public IEnumerable<dynamic> GetInspecties(string klantRelatienummer = null) => GetInspectiesAsync(klantRelatienummer).Result;
        public dynamic GetInspectieDetails(string inspectieId) => GetInspectieDetailsAsync(inspectieId).Result;
        public string SaveInspectie(dynamic inspectieData) => SaveInspectieAsync(inspectieData).Result;
        public object GetRapportage(string klantRelatienummer, DateTime startDatum, DateTime eindDatum) => GetRapportageAsync(klantRelatienummer, startDatum, eindDatum).Result;
        public object UpdateTodo(string todoId, bool done, string text = null) => UpdateTodoAsync(todoId, done, text).Result;

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
    }
} 