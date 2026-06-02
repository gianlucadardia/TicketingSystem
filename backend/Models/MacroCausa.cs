using System.Text.Json.Serialization;

namespace TicketingSystem.Models;

public class MacroCausa
{
    public int Id { get; set; }
    public required string Nome { get; set; }
    public string? Descrizione { get; set; }
    public bool Attivo { get; set; } = true;
    public DateTime CreatoIl { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [JsonIgnore]
    public ICollection<Causa> Cause { get; set; } = new List<Causa>();
    [JsonIgnore]
    public ICollection<TicketAperto> Tickets { get; set; } = new List<TicketAperto>();
}
