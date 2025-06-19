namespace CRM.API.DTO
{
    public class NotificationCreateDto
    {
        public int UserId { get; set; }
        public string Message { get; set; } = null!;
        public bool? IsRead { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
