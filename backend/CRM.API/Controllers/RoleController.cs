using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly CrmContext _context;

        public RoleController(CrmContext context)
        {
            _context = context;
        }

        // GET: api/Role
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
        {
            return await _context.Roles
                .Include(r => r.ProjectMembers)
                .Include(r => r.Users)
                .ToListAsync();
        }

        // GET: api/Role/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRole(int id)
        {
            var role = await _context.Roles
                .Include(r => r.ProjectMembers)
                .Include(r => r.Users)
                .FirstOrDefaultAsync(r => r.RoleId == id);

            if (role == null)
                return NotFound();

            return role;
        }

        // POST: api/Role
        //[HttpPost]
        //public async Task<ActionResult<Role>> PostRole(Role role)
        //{
        //    _context.Roles.Add(role);
        //    await _context.SaveChangesAsync();

        //    return CreatedAtAction(nameof(GetRole), new { id = role.RoleId }, role);
        //}

        [HttpPost]
        public async Task<ActionResult<Role>> PostRole(RoleCreateDto dto)
        {
            var role = new Role
            {
                Name = dto.Name
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRole), new { id = role.RoleId }, role);
        }


        // PUT: api/Role/5
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutRole(int id, Role role)
        //{
        //    if (id != role.RoleId)
        //        return BadRequest();

        //    var existingRole = await _context.Roles.FindAsync(id);
        //    if (existingRole == null)
        //        return NotFound();

        //    existingRole.Name = role.Name;

        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRole(int id, RoleCreateDto dto)
        {
            var existingRole = await _context.Roles.FindAsync(id);
            if (existingRole == null)
                return NotFound($"ID'si {id} olan rol bulunamadı.");

            existingRole.Name = dto.Name;

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

        // DELETE: api/Role/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
                return NotFound();

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
