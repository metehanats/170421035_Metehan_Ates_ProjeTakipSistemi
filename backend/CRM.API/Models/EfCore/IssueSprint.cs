using System;
using System.Collections.Generic;

namespace CRM.API.Models.EfCore;

public partial class IssueSprint
{
    public int Id { get; set; }

    public int SprintId { get; set; }

    public int IssueId { get; set; }

    public virtual Issue Issue { get; set; } = null!;

    public virtual Sprint Sprint { get; set; } = null!;
}
