namespace CRM.API.DTO
{
    public class WorkflowDetailDto
    {
        public int WorkflowId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int FromStatus { get; set; }
        public int ToStatus { get; set; }
        public List<int> IssueTypeIds { get; set; } = new List<int>();

        // Navigation properties için DTO'lar
        public IssueStatusDto? FromStatusNavigation { get; set; }
        public IssueStatusDto? ToStatusNavigation { get; set; }
        public List<IssueTypeDto> IssueTypes { get; set; } = new List<IssueTypeDto>();
    }
}
