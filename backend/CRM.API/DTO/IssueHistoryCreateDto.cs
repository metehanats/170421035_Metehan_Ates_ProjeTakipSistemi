namespace CRM.API.DTO
{
    public class IssueHistoryCreateDto
    {
        public int IssueId { get; set; }
        public int UserId { get; set; }
        public string? Action { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
