using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

[Table("users")]
public class User : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("nome")]
    public string Nome { get; set; }

    [Column("email")]
    public string Email { get; set; }

    [Column("senha")]
    public string Senha { get; set; }
    [Column("foto_perfil")]
    public string FotoPerfil { get; set; }
    [Column("biografia")]
    public string biografia { get; set; }
    [Column("dataaniversario")]
    public string dataaniversario { get; set; }
}
