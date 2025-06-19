namespace CRM.API.DTO
{
    public class UpdateIssueTypeCustomFieldsDto
    {
        public int IssueTypeId { get; set; }
        public List<IssueTypeCustomFieldDto> CustomFields { get; set; } = new List<IssueTypeCustomFieldDto>();
    }
}
