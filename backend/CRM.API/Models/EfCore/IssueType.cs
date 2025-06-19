using System;
using System.Collections.Generic;

namespace CRM.API.Models.EfCore;

public partial class IssueType
{
    public int TypeId { get; set; }

    public string Name { get; set; } = null!;

    public string? Color { get; set; }

    public string? Description { get; set; }

    public string? Icon { get; set; }

    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();

    public virtual ICollection<Workflow> Workflows { get; set; } = new List<Workflow>();

    public virtual ICollection<IssueTypeCustomField> IssueTypeCustomFields { get; set; } = new List<IssueTypeCustomField>();

    public virtual ICollection<WorkflowIssueType> WorkflowIssueTypes { get; set; } = new List<WorkflowIssueType>();

    //public int TypeId { get; set; }

    //public string Name { get; set; } = null!;

    //public string? Color { get; set; }

    //public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();

    //public virtual ICollection<Workflow> Workflows { get; set; } = new List<Workflow>();
}
