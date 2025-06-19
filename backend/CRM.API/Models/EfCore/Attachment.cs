using System;
using System.Collections.Generic;

namespace CRM.API.Models.EfCore;

public partial class Attachment
{
    public int AttachmentId { get; set; }

    public int IssueId { get; set; }

    public string? FilePath { get; set; }

    public string? FileName { get; set; }

    public int? UploadedBy { get; set; }

    public DateTime? UploadedAt { get; set; }

    public virtual Issue Issue { get; set; } = null!;

    public virtual User? UploadedByNavigation { get; set; }
}
