using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectMemberController : ControllerBase
    {
        private readonly CrmContext _context;

        public ProjectMemberController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/ProjectMember
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectMember>>> GetProjectMembers()
        {
            return await _context.ProjectMembers
                .Include(pm => pm.User)
                .Include(pm => pm.Role)
                .Include(pm => pm.Project)
                .ToListAsync();
        }

        // GET: api/ProjectMember/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectMember>> GetProjectMember(int id)
        {
            var projectMember = await _context.ProjectMembers
                .Include(pm => pm.User)
                .Include(pm => pm.Role)
                .Include(pm => pm.Project)
                .FirstOrDefaultAsync(pm => pm.Id == id);

            if (projectMember == null)
                return NotFound();

            return projectMember;
        }


        // POST: api/ProjectMember
        //[HttpPost]
        //public async Task<ActionResult<ProjectMember>> PostProjectMember(ProjectMember projectMember)
        //{
        //    _context.ProjectMembers.Add(projectMember);
        //    await _context.SaveChangesAsync();

        //    return CreatedAtAction(nameof(GetProjectMember), new { id = projectMember.Id }, projectMember);
        //}

        [HttpPost]
        public async Task<ActionResult<ProjectMember>> PostProjectMember(ProjectMemberCreateDto dto)
        {
            var projectMember = new ProjectMember
            {
                ProjectId = dto.ProjectId,
                UserId = dto.UserId,
                RoleId = dto.RoleId
            };

            _context.ProjectMembers.Add(projectMember);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProjectMember), new { id = projectMember.Id }, projectMember);
        }

        // PUT: api/ProjectMember/5
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutProjectMember(int id, ProjectMember projectMember)
        //{
        //    if (id != projectMember.Id)
        //        return BadRequest();

        //    var existing = await _context.ProjectMembers.FindAsync(id);
        //    if (existing == null)
        //        return NotFound();

        //    existing.UserId = projectMember.UserId;
        //    existing.ProjectId = projectMember.ProjectId;
        //    existing.RoleId = projectMember.RoleId;

        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProjectMember(int id, ProjectMemberCreateDto dto)
        {
            var existingMember = await _context.ProjectMembers.FindAsync(id);
            if (existingMember == null)
                return NotFound($"ID'si {id} olan proje üyesi bulunamadı.");

            existingMember.ProjectId = dto.ProjectId;
            existingMember.UserId = dto.UserId;
            existingMember.RoleId = dto.RoleId;

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


        // DELETE: api/ProjectMember/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProjectMember(int id)
        {
            var member = await _context.ProjectMembers.FindAsync(id);
            if (member == null)
                return NotFound();

            _context.ProjectMembers.Remove(member);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
