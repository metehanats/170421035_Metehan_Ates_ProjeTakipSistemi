using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IssueHistoryController : ControllerBase
    {
        private readonly CrmContext _context;

        public IssueHistoryController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/IssueHistory
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IssueHistory>>> GetIssueHistories()
        {
            return await _context.IssueHistories
                .Include(h => h.User)
                .Include(h => h.Issue)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();
        }

        // GET: api/IssueHistory/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IssueHistory>> GetIssueHistory(int id)
        {
            var history = await _context.IssueHistories
                .Include(h => h.User)
                .Include(h => h.Issue)
                .FirstOrDefaultAsync(h => h.LogId == id);

            if (history == null)
                return NotFound();

            return history;
        }

        // POST: api/IssueHistory
        //[HttpPost]
        //public async Task<ActionResult<IssueHistory>> PostIssueHistory(IssueHistory history)
        //{
        //    history.CreatedAt = DateTime.UtcNow;
        //    _context.IssueHistories.Add(history);
        //    await _context.SaveChangesAsync();

        //    return CreatedAtAction(nameof(GetIssueHistory), new { id = history.LogId }, history);
        //}

        [HttpPost]
        public async Task<IActionResult> PostIssueHistory(IssueHistoryCreateDto dto)
        {
            var issueHistory = new IssueHistory
            {
                IssueId = dto.IssueId,
                UserId = dto.UserId,
                Action = dto.Action,
                CreatedAt = dto.CreatedAt ?? DateTime.UtcNow
            };

            _context.IssueHistories.Add(issueHistory);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetIssueHistory), new { id = issueHistory.LogId }, issueHistory);
        }


        // PUT: api/IssueHistory/5
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutIssueHistory(int id, IssueHistory history)
        //{
        //    if (id != history.LogId)
        //        return BadRequest();

        //    var existing = await _context.IssueHistories.FindAsync(id);
        //    if (existing == null)
        //        return NotFound();

        //    existing.Action = history.Action;
        //    existing.UserId = history.UserId;
        //    existing.IssueId = history.IssueId;
        //    existing.CreatedAt = DateTime.UtcNow;

        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

        [HttpPut("{id}")]
        public async Task<IActionResult> PutIssueHistory(int id, IssueHistoryCreateDto dto)
        {
            var existing = await _context.IssueHistories.FindAsync(id);
            if (existing == null)
                return NotFound($"ID'si {id} olan geçmiş kaydı bulunamadı.");

            existing.IssueId = dto.IssueId;
            existing.UserId = dto.UserId;
            existing.Action = dto.Action;
            existing.CreatedAt = dto.CreatedAt ?? existing.CreatedAt;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Veritabanı güncelleme hatası.");
            }

            return NoContent();
        }

        // DELETE: api/IssueHistory/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssueHistory(int id)
        {
            var history = await _context.IssueHistories.FindAsync(id);
            if (history == null)
                return NotFound();

            _context.IssueHistories.Remove(history);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
