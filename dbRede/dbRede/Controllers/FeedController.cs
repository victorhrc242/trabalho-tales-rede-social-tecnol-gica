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
                .Select("*, users (nome)") // Substitua 'users' se o nome da tabela for outro
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
                NomeAutor = post.Usuarios?.Nome ?? "Desconhecido" // Use o nome da propriedade certa do join
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
                Tags = novoPost.Tags
            };

            var resposta = await _supabase.From<Post>().Insert(post);
            var postSalvo = resposta.Models.FirstOrDefault();

            if (postSalvo == null)
                return StatusCode(500, "Erro ao salvar o post.");

            var dto = new PostDTO
            {
                Id = postSalvo.Id,
                AutorId = postSalvo.AutorId,
                Conteudo = postSalvo.Conteudo,
                Imagem = postSalvo.Imagem,
                DataPostagem = postSalvo.DataPostagem,
                Curtidas = postSalvo.Curtidas,
                Comentarios = postSalvo.Comentarios,
                Tags = postSalvo.Tags

            };

            return Ok(dto);
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
