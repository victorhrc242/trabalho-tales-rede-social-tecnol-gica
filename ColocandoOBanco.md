📌 Passo a Passo para Conectar o Supabase ao seu Backend C#
Agora vamos configurar passo a passo como pegar a URL do banco e usá-la no seu backend.

1️⃣ Obter a URL e a Chave do Supabase
Acesse o painel do Supabase e selecione seu projeto.

Vá para a aba "Settings" → "API".

Copie:

URL Base (Supabase URL)

Chave Secreta (Anon Key ou Service Role Key)

📌 Exemplo das informações:

yaml
Copiar
Editar
Supabase URL: https://xyzcompany.supabase.co
Anon Key: eyJhbGciOiJIUzI1...
2️⃣ Criar um Projeto C# com Supabase
Se ainda não tem um projeto ASP.NET, crie um com:

sh
Copiar
Editar
dotnet new webapi -n MeuProjeto
cd MeuProjeto
Agora, instale o SDK do Supabase para C#:

sh
Copiar
Editar
dotnet add package Supabase
📌 Se estiver usando PostgreSQL puro, podemos usar Npgsql em vez do SDK.

3️⃣ Conectar o Backend ao Supabase
Crie um arquivo SupabaseService.cs para gerenciar a conexão:

csharp
Copiar
Editar
using Supabase;
using System;
using System.Threading.Tasks;

public class SupabaseService
{
    private readonly Client _supabase;

    public SupabaseService()
    {
        var url = "https://xyzcompany.supabase.co"; // 🟢 Cole sua URL do Supabase
        var key = "eyJhbGciOiJIUzI1..."; // 🟢 Cole sua Anon Key
        
        _supabase = new Client(url, key);
    }

    public Client GetClient() => _supabase;
}
Isso inicializa o Supabase Client, permitindo consultas no banco.

4️⃣ Criar um Endpoint para Buscar Posts
Agora, crie um controlador para retornar posts do banco.

📌 Crie PostsController.cs:

csharp
Copiar
Editar
using Microsoft.AspNetCore.Mvc;
using Supabase;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/posts")]
public class PostsController : ControllerBase
{
    private readonly Client _supabase;

    public PostsController()
    {
        var service = new SupabaseService();
        _supabase = service.GetClient();
    }

    [HttpGet]
    public async Task<IActionResult> GetPosts()
    {
        var posts = await _supabase.From<Post>().Get();
        return Ok(posts.Models);
    }
}
📌 Isso cria um endpoint que retorna todos os posts da tabela posts.

5️⃣ Criar a Classe do Modelo
Para mapear os dados corretamente, crie um modelo da tabela posts.

📌 Crie Models/Post.cs:

csharp
Copiar
Editar
using Postgrest.Attributes;
using Postgrest.Models;
using System;

[Table("posts")]
public class Post : BaseModel
{
    [PrimaryKey("id")]
    public Guid Id { get; set; }

    [Column("autor_id")]
    public Guid AutorId { get; set; }

    [Column("conteudo")]
    public string Conteudo { get; set; }

    [Column("imagem")]
    public string Imagem { get; set; } // URL da imagem

    [Column("data_postagem")]
    public DateTime DataPostagem { get; set; }
}
📌 Agora o C# entende que a tabela posts tem um campo imagem que armazena a URL da foto.

6️⃣ Criar um Endpoint para Retornar um Post Específico
Se quiser pegar um post pelo ID, adicione isso ao PostsController.cs:

csharp
Copiar
Editar
[HttpGet("{id}")]
public async Task<IActionResult> GetPostById(Guid id)
{
    var post = await _supabase.From<Post>().Where(p => p.Id == id).Single();
    
    if (post == null)
        return NotFound("Post não encontrado.");

    return Ok(post);
}
Agora, acessar GET /api/posts/{id} retorna um post específico, incluindo a URL da imagem.

7️⃣ Como o Frontend Usa a URL da Imagem?
O frontend (feito pelo seu amigo) pode simplesmente usar a URL armazenada no banco e exibir com:

html
Copiar
Editar
<img src="https://xyzcompany.supabase.co/storage/v1/object/public/uploads/minha-imagem.jpg" />
📌 Se precisar, posso gerar um código para o frontend React consumir esses dados.

📌 Testando a API
Agora, rode o backend com:

sh
Copiar
Editar
dotnet run
E acesse no navegador:

bash
Copiar
Editar
http://localhost:5000/api/posts
Ou no Thunder Client/Postman para ver os posts carregando!

✅ Resumo do Processo
Pegamos a URL e a chave do Supabase.

Criamos uma classe SupabaseService para conectar ao banco.

Criamos um PostsController para buscar posts e retornar as URLs das imagens.

O frontend pode exibir as imagens diretamente da URL salva.

Testamos a API no navegador/Postman.

📌 Agora você já pode salvar e recuperar imagens do Supabase no seu backend! 🚀

👉 Quer que eu te ajude a criar o endpoint para enviar imagens ao Supabase Storage?
