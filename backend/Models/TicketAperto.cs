namespace TicketingSystem.Models;

public class TicketAperto
{
    public int Id { get; set; }
    public string CodiceTicket { get; set; } = string.Empty;
    public required string Titolo { get; set; }
    public string? Descrizione { get; set; }
    
    // Foreign Keys
    public int? CompetenzaId { get; set; }
    public int? MacroCausaId { get; set; }
    public int? CausaId { get; set; }
    
    // Campi stato e gestione
    public string Stato { get; set; } = "Aperto";
    public string? Priorita { get; set; }
    public DateTime DataApertura { get; set; } = DateTime.UtcNow;
    public DateTime? DataChiusura { get; set; }
    public string? AssegnatoA { get; set; }
    
    // Audit fields - nullable perché vengono settati dal controller
    public string? CreatoDa { get; set; }
    public DateTime CreatoIl { get; set; } = DateTime.UtcNow;
    public string? ModificatoDa { get; set; }
    public DateTime? ModificatoIl { get; set; }

    // Navigation properties
    public Competenza? Competenza { get; set; }
    public MacroCausa? MacroCausa { get; set; }
    public Causa? Causa { get; set; }
    public ICollection<Commento> Commenti { get; set; } = new List<Commento>();
}
