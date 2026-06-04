using Microsoft.EntityFrameworkCore;
using TicketingSystem.Models;

namespace TicketingSystem.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<TicketAperto> TicketAperti { get; set; }
    public DbSet<Competenza> Competenze { get; set; }
    public DbSet<MacroCausa> MacroCause { get; set; }
    public DbSet<Causa> Cause { get; set; }
    public DbSet<Commento> Commenti { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.HasDefaultSchema("Ticketing");
        
        // Configurazione Competenza
        modelBuilder.Entity<Competenza>(entity =>
        {
            entity.ToTable("competenza");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Descrizione).HasColumnName("descrizione").HasMaxLength(500);
            entity.Property(e => e.Attivo).HasColumnName("attivo").HasDefaultValue(true);
            entity.Property(e => e.CreatoIl).HasColumnName("creato_il").HasDefaultValueSql("GETDATE()");
            
            entity.HasIndex(e => e.Nome).IsUnique();
        });

        // Configurazione MacroCausa
        modelBuilder.Entity<MacroCausa>(entity =>
        {
            entity.ToTable("macro_causa");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Descrizione).HasColumnName("descrizione").HasMaxLength(500);
            entity.Property(e => e.Attivo).HasColumnName("attivo").HasDefaultValue(true);
            entity.Property(e => e.CreatoIl).HasColumnName("creato_il").HasDefaultValueSql("GETDATE()");
            
            entity.HasIndex(e => e.Nome).IsUnique();
        });

        // Configurazione Causa
        modelBuilder.Entity<Causa>(entity =>
        {
            entity.ToTable("causa");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.MacroCausaId).HasColumnName("macro_causa_id");
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Descrizione).HasColumnName("descrizione").HasMaxLength(500);
            entity.Property(e => e.Attivo).HasColumnName("attivo").HasDefaultValue(true);
            entity.Property(e => e.CreatoIl).HasColumnName("creato_il").HasDefaultValueSql("GETDATE()");
            
            entity.HasOne(e => e.MacroCausa)
                .WithMany(m => m.Cause)
                .HasForeignKey(e => e.MacroCausaId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasIndex(e => e.MacroCausaId).HasDatabaseName("idx_causa_macro");
            entity.HasIndex(e => new { e.MacroCausaId, e.Nome }).IsUnique();
        });

        // Configurazione TicketAperto
        modelBuilder.Entity<TicketAperto>(entity =>
        {
            entity.ToTable("ticket_aperti");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CodiceTicket).HasColumnName("codice_ticket").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Titolo).HasColumnName("titolo").HasMaxLength(200).IsRequired();
            entity.Property(e => e.Descrizione).HasColumnName("descrizione");
            entity.Property(e => e.CompetenzaId).HasColumnName("competenza_id");
            entity.Property(e => e.MacroCausaId).HasColumnName("macro_causa_id");
            entity.Property(e => e.CausaId).HasColumnName("causa_id");
            entity.Property(e => e.Stato).HasColumnName("stato").HasMaxLength(50).HasDefaultValue("Aperto");
            entity.Property(e => e.Priorita).HasColumnName("priorita").HasMaxLength(20);
            entity.Property(e => e.DataApertura).HasColumnName("data_apertura").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.DataChiusura).HasColumnName("data_chiusura");
            entity.Property(e => e.AssegnatoA).HasColumnName("assegnato_a").HasMaxLength(100);
            entity.Property(e => e.CreatoDa).HasColumnName("creato_da").HasMaxLength(100).IsRequired();
            entity.Property(e => e.CreatoIl).HasColumnName("creato_il").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.ModificatoDa).HasColumnName("modificato_da").HasMaxLength(100);
            entity.Property(e => e.ModificatoIl).HasColumnName("modificato_il");

            entity.HasOne(e => e.Competenza)
                .WithMany(c => c.Tickets)
                .HasForeignKey(e => e.CompetenzaId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.MacroCausa)
                .WithMany(m => m.Tickets)
                .HasForeignKey(e => e.MacroCausaId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Causa)
                .WithMany(c => c.Tickets)
                .HasForeignKey(e => e.CausaId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.CodiceTicket).IsUnique().HasDatabaseName("idx_ticket_codice");
            entity.HasIndex(e => e.CompetenzaId).HasDatabaseName("idx_ticket_competenza");
            entity.HasIndex(e => e.Stato).HasDatabaseName("idx_ticket_stato");
            entity.HasIndex(e => e.DataApertura).HasDatabaseName("idx_ticket_data_apertura");
        });

        // Configurazione Commento
        modelBuilder.Entity<Commento>(entity =>
        {
            entity.ToTable("commenti");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TicketId).HasColumnName("ticket_id");
            entity.Property(e => e.CodiceTicket).HasColumnName("codice_ticket").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Testo).HasColumnName("testo").IsRequired();
            entity.Property(e => e.Autore).HasColumnName("autore").HasMaxLength(100).IsRequired();
            entity.Property(e => e.CreatoIl).HasColumnName("creato_il").HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.ModificatoIl).HasColumnName("modificato_il");

            entity.HasOne(e => e.Ticket)
                .WithMany(t => t.Commenti)
                .HasForeignKey(e => e.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.TicketId).HasDatabaseName("idx_commenti_ticket");
            entity.HasIndex(e => e.CodiceTicket).HasDatabaseName("idx_commenti_codice_ticket");
            entity.HasIndex(e => e.CreatoIl).HasDatabaseName("idx_commenti_data");
        });
    }
}
