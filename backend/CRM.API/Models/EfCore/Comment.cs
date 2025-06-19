using System;
using System.Collections.Generic;

namespace CRM.API.Models.EfCore;

public partial class Comment
{
    public int CommentId { get; set; }

    public int IssueId { get; set; }

    public int UserId { get; set; }

    public string Content { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual Issue Issue { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
