namespace CRM.API.DTO
{
    //public class IssueCreateDto
    //{
    //    public int ProjectId { get; set; }
    //    public string Title { get; set; } = null!;
    //    public string? Description { get; set; }
    //    public int TypeId { get; set; }
    //    public int StatusId { get; set; }
    //    public int? PriorityId { get; set; }
    //    public int? AssigneeId { get; set; }
    //    public int ReporterId { get; set; }
    //    public DateTime? DueDate { get; set; }
    //    public int? ParentIssueId { get; set; }
    //}

    public class IssueCreateDto
    {
        public int ProjectId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public int TypeId { get; set; }
        public int StatusId { get; set; }
        public int? PriorityId { get; set; }
        public int? AssigneeId { get; set; }
        public int ReporterId { get; set; }
        public DateTime? DueDate { get; set; }
        public int? ParentIssueId { get; set; }

        // Yeni eklenen alan
        public int? StoryPoints { get; set; }
    }
}
