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
    public class IssueStatusController : ControllerBase
    {
        private readonly CrmContext _context;

        public IssueStatusController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/IssueStatus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IssueStatusResponseDto>>> GetIssueStatuses()
        {
            var statuses = await _context.IssueStatuses
                .Include(s => s.Issues)
                .Include(s => s.WorkflowFromStatusNavigations)
                .Include(s => s.WorkflowToStatusNavigations)
                .OrderBy(s => s.Order)
                .ToListAsync();

            var result = statuses.Select(s => new IssueStatusResponseDto
            {
                StatusId = s.StatusId,
                Name = s.Name,
                Order = (int)s.Order,
                Description = s.Description,
                Color = s.Color
            }).ToList();

            return Ok(result);
        }

        // GET: api/IssueStatus/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IssueStatusResponseDto>> GetIssueStatus(int id)
        {
            var status = await _context.IssueStatuses
                .Include(s => s.Issues)
                .Include(s => s.WorkflowFromStatusNavigations)
                .Include(s => s.WorkflowToStatusNavigations)
                .FirstOrDefaultAsync(s => s.StatusId == id);

            if (status == null)
                return NotFound();

            var result = new IssueStatusResponseDto
            {
                StatusId = status.StatusId,
                Name = status.Name,
                Order = (int)status.Order,
                Description = status.Description,
                Color = status.Color
            };

            return Ok(result);
        }
        [HttpPost]
        public async Task<ActionResult<IssueStatus>> PostIssueStatus(IssueStatusCreateDto dto)
        {
            var status = new IssueStatus
            {
                Name = dto.Name,
                Order = dto.Order,
                Description = dto.Description,
                Color = dto.Color
            };

            _context.IssueStatuses.Add(status);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetIssueStatus), new { id = status.StatusId }, status);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutIssueStatus(int id, IssueStatusCreateDto dto)
        {
            var existing = await _context.IssueStatuses.FindAsync(id);
            if (existing == null)
                return NotFound($"ID'si {id} olan durum bulunamadı.");

            existing.Name = dto.Name;
            existing.Order = dto.Order;
            existing.Description = dto.Description;
            existing.Color = dto.Color;

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
        //[HttpPost]
        //public async Task<ActionResult<IssueStatusResponseDto>> PostIssueStatus(IssueStatusCreateDto dto)
        //{
        //    var status = new IssueStatus
        //    {
        //        Name = dto.Name,
        //        Order = dto.Order,
        //        Description = dto.Description,
        //        Color = dto.Color,
        //        Category = dto.Category
        //    };

        //    _context.IssueStatuses.Add(status);
        //    await _context.SaveChangesAsync();

        //    var result = new IssueStatusResponseDto
        //    {
        //        StatusId = status.StatusId,
        //        Name = status.Name,
        //        Order = (int)status.Order,
        //        Description = status.Description,
        //        Color = status.Color,
        //        Category = status.Category
        //    };

        //    return CreatedAtAction(nameof(GetIssueStatus), new { id = status.StatusId }, result);
        //}

        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutIssueStatus(int id, IssueStatusCreateDto dto)
        //{
        //    var existing = await _context.IssueStatuses.FindAsync(id);
        //    if (existing == null)
        //        return NotFound($"ID'si {id} olan durum bulunamadı.");

        //    existing.Name = dto.Name;
        //    existing.Order = dto.Order;
        //    existing.Description = dto.Description;
        //    existing.Color = dto.Color;
        //    existing.Category = dto.Category;

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

        // DELETE: api/IssueStatus/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssueStatus(int id)
        {
            var status = await _context.IssueStatuses.FindAsync(id);
            if (status == null)
                return NotFound();

            _context.IssueStatuses.Remove(status);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

//namespace CRM.API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class IssueStatusController : ControllerBase
//    {
//        private readonly CrmContext _context;

//        public IssueStatusController(CrmContext context)
//        {
//            _context = context;
//        }

//        // GET: api/IssueStatus
//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<IssueStatus>>> GetIssueStatuses()
//        {
//            return await _context.IssueStatuses
//                .Include(s => s.Issues)
//                .Include(s => s.WorkflowFromStatusNavigations)
//                .Include(s => s.WorkflowToStatusNavigations)
//                .OrderBy(s => s.Order)
//                .ToListAsync();
//        }

//        // GET: api/IssueStatus/5
//        [HttpGet("{id}")]
//        public async Task<ActionResult<IssueStatus>> GetIssueStatus(int id)
//        {
//            var status = await _context.IssueStatuses
//                .Include(s => s.Issues)
//                .Include(s => s.WorkflowFromStatusNavigations)
//                .Include(s => s.WorkflowToStatusNavigations)
//                .FirstOrDefaultAsync(s => s.StatusId == id);

//            if (status == null)
//                return NotFound();

//            return status;
//        }

//        // POST: api/IssueStatus
//        //[HttpPost]
//        //public async Task<ActionResult<IssueStatus>> PostIssueStatus(IssueStatus status)
//        //{
//        //    _context.IssueStatuses.Add(status);
//        //    await _context.SaveChangesAsync();

//        //    return CreatedAtAction(nameof(GetIssueStatus), new { id = status.StatusId }, status);
//        //}

//        [HttpPost]
//        public async Task<ActionResult<IssueStatus>> PostIssueStatus(IssueStatusCreateDto dto)
//        {
//            var status = new IssueStatus
//            {
//                Name = dto.Name,
//                Order = dto.Order
//            };

//            _context.IssueStatuses.Add(status);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetIssueStatus), new { id = status.StatusId }, status);
//        }

//        // PUT: api/IssueStatus/5
//        //[HttpPut("{id}")]
//        //public async Task<IActionResult> PutIssueStatus(int id, IssueStatus status)
//        //{
//        //    if (id != status.StatusId)
//        //        return BadRequest();

//        //    var existing = await _context.IssueStatuses.FindAsync(id);
//        //    if (existing == null)
//        //        return NotFound();

//        //    existing.Name = status.Name;
//        //    existing.Order = status.Order;

//        //    await _context.SaveChangesAsync();

//        //    return NoContent();
//        //}

//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutIssueStatus(int id, IssueStatusCreateDto dto)
//        {
//            var existing = await _context.IssueStatuses.FindAsync(id);
//            if (existing == null)
//                return NotFound($"ID'si {id} olan durum bulunamadı.");

//            existing.Name = dto.Name;
//            existing.Order = dto.Order;

//            try
//            {
//                await _context.SaveChangesAsync();
//            }
//            catch (DbUpdateConcurrencyException)
//            {
//                return StatusCode(500, "Veritabanı güncelleme hatası.");
//            }

//            return NoContent();
//        }

//        // DELETE: api/IssueStatus/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteIssueStatus(int id)
//        {
//            var status = await _context.IssueStatuses.FindAsync(id);
//            if (status == null)
//                return NotFound();

//            _context.IssueStatuses.Remove(status);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }
//    }
//}
