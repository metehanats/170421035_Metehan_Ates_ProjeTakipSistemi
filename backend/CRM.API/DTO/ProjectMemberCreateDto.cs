namespace CRM.API.DTO
{
    public class ProjectMemberCreateDto
    {
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
    }

}
