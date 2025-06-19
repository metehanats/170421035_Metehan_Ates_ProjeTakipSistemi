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
    public class CustomFieldController : ControllerBase
    {
        private readonly CrmContext _context;

        public CustomFieldController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/CustomField
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomFieldResponseDto>>> GetCustomFields()
        {
            var customFields = await _context.CustomFields
                .Include(cf => cf.Project)
                .ToListAsync();

            //var result = customFields.Select(cf => new CustomFieldResponseDto
            //{
            //    FieldId = cf.FieldId,
            //    ProjectId = cf.ProjectId,
            //    FieldName = cf.FieldName,
            //    FieldType = cf.FieldType,
            //    Description = cf.Description,
            //    Required = cf.Required,
            //    Searchable = cf.Searchable,
            //    Options = cf.Options != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(cf.Options) : null,
            //    DefaultValue = cf.DefaultValue,
            //    CreatedAt = (DateTime)cf.CreatedAt,
            //    Usage = cf.Usage,
            //    ProjectName = cf.Project?.Name
            //}).ToList();

            return Ok(customFields);
        }

        // GET: api/CustomField/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CustomFieldResponseDto>> GetCustomField(int id)
        {
            var customField = await _context.CustomFields
                .Include(cf => cf.Project)
                .FirstOrDefaultAsync(cf => cf.FieldId == id);

            if (customField == null)
                return NotFound($"ID'si {id} olan özel alan bulunamadı.");

            var result = new CustomFieldResponseDto
            {
                FieldId = customField.FieldId,
                ProjectId = customField.ProjectId,
                FieldName = customField.FieldName,
                FieldType = customField.FieldType,
                Description = customField.Description,
                Required = customField.Required,
                Searchable = customField.Searchable,
                Options = customField.Options != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(customField.Options) : null,
                DefaultValue = customField.DefaultValue,
                CreatedAt = (DateTime)customField.CreatedAt,
                Usage = customField.Usage,
                ProjectName = customField.Project?.Name
            };

            return Ok(result);
        }

        //[HttpPost]
        //public async Task<ActionResult<CustomFieldResponseDto>> PostCustomField(CustomFieldCreateDto dto)
        //{
        //    var customField = new CustomField
        //    {
        //        ProjectId = dto.ProjectId,
        //        FieldName = dto.FieldName,
        //        FieldType = dto.FieldType,
        //        Description = dto.Description,
        //        Required = dto.Required,
        //        Searchable = dto.Searchable,
        //        Options = dto.Options,
        //        DefaultValue = dto.DefaultValue,
        //        CreatedAt = DateTime.UtcNow,
        //        Usage = 0
        //    };

        //    _context.CustomFields.Add(customField);
        //    await _context.SaveChangesAsync();

        //    var result = new CustomFieldResponseDto
        //    {
        //        FieldId = customField.FieldId,
        //        ProjectId = customField.ProjectId,
        //        FieldName = customField.FieldName,
        //        FieldType = customField.FieldType,
        //        Description = customField.Description,
        //        Required = customField.Required,
        //        Searchable = customField.Searchable,
        //        Options = customField.Options != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(customField.Options) : null,
        //        DefaultValue = customField.DefaultValue,
        //        CreatedAt = (DateTime)customField.CreatedAt,
        //        Usage = customField.Usage
        //    };

        //    return CreatedAtAction(nameof(GetCustomField), new { id = customField.FieldId }, result);
        //}

        [HttpPost]
        public async Task<ActionResult<CustomFieldResponseDto>> PostCustomField(CustomFieldCreateDto dto)
        {
            try
            {
                // Options alanını JSON olarak serileştir
                string optionsJson = null;
                if (dto.Options != null && dto.Options.Length > 0)
                {
                    optionsJson = System.Text.Json.JsonSerializer.Serialize(dto.Options);
                }

                var customField = new CustomField
                {
                    ProjectId = dto.ProjectId,
                    FieldName = dto.FieldName,
                    FieldType = dto.FieldType,
                    Description = dto.Description,
                    Required = dto.Required,
                    Searchable = dto.Searchable,
                    Options = optionsJson, // JSON olarak serileştirilmiş options
                    DefaultValue = dto.DefaultValue,
                    CreatedAt = DateTime.UtcNow,
                    Usage = 0
                };

                _context.CustomFields.Add(customField);
                await _context.SaveChangesAsync();

                var result = new CustomFieldResponseDto
                {
                    FieldId = customField.FieldId,
                    ProjectId = customField.ProjectId,
                    FieldName = customField.FieldName,
                    FieldType = customField.FieldType,
                    Description = customField.Description,
                    Required = customField.Required,
                    Searchable = customField.Searchable,
                    Options = customField.Options != null ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(customField.Options) : null,
                    DefaultValue = customField.DefaultValue,
                    CreatedAt = (DateTime)customField.CreatedAt,
                    Usage = customField.Usage
                };

                return CreatedAtAction(nameof(GetCustomField), new { id = customField.FieldId }, result);
            }
            catch (Exception ex)
            {
                // Hata günlüğü
                Console.WriteLine($"Error in PostCustomField: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutCustomField(int id, CustomFieldCreateDto dto)
        //{
        //    var existingField = await _context.CustomFields.FindAsync(id);
        //    if (existingField == null)
        //        return NotFound($"ID'si {id} olan özel alan bulunamadı.");

        //    // DTO'dan gelen verilerle güncelleme
        //    existingField.FieldName = dto.FieldName;
        //    existingField.FieldType = dto.FieldType;
        //    existingField.ProjectId = dto.ProjectId;
        //    existingField.Description = dto.Description;
        //    existingField.Required = dto.Required;
        //    existingField.Searchable = dto.Searchable;
        //    existingField.Options = dto.Options;
        //    existingField.DefaultValue = dto.DefaultValue;

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

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCustomField(int id, CustomFieldCreateDto dto)
        {
            try
            {
                var existingField = await _context.CustomFields.FindAsync(id);
                if (existingField == null)
                    return NotFound($"ID'si {id} olan özel alan bulunamadı.");

                // Options alanını JSON olarak serileştir
                string optionsJson = null;
                if (dto.Options != null && dto.Options.Length > 0)
                {
                    optionsJson = System.Text.Json.JsonSerializer.Serialize(dto.Options);
                }

                // DTO'dan gelen verilerle güncelleme
                existingField.FieldName = dto.FieldName;
                existingField.FieldType = dto.FieldType;
                existingField.ProjectId = dto.ProjectId;
                existingField.Description = dto.Description;
                existingField.Required = dto.Required;
                existingField.Searchable = dto.Searchable;
                existingField.Options = optionsJson; // JSON olarak serileştirilmiş options
                existingField.DefaultValue = dto.DefaultValue;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Veritabanı güncelleme hatası.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/CustomField/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomField(int id)
        {
            var customField = await _context.CustomFields.FindAsync(id);
            if (customField == null)
                return NotFound($"ID'si {id} olan özel alan bulunamadı.");

            _context.CustomFields.Remove(customField);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //// GET: api/CustomFiel
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<CustomField>>> GetCustomFields()
        //{
        //    var customFields = await _context.CustomFields
        //        .Include(cf => cf.Project)
        //        .ToListAsync();

        //    return Ok(customFields);
        //}

        //// GET: api/CustomField/5
        //[HttpGet("{id}")]
        //public async Task<ActionResult<CustomField>> GetCustomField(int id)
        //{
        //    var customField = await _context.CustomFields
        //        .Include(cf => cf.Project)
        //        .FirstOrDefaultAsync(cf => cf.FieldId == id);

        //    if (customField == null)
        //        return NotFound($"ID'si {id} olan özel alan bulunamadı.");

        //    return Ok(customField);
        //}

        //[HttpPost]
        //public async Task<ActionResult<CustomField>> PostCustomField(CustomFieldCreateDto dto)
        //{
        //    var customField = new CustomField
        //    {
        //        ProjectId = dto.ProjectId,
        //        FieldName = dto.FieldName,
        //        FieldType = dto.FieldType
        //    };

        //    _context.CustomFields.Add(customField);
        //    await _context.SaveChangesAsync();

        //    return CreatedAtAction(nameof(GetCustomField), new { id = customField.FieldId }, customField);
        //}

        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutCustomField(int id, CustomFieldCreateDto dto)
        //{
        //    var existingField = await _context.CustomFields.FindAsync(id);
        //    if (existingField == null)
        //        return NotFound($"ID'si {id} olan özel alan bulunamadı.");

        //    // DTO'dan gelen verilerle güncelleme
        //    existingField.FieldName = dto.FieldName;
        //    existingField.FieldType = dto.FieldType;
        //    existingField.ProjectId = dto.ProjectId;

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

        //// DELETE: api/CustomField/5
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteCustomField(int id)
        //{
        //    var customField = await _context.CustomFields.FindAsync(id);
        //    if (customField == null)
        //        return NotFound($"ID'si {id} olan özel alan bulunamadı.");

        //    _context.CustomFields.Remove(customField);
        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}
    }
}
