namespace CRM.API.DTO
{
    //public class IssueStatusCreateDto
    //{
    //    public string Name { get; set; } = null!;
    //    public int? Order { get; set; }
    //}

    public class IssueStatusCreateDto
    {
        public string Name { get; set; } = null!;

        public int? Order { get; set; }

        public string? Description { get; set; }

        public string? Color { get; set; }
    }
}
