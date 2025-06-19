namespace CRM.API.DTO
{
    public class SmtpConfigurationDto
    {
        public int ConfigId { get; set; }
        public string SmtpHost { get; set; } = null!;
        public int Port { get; set; }
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string EncryptionType { get; set; } = null!;
        public string? FromName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
