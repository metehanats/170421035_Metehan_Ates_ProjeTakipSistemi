using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IssueSprintController : ControllerBase
    {
        private readonly CrmContext _context;

        public IssueSprintController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/IssueSprint
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IssueSprintResponseDto>>> GetIssueSprints()
        {
            var issueSprints = await _context.IssueSprints
                .Include(i => i.Issue)
                .Include(i => i.Sprint)
                .ToListAsync();

            var result = issueSprints.Select(i => new IssueSprintResponseDto
            {
                Id = i.Id,
                IssueId = i.IssueId,
                SprintId = i.SprintId,
                IssueTitle = i.Issue?.Title,
                SprintName = i.Sprint?.Name
            }).ToList();

            return Ok(result);
        }

        // GET: api/IssueSprint/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IssueSprintResponseDto>> GetIssueSprint(int id)
        {
            var issueSprint = await _context.IssueSprints
                .Include(i => i.Issue)
                .Include(i => i.Sprint)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (issueSprint == null)
                return NotFound();

            var result = new IssueSprintResponseDto
            {
                Id = issueSprint.Id,
                IssueId = issueSprint.IssueId,
                SprintId = issueSprint.SprintId,
                IssueTitle = issueSprint.Issue?.Title,
                SprintName = issueSprint.Sprint?.Name
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> PostIssueSprint(IssueSprintCreateDto dto)
        {
            // Aynı issue ve sprint için kayıt var mı kontrol et
            var existingRecord = await _context.IssueSprints
                .FirstOrDefaultAsync(i => i.IssueId == dto.IssueId && i.SprintId == dto.SprintId);

            if (existingRecord != null)
            {
                return BadRequest("Bu görev zaten bu sprint'e eklenmiş.");
            }

            var issueSprint = new IssueSprint
            {
                SprintId = dto.SprintId,
                IssueId = dto.IssueId
            };

            _context.IssueSprints.Add(issueSprint);
            await _context.SaveChangesAsync();

            var result = new IssueSprintResponseDto
            {
                Id = issueSprint.Id,
                IssueId = issueSprint.IssueId,
                SprintId = issueSprint.SprintId
            };

            return CreatedAtAction(nameof(GetIssueSprint), new { id = issueSprint.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutIssueSprint(int id, IssueSprintCreateDto dto)
        {
            var existing = await _context.IssueSprints.FindAsync(id);
            if (existing == null)
                return NotFound($"ID'si {id} olan kayıt bulunamadı.");

            // Aynı issue ve sprint için başka kayıt var mı kontrol et
            var duplicateRecord = await _context.IssueSprints
                .FirstOrDefaultAsync(i => i.Id != id && i.IssueId == dto.IssueId && i.SprintId == dto.SprintId);

            if (duplicateRecord != null)
            {
                return BadRequest("Bu görev zaten bu sprint'e eklenmiş.");
            }

            existing.SprintId = dto.SprintId;
            existing.IssueId = dto.IssueId;

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

        // DELETE: api/IssueSprint/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssueSprint(int id)
        {
            var issueSprint = await _context.IssueSprints.FindAsync(id);
            if (issueSprint == null)
                return NotFound();

            _context.IssueSprints.Remove(issueSprint);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

//namespace CRM.API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class IssueSprintController : ControllerBase
//    {
//        private readonly CrmContext _context;

//        public IssueSprintController(CrmContext context)
//        {
//            _context = context;
//        }

//        // GET: api/IssueSprint
//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<IssueSprint>>> GetIssueSprints()
//        {
//            return await _context.IssueSprints
//                .Include(i => i.Issue)
//                .Include(i => i.Sprint)
//                .ToListAsync();
//        }

//        // GET: api/IssueSprint/5
//        [HttpGet("{id}")]
//        public async Task<ActionResult<IssueSprint>> GetIssueSprint(int id)
//        {
//            var issueSprint = await _context.IssueSprints
//                .Include(i => i.Issue)
//                .Include(i => i.Sprint)
//                .FirstOrDefaultAsync(i => i.Id == id);

//            if (issueSprint == null)
//                return NotFound();

//            return issueSprint;
//        }

//        // POST: api/IssueSprint
//        //[HttpPost]
//        //public async Task<ActionResult<IssueSprint>> PostIssueSprint(IssueSprint issueSprint)
//        //{
//        //    _context.IssueSprints.Add(issueSprint);
//        //    await _context.SaveChangesAsync();

//        //    return CreatedAtAction(nameof(GetIssueSprint), new { id = issueSprint.Id }, issueSprint);
//        //}

//        [HttpPost]
//        public async Task<IActionResult> PostIssueSprint(IssueSprintCreateDto dto)
//        {
//            var issueSprint = new IssueSprint
//            {
//                SprintId = dto.SprintId,
//                IssueId = dto.IssueId
//            };

//            _context.IssueSprints.Add(issueSprint);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetIssueSprint), new { id = issueSprint.Id }, issueSprint);
//        }

//        // PUT: api/IssueSprint/5
//        //[HttpPut("{id}")]
//        //public async Task<IActionResult> PutIssueSprint(int id, IssueSprint issueSprint)
//        //{
//        //    if (id != issueSprint.Id)
//        //        return BadRequest();

//        //    var existing = await _context.IssueSprints.FindAsync(id);
//        //    if (existing == null)
//        //        return NotFound();

//        //    existing.IssueId = issueSprint.IssueId;
//        //    existing.SprintId = issueSprint.SprintId;

//        //    await _context.SaveChangesAsync();

//        //    return NoContent();
//        //}

//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutIssueSprint(int id, IssueSprintCreateDto dto)
//        {
//            var existing = await _context.IssueSprints.FindAsync(id);
//            if (existing == null)
//                return NotFound($"ID'si {id} olan kayıt bulunamadı.");

//            existing.SprintId = dto.SprintId;
//            existing.IssueId = dto.IssueId;

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

//        // DELETE: api/IssueSprint/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteIssueSprint(int id)
//        {
//            var issueSprint = await _context.IssueSprints.FindAsync(id);
//            if (issueSprint == null)
//                return NotFound();

//            _context.IssueSprints.Remove(issueSprint);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }
//    }
//}
