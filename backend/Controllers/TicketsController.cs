using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketingSystem.Data;
using TicketingSystem.Models;

namespace TicketingSystem.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TicketsController> _logger;

    public TicketsController(ApplicationDbContext context, ILogger<TicketsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/tickets
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketAperto>>> GetTickets()
    {
        return await _context.TicketAperti
            .Include(t => t.Competenza)
            .Include(t => t.MacroCausa)
            .Include(t => t.Causa)
            .Include(t => t.Commenti)
            .ToListAsync();
    }

    // GET: api/tickets/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TicketAperto>> GetTicket(int id)
    {
        var ticket = await _context.TicketAperti
            .Include(t => t.Competenza)
            .Include(t => t.MacroCausa)
            .Include(t => t.Causa)
            .Include(t => t.Commenti)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            return NotFound();
        }

        return ticket;
    }

    // POST: api/tickets
    [HttpPost]
    public async Task<ActionResult<TicketAperto>> CreateTicket(TicketAperto ticket)
    {
        // Set audit fields from authenticated user
        var userName = User.Identity?.Name ?? "System";
        ticket.CreatoDa = userName;
        ticket.CreatoIl = DateTime.UtcNow;

        _context.TicketAperti.Add(ticket);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
    }

    // PUT: api/tickets/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTicket(int id, TicketAperto ticket)
    {
        if (id != ticket.Id)
        {
            return BadRequest();
        }

        var existingTicket = await _context.TicketAperti.FindAsync(id);
        if (existingTicket == null)
        {
            return NotFound();
        }

        // Set audit fields
        var userName = User.Identity?.Name ?? "System";
        existingTicket.Titolo = ticket.Titolo;
        existingTicket.Descrizione = ticket.Descrizione;
        existingTicket.CompetenzaId = ticket.CompetenzaId;
        existingTicket.MacroCausaId = ticket.MacroCausaId;
        existingTicket.CausaId = ticket.CausaId;
        existingTicket.Stato = ticket.Stato;
        existingTicket.Priorita = ticket.Priorita;
        existingTicket.DataChiusura = ticket.DataChiusura;
        existingTicket.AssegnatoA = ticket.AssegnatoA;
        existingTicket.ModificatoDa = userName;
        existingTicket.ModificatoIl = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TicketExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/tickets/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        var ticket = await _context.TicketAperti.FindAsync(id);
        if (ticket == null)
        {
            return NotFound();
        }

        _context.TicketAperti.Remove(ticket);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/tickets/search?query=test
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<TicketAperto>>> SearchTickets(
        [FromQuery] string? query,
        [FromQuery] string? stato,
        [FromQuery] int? competenzaId)
    {
        var ticketsQuery = _context.TicketAperti
            .Include(t => t.Competenza)
            .Include(t => t.MacroCausa)
            .Include(t => t.Causa)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            ticketsQuery = ticketsQuery.Where(t =>
                t.Titolo.Contains(query) ||
                (t.Descrizione != null && t.Descrizione.Contains(query)));
        }

        if (!string.IsNullOrWhiteSpace(stato))
        {
            ticketsQuery = ticketsQuery.Where(t => t.Stato == stato);
        }

        if (competenzaId.HasValue)
        {
            ticketsQuery = ticketsQuery.Where(t => t.CompetenzaId == competenzaId.Value);
        }

        return await ticketsQuery.ToListAsync();
    }

    private bool TicketExists(int id)
    {
        return _context.TicketAperti.Any(e => e.Id == id);
    }
}
