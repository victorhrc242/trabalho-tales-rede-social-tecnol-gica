﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Supabase;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;
using System.Collections.Concurrent;

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

[HttpPut("Recuperar-senha")]
public async Task<IActionResult> RecuperarSenha([FromBody] RecuperarSenhaDTO dados)
{
    if (string.IsNullOrEmpty(dados.Email) || string.IsNullOrEmpty(dados.NovaSenha))
        return BadRequest("Email e nova senha são obrigatórios.");

    // Criptografa a nova senha com BCrypt
    string senhaCriptografada = BCrypt.Net.BCrypt.HashPassword(dados.NovaSenha);

    // Atualiza a senha com base no e-mail
    var response = await _supabase
        .From<User>()
        .Where(x => x.Email == dados.Email)
        .Set(x => x.Senha, senhaCriptografada)
        .Update();

    if (response.Models.Count == 0)
        return NotFound("Usuário não encontrado.");

    return Ok("Senha atualizada com sucesso.");
}

public class RecuperarSenhaDTO
    {
        public string Email { get; set; }
        public string NovaSenha { get; set; }
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