namespace CRM.API.DTO
{
    public class AttachmentCreateDto
    {
        public int IssueId { get; set; }
        public string? FilePath { get; set; }
        public string? FileName { get; set; }
        public int? UploadedBy { get; set; }
        public DateTime? UploadedAt { get; set; }
    }
}
