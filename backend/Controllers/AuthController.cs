using CRM.API.DTO;
using CRM.API.Models.EfCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Net.Mail;
using System.Net;

namespace CRM.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly CrmContext _context;

        public AuthController(CrmContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null)
                return Unauthorized(new { message = "Kullanıcı bulunamadı" });

            if (user.IsActive == false)
                return Unauthorized(new { message = "Kullanıcı pasif durumda" });

            if (user.PasswordHash != request.Password)
                return Unauthorized(new { message = "Geçersiz şifre" });

            return Ok(new
            {
                message = "Giriş başarılı",
                user = new
                {
                    user.UserId,
                    user.FullName,
                    user.Email,
                    Role = user.Role.Name
                }
            });
        }

        // imbp gswt kpus rzku
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPassword)
        {
            // 1. Kullanıcının var olup olmadığını kontrol et
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == forgotPassword.Email);
            var smtp = await _context.SmtpConfigurations.OrderBy(c => c.ConfigId).FirstOrDefaultAsync();

            if (user == null)
                return NotFound("Bu e-posta adresine sahip bir kullanıcı bulunamadı.");

            if (smtp == null)
                return NotFound("Herhangi bir SMTP Ayarı bulunamadı.");

            // 2. Rastgele onay kodu üret
            var rnd = new Random();
            int randomCode = rnd.Next(100000, 1000000);

            // 3. SMTP ayarları
            var smtpClient = new SmtpClient(smtp.SmtpHost)
            {
                Port = smtp.Port,
                Credentials = new NetworkCredential(smtp.FromName, smtp.Password),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(smtp.FromName),
                Subject = "Onay Kodu",
                Body = $"Şifre sıfırlama işlemi için onay kodunuz: {randomCode}",
            };
            mailMessage.To.Add(forgotPassword.Email);

            try
            {
                smtpClient.Send(mailMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"E-posta gönderilemedi: {ex.Message}");
            }

            // Burada onay kodunu bir yerde saklaman gerek (örneğin veritabanında veya cache içinde)
            user.PasswordResetToken = randomCode.ToString(); // Örnek kullanım
            user.ResetTokenExpires = DateTime.UtcNow.AddMinutes(10);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Onay kodu e-posta adresinize gönderildi." });

        }

        

        [HttpPost("verify-reset-code")]
        public async Task<IActionResult> VerifyResetCode([FromBody] VerifyResetCodeDto request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            if (user.PasswordResetToken != request.Code)
                return BadRequest("Onay kodu geçersiz.");

            return Ok("Kod doğrulandı.");
        }



        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            user.PasswordHash = request.NewPassword;

            user.PasswordResetToken = null;

            await _context.SaveChangesAsync();

            return Ok("Şifreniz başarıyla güncellendi.");
        }

        

    }
}


//// 2. Rastgele onay kodu üret
//var rnd = new Random();
//int randomCode = rnd.Next(100000, 1000000);

//// 3. SMTP ayarları
//var smtpClient = new SmtpClient("smtp.gmail.com")
//{
//    Port = 587,
//    Credentials = new NetworkCredential("emirhancinar025@gmail.com", "imbp gswt kpus rzku"),
//    EnableSsl = true,
//};

//var mailMessage = new MailMessage
//{
//    From = new MailAddress("emirhancinar025@gmail.com"),
//    Subject = "Onay Kodu",
//    Body = $"Şifre sıfırlama işlemi için onay kodunuz: {randomCode}",
//};
//mailMessage.To.Add(forgotPassword.Email);