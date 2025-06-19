namespace CRM.API.Models.EfCore
{
    public partial class WorkflowStatus
    {
        public int Id { get; set; }
        public int WorkflowId { get; set; }
        public int StatusId { get; set; }
        public int Order { get; set; }

        public virtual Workflow Workflow { get; set; } = null!;
        public virtual IssueStatus Status { get; set; } = null!;
    }
}
