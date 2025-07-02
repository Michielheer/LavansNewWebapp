using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace LavansBackendTest.Data
{
    // Database Context
    public class LavansDbContext : DbContext
    {
        public LavansDbContext(DbContextOptions<LavansDbContext> options) : base(options)
        {
        }

        public DbSet<Klant> Klanten { get; set; }
        public DbSet<Abonnement> Abonnementen { get; set; }
        public DbSet<Contactpersoon> Contactpersonen { get; set; }
        public DbSet<Inspectie> Inspecties { get; set; }
        public DbSet<MatInspectie> MatInspecties { get; set; }
        public DbSet<WisserInspectie> WisserInspecties { get; set; }
        public DbSet<TodoItem> TodoItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Klant configuratie
            modelBuilder.Entity<Klant>(entity =>
            {
                entity.HasKey(e => e.Relatienummer);
                entity.Property(e => e.Relatienummer).HasMaxLength(20);
                entity.Property(e => e.Naam).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Adres).HasMaxLength(200);
                entity.Property(e => e.Postcode).HasMaxLength(10);
                entity.Property(e => e.Plaats).HasMaxLength(100);
                
                // Index voor snelle zoekopdrachten
                entity.HasIndex(e => e.Naam);
            });

            // Abonnement configuratie
            modelBuilder.Entity<Abonnement>(entity =>
            {
                entity.HasKey(e => new { e.KlantRelatienummer, e.Productnummer });
                entity.Property(e => e.Productnummer).HasMaxLength(20);
                entity.Property(e => e.Productomschrijving).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Activiteit).HasMaxLength(50);
                entity.Property(e => e.Afdeling).HasMaxLength(100);
                entity.Property(e => e.Ligplaats).HasMaxLength(100);
                entity.Property(e => e.Barcode).HasMaxLength(50);
                
                // Foreign key relatie
                entity.HasOne<Klant>()
                    .WithMany()
                    .HasForeignKey(e => e.KlantRelatienummer)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Contactpersoon configuratie
            modelBuilder.Entity<Contactpersoon>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Voornaam).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Tussenvoegsel).HasMaxLength(20);
                entity.Property(e => e.Achternaam).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(200);
                entity.Property(e => e.Telefoon).HasMaxLength(20);
                entity.Property(e => e.Klantenportaal).HasMaxLength(100);
                
                // Foreign key relatie
                entity.HasOne<Klant>()
                    .WithMany()
                    .HasForeignKey(e => e.KlantRelatienummer)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Inspectie configuratie
            modelBuilder.Entity<Inspectie>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Inspecteur).IsRequired().HasMaxLength(100);
                entity.Property(e => e.InspectieTijd).HasMaxLength(10);
                entity.Property(e => e.ContactpersoonNaam).HasMaxLength(200);
                entity.Property(e => e.ContactpersoonEmail).HasMaxLength(200);
                
                // Foreign key relatie
                entity.HasOne<Klant>()
                    .WithMany()
                    .HasForeignKey(e => e.KlantRelatienummer)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Index voor snelle zoekopdrachten
                entity.HasIndex(e => e.InspectieDatum);
                entity.HasIndex(e => e.KlantRelatienummer);
            });

            // MatInspectie configuratie
            modelBuilder.Entity<MatInspectie>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Productnummer).HasMaxLength(20);
                entity.Property(e => e.MatType).HasMaxLength(100);
                entity.Property(e => e.Afdeling).HasMaxLength(100);
                entity.Property(e => e.Ligplaats).HasMaxLength(100);
                entity.Property(e => e.VuilgraadLabel).HasMaxLength(50);
                entity.Property(e => e.Barcode).HasMaxLength(50);
                entity.Property(e => e.Opmerking).HasMaxLength(500);
                
                // Foreign key relatie
                entity.HasOne<Inspectie>()
                    .WithMany(i => i.Matten)
                    .HasForeignKey(e => e.InspectieId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // WisserInspectie configuratie
            modelBuilder.Entity<WisserInspectie>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.TypeWisser).HasMaxLength(100);
                entity.Property(e => e.Opmerking).HasMaxLength(500);
                
                // Foreign key relatie
                entity.HasOne<Inspectie>()
                    .WithMany(i => i.Wissers)
                    .HasForeignKey(e => e.InspectieId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // TodoItem configuratie
            modelBuilder.Entity<TodoItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Text).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Type).HasMaxLength(20);
                
                // Foreign key relatie
                entity.HasOne<Inspectie>()
                    .WithMany(i => i.TodoList)
                    .HasForeignKey(e => e.InspectieId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }

    // Data Models met Annotations
    [Table("Klanten")]
    public class Klant
    {
        [Key]
        [StringLength(20)]
        public string Relatienummer { get; set; }

        [Required]
        [StringLength(200)]
        public string Naam { get; set; }

        [StringLength(200)]
        public string Adres { get; set; }

        [StringLength(10)]
        public string Postcode { get; set; }

        [StringLength(100)]
        public string Plaats { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        public virtual ICollection<Abonnement> Abonnementen { get; set; } = new List<Abonnement>();
        public virtual ICollection<Contactpersoon> Contactpersonen { get; set; } = new List<Contactpersoon>();
        public virtual ICollection<Inspectie> Inspecties { get; set; } = new List<Inspectie>();
    }

    [Table("Abonnementen")]
    public class Abonnement
    {
        [Key]
        [StringLength(20)]
        public string Productnummer { get; set; }

        [Required]
        [StringLength(200)]
        public string Productomschrijving { get; set; }

        [StringLength(50)]
        public string Activiteit { get; set; }

        [StringLength(100)]
        public string Afdeling { get; set; }

        [StringLength(100)]
        public string Ligplaats { get; set; }

        public int Aantal { get; set; }

        [StringLength(50)]
        public string Barcode { get; set; }

        [Required]
        [StringLength(20)]
        public string KlantRelatienummer { get; set; }

        // Navigation property
        public virtual Klant Klant { get; set; }
    }

    [Table("Contactpersonen")]
    public class Contactpersoon
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Voornaam { get; set; }

        [StringLength(20)]
        public string Tussenvoegsel { get; set; }

        [Required]
        [StringLength(100)]
        public string Achternaam { get; set; }

        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; }

        [StringLength(20)]
        public string Telefoon { get; set; }

        [StringLength(100)]
        public string Klantenportaal { get; set; }

        public bool NogInDienst { get; set; } = true;

        public bool Routecontact { get; set; }

        [Required]
        [StringLength(20)]
        public string KlantRelatienummer { get; set; }

        // Navigation property
        public virtual Klant Klant { get; set; }

        // Computed property
        [NotMapped]
        public string VolledigeNaam => $"{Voornaam} {Tussenvoegsel} {Achternaam}".Trim();
    }

    [Table("Inspecties")]
    public class Inspectie
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(20)]
        public string KlantRelatienummer { get; set; }

        [Required]
        [StringLength(100)]
        public string Inspecteur { get; set; }

        public DateTime InspectieDatum { get; set; }

        [StringLength(10)]
        public string InspectieTijd { get; set; }

        [StringLength(200)]
        public string ContactpersoonNaam { get; set; }

        [EmailAddress]
        [StringLength(200)]
        public string ContactpersoonEmail { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        public virtual Klant Klant { get; set; }
        public virtual ICollection<MatInspectie> Matten { get; set; } = new List<MatInspectie>();
        public virtual ICollection<WisserInspectie> Wissers { get; set; } = new List<WisserInspectie>();
        public virtual ICollection<TodoItem> TodoList { get; set; } = new List<TodoItem>();
    }

    [Table("MatInspecties")]
    public class MatInspectie
    {
        [Key]
        public int Id { get; set; }

        [StringLength(20)]
        public string Productnummer { get; set; }

        [StringLength(100)]
        public string MatType { get; set; }

        [StringLength(100)]
        public string Afdeling { get; set; }

        [StringLength(100)]
        public string Ligplaats { get; set; }

        public int Aantal { get; set; }

        public bool Aanwezig { get; set; }

        public bool SchoonOnbeschadigd { get; set; }

        [StringLength(50)]
        public string VuilgraadLabel { get; set; }

        public int Representativiteitsscore { get; set; } = 100;

        [StringLength(50)]
        public string Barcode { get; set; }

        [StringLength(500)]
        public string Opmerking { get; set; }

        [Required]
        public string InspectieId { get; set; }

        // Navigation property
        public virtual Inspectie Inspectie { get; set; }

        // Computed property
        [NotMapped]
        public string Locatie => $"{Afdeling}, {Ligplaats}".Trim(',');
    }

    [Table("WisserInspecties")]
    public class WisserInspectie
    {
        [Key]
        public int Id { get; set; }

        [StringLength(100)]
        public string TypeWisser { get; set; }

        public int AantalAanwezig { get; set; }

        public int VuilPercentage { get; set; }

        [StringLength(500)]
        public string Opmerking { get; set; }

        [Required]
        public string InspectieId { get; set; }

        // Navigation property
        public virtual Inspectie Inspectie { get; set; }
    }

    [Table("TodoItems")]
    public class TodoItem
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(500)]
        public string Text { get; set; }

        public bool Done { get; set; }

        [StringLength(20)]
        public string Type { get; set; } // "inspectie" of "klantenservice"

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Required]
        public string InspectieId { get; set; }

        // Navigation property
        public virtual Inspectie Inspectie { get; set; }
    }

    // DTOs (Data Transfer Objects) voor API responses
    public class KlantDto
    {
        public string Relatienummer { get; set; }
        public string Naam { get; set; }
        public string Adres { get; set; }
        public string Postcode { get; set; }
        public string Plaats { get; set; }
        public DateTime CreatedAt { get; set; }
        public int AantalAbonnementen { get; set; }
        public int AantalContactpersonen { get; set; }
    }

    public class InspectieDto
    {
        public string Id { get; set; }
        public string KlantRelatienummer { get; set; }
        public string KlantNaam { get; set; }
        public string Inspecteur { get; set; }
        public DateTime InspectieDatum { get; set; }
        public string InspectieTijd { get; set; }
        public string ContactpersoonNaam { get; set; }
        public string ContactpersoonEmail { get; set; }
        public DateTime CreatedAt { get; set; }
        public int AantalMatten { get; set; }
        public int AantalWissers { get; set; }
        public int AantalTodos { get; set; }
    }

    // View Models voor specifieke use cases
    public class InspectieCreateModel
    {
        [Required]
        public string KlantRelatienummer { get; set; }

        [Required]
        public string Inspecteur { get; set; }

        [Required]
        public DateTime InspectieDatum { get; set; }

        public string InspectieTijd { get; set; }

        public string ContactpersoonNaam { get; set; }

        [EmailAddress]
        public string ContactpersoonEmail { get; set; }

        public List<MatInspectieCreateModel> Matten { get; set; } = new List<MatInspectieCreateModel>();
        public List<WisserInspectieCreateModel> Wissers { get; set; } = new List<WisserInspectieCreateModel>();
    }

    public class MatInspectieCreateModel
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

    public class WisserInspectieCreateModel
    {
        public string TypeWisser { get; set; }
        public int AantalAanwezig { get; set; }
        public int VuilPercentage { get; set; }
        public string Opmerking { get; set; }
    }
} 