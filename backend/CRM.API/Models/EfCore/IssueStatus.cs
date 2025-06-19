using System;
using System.Collections.Generic;

namespace CRM.API.Models.EfCore;

public partial class IssueStatus
{
    public int StatusId { get; set; }

    public string Name { get; set; } = null!;

    public int? Order { get; set; }

    public string? Description { get; set; }

    public string? Color { get; set; }

    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();

    public virtual ICollection<Workflow> WorkflowFromStatusNavigations { get; set; } = new List<Workflow>();

    public virtual ICollection<Workflow> WorkflowToStatusNavigations { get; set; } = new List<Workflow>();

    //public int StatusId { get; set; }

    //public string Name { get; set; } = null!;

    //public int? Order { get; set; }

    //public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();

    //public virtual ICollection<Workflow> WorkflowFromStatusNavigations { get; set; } = new List<Workflow>();

    //public virtual ICollection<Workflow> WorkflowToStatusNavigations { get; set; } = new List<Workflow>();
}
