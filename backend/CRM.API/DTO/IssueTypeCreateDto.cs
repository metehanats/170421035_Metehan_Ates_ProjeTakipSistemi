namespace CRM.API.DTO
{
    //public class IssueTypeCreateDto
    //{
    //    public string Name { get; set; } = null!;
    //    public string? Color { get; set; }
    //}

    public class IssueTypeCreateDto
    {
        public string Name { get; set; } = null!;
        public string? Color { get; set; }
        public string? Description { get; set; }
        public string? Icon { get; set; }
    }
}
