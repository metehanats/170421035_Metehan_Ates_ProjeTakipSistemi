namespace CRM.API.DTO
{
    public class IssueResponseDto
    {
        public int IssueId { get; set; }
        public int ProjectId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int TypeId { get; set; }
        public int StatusId { get; set; }
        public int PriorityId { get; set; }
        public int? AssigneeId { get; set; }
        public int ReporterId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public int? ParentIssueId { get; set; }
        public int? StoryPoints { get; set; }
        public string TypeName { get; set; }
        public string StatusName { get; set; }
        public string AssigneeName { get; set; }
        public string ReporterName { get; set; }
        public string ProjectName { get; set; }
    }
}
