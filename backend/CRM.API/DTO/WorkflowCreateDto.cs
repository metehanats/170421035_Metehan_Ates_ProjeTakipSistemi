namespace CRM.API.DTO
{
    //public class WorkflowCreateDto
    //{
    //    public string? Name { get; set; }
    //    public string? Description { get; set; }
    //    public int FromStatus { get; set; }
    //    public int ToStatus { get; set; }
    //    public List<int> IssueTypeIds { get; set; } = new List<int>();
    //}


    public class WorkflowCreateDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int FromStatus { get; set; }
        public int ToStatus { get; set; }
        public List<int> IssueTypeIds { get; set; } = new List<int>();
        public List<WorkflowStatusItem> Statuses { get; set; } = new List<WorkflowStatusItem>();
    }
}
