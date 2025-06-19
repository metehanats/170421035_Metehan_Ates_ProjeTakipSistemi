namespace CRM.API.DTO
{
    public class ProjectResponseDto
    {
        public int ProjectId { get; set; }
        public string Name { get; set; }
        public string Key { get; set; }
        public string Description { get; set; }
        public int OwnerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public int CompletedIssues { get; set; }
        public int TotalIssues { get; set; }
        public int TeamMembers { get; set; }
        public string OwnerName { get; set; }
    }
}
