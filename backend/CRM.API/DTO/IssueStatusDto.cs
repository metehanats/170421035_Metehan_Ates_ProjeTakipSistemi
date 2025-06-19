namespace CRM.API.DTO
{
    public class IssueStatusDto
    {
        public int StatusId { get; set; }
        public string Name { get; set; } = null!;
        public string? Color { get; set; }
    }
}
