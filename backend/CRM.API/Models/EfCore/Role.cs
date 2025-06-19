using System;
using System.Collections.Generic;

namespace CRM.API.Models.EfCore;

public partial class Role
{
    public int RoleId { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
