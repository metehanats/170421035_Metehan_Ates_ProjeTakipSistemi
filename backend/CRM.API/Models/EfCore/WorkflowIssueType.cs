namespace CRM.API.Models.EfCore
{
    public partial class WorkflowIssueType
    {
        public int Id { get; set; }

        public int WorkflowId { get; set; }

        public int IssueTypeId { get; set; }

        public virtual Workflow Workflow { get; set; } = null!;

        public virtual IssueType IssueType { get; set; } = null!;
    }

}
