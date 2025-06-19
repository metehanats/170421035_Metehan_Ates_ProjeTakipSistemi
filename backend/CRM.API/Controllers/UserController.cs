using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly CrmContext _context;

        public UserController(CrmContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .ToListAsync();

            var result = users.Select(u => new UserResponseDto
            {
                UserId = u.UserId,
                FullName = u.FullName,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                RoleId = u.RoleId,
                // Null kontrolü yapılıyor
                IsActive = u.IsActive ?? false,
                CreatedAt = u.CreatedAt ?? DateTime.MinValue,
                PasswordResetToken = u.PasswordResetToken,
                // Null kontrolü yapılıyor
                ResetTokenExpires = u.ResetTokenExpires
            }).ToList();

            return Ok(result);
        }

        //// GET: api/User
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
        //{
        //    var users = await _context.Users
        //        .Include(u => u.Role)
        //        .ToListAsync();

        //    var result = users.Select(u => new UserResponseDto
        //    {
        //        UserId = u.UserId,
        //        FullName = u.FullName,
        //        FirstName = u.FirstName,
        //        LastName = u.LastName,
        //        Email = u.Email,
        //        RoleId = u.RoleId,
        //        IsActive = (bool)u.IsActive,
        //        CreatedAt = (DateTime)u.CreatedAt,
        //        PasswordResetToken = u.PasswordResetToken,
        //        ResetTokenExpires = (DateTime)u.ResetTokenExpires,
        //    }).ToList();

        //    return Ok(result);
        //}

        // GET: api/User/5

        //[HttpGet("{id}")]
        //public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        //{
        //    var user = await _context.Users
        //        .Include(u => u.Role)
        //        .FirstOrDefaultAsync(u => u.UserId == id);

        //    if (user == null)
        //        return NotFound();

        //    var result = new UserResponseDto
        //    {
        //        UserId = user.UserId,
        //        FullName = user.FullName,
        //        FirstName = user.FirstName,
        //        LastName = user.LastName,
        //        Email = user.Email,
        //        RoleId = user.RoleId,
        //        IsActive = (bool)user.IsActive,
        //        CreatedAt = (DateTime)user.CreatedAt,
        //        PasswordResetToken = user.PasswordResetToken,
        //        ResetTokenExpires = (DateTime)user.ResetTokenExpires,
        //    };

        //    return Ok(result);
        //}

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                return NotFound();

            var result = new UserResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                RoleId = user.RoleId,
                // Null kontrolü yapılıyor
                IsActive = user.IsActive ?? false,
                CreatedAt = user.CreatedAt ?? DateTime.MinValue,
                PasswordResetToken = user.PasswordResetToken,
                // Null kontrolü yapılıyor
                ResetTokenExpires = user.ResetTokenExpires
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> PostUser(UserCreateDto dto)
        {
            var user = new User
            {
                FullName = dto.FullName,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = dto.Password, // Gerçek uygulamada hashedPassword kullanın
                RoleId = dto.RoleId,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow,
                PasswordResetToken = null, // Null olarak ayarlayın
                ResetTokenExpires = null  // Null olarak ayarlayın
            };

            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException dbEx)
            {
                // SQL'e özgü detaylı hata
                return StatusCode(500, $"Veritabanı hatası: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                // Genel hata
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }

            var result = new UserResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                RoleId = user.RoleId,
                IsActive = (bool)user.IsActive,
                CreatedAt = (DateTime)user.CreatedAt
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, UserCreateDto dto)
        {
            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null)
                return NotFound($"ID'si {id} olan kullanıcı bulunamadı.");

            existingUser.FullName = dto.FullName;
            existingUser.FirstName = dto.FirstName;
            existingUser.LastName = dto.LastName;
            existingUser.Email = dto.Email;
            existingUser.RoleId = dto.RoleId;
            existingUser.IsActive = dto.IsActive;

            // Şifreyi güncellemek isterseniz:
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                existingUser.PasswordHash = dto.Password; // Gerçek uygulamada hash kullanın
            }

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

        // DELETE: api/User/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}


//using CRM.API.DTO;
//using CRM.API.Models.EfCore;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;

//namespace CRM.API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class UserController : ControllerBase
//    {
//        private readonly CrmContext _context;

//        public UserController(CrmContext context)
//        {
//            _context = context;
//        }

//        // GET: api/User
//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
//        {
//            var users = await _context.Users
//                .Include(u => u.Role)
//                .ToListAsync();

//            var result = users.Select(u => new UserResponseDto
//            {
//                UserId = u.UserId,
//                FullName = u.FullName,
//                FirstName = u.FirstName,
//                LastName = u.LastName,
//                Email = u.Email,
//                RoleId = u.RoleId,
//                RoleName = u.Role?.Name,
//                IsActive = (bool)u.IsActive,
//                CreatedAt = (DateTime)u.CreatedAt,
//                PasswordResetToken = u.PasswordResetToken,
//                ResetTokenExpires = u.ResetTokenExpires,
//            }).ToList();

//            return Ok(result);
//        }

//        // GET: api/User/5
//        [HttpGet("{id}")]
//        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
//        {
//            var user = await _context.Users
//                .Include(u => u.Role)
//                .FirstOrDefaultAsync(u => u.UserId == id);

//            if (user == null)
//                return NotFound();

//            var result = new UserResponseDto
//            {
//                UserId = user.UserId,
//                FullName = user.FullName,
//                FirstName = user.FirstName,
//                LastName = user.LastName,
//                Email = user.Email,
//                RoleId = user.RoleId,
//                RoleName = user.Role?.Name,
//                IsActive = (bool)user.IsActive,
//                CreatedAt = (DateTime)user.CreatedAt,
//                PasswordResetToken = user.PasswordResetToken,
//                ResetTokenExpires = user.ResetTokenExpires,
//            };

//            return Ok(result);
//        }

//        [HttpPost]
//        public async Task<ActionResult<UserResponseDto>> PostUser(UserCreateDto dto)
//        {

//            var user = new User
//            {
//                FullName = dto.FullName,
//                FirstName = dto.FirstName,
//                LastName = dto.LastName,
//                Email = dto.Email,
//                PasswordHash = dto.Password, // Gerçek uygulamada hashedPassword kullanın
//                RoleId = dto.RoleId,
//                IsActive = dto.IsActive,
//                CreatedAt = DateTime.UtcNow
//            };

//            try
//            {
//                _context.Users.Add(user);
//                await _context.SaveChangesAsync();

//            }
//            catch (DbUpdateException dbEx)
//            {
//                // SQL'e özgü detaylı hata
//                return StatusCode(500, $"Veritabanı hatası: {dbEx.InnerException?.Message ?? dbEx.Message}");
//            }
//            catch (Exception ex)
//            {
//                // Genel hata
//                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
//            }

//            var result = new UserResponseDto
//            {
//                UserId = user.UserId,
//                FullName = user.FullName,
//                FirstName = user.FirstName,
//                LastName = user.LastName,
//                Email = user.Email,
//                RoleId = user.RoleId,
//                IsActive = (bool)user.IsActive,
//                CreatedAt = (DateTime)user.CreatedAt
//            };

//            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, result);
//        }

//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutUser(int id, UserCreateDto dto)
//        {
//            var existingUser = await _context.Users.FindAsync(id);
//            if (existingUser == null)
//                return NotFound($"ID'si {id} olan kullanıcı bulunamadı.");

//            existingUser.FullName = dto.FullName;
//            existingUser.FirstName = dto.FirstName;
//            existingUser.LastName = dto.LastName;
//            existingUser.Email = dto.Email;
//            existingUser.RoleId = dto.RoleId;
//            existingUser.IsActive = dto.IsActive;

//            // Şifreyi güncellemek isterseniz:
//            if (!string.IsNullOrWhiteSpace(dto.Password))
//            {
//                //existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
//                existingUser.PasswordHash = dto.Password; // Gerçek uygulamada hash kullanın
//            }

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

//        // DELETE: api/User/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteUser(int id)
//        {
//            var user = await _context.Users.FindAsync(id);
//            if (user == null)
//                return NotFound();

//            _context.Users.Remove(user);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }
//    }
//}

