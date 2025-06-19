using System;
using System.Collections.Generic;

namespace CRM.API.Models.EfCore;

public partial class Issue
{
    public int IssueId { get; set; }
    public int ProjectId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int TypeId { get; set; }
    public int StatusId { get; set; }
    public int? PriorityId { get; set; }
    public int? AssigneeId { get; set; }
    public int ReporterId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public int? ParentIssueId { get; set; }

    // Yeni eklenen alan
    public int? StoryPoints { get; set; }

    public virtual User? Assignee { get; set; }
    public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Issue> InverseParentIssue { get; set; } = new List<Issue>();
    public virtual ICollection<IssueHistory> IssueHistories { get; set; } = new List<IssueHistory>();
    public virtual ICollection<IssueSprint> IssueSprints { get; set; } = new List<IssueSprint>();
    public virtual Issue? ParentIssue { get; set; }
    public virtual Project Project { get; set; } = null!;
    public virtual User Reporter { get; set; } = null!;
    public virtual IssueStatus Status { get; set; } = null!;
    public virtual IssueType Type { get; set; } = null!;

    //public int IssueId { get; set; }

    //public int ProjectId { get; set; }

    //public string Title { get; set; } = null!;

    //public string? Description { get; set; }

    //public int TypeId { get; set; }

    //public int StatusId { get; set; }

    //public int? PriorityId { get; set; }

    //public int? AssigneeId { get; set; }

    //public int ReporterId { get; set; }

    //public DateTime? CreatedAt { get; set; }

    //public DateTime? UpdatedAt { get; set; }

    //public DateTime? DueDate { get; set; }

    //public int? ParentIssueId { get; set; }

    //public virtual User? Assignee { get; set; }

    //public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();

    //public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    //public virtual ICollection<Issue> InverseParentIssue { get; set; } = new List<Issue>();

    //public virtual ICollection<IssueHistory> IssueHistories { get; set; } = new List<IssueHistory>();

    //public virtual ICollection<IssueSprint> IssueSprints { get; set; } = new List<IssueSprint>();

    //public virtual Issue? ParentIssue { get; set; }

    //public virtual Project Project { get; set; } = null!;

    //public virtual User Reporter { get; set; } = null!;

    //public virtual IssueStatus Status { get; set; } = null!;

    //public virtual IssueType Type { get; set; } = null!;
}
