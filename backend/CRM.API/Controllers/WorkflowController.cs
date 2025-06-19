using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkflowController : ControllerBase
    {
        private readonly CrmContext _context;

        public WorkflowController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/Workflow
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkflowDetailDto>>> GetWorkflows()
        {
            var workflows = await _context.Workflows
                .Include(w => w.FromStatusNavigation)
                .Include(w => w.ToStatusNavigation)
                .Include(w => w.WorkflowIssueTypes)
                    .ThenInclude(wit => wit.IssueType)
                .ToListAsync();

            return workflows.Select(w => new WorkflowDetailDto
            {
                WorkflowId = w.WorkflowId,
                Name = w.Name,
                Description = w.Description,
                FromStatus = w.FromStatus,
                ToStatus = w.ToStatus,
                IssueTypeIds = w.WorkflowIssueTypes.Select(wit => wit.IssueTypeId).ToList(),
                FromStatusNavigation = new IssueStatusDto
                {
                    StatusId = w.FromStatusNavigation.StatusId,
                    Name = w.FromStatusNavigation.Name,
                    Color = w.FromStatusNavigation.Color
                },
                ToStatusNavigation = new IssueStatusDto
                {
                    StatusId = w.ToStatusNavigation.StatusId,
                    Name = w.ToStatusNavigation.Name,
                    Color = w.ToStatusNavigation.Color
                },
                IssueTypes = w.WorkflowIssueTypes.Select(wit => new IssueTypeDto
                {
                    TypeId = wit.IssueType.TypeId,
                    Name = wit.IssueType.Name,
                    Color = wit.IssueType.Color
                }).ToList()
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WorkflowFullDetailDto>> GetWorkflow(int id)
        {
            var workflow = await _context.Workflows
                .Include(w => w.FromStatusNavigation)
                .Include(w => w.ToStatusNavigation)
                .Include(w => w.WorkflowIssueTypes)
                    .ThenInclude(wit => wit.IssueType)
                .FirstOrDefaultAsync(w => w.WorkflowId == id);

            if (workflow == null)
                return NotFound();

            // Statüleri getirelim
            var statuses = await GetWorkflowStatuses(id);

            return new WorkflowFullDetailDto
            {
                WorkflowId = workflow.WorkflowId,
                Name = workflow.Name,
                Description = workflow.Description,
                FromStatus = workflow.FromStatus,
                ToStatus = workflow.ToStatus,
                IssueTypeIds = workflow.WorkflowIssueTypes.Select(wit => wit.IssueTypeId).ToList(),
                FromStatusNavigation = new IssueStatusDto
                {
                    StatusId = workflow.FromStatusNavigation.StatusId,
                    Name = workflow.FromStatusNavigation.Name,
                    Color = workflow.FromStatusNavigation.Color
                },
                ToStatusNavigation = new IssueStatusDto
                {
                    StatusId = workflow.ToStatusNavigation.StatusId,
                    Name = workflow.ToStatusNavigation.Name,
                    Color = workflow.ToStatusNavigation.Color
                },
                IssueTypes = workflow.WorkflowIssueTypes.Select(wit => new IssueTypeDto
                {
                    TypeId = wit.IssueType.TypeId,
                    Name = wit.IssueType.Name,
                    Color = wit.IssueType.Color
                }).ToList(),
                OrderedStatuses = statuses.Value
            };
        }



        [HttpGet("{id}/statuses")]
        public async Task<ActionResult<List<WorkflowStatusDto>>> GetWorkflowStatuses(int id)
        {
            var workflow = await _context.Workflows
                .Include(w => w.FromStatusNavigation)
                .Include(w => w.ToStatusNavigation)
                .FirstOrDefaultAsync(w => w.WorkflowId == id);

            if (workflow == null)
                return NotFound();

            // Aynı adlı tüm workflow'ları bulalım
            var relatedWorkflows = await _context.Workflows
                .Where(w => w.Name == workflow.Name)
                .Include(w => w.FromStatusNavigation)
                .Include(w => w.ToStatusNavigation)
                .ToListAsync();

            // Statü zincirini oluşturalım
            var statusChain = new Dictionary<int, int>(); // FromStatus -> ToStatus
            var allStatuses = new HashSet<int>();

            foreach (var wf in relatedWorkflows)
            {
                statusChain[wf.FromStatus] = wf.ToStatus;
                allStatuses.Add(wf.FromStatus);
                allStatuses.Add(wf.ToStatus);
            }

            // Statülerin detaylarını çekelim
            var statusDetails = await _context.IssueStatuses
                .Where(s => allStatuses.Contains(s.StatusId))
                .ToDictionaryAsync(s => s.StatusId, s => s);

            // Başlangıç statüsünü bulalım (hiçbir workflow'da ToStatus olmayan)
            var startStatusId = allStatuses.FirstOrDefault(s => !statusChain.Values.Contains(s));

            // Eğer başlangıç statüsü bulunamazsa (döngü varsa), herhangi bir statüden başlayalım
            if (startStatusId == 0)
                startStatusId = workflow.FromStatus;

            // Statüleri sıralayalım
            var orderedStatuses = new List<WorkflowStatusDto>();
            var currentStatusId = startStatusId;
            var visitedStatuses = new HashSet<int>();
            var order = 1;

            while (currentStatusId != 0 && !visitedStatuses.Contains(currentStatusId))
            {
                visitedStatuses.Add(currentStatusId);

                if (statusDetails.TryGetValue(currentStatusId, out var status))
                {
                    orderedStatuses.Add(new WorkflowStatusDto
                    {
                        StatusId = status.StatusId,
                        Name = status.Name,
                        Description = status.Description,
                        Color = status.Color,
                        Order = order++
                    });
                }

                // Bir sonraki statüye geç
                statusChain.TryGetValue(currentStatusId, out currentStatusId);
            }

            // Eğer zincirde olmayan statüler varsa, onları da ekleyelim
            foreach (var statusId in allStatuses)
            {
                if (!visitedStatuses.Contains(statusId) && statusDetails.TryGetValue(statusId, out var status))
                {
                    orderedStatuses.Add(new WorkflowStatusDto
                    {
                        StatusId = status.StatusId,
                        Name = status.Name,
                        Description = status.Description,
                        Color = status.Color,
                        Order = order++
                    });
                }
            }

            return orderedStatuses;
        }

        [HttpPost]
        public async Task<ActionResult<WorkflowFullDetailDto>> CreateWorkflow(WorkflowCreateDto dto)
        {
            // İlk workflow'u oluştur
            var workflow = new Workflow
            {
                Name = dto.Name,
                Description = dto.Description,
                FromStatus = dto.FromStatus,
                ToStatus = dto.ToStatus,
                IssueTypeId = dto.IssueTypeIds.FirstOrDefault() // Eski yapıyla uyumluluk için
            };

            _context.Workflows.Add(workflow);
            await _context.SaveChangesAsync();

            // Issue type ilişkilerini ekle
            foreach (var issueTypeId in dto.IssueTypeIds)
            {
                _context.WorkflowIssueTypes.Add(new WorkflowIssueType
                {
                    WorkflowId = workflow.WorkflowId,
                    IssueTypeId = issueTypeId
                });
            }

            await _context.SaveChangesAsync();

            // Eğer statüler belirtilmişse, onları da ekleyelim
            if (dto.Statuses != null && dto.Statuses.Count > 2)
            {
                var statusOrderDto = new WorkflowStatusOrderDto
                {
                    WorkflowId = workflow.WorkflowId,
                    Statuses = dto.Statuses.Select(s => new WorkflowStatusItem
                    {
                        StatusId = s.StatusId,
                        Order = s.Order
                    }).ToList()
                };

                await UpdateStatusOrder(workflow.WorkflowId, statusOrderDto);
            }

            // Yeni oluşturulan workflow'u detaylarıyla birlikte getir
            return await GetWorkflow(workflow.WorkflowId);
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkflow(int id, WorkflowCreateDto dto)
        {
            var workflow = await _context.Workflows.FindAsync(id);
            if (workflow == null)
                return NotFound();

            workflow.Name = dto.Name;
            workflow.Description = dto.Description;
            workflow.FromStatus = dto.FromStatus;
            workflow.ToStatus = dto.ToStatus;
            workflow.IssueTypeId = dto.IssueTypeIds.FirstOrDefault(); // Eski yapıyla uyumluluk için

            // Mevcut issue type ilişkilerini sil
            var existingRelations = await _context.WorkflowIssueTypes
                .Where(wit => wit.WorkflowId == id)
                .ToListAsync();

            _context.WorkflowIssueTypes.RemoveRange(existingRelations);

            // Yeni issue type ilişkilerini ekle
            foreach (var issueTypeId in dto.IssueTypeIds)
            {
                _context.WorkflowIssueTypes.Add(new WorkflowIssueType
                {
                    WorkflowId = id,
                    IssueTypeId = issueTypeId
                });
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Workflow/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkflow(int id)
        {
            var workflow = await _context.Workflows.FindAsync(id);
            if (workflow == null)
                return NotFound();

            _context.Workflows.Remove(workflow);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Workflow/ByIssueType/{issueTypeId}
        [HttpGet("ByIssueType/{issueTypeId}")]
        public async Task<ActionResult<IEnumerable<WorkflowDetailDto>>> GetWorkflowsByIssueType(int issueTypeId)
        {
            var workflows = await _context.WorkflowIssueTypes
                .Where(wit => wit.IssueTypeId == issueTypeId)
                .Include(wit => wit.Workflow)
                    .ThenInclude(w => w.FromStatusNavigation)
                .Include(wit => wit.Workflow)
                    .ThenInclude(w => w.ToStatusNavigation)
                .Select(wit => wit.Workflow)
                .ToListAsync();

            if (!workflows.Any())
                return new List<WorkflowDetailDto>();

            var result = new List<WorkflowDetailDto>();

            foreach (var workflow in workflows)
            {
                var issueTypes = await _context.WorkflowIssueTypes
                    .Where(wit => wit.WorkflowId == workflow.WorkflowId)
                    .Include(wit => wit.IssueType)
                    .ToListAsync();

                result.Add(new WorkflowDetailDto
                {
                    WorkflowId = workflow.WorkflowId,
                    Name = workflow.Name,
                    Description = workflow.Description,
                    FromStatus = workflow.FromStatus,
                    ToStatus = workflow.ToStatus,
                    IssueTypeIds = issueTypes.Select(wit => wit.IssueTypeId).ToList(),
                    FromStatusNavigation = new IssueStatusDto
                    {
                        StatusId = workflow.FromStatusNavigation.StatusId,
                        Name = workflow.FromStatusNavigation.Name,
                        Color = workflow.FromStatusNavigation.Color
                    },
                    ToStatusNavigation = new IssueStatusDto
                    {
                        StatusId = workflow.ToStatusNavigation.StatusId,
                        Name = workflow.ToStatusNavigation.Name,
                        Color = workflow.ToStatusNavigation.Color
                    },
                    IssueTypes = issueTypes.Select(wit => new IssueTypeDto
                    {
                        TypeId = wit.IssueType.TypeId,
                        Name = wit.IssueType.Name,
                        Color = wit.IssueType.Color
                    }).ToList()
                });
            }

            return result;
        }

        [HttpPut("{id}/statuses/order")]
        public async Task<IActionResult> UpdateStatusOrder(int id, WorkflowStatusOrderDto orderDto)
        {
            var workflow = await _context.Workflows
                .Include(w => w.WorkflowIssueTypes)
                .FirstOrDefaultAsync(w => w.WorkflowId == id);

            if (workflow == null)
                return NotFound();

            if (orderDto.WorkflowId != id)
                return BadRequest("Workflow ID mismatch");

            // Statülerin en az 2 tane olduğundan emin olalım
            if (orderDto.Statuses.Count < 2)
                return BadRequest("At least 2 statuses are required");

            // Aynı adlı tüm workflow'ları bulalım
            var relatedWorkflows = await _context.Workflows
                .Where(w => w.Name == workflow.Name)
                .ToListAsync();

            // Issue type ilişkilerini saklayalım
            var issueTypeIds = workflow.WorkflowIssueTypes
                .Select(wit => wit.IssueTypeId)
                .ToList();

            // Mevcut workflow'ları silelim
            _context.Workflows.RemoveRange(relatedWorkflows);
            await _context.SaveChangesAsync();

            // Sıralanmış statülerden yeni workflow'lar oluşturalım
            var orderedStatuses = orderDto.Statuses.OrderBy(s => s.Order).ToList();
            var createdWorkflows = new List<Workflow>();

            for (int i = 0; i < orderedStatuses.Count - 1; i++)
            {
                var fromStatusId = orderedStatuses[i].StatusId;
                var toStatusId = orderedStatuses[i + 1].StatusId;

                // Yeni workflow oluştur
                var newWorkflow = new Workflow
                {
                    Name = workflow.Name,
                    Description = workflow.Description,
                    FromStatus = fromStatusId,
                    ToStatus = toStatusId,
                    IssueTypeId = issueTypeIds.FirstOrDefault() // Eski yapıyla uyumluluk için
                };

                _context.Workflows.Add(newWorkflow);
                await _context.SaveChangesAsync();

                createdWorkflows.Add(newWorkflow);

                // Issue type ilişkilerini ekle
                foreach (var issueTypeId in issueTypeIds)
                {
                    _context.WorkflowIssueTypes.Add(new WorkflowIssueType
                    {
                        WorkflowId = newWorkflow.WorkflowId,
                        IssueTypeId = issueTypeId
                    });
                }
            }

            await _context.SaveChangesAsync();

            // İlk oluşturulan workflow'un ID'sini dönelim
            return Ok(new { WorkflowId = createdWorkflows.FirstOrDefault()?.WorkflowId ?? 0 });
        }

        [HttpDelete("DeleteTransition")]
        public async Task<IActionResult> DeleteTransition([FromQuery] int workflowId, [FromQuery] int fromStatusId, [FromQuery] int toStatusId)
        {
            try
            {
                // İlgili workflow'u bul
                var workflow = await _context.Workflows
                    .FirstOrDefaultAsync(w => w.WorkflowId == workflowId &&
                                             w.FromStatus == fromStatusId &&
                                             w.ToStatus == toStatusId);

                if (workflow == null)
                {
                    return NotFound("Transition not found");
                }

                // Workflow'u sil
                _context.Workflows.Remove(workflow);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Transition deleted successfully" });
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error deleting workflow transition");
                return StatusCode(500, $"An error occurred while deleting the workflow transition : {ex}");
            }
        }


    }
}


