using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketingSystem.Data;
using TicketingSystem.Models;

namespace TicketingSystem.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CommentiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CommentiController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/commenti/ticket/5
    [HttpGet("ticket/{ticketId}")]
    public async Task<ActionResult<IEnumerable<Commento>>> GetCommentiByTicket(int ticketId)
    {
        return await _context.Commenti
            .Where(c => c.TicketId == ticketId)
            .OrderByDescending(c => c.CreatoIl)
            .ToListAsync();
    }

    // GET: api/commenti/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Commento>> GetCommento(int id)
    {
        var commento = await _context.Commenti.FindAsync(id);

        if (commento == null)
        {
            return NotFound();
        }

        return commento;
    }

    // POST: api/commenti
    [HttpPost]
    public async Task<ActionResult<Commento>> CreateCommento(Commento commento)
    {
        // Set autore from authenticated user
        var userName = User.Identity?.Name ?? "System";
        commento.Autore = userName;
        commento.CreatoIl = DateTime.UtcNow;

        _context.Commenti.Add(commento);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCommento), new { id = commento.Id }, commento);
    }

    // PUT: api/commenti/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCommento(int id, Commento commento)
    {
        if (id != commento.Id)
        {
            return BadRequest();
        }

        commento.ModificatoIl = DateTime.UtcNow;
        _context.Entry(commento).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CommentoExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/commenti/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCommento(int id)
    {
        var commento = await _context.Commenti.FindAsync(id);
        if (commento == null)
        {
            return NotFound();
        }

        _context.Commenti.Remove(commento);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CommentoExists(int id)
    {
        return _context.Commenti.Any(e => e.Id == id);
    }
}
