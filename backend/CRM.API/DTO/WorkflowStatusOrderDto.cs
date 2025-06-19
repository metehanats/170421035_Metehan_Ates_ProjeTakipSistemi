namespace CRM.API.DTO
{
    public class WorkflowStatusOrderDto
    {
        public int WorkflowId { get; set; }
        public List<WorkflowStatusItem> Statuses { get; set; } = new List<WorkflowStatusItem>();
    }
}
