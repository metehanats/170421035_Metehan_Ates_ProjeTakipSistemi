namespace CRM.API.DTO
{
    public class SmtpConfigurationUpdateDto
    {
        public string SmtpHost { get; set; } = null!;
        public int Port { get; set; }
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string EncryptionType { get; set; } = null!;
        public string? FromName { get; set; }
        public bool IsActive { get; set; }
    }
}
