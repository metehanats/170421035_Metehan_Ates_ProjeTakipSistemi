namespace CRM.API.DTO
{
    public class IssueSprintResponseDto
    {
        public int Id { get; set; }
        public int IssueId { get; set; }
        public int SprintId { get; set; }
        public string IssueTitle { get; set; }
        public string SprintName { get; set; }
    }
}
