namespace CRM.API.DTO
{
    //public class UserCreateDto
    //{
    //    public string FullName { get; set; } = null!;
    //    public string Email { get; set; } = null!;
    //    public string Password { get; set; } = null!; // Hash'lenmeden gelen düz şifre
    //    public int RoleId { get; set; }
    //    public bool? IsActive { get; set; }
    //}

    public class UserCreateDto
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!; // Hash'lenmeden gelen düz şifre
        public int RoleId { get; set; }
        public bool? IsActive { get; set; }

        // Yeni eklenen alanlar
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }

}
