namespace CRM.API.DTO
{
    //public class UserResponseDto
    //{
    //    public int UserId { get; set; }
    //    public string FullName { get; set; }
    //    public string FirstName { get; set; }
    //    public string LastName { get; set; }
    //    public string Email { get; set; }
    //    public int RoleId { get; set; }
    //    public bool IsActive { get; set; }
    //    public DateTime CreatedAt { get; set; }
    //    public string PasswordResetToken { get; set; }
    //    public DateTime ResetTokenExpires { get; set; }
    //}

    public class UserResponseDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public int RoleId { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string PasswordResetToken { get; set; }
        public DateTime? ResetTokenExpires { get; set; }
    }
}
