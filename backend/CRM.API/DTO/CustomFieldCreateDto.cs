namespace CRM.API.DTO
{
    public class CustomFieldCreateDto
    {
        public int ProjectId { get; set; }
        public string FieldName { get; set; } = null!;
        public string FieldType { get; set; } = null!;

        // Yeni eklenen alanlar
        public string? Description { get; set; }
        public bool Required { get; set; } = false;
        public bool Searchable { get; set; } = true;
        public string[]? Options { get; set; } // JSON olarak gönderilecek
        public string? DefaultValue { get; set; }
    }

    //public class CustomFieldCreateDto
    //{
    //    public int ProjectId { get; set; }
    //    public string FieldName { get; set; } = null!;
    //    public string FieldType { get; set; } = null!;
    //}
}
