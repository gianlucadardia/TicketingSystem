using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketingSystem.Data;
using TicketingSystem.Models;

namespace TicketingSystem.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CompetenzeController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CompetenzeController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/competenze
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Competenza>>> GetCompetenze()
    {
        return await _context.Competenze
            .Where(c => c.Attivo)
            .OrderBy(c => c.Nome)
            .ToListAsync();
    }

    // GET: api/competenze/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Competenza>> GetCompetenza(int id)
    {
        var competenza = await _context.Competenze.FindAsync(id);

        if (competenza == null)
        {
            return NotFound();
        }

        return competenza;
    }

    // POST: api/competenze
    [HttpPost]
    public async Task<ActionResult<Competenza>> CreateCompetenza(Competenza competenza)
    {
        _context.Competenze.Add(competenza);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCompetenza), new { id = competenza.Id }, competenza);
    }

    // PUT: api/competenze/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCompetenza(int id, Competenza competenza)
    {
        if (id != competenza.Id)
        {
            return BadRequest();
        }

        _context.Entry(competenza).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CompetenzaExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/competenze/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCompetenza(int id)
    {
        var competenza = await _context.Competenze.FindAsync(id);
        if (competenza == null)
        {
            return NotFound();
        }

        _context.Competenze.Remove(competenza);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CompetenzaExists(int id)
    {
        return _context.Competenze.Any(e => e.Id == id);
    }
}
