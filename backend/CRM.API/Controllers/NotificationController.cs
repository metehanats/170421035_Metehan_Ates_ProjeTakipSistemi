using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly CrmContext _context;

        public NotificationController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/Notification
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications()
        {
            return await _context.Notifications
                                 .Include(n => n.User)
                                 .OrderByDescending(n => n.CreatedAt)
                                 .ToListAsync();
        }

        // GET: api/Notification/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Notification>> GetNotification(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null)
                return NotFound();

            return notification;
        }

        // POST: api/Notification
        //[HttpPost]
        //public async Task<ActionResult<Notification>> PostNotification(Notification notification)
        //{
        //    notification.CreatedAt = DateTime.UtcNow;
        //    notification.IsRead = false;

        //    _context.Notifications.Add(notification);
        //    await _context.SaveChangesAsync();

        //    return CreatedAtAction(nameof(GetNotification), new { id = notification.NotificationId }, notification);
        //}

        [HttpPost]
        public async Task<ActionResult<Notification>> PostNotification(NotificationCreateDto dto)
        {
            var notification = new Notification
            {
                UserId = dto.UserId,
                Message = dto.Message,
                IsRead = dto.IsRead,
                CreatedAt = dto.CreatedAt ?? DateTime.UtcNow // Eğer CreatedAt null ise şu anki zaman atanır
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNotification), new { id = notification.NotificationId }, notification);
        }

        //// PUT: api/Notification/5
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutNotification(int id, Notification notification)
        //{
        //    if (id != notification.NotificationId)
        //        return BadRequest();

        //    var existing = await _context.Notifications.FindAsync(id);
        //    if (existing == null)
        //        return NotFound();

        //    existing.Message = notification.Message;
        //    existing.IsRead = notification.IsRead;
        //    existing.CreatedAt = notification.CreatedAt ?? existing.CreatedAt;

        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

        [HttpPut("{id}")]
        public async Task<IActionResult> PutNotification(int id, NotificationCreateDto dto)
        {
            var existingNotification = await _context.Notifications.FindAsync(id);
            if (existingNotification == null)
                return NotFound($"ID'si {id} olan bildirim bulunamadı.");

            existingNotification.Message = dto.Message;
            existingNotification.IsRead = dto.IsRead;
            existingNotification.CreatedAt = dto.CreatedAt ?? existingNotification.CreatedAt;

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

       

        // DELETE: api/Notification/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return NotFound();

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
