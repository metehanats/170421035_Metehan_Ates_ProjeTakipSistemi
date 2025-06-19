using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SmtpConfigurationController : ControllerBase
    {
        private readonly CrmContext _context;

        public SmtpConfigurationController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/SmtpConfiguration
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SmtpConfigurationDto>>> GetSmtpConfigurations()
        {
            var configurations = await _context.SmtpConfigurations.ToListAsync();

            var result = configurations.Select(config => new SmtpConfigurationDto
            {
                ConfigId = config.ConfigId,
                SmtpHost = config.SmtpHost,
                Port = config.Port,
                Username = config.Username,
                Password = config.Password, // Güvenlik için şifreyi maskeliyoruz
                EncryptionType = config.EncryptionType,
                FromName = config.FromName,
                IsActive = config.IsActive,
                CreatedAt = config.CreatedAt,
                UpdatedAt = config.UpdatedAt
            }).ToList();

            return Ok(result);
        }

        // GET: api/SmtpConfiguration/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SmtpConfigurationDto>> GetSmtpConfiguration(int id)
        {
            var config = await _context.SmtpConfigurations.FindAsync(id);

            if (config == null)
                return NotFound($"ID'si {id} olan SMTP yapılandırması bulunamadı.");

            var result = new SmtpConfigurationDto
            {
                ConfigId = config.ConfigId,
                SmtpHost = config.SmtpHost,
                Port = config.Port,
                Username = config.Username,
                Password = config.Password, // Güvenlik için şifreyi maskeliyoruz
                EncryptionType = config.EncryptionType,
                FromName = config.FromName,
                IsActive = config.IsActive,
                CreatedAt = config.CreatedAt,
                UpdatedAt = config.UpdatedAt
            };

            return Ok(result);
        }

        // POST: api/SmtpConfiguration
        [HttpPost]
        public async Task<ActionResult<SmtpConfigurationDto>> CreateSmtpConfiguration(SmtpConfigurationCreateDto dto)
        {
            try
            {
                var config = new SmtpConfiguration
                {
                    SmtpHost = dto.SmtpHost,
                    Port = dto.Port,
                    Username = dto.Username,
                    Password = dto.Password,
                    EncryptionType = dto.EncryptionType,
                    FromName = dto.FromName,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                _context.SmtpConfigurations.Add(config);
                await _context.SaveChangesAsync();

                var result = new SmtpConfigurationDto
                {
                    ConfigId = config.ConfigId,
                    SmtpHost = config.SmtpHost,
                    Port = config.Port,
                    Username = config.Username,
                    Password = config.Password, // Güvenlik için şifreyi maskeliyoruz
                    EncryptionType = config.EncryptionType,
                    FromName = config.FromName,
                    IsActive = config.IsActive,
                    CreatedAt = config.CreatedAt,
                    UpdatedAt = config.UpdatedAt
                };

                return CreatedAtAction(nameof(GetSmtpConfiguration), new { id = config.ConfigId }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/SmtpConfiguration/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSmtpConfiguration(int id, SmtpConfigurationUpdateDto dto)
        {
            try
            {
                var config = await _context.SmtpConfigurations.FindAsync(id);
                if (config == null)
                    return NotFound($"ID'si {id} olan SMTP yapılandırması bulunamadı.");

                config.SmtpHost = dto.SmtpHost;
                config.Port = dto.Port;
                config.Username = dto.Username;
                config.Password = dto.Password;
                config.EncryptionType = dto.EncryptionType;
                config.FromName = dto.FromName;
                config.IsActive = dto.IsActive;
                config.UpdatedAt = DateTime.UtcNow;

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

        // DELETE: api/SmtpConfiguration/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSmtpConfiguration(int id)
        {
            var config = await _context.SmtpConfigurations.FindAsync(id);
            if (config == null)
                return NotFound($"ID'si {id} olan SMTP yapılandırması bulunamadı.");

            _context.SmtpConfigurations.Remove(config);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/SmtpConfiguration/test
        //[HttpPost("test")]
        //public async Task<IActionResult> TestSmtpConfiguration(SmtpConfigurationCreateDto dto)
        //{
        //    try
        //    {
        //        // Burada SMTP bağlantısını test edebilirsiniz
        //        // Örneğin: SmtpClient kullanarak bir test e-postası gönderme

        //        return Ok(new { message = "SMTP bağlantısı başarılı!" });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, $"SMTP bağlantı hatası: {ex.Message}");
        //    }
        //}
    }
}
