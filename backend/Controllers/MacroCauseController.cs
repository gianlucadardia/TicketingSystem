using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketingSystem.Data;
using TicketingSystem.Models;

namespace TicketingSystem.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MacroCauseController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MacroCauseController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/macrocause
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MacroCausa>>> GetMacroCause()
    {
        return await _context.MacroCause
            .Where(m => m.Attivo)
            .OrderBy(m => m.Nome)
            .ToListAsync();
    }

    // GET: api/macrocause/5
    [HttpGet("{id}")]
    public async Task<ActionResult<MacroCausa>> GetMacroCausa(int id)
    {
        var macroCausa = await _context.MacroCause
            .Include(m => m.Cause)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (macroCausa == null)
        {
            return NotFound();
        }

        return macroCausa;
    }

    // POST: api/macrocause
    [HttpPost]
    public async Task<ActionResult<MacroCausa>> CreateMacroCausa(MacroCausa macroCausa)
    {
        _context.MacroCause.Add(macroCausa);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMacroCausa), new { id = macroCausa.Id }, macroCausa);
    }

    // PUT: api/macrocause/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMacroCausa(int id, MacroCausa macroCausa)
    {
        if (id != macroCausa.Id)
        {
            return BadRequest();
        }

        _context.Entry(macroCausa).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!MacroCausaExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/macrocause/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMacroCausa(int id)
    {
        var macroCausa = await _context.MacroCause.FindAsync(id);
        if (macroCausa == null)
        {
            return NotFound();
        }

        _context.MacroCause.Remove(macroCausa);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool MacroCausaExists(int id)
    {
        return _context.MacroCause.Any(e => e.Id == id);
    }
}
