namespace CRM.API.DTO
{
    public class WorkflowStatusDto
    {
        public int StatusId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Color { get; set; }
        public int Order { get; set; }
    }
}
