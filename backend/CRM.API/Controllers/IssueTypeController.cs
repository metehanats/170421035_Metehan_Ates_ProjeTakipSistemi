using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IssueTypeController : ControllerBase
    {
        private readonly CrmContext _context;

        public IssueTypeController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/IssueType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IssueType>>> GetIssueTypes()
        {
            return await _context.IssueTypes.ToListAsync();
        }

        // GET: api/IssueType/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IssueType>> GetIssueType(int id)
        {
            var issueType = await _context.IssueTypes.FindAsync(id);

            if (issueType == null)
                return NotFound();

            return issueType;
        }

        [HttpGet("{id}/custom-fields")]
        public async Task<ActionResult<IEnumerable<IssueTypeCustomFieldDto>>> GetCustomFields(int id)
        {
            var issueType = await _context.IssueTypes.FindAsync(id);
            if (issueType == null)
                return NotFound();

            var customFields = await _context.IssueTypeCustomFields
                .Where(cf => cf.IssueTypeId == id)
                .Select(cf => new IssueTypeCustomFieldDto
                {
                    CustomFieldId = cf.CustomFieldId,
                    IsRequired = cf.IsRequired,
                    DisplayOrder = cf.DisplayOrder
                })
                .ToListAsync();

            return customFields;
        }

        [HttpPost("{id}/custom-fields")]
        public async Task<IActionResult> UpdateCustomFields(int id, [FromBody] UpdateIssueTypeCustomFieldsDto dto)
        {
            if (id != dto.IssueTypeId)
                return BadRequest("ID mismatch");

            var issueType = await _context.IssueTypes.FindAsync(id);
            if (issueType == null)
                return NotFound();

            // Mevcut custom field ilişkilerini sil
            var existingFields = await _context.IssueTypeCustomFields
                .Where(cf => cf.IssueTypeId == id)
                .ToListAsync();

            _context.IssueTypeCustomFields.RemoveRange(existingFields);

            // Yeni custom field ilişkilerini ekle
            foreach (var field in dto.CustomFields)
            {
                _context.IssueTypeCustomFields.Add(new IssueTypeCustomField
                {
                    IssueTypeId = id,
                    CustomFieldId = field.CustomFieldId,
                    IsRequired = field.IsRequired,
                    DisplayOrder = field.DisplayOrder
                });
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

        


        [HttpPost]
        public async Task<ActionResult<IssueType>> PostIssueType(IssueTypeCreateDto dto)
        {
            var issueType = new IssueType
            {
                Name = dto.Name,
                Color = dto.Color,
                Description = dto.Description,
                Icon = dto.Icon
            };

            _context.IssueTypes.Add(issueType);
            await _context.SaveChangesAsync();

            // Burada issueType.TypeId artık veritabanından gelmiş olur
            return CreatedAtAction(nameof(GetIssueType), new { id = issueType.TypeId }, issueType);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutIssueType(int id, IssueTypeCreateDto dto)
        {
            var existingType = await _context.IssueTypes.FindAsync(id);
            if (existingType == null)
                return NotFound();

            existingType.Name = dto.Name;
            existingType.Color = dto.Color;
            existingType.Description = dto.Description;
            existingType.Icon = dto.Icon;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/IssueType/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssueType(int id)
        {
            var issueType = await _context.IssueTypes.FindAsync(id);
            if (issueType == null)
                return NotFound();

            _context.IssueTypes.Remove(issueType);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

//namespace CRM.API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class IssueTypeController : ControllerBase
//    {
//        private readonly CrmContext _context;

//        public IssueTypeController(CrmContext context)
//        {
//            _context = context;
//        }

//        // GET: api/IssueType
//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<IssueType>>> GetIssueTypes()
//        {
//            return await _context.IssueTypes.ToListAsync();
//        }

//        // GET: api/IssueType/5
//        [HttpGet("{id}")]
//        public async Task<ActionResult<IssueType>> GetIssueType(int id)
//        {
//            var issueType = await _context.IssueTypes.FindAsync(id);

//            if (issueType == null)
//                return NotFound();

//            return issueType;
//        }

//        [HttpPost]
//        public async Task<ActionResult<IssueType>> PostIssueType(IssueTypeCreateDto dto)
//        {
//            var issueType = new IssueType
//            {
//                Name = dto.Name,
//                Color = dto.Color
//            };

//            _context.IssueTypes.Add(issueType);
//            await _context.SaveChangesAsync();

//            // Burada issueType.TypeId artık veritabanından gelmiş olur
//            return CreatedAtAction(nameof(GetIssueType), new { id = issueType.TypeId }, issueType);
//        }

//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutIssueType(int id, IssueTypeCreateDto dto)
//        {
//            var existingType = await _context.IssueTypes.FindAsync(id);
//            if (existingType == null)
//                return NotFound();

//            existingType.Name = dto.Name;
//            existingType.Color = dto.Color;

//            await _context.SaveChangesAsync();

//            return NoContent();
//        }

//        // DELETE: api/IssueType/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteIssueType(int id)
//        {
//            var issueType = await _context.IssueTypes.FindAsync(id);
//            if (issueType == null)
//                return NotFound();

//            _context.IssueTypes.Remove(issueType);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }
//    }
//}
