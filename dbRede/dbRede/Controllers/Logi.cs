using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Supabase;
using System.Linq;
using System.Threading.Tasks;

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

    // aqui eu estou logando

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var users = await _supabase.From<User>()
            .Where(u => u.Email == request.Email && u.Senha == request.Senha)
            .Get();

        if (users.Models.Count == 0)
            return Unauthorized("Usuário ou senha inválidos");

        return Ok(new { message = "Login realizado com sucesso!", user = users.Models.First() });
    }
}

public class LoginRequest
{
    public string Email { get; set; }
    public string Senha { get; set; }
}
