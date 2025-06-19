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
    public class IssueController : ControllerBase
    {
        private readonly CrmContext _context;

        public IssueController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/Issue
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IssueResponseDto>>> GetIssues()
        {
            var issues = await _context.Issues
                .Include(i => i.Project)
                .Include(i => i.Assignee)
                .Include(i => i.Reporter)
                .Include(i => i.Type)
                .Include(i => i.Status)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            var result = issues.Select(i => new IssueResponseDto
            {
                IssueId = i.IssueId,
                ProjectId = i.ProjectId,
                Title = i.Title,
                Description = i.Description,
                TypeId = i.TypeId,
                StatusId = i.StatusId,
                PriorityId = (int)i.PriorityId,
                AssigneeId = i.AssigneeId,
                ReporterId = i.ReporterId,
                CreatedAt = (DateTime)i.CreatedAt,
                UpdatedAt = i.UpdatedAt,
                DueDate = i.DueDate,
                ParentIssueId = i.ParentIssueId,
                StoryPoints = i.StoryPoints,
                TypeName = i.Type?.Name,
                StatusName = i.Status?.Name,
                AssigneeName = i.Assignee?.FullName,
                ReporterName = i.Reporter?.FullName,
                ProjectName = i.Project?.Name
            }).ToList();

            return Ok(result);
        }

        // GET: api/Issue/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IssueResponseDto>> GetIssue(int id)
        {
            var issue = await _context.Issues
                .Include(i => i.Project)
                .Include(i => i.Assignee)
                .Include(i => i.Reporter)
                .Include(i => i.Type)
                .Include(i => i.Status)
                .Include(i => i.Attachments)
                .Include(i => i.Comments)
                .Include(i => i.IssueHistories)
                .Include(i => i.IssueSprints)
                .Include(i => i.ParentIssue)
                .FirstOrDefaultAsync(i => i.IssueId == id);

            if (issue == null)
                return NotFound($"ID'si {id} olan görev bulunamadı.");

            var result = new IssueResponseDto
            {
                IssueId = issue.IssueId,
                ProjectId = issue.ProjectId,
                Title = issue.Title,
                Description = issue.Description,
                TypeId = issue.TypeId,
                StatusId = issue.StatusId,
                PriorityId = (int)issue.PriorityId,
                AssigneeId = issue.AssigneeId,
                ReporterId = issue.ReporterId,
                CreatedAt = (DateTime)issue.CreatedAt,
                UpdatedAt = issue.UpdatedAt,
                DueDate = issue.DueDate,
                ParentIssueId = issue.ParentIssueId,
                StoryPoints = issue.StoryPoints,
                TypeName = issue.Type?.Name,
                StatusName = issue.Status?.Name,
                AssigneeName = issue.Assignee?.FullName,
                ReporterName = issue.Reporter?.FullName,
                ProjectName = issue.Project?.Name
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<IssueResponseDto>> PostIssue(IssueCreateDto dto)
        {
            var issue = new Issue
            {
                ProjectId = dto.ProjectId,
                Title = dto.Title,
                Description = dto.Description,
                TypeId = dto.TypeId,
                StatusId = dto.StatusId,
                PriorityId = dto.PriorityId,
                AssigneeId = dto.AssigneeId,
                ReporterId = dto.ReporterId,
                DueDate = dto.DueDate,
                ParentIssueId = dto.ParentIssueId,
                StoryPoints = dto.StoryPoints,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Issues.Add(issue);
            await _context.SaveChangesAsync();

            // İlgili projenin toplam issue sayısını güncelle
            var project = await _context.Projects.FindAsync(dto.ProjectId);
            if (project != null)
            {
                project.TotalIssues += 1;
                await _context.SaveChangesAsync();
            }
            //if (project != null)
            //{
            //    project.TotalIssues = (project.TotalIssues ?? 0) + 1;
            //    await _context.SaveChangesAsync();
            //}

            var result = new IssueResponseDto
            {
                IssueId = issue.IssueId,
                ProjectId = issue.ProjectId,
                Title = issue.Title,
                Description = issue.Description,
                TypeId = issue.TypeId,
                StatusId = issue.StatusId,
                PriorityId = (int)issue.PriorityId,
                AssigneeId = issue.AssigneeId,
                ReporterId = issue.ReporterId,
                CreatedAt = (DateTime)issue.CreatedAt,
                UpdatedAt = issue.UpdatedAt,
                DueDate = issue.DueDate,
                ParentIssueId = issue.ParentIssueId,
                StoryPoints = issue.StoryPoints
            };

            return CreatedAtAction(nameof(GetIssue), new { id = issue.IssueId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutIssue(int id, IssueCreateDto updatedDto)
        {
            var existingIssue = await _context.Issues.FindAsync(id);
            if (existingIssue == null)
                return NotFound($"ID'si {id} olan görev bulunamadı.");

            // Durum değişikliği varsa ve yeni durum "done" kategorisindeyse
            bool statusChanged = existingIssue.StatusId != updatedDto.StatusId;

            // Güncelleme işlemleri
            existingIssue.ProjectId = updatedDto.ProjectId;
            existingIssue.Title = updatedDto.Title;
            existingIssue.Description = updatedDto.Description;
            existingIssue.TypeId = updatedDto.TypeId;
            existingIssue.StatusId = updatedDto.StatusId;
            existingIssue.PriorityId = updatedDto.PriorityId;
            existingIssue.AssigneeId = updatedDto.AssigneeId;
            existingIssue.ReporterId = updatedDto.ReporterId;
            existingIssue.DueDate = updatedDto.DueDate;
            existingIssue.ParentIssueId = updatedDto.ParentIssueId;
            existingIssue.StoryPoints = updatedDto.StoryPoints;
            existingIssue.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();

                //// Durum değişikliği varsa ve yeni durum "done" kategorisindeyse
                //if (statusChanged)
                //{
                //    var newStatus = await _context.IssueStatuses.FindAsync(updatedDto.StatusId);
                //    if (newStatus?.Category == "done")
                //    {
                //        var project = await _context.Projects.FindAsync(existingIssue.ProjectId);
                //        if (project != null)
                //        {
                //            project.CompletedIssues = project.CompletedIssues + 1;
                //            await _context.SaveChangesAsync();
                //        }
                //    }
                //}
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Veritabanı güncelleme hatası.");
            }

            return NoContent();
        }

        // DELETE: api/Issue/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssue(int id)
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null)
                return NotFound($"ID'si {id} olan görev bulunamadı.");

            _context.Issues.Remove(issue);

            // İlgili projenin issue sayılarını güncelle
            var project = await _context.Projects.FindAsync(issue.ProjectId);
            if (project != null)
            {
                project.TotalIssues = Math.Max(0, project.TotalIssues - 1);

                // Eğer tamamlanmış bir issue ise
                //var status = await _context.IssueStatuses.FindAsync(issue.StatusId);
                //if (status?.Category == "done")
                //{
                //    project.CompletedIssues = Math.Max(0, project.CompletedIssues - 1);
                //}

                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
    }
}


//namespace CRM.API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class IssueController : ControllerBase
//    {
//        private readonly CrmContext _context;

//        public IssueController(CrmContext context)
//        {
//            _context = context;
//        }

//        // GET: api/Issue
//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<Issue>>> GetIssues()
//        {
//            var issues = await _context.Issues
//                .Include(i => i.Project)
//                .Include(i => i.Assignee)
//                .Include(i => i.Reporter)
//                .Include(i => i.Type)
//                .Include(i => i.Status)
//                .OrderByDescending(i => i.CreatedAt)
//                .ToListAsync();

//            return Ok(issues);
//        }

//        // GET: api/Issue/5
//        [HttpGet("{id}")]
//        public async Task<ActionResult<Issue>> GetIssue(int id)
//        {
//            var issue = await _context.Issues
//                .Include(i => i.Project)
//                .Include(i => i.Assignee)
//                .Include(i => i.Reporter)
//                .Include(i => i.Type)
//                .Include(i => i.Status)
//                .Include(i => i.Attachments)
//                .Include(i => i.Comments)
//                .Include(i => i.IssueHistories)
//                .Include(i => i.IssueSprints)
//                .Include(i => i.ParentIssue)
//                .FirstOrDefaultAsync(i => i.IssueId == id);

//            if (issue == null)
//                return NotFound($"ID'si {id} olan görev bulunamadı.");

//            return Ok(issue);
//        }

//        // POST: api/Issue
//        //[HttpPost]
//        //public async Task<ActionResult<Issue>> PostIssue(Issue issue)
//        //{
//        //    issue.CreatedAt = DateTime.UtcNow;

//        //    _context.Issues.Add(issue);
//        //    await _context.SaveChangesAsync();

//        //    return CreatedAtAction(nameof(GetIssue), new { id = issue.IssueId }, issue);
//        //}
//        [HttpPost]
//        public async Task<ActionResult<Issue>> PostIssue(IssueCreateDto dto)
//        {
//            var issue = new Issue
//            {
//                ProjectId = dto.ProjectId,
//                Title = dto.Title,
//                Description = dto.Description,
//                TypeId = dto.TypeId,
//                StatusId = dto.StatusId,
//                PriorityId = dto.PriorityId,
//                AssigneeId = dto.AssigneeId,
//                ReporterId = dto.ReporterId,
//                DueDate = dto.DueDate,
//                ParentIssueId = dto.ParentIssueId,
//                CreatedAt = DateTime.UtcNow,
//                UpdatedAt = DateTime.UtcNow
//            };

//            _context.Issues.Add(issue);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetIssue), new { id = issue.IssueId }, issue);
//        }

//        // PUT: api/Issue/5
//        //[HttpPut("{id}")]
//        //public async Task<IActionResult> PutIssue(int id, Issue updatedIssue)
//        //{
//        //    if (id != updatedIssue.IssueId)
//        //        return BadRequest("ID uyuşmazlığı.");

//        //    var existingIssue = await _context.Issues.FindAsync(id);
//        //    if (existingIssue == null)
//        //        return NotFound($"ID'si {id} olan görev bulunamadı.");

//        //    existingIssue.Title = updatedIssue.Title;
//        //    existingIssue.Description = updatedIssue.Description;
//        //    existingIssue.StatusId = updatedIssue.StatusId;
//        //    existingIssue.TypeId = updatedIssue.TypeId;
//        //    existingIssue.PriorityId = updatedIssue.PriorityId;
//        //    existingIssue.AssigneeId = updatedIssue.AssigneeId;
//        //    existingIssue.ReporterId = updatedIssue.ReporterId;
//        //    existingIssue.DueDate = updatedIssue.DueDate;
//        //    existingIssue.ParentIssueId = updatedIssue.ParentIssueId;
//        //    existingIssue.UpdatedAt = DateTime.UtcNow;

//        //    try
//        //    {
//        //        await _context.SaveChangesAsync();
//        //    }
//        //    catch (DbUpdateConcurrencyException)
//        //    {
//        //        return StatusCode(500, "Veritabanı güncelleme hatası.");
//        //    }

//        //    return NoContent();
//        //}

//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutIssue(int id, IssueCreateDto updatedDto)
//        {
//            var existingIssue = await _context.Issues.FindAsync(id);
//            if (existingIssue == null)
//                return NotFound($"ID'si {id} olan görev bulunamadı.");

//            // Güncelleme işlemleri
//            existingIssue.ProjectId = updatedDto.ProjectId;
//            existingIssue.Title = updatedDto.Title;
//            existingIssue.Description = updatedDto.Description;
//            existingIssue.TypeId = updatedDto.TypeId;
//            existingIssue.StatusId = updatedDto.StatusId;
//            existingIssue.PriorityId = updatedDto.PriorityId;
//            existingIssue.AssigneeId = updatedDto.AssigneeId;
//            existingIssue.ReporterId = updatedDto.ReporterId;
//            existingIssue.DueDate = updatedDto.DueDate;
//            existingIssue.ParentIssueId = updatedDto.ParentIssueId;
//            existingIssue.UpdatedAt = DateTime.UtcNow;

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

//        // DELETE: api/Issue/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteIssue(int id)
//        {
//            var issue = await _context.Issues.FindAsync(id);
//            if (issue == null)
//                return NotFound($"ID'si {id} olan görev bulunamadı.");

//            _context.Issues.Remove(issue);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }

//    }
//}
