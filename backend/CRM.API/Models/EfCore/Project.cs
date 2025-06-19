using System;
using System.Collections.Generic;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace CRM.API.Models.EfCore;

public partial class Project
{
    public int ProjectId { get; set; }
    public string Name { get; set; } = null!;
    public string Key { get; set; } = null!;
    public string? Description { get; set; }
    public int OwnerId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public bool? IsActive { get; set; }

    // Yeni eklenen alanlar
    public string? Status { get; set; } = "planning"; // planning, active, completed, on_hold
    public string? Priority { get; set; } = "medium"; // low, medium, high, critical
    public int CompletedIssues { get; set; } = 0;
    public int TotalIssues { get; set; } = 0;
    public int TeamMembers { get; set; } = 0;

    public virtual ICollection<CustomField> CustomFields { get; set; } = new List<CustomField>();
    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();
    public virtual User Owner { get; set; } = null!;
    public virtual ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();
    public virtual ICollection<Sprint> Sprints { get; set; } = new List<Sprint>();

    //public int ProjectId { get; set; }

    //public string Name { get; set; } = null!;

    //public string Key { get; set; } = null!;

    //public string? Description { get; set; }

    //public int OwnerId { get; set; }

    //public DateTime? CreatedAt { get; set; }

    //public bool? IsActive { get; set; }

    //public virtual ICollection<CustomField> CustomFields { get; set; } = new List<CustomField>();

    //public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();

    //public virtual User Owner { get; set; } = null!;

    //public virtual ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();

    //public virtual ICollection<Sprint> Sprints { get; set; } = new List<Sprint>();
}
