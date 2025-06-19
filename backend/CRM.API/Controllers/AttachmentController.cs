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
    public class AttachmentController : ControllerBase
    {
        private readonly CrmContext _context;

        public AttachmentController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/Attachment
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Attachment>>> GetAttachments()
        {
            var attachments = await _context.Attachments
                .Include(a => a.Issue)
                .Include(a => a.UploadedByNavigation)
                .ToListAsync();

            return Ok(attachments);
        }

        // GET: api/Attachment/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Attachment>> GetAttachment(int id)
        {
            var attachment = await _context.Attachments
                .Include(a => a.Issue)
                .Include(a => a.UploadedByNavigation)
                .FirstOrDefaultAsync(a => a.AttachmentId == id);

            if (attachment == null)
                return NotFound();

            return Ok(attachment);
        }

        // POST: api/Attachment
        [HttpPost]
        public async Task<ActionResult<Attachment>> PostAttachment(AttachmentCreateDto dto)
        {
            var attachment = new Attachment
            {
                IssueId = dto.IssueId,
                FilePath = dto.FilePath,
                FileName = dto.FileName,
                UploadedBy = dto.UploadedBy,
                UploadedAt = dto.UploadedAt ?? DateTime.UtcNow
            };

            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAttachment), new { id = attachment.AttachmentId }, attachment);
        }

       

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAttachment(int id, AttachmentCreateDto dto)
        {
            var existingAttachment = await _context.Attachments.FindAsync(id);
            if (existingAttachment == null)
                return NotFound();

            // Alanları güncelle
            existingAttachment.IssueId = dto.IssueId;
            existingAttachment.FilePath = dto.FilePath;
            existingAttachment.FileName = dto.FileName;
            existingAttachment.UploadedBy = dto.UploadedBy;
            existingAttachment.UploadedAt = dto.UploadedAt;

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

        // DELETE: api/Attachment/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAttachment(int id)
        {
            var attachment = await _context.Attachments.FindAsync(id);
            if (attachment == null)
                return NotFound();

            _context.Attachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        
        // PUT: api/Attachment/5
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutAttachment(int id, Attachment attachment)
        //{
        //    if (id != attachment.AttachmentId)
        //        return BadRequest("ID uyuşmazlığı.");

        //    var existingAttachment = await _context.Attachments.FindAsync(id);
        //    if (existingAttachment == null)
        //        return NotFound();

        //    // Gerekli alanları güncelle (istediğin gibi genişlet)
        //    existingAttachment.FileName = attachment.FileName;
        //    existingAttachment.FilePath = attachment.FilePath;
        //    existingAttachment.IssueId = attachment.IssueId;
        //    existingAttachment.UploadedBy = attachment.UploadedBy;

        //    try
        //    {
        //        await _context.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        return StatusCode(500, "Veritabanı güncelleme hatası.");
        //    }

        //    return NoContent();
        //}
    }
}
