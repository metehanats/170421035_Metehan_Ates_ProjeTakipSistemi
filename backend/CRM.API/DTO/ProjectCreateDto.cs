namespace CRM.API.DTO
{
    //public class ProjectCreateDto
    //{
    //    public string Name { get; set; } = null!;
    //    public string Key { get; set; } = null!;
    //    public string? Description { get; set; }
    //    public int OwnerId { get; set; }
    //    public DateTime? CreatedAt { get; set; }
    //    public bool? IsActive { get; set; }
    //}

    public class ProjectCreateDto
    {
        public string Name { get; set; } = null!;
        public string Key { get; set; } = null!;
        public string? Description { get; set; }
        public int OwnerId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public bool? IsActive { get; set; }

        // Yeni eklenen alanlar
        public string? Status { get; set; } = "planning"; // planning, active, completed, on_hold
        public string? Priority { get; set; } = "medium"; // low, medium, high, critical
    }
}
