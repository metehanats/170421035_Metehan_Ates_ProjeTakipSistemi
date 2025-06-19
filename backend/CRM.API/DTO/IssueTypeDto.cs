namespace CRM.API.DTO
{
    public class IssueTypeDto
    {
        public int TypeId { get; set; }
        public string Name { get; set; } = null!;
        public string? Color { get; set; }
    }
}
