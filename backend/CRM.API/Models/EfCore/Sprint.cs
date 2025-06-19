using System;
using System.Collections.Generic;

namespace CRM.API.Models.EfCore;

public partial class Sprint
{
    public int SprintId { get; set; }
    public int ProjectId { get; set; }
    public string? Name { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? IsActive { get; set; }

    // Yeni eklenen alanlar
    public string? Description { get; set; }
    public string? Status { get; set; } = "planned"; // planned, active, completed
    public string? Goal { get; set; }

    public virtual ICollection<IssueSprint> IssueSprints { get; set; } = new List<IssueSprint>();
    public virtual Project Project { get; set; } = null!;

    //public int SprintId { get; set; }

    //public int ProjectId { get; set; }

    //public string? Name { get; set; }

    //public DateTime? StartDate { get; set; }

    //public DateTime? EndDate { get; set; }

    //public bool? IsActive { get; set; }

    //public virtual ICollection<IssueSprint> IssueSprints { get; set; } = new List<IssueSprint>();

    //public virtual Project Project { get; set; } = null!;
}
