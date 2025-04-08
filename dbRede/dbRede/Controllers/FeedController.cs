using Microsoft.AspNetCore.Mvc;
using dbRede.Models;
using Supabase;
using static Supabase.Postgrest.Constants;
using static dbRede.Controllers.FeedController;

namespace dbRede.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedController : ControllerBase
    {
        private readonly Client _supabase;

        public FeedController(IConfiguration configuration)
        {
            var service = new SupabaseService(configuration);
            _supabase = service.GetClient();
        }

        [HttpGet("feed")]
        public async Task<IActionResult> GetFeed()
        {
            var resultado = await _supabase
                .From<Post>()
                .Select("*, users (nome)") // nome da tabela referenciada
                .Get();

            if (resultado == null)
                return StatusCode(500, new { erro = "Erro ao acessar o Supabase." });

            var postsComAutores = resultado.Models.Select(post => new PostDTO
            {
                Id = post.Id,
                Conteudo = post.Conteudo,
                Imagem = post.Imagem,
                Tags = post.Tags,
                DataPostagem = post.DataPostagem,
                Curtidas = post.Curtidas,
                Comentarios = post.Comentarios,
                AutorId = post.AutorId,
                NomeAutor = post.Usuarios?.Nome ?? "Desconhecido"
            });

            return Ok(postsComAutores);
        }

        [HttpPost("criar")]
        public async Task<IActionResult> CriarPost([FromBody] CriarPostRequest novoPost)
        {
            var post = new Post
            {
                Id = Guid.NewGuid(),
                AutorId = novoPost.AutorId,
                Conteudo = novoPost.Conteudo,
                Imagem = novoPost.Imagem,
                DataPostagem = DateTime.UtcNow,
                Curtidas = 0,
                Comentarios = 0,
                Tags = novoPost.Tags,
            };

            var resposta = await _supabase.From<Post>().Insert(post);
            var postSalvo = resposta.Models.FirstOrDefault();

            if (postSalvo == null)
                return StatusCode(500, new { erro = "Erro ao salvar o post." });

            // Buscar o post novamente com o nome do autor (join)
            var resultado = await _supabase
                .From<Post>()
                .Select("*, users (nome)")
                .Filter("id", Operator.Equals, postSalvo.Id.ToString())
                .Get();

            var postComAutor = resultado.Models.FirstOrDefault();

            var dto = new PostDTO
            {
                Id = postComAutor.Id,
                AutorId = postComAutor.AutorId,
                Conteudo = postComAutor.Conteudo,
                Imagem = postComAutor.Imagem,
                DataPostagem = postComAutor.DataPostagem,
                Curtidas = postComAutor.Curtidas,
                Comentarios = postComAutor.Comentarios,
                Tags = postComAutor.Tags,
                NomeAutor = postComAutor.Usuarios?.Nome ?? "Desconhecido"
            };

            return Ok(new
            {
                mensagem = "Post criado com sucesso!",
                post = dto
            });
        }

        public class CriarPostRequest
        {
            public Guid AutorId { get; set; }
            public string Conteudo { get; set; }
            public string Imagem { get; set; }
            public List<string> Tags { get; set; }
        }

        public class PostDTO
        {
            public Guid Id { get; set; }
            public Guid AutorId { get; set; }
            public string Conteudo { get; set; }
            public string Imagem { get; set; }
            public DateTime DataPostagem { get; set; }
            public int Curtidas { get; set; }
            public int Comentarios { get; set; }
            public List<string> Tags { get; set; }
            public string NomeAutor { get; set; }
        }
    }
}