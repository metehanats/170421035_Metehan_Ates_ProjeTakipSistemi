namespace CRM.API.Models.EfCore
{
    public partial class IssueTypeCustomField
    {
        public int Id { get; set; }

        public int IssueTypeId { get; set; }

        public int CustomFieldId { get; set; }

        public bool IsRequired { get; set; }

        public int DisplayOrder { get; set; }

        public virtual IssueType IssueType { get; set; } = null!;

        public virtual CustomField CustomField { get; set; } = null!;
    }
}
