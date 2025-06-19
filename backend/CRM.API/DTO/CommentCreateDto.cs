namespace CRM.API.DTO
{
    public class CommentCreateDto
    {
        public int IssueId { get; set; }
        public int UserId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
    }
}
