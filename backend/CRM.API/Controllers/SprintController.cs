using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SprintController : ControllerBase
    {
        private readonly CrmContext _context;

        public SprintController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/Sprint
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SprintResponseDto>>> GetSprints()
        {
            var sprints = await _context.Sprints
                .Include(s => s.Project)
                .Include(s => s.IssueSprints)
                .ToListAsync();

            var result = sprints.Select(s => new SprintResponseDto
            {
                SprintId = s.SprintId,
                ProjectId = s.ProjectId,
                Name = s.Name,
                Description = s.Description,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                IsActive = (bool)s.IsActive,
                Status = s.Status,
                Goal = s.Goal,
                ProjectName = s.Project?.Name,
                IssueCount = s.IssueSprints.Count
            }).ToList();

            return Ok(result);
        }

        // GET: api/Sprint/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SprintResponseDto>> GetSprint(int id)
        {
            var sprint = await _context.Sprints
                .Include(s => s.Project)
                .Include(s => s.IssueSprints)
                .FirstOrDefaultAsync(s => s.SprintId == id);

            if (sprint == null)
                return NotFound();

            var result = new SprintResponseDto
            {
                SprintId = sprint.SprintId,
                ProjectId = sprint.ProjectId,
                Name = sprint.Name,
                Description = sprint.Description,
                StartDate = sprint.StartDate,
                EndDate = sprint.EndDate,
                IsActive = (bool)sprint.IsActive,
                Status = sprint.Status,
                Goal = sprint.Goal,
                ProjectName = sprint.Project?.Name,
                IssueCount = sprint.IssueSprints.Count
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<SprintResponseDto>> PostSprint(SprintCreateDto dto)
        {
            var sprint = new Sprint
            {
                ProjectId = dto.ProjectId,
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = dto.IsActive ?? true,
                Status = dto.Status ?? "planned",
                Goal = dto.Goal
            };

            _context.Sprints.Add(sprint);
            await _context.SaveChangesAsync();

            var result = new SprintResponseDto
            {
                SprintId = sprint.SprintId,
                ProjectId = sprint.ProjectId,
                Name = sprint.Name,
                Description = sprint.Description,
                StartDate = sprint.StartDate,
                EndDate = sprint.EndDate,
                IsActive = (bool)sprint.IsActive,
                Status = sprint.Status,
                Goal = sprint.Goal,
                IssueCount = 0
            };

            return CreatedAtAction(nameof(GetSprint), new { id = sprint.SprintId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSprint(int id, SprintCreateDto dto)
        {
            var existingSprint = await _context.Sprints.FindAsync(id);
            if (existingSprint == null)
                return NotFound($"ID'si {id} olan sprint bulunamadı.");

            existingSprint.ProjectId = dto.ProjectId;
            existingSprint.Name = dto.Name;
            existingSprint.Description = dto.Description;
            existingSprint.StartDate = dto.StartDate;
            existingSprint.EndDate = dto.EndDate;
            existingSprint.IsActive = dto.IsActive ?? existingSprint.IsActive;
            existingSprint.Status = dto.Status ?? existingSprint.Status;
            existingSprint.Goal = dto.Goal;

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

        // DELETE: api/Sprint/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSprint(int id)
        {
            var sprint = await _context.Sprints.FindAsync(id);
            if (sprint == null)
                return NotFound();

            _context.Sprints.Remove(sprint);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}


//namespace CRM.API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class SprintController : ControllerBase
//    {
//        private readonly CrmContext _context;

//        public SprintController(CrmContext context)
//        {
//            _context = context;
//        }

//        // GET: api/Sprint
//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<Sprint>>> GetSprints()
//        {
//            return await _context.Sprints
//                .Include(s => s.Project)
//                .Include(s => s.IssueSprints)
//                .ToListAsync();
//        }

//        // GET: api/Sprint/5
//        [HttpGet("{id}")]
//        public async Task<ActionResult<Sprint>> GetSprint(int id)
//        {
//            var sprint = await _context.Sprints
//                .Include(s => s.Project)
//                .Include(s => s.IssueSprints)
//                .FirstOrDefaultAsync(s => s.SprintId == id);

//            if (sprint == null)
//                return NotFound();

//            return sprint;
//        }

//        // POST: api/Sprint
//        //[HttpPost]
//        //public async Task<ActionResult<Sprint>> PostSprint(Sprint sprint)
//        //{
//        //    _context.Sprints.Add(sprint);
//        //    await _context.SaveChangesAsync();

//        //    return CreatedAtAction(nameof(GetSprint), new { id = sprint.SprintId }, sprint);
//        //}

//        [HttpPost]
//        public async Task<ActionResult<Sprint>> PostSprint(SprintCreateDto dto)
//        {
//            var sprint = new Sprint
//            {
//                ProjectId = dto.ProjectId,
//                Name = dto.Name,
//                StartDate = dto.StartDate,
//                EndDate = dto.EndDate,
//                IsActive = dto.IsActive
//            };

//            _context.Sprints.Add(sprint);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetSprint), new { id = sprint.SprintId }, sprint);
//        }


//        // PUT: api/Sprint/5
//        //[HttpPut("{id}")]
//        //public async Task<IActionResult> PutSprint(int id, Sprint sprint)
//        //{
//        //    if (id != sprint.SprintId)
//        //        return BadRequest();

//        //    var existingSprint = await _context.Sprints.FindAsync(id);
//        //    if (existingSprint == null)
//        //        return NotFound();

//        //    existingSprint.ProjectId = sprint.ProjectId;
//        //    existingSprint.Name = sprint.Name;
//        //    existingSprint.StartDate = sprint.StartDate;
//        //    existingSprint.EndDate = sprint.EndDate;
//        //    existingSprint.IsActive = sprint.IsActive;

//        //    await _context.SaveChangesAsync();

//        //    return NoContent();
//        //}

//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutSprint(int id, SprintCreateDto dto)
//        {
//            var existingSprint = await _context.Sprints.FindAsync(id);
//            if (existingSprint == null)
//                return NotFound($"ID'si {id} olan sprint bulunamadı.");

//            existingSprint.ProjectId = dto.ProjectId;
//            existingSprint.Name = dto.Name;
//            existingSprint.StartDate = dto.StartDate;
//            existingSprint.EndDate = dto.EndDate;
//            existingSprint.IsActive = dto.IsActive;

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


//        // DELETE: api/Sprint/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteSprint(int id)
//        {
//            var sprint = await _context.Sprints.FindAsync(id);
//            if (sprint == null)
//                return NotFound();

//            _context.Sprints.Remove(sprint);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }
//    }
//}
