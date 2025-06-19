namespace CRM.API.DTO
{
    public class IssueStatusResponseDto
    {
        public int StatusId { get; set; }
        public string Name { get; set; }
        public int Order { get; set; }
        public string Description { get; set; }
        public string Color { get; set; }
        public string Category { get; set; }
    }
}
