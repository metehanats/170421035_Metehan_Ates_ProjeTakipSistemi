using System.ComponentModel.DataAnnotations;

namespace CRM.API.Models.EfCore
{
    public partial class SmtpConfiguration
    {
        [Key]
        public int ConfigId { get; set; }

        [Required]
        public string SmtpHost { get; set; } = null!;

        [Required]
        public int Port { get; set; }

        [Required]
        public string Username { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

        [Required]
        public string EncryptionType { get; set; } = null!;

        public string? FromName { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }
    }
}
