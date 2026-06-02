using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketingSystem.Data;
using TicketingSystem.Models;

namespace TicketingSystem.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CauseController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CauseController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/cause
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Causa>>> GetCause()
    {
        return await _context.Cause
            .Include(c => c.MacroCausa)
            .Where(c => c.Attivo)
            .OrderBy(c => c.MacroCausa.Nome)
            .ThenBy(c => c.Nome)
            .ToListAsync();
    }

    // GET: api/cause/bymacrocausa/5
    [HttpGet("bymacrocausa/{macroCausaId}")]
    public async Task<ActionResult<IEnumerable<Causa>>> GetCauseByMacroCausa(int macroCausaId)
    {
        return await _context.Cause
            .Where(c => c.MacroCausaId == macroCausaId && c.Attivo)
            .OrderBy(c => c.Nome)
            .ToListAsync();
    }

    // GET: api/cause/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Causa>> GetCausa(int id)
    {
        var causa = await _context.Cause
            .Include(c => c.MacroCausa)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (causa == null)
        {
            return NotFound();
        }

        return causa;
    }

    // POST: api/cause
    [HttpPost]
    public async Task<ActionResult<Causa>> CreateCausa(Causa causa)
    {
        _context.Cause.Add(causa);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCausa), new { id = causa.Id }, causa);
    }

    // PUT: api/cause/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCausa(int id, Causa causa)
    {
        if (id != causa.Id)
        {
            return BadRequest();
        }

        _context.Entry(causa).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CausaExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/cause/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCausa(int id)
    {
        var causa = await _context.Cause.FindAsync(id);
        if (causa == null)
        {
            return NotFound();
        }

        _context.Cause.Remove(causa);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CausaExists(int id)
    {
        return _context.Cause.Any(e => e.Id == id);
    }
}
