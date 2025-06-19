using System;
using System.Collections.Generic;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace CRM.API.Models.EfCore;

public partial class User
{
    public int UserId { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public int RoleId { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }

    // Nullable olarak düzeltildi
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? ResetTokenExpires { get; set; }

    public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Issue> IssueAssignees { get; set; } = new List<Issue>();
    public virtual ICollection<IssueHistory> IssueHistories { get; set; } = new List<IssueHistory>();
    public virtual ICollection<Issue> IssueReporters { get; set; } = new List<Issue>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();
    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
    public virtual Role Role { get; set; } = null!;
}

//public partial class User
//{


//    //public int UserId { get; set; }
//    //public string FullName { get; set; } = null!;
//    //public string Email { get; set; } = null!;
//    //public string PasswordHash { get; set; } = null!;
//    //public int RoleId { get; set; }
//    //public bool? IsActive { get; set; }
//    //public DateTime? CreatedAt { get; set; }

//    //// Yeni eklenen alanlar
//    //public string? FirstName { get; set; }
//    //public string? LastName { get; set; }
//    //public string PasswordResetToken { get; set; }
//    //public DateTime ResetTokenExpires { get; set; }

//    //public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
//    //public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
//    //public virtual ICollection<Issue> IssueAssignees { get; set; } = new List<Issue>();
//    //public virtual ICollection<IssueHistory> IssueHistories { get; set; } = new List<IssueHistory>();
//    //public virtual ICollection<Issue> IssueReporters { get; set; } = new List<Issue>();
//    //public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
//    //public virtual ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();
//    //public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
//    //public virtual Role Role { get; set; } = null!;


//}
