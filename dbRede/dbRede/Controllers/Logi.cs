using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Supabase;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;

[ApiController]
[Route("api/auth")]
public class Logi : ControllerBase
{
    private readonly Client _supabase;

    public Logi(IConfiguration configuration)
    {
        var service = new SupabaseService(configuration);
        _supabase = service.GetClient();
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var users = await _supabase.From<User>()
            .Where(u => u.Email == request.Email)
            .Get();

        if (users.Models.Count == 0)
            return Unauthorized("Usuário não encontrado");

        var user = users.Models.First();

        if (!BCrypt.Net.BCrypt.Verify(request.Senha, user.Senha))
            return Unauthorized("Senha incorreta");

        // Retorna apenas o e-mail do usuário
        var userDTO = new UserDTO
        {
            Email = user.Email
        };

        return Ok(new { message = "Login realizado com sucesso!", user = userDTO });
    }



    public class LoginRequest
    {
        public string Email { get; set; }
        public string Senha { get; set; }
    }
    public class UserDTO
    {
        public string Email { get; set; }
    }
}