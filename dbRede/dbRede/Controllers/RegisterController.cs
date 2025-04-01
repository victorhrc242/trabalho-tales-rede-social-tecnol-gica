using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Supabase;
using System;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/auth")]
public class RegisterController : ControllerBase
{
    private readonly Client _supabase;

    public RegisterController(IConfiguration configuration)
    {
        var service = new SupabaseService(configuration);
        _supabase = service.GetClient();
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrEmpty(request.Nome) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Senha ) || string.IsNullOrEmpty(request.biografia)||string.IsNullOrEmpty(request.FotoPerfil)||string.IsNullOrEmpty(request.dataaniversario))
        {
            return BadRequest("Todos os campos são obrigatórios.");
        }

        // Verifica se o usuário já existe
        var existingUser = await _supabase.From<User>().Where(u => u.Email == request.Email).Get();
        if (existingUser.Models.Any())
        {
            return BadRequest("E-mail já cadastrado.");
        }

        // Criar novo usuário
        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Nome = request.Nome,
            Email = request.Email,
            Senha = request.Senha,
            FotoPerfil=request.FotoPerfil,
            biografia=request.biografia,
            dataaniversario = request.dataaniversario// 🔴 Depois, devemos usar Hash para segurança!

        };

        await _supabase.From<User>().Insert(newUser);
        return Ok(new { message = "Usuário cadastrado com sucesso!", user = newUser });
    }
}

// Classe para receber os dados do cadastro
public class RegisterRequest
{
    public string Nome { get; set; }
    public string Email { get; set; }
    public string Senha { get; set; }
    public string FotoPerfil { get; set; }
    public string biografia { get; set; }
    public string dataaniversario { get; set; }
}
