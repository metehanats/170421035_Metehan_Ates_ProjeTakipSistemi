namespace CRM.API.DTO
{
    public class ResetPasswordDto
    {
        public string Email { get; set; } = null!;
        public string Code { get; set; } = null!; // E-posta ile gönderilen doğrulama kodu
        public string NewPassword { get; set; } = null!;
    }
}
