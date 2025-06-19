using System;
using System.Collections.Generic;

namespace CRM.API.Models.EfCore;

public partial class CustomField
{
    //public int FieldId { get; set; }

    //public int ProjectId { get; set; }

    //public string FieldName { get; set; } = null!;

    //public string FieldType { get; set; } = null!;

    //public virtual Project Project { get; set; } = null!;

    public int FieldId { get; set; }
    public int ProjectId { get; set; }
    public string FieldName { get; set; } = null!;
    public string FieldType { get; set; } = null!;

    // Yeni eklenen alanlar
    public string? Description { get; set; }
    public bool Required { get; set; } = false;
    public bool Searchable { get; set; } = true;
    public string? Options { get; set; } // JSON olarak saklanabilir
    public string? DefaultValue { get; set; }
    public DateTime? CreatedAt { get; set; } = DateTime.Now;
    public int Usage { get; set; } = 0;

    public virtual Project Project { get; set; } = null!;
    public virtual ICollection<IssueTypeCustomField> IssueTypeCustomFields { get; set; } = new List<IssueTypeCustomField>();
}
