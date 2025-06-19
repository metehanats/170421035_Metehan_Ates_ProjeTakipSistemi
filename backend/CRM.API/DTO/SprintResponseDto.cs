namespace CRM.API.DTO
{
    public class SprintResponseDto
    {
        public int SprintId { get; set; }
        public int ProjectId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
        public string Status { get; set; }
        public string Goal { get; set; }
        public string ProjectName { get; set; }
        public int IssueCount { get; set; }
    }
}
