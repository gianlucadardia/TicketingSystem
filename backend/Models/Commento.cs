namespace TicketingSystem.Models;

public class Commento
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public string CodiceTicket { get; set; } = string.Empty;
    public required string Testo { get; set; }
    public required string Autore { get; set; }
    public DateTime CreatoIl { get; set; } = DateTime.UtcNow;
    public DateTime? ModificatoIl { get; set; }

    // Navigation property
    public TicketAperto Ticket { get; set; } = null!;
}
