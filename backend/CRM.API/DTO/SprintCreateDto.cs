namespace CRM.API.DTO
{
    //public class SprintCreateDto
    //{
    //    public int ProjectId { get; set; }
    //    public string? Name { get; set; }
    //    public DateTime? StartDate { get; set; }
    //    public DateTime? EndDate { get; set; }
    //    public bool? IsActive { get; set; }
    //}

    public class SprintCreateDto
    {
        public int ProjectId { get; set; }
        public string? Name { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsActive { get; set; }

        // Yeni eklenen alanlar
        public string? Description { get; set; }
        public string? Status { get; set; } = "planned"; // planned, active, completed
        public string? Goal { get; set; }
    }

}
