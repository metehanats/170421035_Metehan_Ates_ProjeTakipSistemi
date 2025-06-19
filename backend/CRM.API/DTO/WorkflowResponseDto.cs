namespace CRM.API.DTO
{
    public class WorkflowResponseDto
    {
        public int WorkflowId { get; set; }
        public int FromStatus { get; set; }
        public int ToStatus { get; set; }
        public int IssueTypeId { get; set; }
        public string FromStatusName { get; set; }
        public string ToStatusName { get; set; }
        public string IssueTypeName { get; set; }
    }
}
