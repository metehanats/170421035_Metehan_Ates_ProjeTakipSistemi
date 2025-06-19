namespace CRM.API.DTO
{
    public class WorkflowFullDetailDto
    {
        public int WorkflowId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int FromStatus { get; set; }
        public int ToStatus { get; set; }
        public List<int> IssueTypeIds { get; set; } = new List<int>();

        // Navigation properties
        public IssueStatusDto FromStatusNavigation { get; set; }
        public IssueStatusDto ToStatusNavigation { get; set; }
        public List<IssueTypeDto> IssueTypes { get; set; } = new List<IssueTypeDto>();

        // Workflow'daki tüm statüler ve sıraları
        public List<WorkflowStatusDto> OrderedStatuses { get; set; } = new List<WorkflowStatusDto>();
    }
}
