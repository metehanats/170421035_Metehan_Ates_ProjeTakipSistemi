using System;
using System.Collections.Generic;

namespace CRM.API.Models.EfCore;

public partial class Workflow
{
    public int WorkflowId { get; set; }

    public int FromStatus { get; set; }

    public int ToStatus { get; set; }

    public int IssueTypeId { get; set; } // Eski yapıyla uyumluluk için tutuyoruz

    public string? Name { get; set; }

    public string? Description { get; set; }

    public virtual IssueStatus FromStatusNavigation { get; set; } = null!;

    public virtual IssueType IssueType { get; set; } = null!;

    public virtual IssueStatus ToStatusNavigation { get; set; } = null!;

    public virtual ICollection<WorkflowStatus> WorkflowStatuses { get; set; } = new List<WorkflowStatus>();

    public virtual ICollection<WorkflowIssueType> WorkflowIssueTypes { get; set; } = new List<WorkflowIssueType>();

    
}
