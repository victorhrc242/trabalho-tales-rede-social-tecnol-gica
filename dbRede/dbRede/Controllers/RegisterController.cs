using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Supabase;
using Supabase.Postgrest.Attributes;
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
    //aqui estava dando erro pois  o status body não estava fucionando pois não
    //estava conseguindo retornar  um json valido ele tentava retornar os dados de
    // um jeito diferente do que era para retornar pois precisava retornar um formato json completo 
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Remover espaços extras e validar os campos obrigatórios
        if (string.IsNullOrWhiteSpace(request.Nome) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Senha) ||
            string.IsNullOrWhiteSpace(request.biografia) ||
            string.IsNullOrWhiteSpace(request.FotoPerfil) ||
            string.IsNullOrWhiteSpace(request.dataaniversario))
        {
            return BadRequest(new { error = "Todos os campos são obrigatórios." });
        }

        try
        {
            // Verifica se o usuário já existe
            var existingUser = await _supabase.From<User>().Where(u => u.Email == request.Email).Get();
            if (existingUser.Models.Any())
            {
         
                return BadRequest(new { error = "E-mail já cadastrado." });
            }
            
            // Hash da senha antes de salvar
            string senhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha);

            // Criar novo usuário
            var newUser = new User
            {
                Nome = request.Nome.Trim().ToLower(),
                Email = request.Email.Trim().ToLower(),
                Senha = senhaHash, // Senha agora está protegida
                FotoPerfil = request.FotoPerfil,
                biografia = request.biografia,
                dataaniversario = request.dataaniversario
            };

            await _supabase.From<User>().Insert(newUser);

            // Retornar sucesso sem expor a senha
            return Ok(new
            {
                message = "Usuário cadastrado com sucesso!",
                user = new
                {
                    newUser.Nome,
                    newUser.Email,
                    newUser.FotoPerfil,
                    newUser.biografia,
                    newUser.dataaniversario
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Erro interno no servidor.", details = ex.Message });
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
}
