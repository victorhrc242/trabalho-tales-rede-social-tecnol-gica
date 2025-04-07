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
        [HttpGet]
        public async Task<IActionResult> GetFeed()
        {
            try
            {
                // Buscar todos os posts ordenados por data (mais recente primeiro)
                var posts = await _supabase
                    .From<Post>()
                    .Order("data_postagem", Ordering.Descending)
                    .Get();

                // Mapear os dados para DTO, se necessário
                var postsDto = posts.Models.Select(post => new PostDTO
                {
                    Id = post.Id,
                    AutorId = post.AutorId,
                    Conteudo = post.Conteudo,
                    Imagem = post.Imagem,
                    Tags = post.Tags,
                    DataPostagem = post.DataPostagem,
                    Curtidas = post.Curtidas,
                    Comentarios = post.Comentarios
                }).ToList();

                return Ok(postsDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
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
        }
    

    }
}
