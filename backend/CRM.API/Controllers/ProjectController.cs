using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly CrmContext _context;

        public ProjectController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/Project
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectResponseDto>>> GetProjects()
        {
            var projects = await _context.Projects
                .Include(p => p.Owner)
                .Include(p => p.ProjectMembers)
                .Include(p => p.Issues)
                .Include(p => p.Sprints)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var result = projects.Select(static p => new ProjectResponseDto
            {
                ProjectId = p.ProjectId,
                Name = p.Name,
                Key = p.Key,
                Description = p.Description,
                OwnerId = p.OwnerId,
                CreatedAt = (DateTime)p.CreatedAt,
                IsActive = (bool)p.IsActive,
                Status = p.Status,
                Priority = p.Priority,
                CompletedIssues = p.CompletedIssues,
                TotalIssues = p.TotalIssues,
                TeamMembers = p.TeamMembers > 0 ? p.TeamMembers : p.ProjectMembers.Count,
                OwnerName = p.Owner?.FullName
            }).ToList();

            return Ok(result);
        }

        // GET: api/Project/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectResponseDto>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Owner)
                .Include(p => p.ProjectMembers)
                .Include(p => p.Issues)
                .Include(p => p.Sprints)
                .Include(p => p.CustomFields)
                .FirstOrDefaultAsync(p => p.ProjectId == id);

            if (project == null)
                return NotFound();

            var result = new ProjectResponseDto
            {
                ProjectId = project.ProjectId,
                Name = project.Name,
                Key = project.Key,
                Description = project.Description,
                OwnerId = project.OwnerId,
                CreatedAt = (DateTime)project.CreatedAt,
                IsActive = (bool)project.IsActive,
                Status = project.Status,
                Priority = project.Priority,
                CompletedIssues = project.CompletedIssues,
                TotalIssues = project.TotalIssues,
                TeamMembers = project.TeamMembers > 0 ? project.TeamMembers : project.ProjectMembers.Count,
                OwnerName = project.Owner?.FullName
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<ProjectResponseDto>> PostProject(ProjectCreateDto dto)
        {
            var project = new Project
            {
                Name = dto.Name,
                Key = dto.Key,
                Description = dto.Description,
                OwnerId = dto.OwnerId,
                CreatedAt = dto.CreatedAt ?? DateTime.UtcNow,
                IsActive = dto.IsActive ?? true,
                Status = dto.Status,
                Priority = dto.Priority,
                CompletedIssues = 0,
                TotalIssues = 0,
                TeamMembers = 1 // Başlangıçta sadece owner
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            // Proje sahibini otomatik olarak proje üyesi olarak ekle
            var projectMember = new ProjectMember
            {
                ProjectId = project.ProjectId,
                UserId = dto.OwnerId,
                RoleId = 1 // Proje Yöneticisi rolü (varsayılan olarak 1 kabul ediyoruz)
            };

            _context.ProjectMembers.Add(projectMember);
            await _context.SaveChangesAsync();

            var result = new ProjectResponseDto
            {
                ProjectId = project.ProjectId,
                Name = project.Name,
                Key = project.Key,
                Description = project.Description,
                OwnerId = project.OwnerId,
                CreatedAt = (DateTime)project.CreatedAt,
                IsActive = (bool)project.IsActive,
                Status = project.Status,
                Priority = project.Priority,
                CompletedIssues = project.CompletedIssues,
                TotalIssues = project.TotalIssues,
                TeamMembers = project.TeamMembers
            };

            return CreatedAtAction(nameof(GetProject), new { id = project.ProjectId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProject(int id, ProjectCreateDto dto)
        {
            var existingProject = await _context.Projects.FindAsync(id);
            if (existingProject == null)
                return NotFound($"ID'si {id} olan proje bulunamadı.");

            existingProject.Name = dto.Name;
            existingProject.Key = dto.Key;
            existingProject.Description = dto.Description;
            existingProject.OwnerId = dto.OwnerId;
            existingProject.CreatedAt = dto.CreatedAt ?? existingProject.CreatedAt;
            existingProject.IsActive = dto.IsActive ?? existingProject.IsActive;
            existingProject.Status = dto.Status ?? existingProject.Status;
            existingProject.Priority = dto.Priority ?? existingProject.Priority;

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

        // DELETE: api/Project/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
                return NotFound();

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

//namespace CRM.API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class ProjectController : ControllerBase
//    {
//        private readonly CrmContext _context;

//        public ProjectController(CrmContext context)
//        {
//            _context = context;
//        }

//        // GET: api/Project
//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
//        {
//            return await _context.Projects
//                .Include(p => p.Owner)
//                .Include(p => p.ProjectMembers)
//                .Include(p => p.Issues)
//                .Include(p => p.Sprints)
//                .OrderByDescending(p => p.CreatedAt)
//                .ToListAsync();
//        }

//        // GET: api/Project/5
//        [HttpGet("{id}")]
//        public async Task<ActionResult<Project>> GetProject(int id)
//        {
//            var project = await _context.Projects
//                .Include(p => p.Owner)
//                .Include(p => p.ProjectMembers)
//                .Include(p => p.Issues)
//                .Include(p => p.Sprints)
//                .Include(p => p.CustomFields)
//                .FirstOrDefaultAsync(p => p.ProjectId == id);

//            if (project == null)
//                return NotFound();

//            return project;
//        }


//        // POST: api/Project
//        //[HttpPost]
//        //public async Task<ActionResult<Project>> PostProject(Project project)
//        //{
//        //    project.CreatedAt = DateTime.UtcNow;
//        //    project.IsActive = true;

//        //    _context.Projects.Add(project);
//        //    await _context.SaveChangesAsync();

//        //    return CreatedAtAction(nameof(GetProject), new { id = project.ProjectId }, project);
//        //}

//        [HttpPost]
//        public async Task<ActionResult<Project>> PostProject(ProjectCreateDto dto)
//        {
//            var project = new Project
//            {
//                Name = dto.Name,
//                Key = dto.Key,
//                Description = dto.Description,
//                OwnerId = dto.OwnerId,
//                CreatedAt = dto.CreatedAt ?? DateTime.UtcNow,
//                IsActive = dto.IsActive ?? true
//            };

//            _context.Projects.Add(project);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetProject), new { id = project.ProjectId }, project);
//        }

//        // PUT: api/Project/5
//        //[HttpPut("{id}")]
//        //public async Task<IActionResult> PutProject(int id, Project project)
//        //{
//        //    if (id != project.ProjectId)
//        //        return BadRequest();

//        //    var existing = await _context.Projects.FindAsync(id);
//        //    if (existing == null)
//        //        return NotFound();

//        //    existing.Name = project.Name;
//        //    existing.Key = project.Key;
//        //    existing.Description = project.Description;
//        //    existing.OwnerId = project.OwnerId;
//        //    existing.IsActive = project.IsActive;

//        //    await _context.SaveChangesAsync();

//        //    return NoContent();
//        //}

//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutProject(int id, ProjectCreateDto dto)
//        {
//            var existingProject = await _context.Projects.FindAsync(id);
//            if (existingProject == null)
//                return NotFound($"ID'si {id} olan proje bulunamadı.");

//            existingProject.Name = dto.Name;
//            existingProject.Key = dto.Key;
//            existingProject.Description = dto.Description;
//            existingProject.OwnerId = dto.OwnerId;
//            existingProject.CreatedAt = dto.CreatedAt ?? existingProject.CreatedAt;
//            existingProject.IsActive = dto.IsActive ?? existingProject.IsActive;

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

//        // DELETE: api/Project/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteProject(int id)
//        {
//            var project = await _context.Projects.FindAsync(id);
//            if (project == null)
//                return NotFound();

//            _context.Projects.Remove(project);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }


//    }
//}
