namespace CRM.API.DTO
{
    public class VerifyResetCodeDto
    {
        public string Email { get; set; } = null!;
        public string Code { get; set; }
    }
}
