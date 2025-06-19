namespace CRM.API.DTO
{
    public class CustomFieldResponseDto
    {
        public int FieldId { get; set; }
        public int ProjectId { get; set; }
        public string FieldName { get; set; }
        public string FieldType { get; set; }
        public string Description { get; set; }
        public bool Required { get; set; }
        public bool Searchable { get; set; }
        public List<string> Options { get; set; }
        public string DefaultValue { get; set; }
        public DateTime CreatedAt { get; set; }
        public int Usage { get; set; }
        public string ProjectName { get; set; }
    }
}
