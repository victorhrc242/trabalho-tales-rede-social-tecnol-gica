import React, { useEffect, useState } from 'react';
import '../adm/denuncia.css'
function DenunciasAdmin() {
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [logado, setLogado] = useState(localStorage.getItem('adminLogado') === 'true');
  const [senha, setSenha] = useState('');

  const [postModalAberto, setPostModalAberto] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [carregandoPost, setCarregandoPost] = useState(false);

  const senhaCorreta = '40028922ligueagoraeganhejaenãodeixeparadepois';

  const fazerLogin = () => {
    if (senha === senhaCorreta) {
      localStorage.setItem('adminLogado', 'true');
      setLogado(true);
    } else {
      alert('Senha incorreta!');
    }
  };

  const sair = () => {
    localStorage.removeItem('adminLogado');
    setLogado(false);
    setDenuncias([]);
  };

  useEffect(() => {
    if (!logado) return;

    setCarregando(true);
    fetch('http://localhost:5124/api/denuncias/listar-denuncias')
      .then(res => res.json())
      .then(data => {
        setDenuncias(data);
        setCarregando(false);
      })
      .catch(error => {
        console.error("Erro ao buscar denúncias:", error);
        setCarregando(false);
      });
  }, [logado]);

  const deletarDenuncia = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar esta denúncia?")) return;

    try {
      const res = await fetch(`http://localhost:5124/api/denuncias/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.mensagem);
        setDenuncias(prev => prev.filter(d => d.id !== id));
      } else {
        alert(data.erro || "Erro ao deletar denúncia.");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("Falha na conexão com o servidor.");
    }
  };

  // Função para abrir o modal e carregar o post pelo id
  const abrirModalPost = async (postId) => {
    setCarregandoPost(true);
    setPostModalAberto(true);

    try {
      const res = await fetch(`http://localhost:5124/api/Feed/feed-porID/${postId}`);
      if (!res.ok) {
        alert("Post não encontrado");
        setPostModalAberto(false);
        return;
      }
      const data = await res.json();
      setPostSelecionado(data);
    } catch (error) {
      alert("Erro ao buscar post");
      setPostModalAberto(false);
    } finally {
      setCarregandoPost(false);
    }
  };

  // Função para deletar post
 const deletarPost = async (postId) => {
  if (!window.confirm("Tem certeza que deseja deletar este post?")) return;

  try {
    const res = await fetch(`http://localhost:5124/api/Feed/${postId}`, {
      method: 'DELETE',
    });

    const data = await res.json();

    if (res.ok) {
      alert("Post deletado com sucesso!");
      setPostModalAberto(false);

      // Remove as denúncias relacionadas a esse post
      setDenuncias(prevDenuncias => prevDenuncias.filter(d => d.postId !== postId));
    } else {
      alert(data.erro || "Erro ao deletar post.");
    }
  } catch (err) {
    alert("Falha na conexão com o servidor.");
  }
};

  if (!logado) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Login do Administrador</h2>
        <input
          type="password"
          placeholder="Digite a senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button onClick={fazerLogin}>Entrar</button>
      </div>
    );
  }

  if (carregando) return <p>Carregando denúncias...</p>;

  return (
    <div style={{ padding: '20px' }}>
<div className="container">
  <h2>Painel de Denúncias</h2>
  <button onClick={sair} className="btn-sair">Sair</button>
  
  {denuncias.length === 0 ? (
    <p className="msg-centralizada">Nenhuma denúncia registrada.</p>
  ) : (
    denuncias.map(denuncia => (
      <div key={denuncia.id} className="card-denuncia">
        <p><strong>Post:</strong> {denuncia.postId}</p>
        <p><strong>Usuário:</strong> {denuncia.usuarioId}</p>
        <p><strong>Descrição:</strong> {denuncia.descricao}</p>
        <p><strong>Data:</strong> {new Date(denuncia.dataDenuncia).toLocaleString()}</p>
        <button onClick={() => deletarDenuncia(denuncia.id)} className="btn-deletar-denuncia">
          Deletar Denúncia
        </button>
        <button onClick={() => abrirModalPost(denuncia.postId)} className="btn-ver-post">
          Ver Post
        </button>
      </div>
    ))
  )}

  {postModalAberto && (
    <div className="modal-fundo">
      <div className="modal-conteudo">
        <button onClick={() => setPostModalAberto(false)} className="btn-fechar">&times;</button>

        {carregandoPost ? (
          <p>Carregando post...</p>
        ) : postSelecionado ? (
          <>
            <h3>Post de {postSelecionado.nomeAutor || 'Desconhecido'}</h3>
            <p><strong>Conteúdo:</strong> {postSelecionado.conteudo}</p>
            {postSelecionado.imagem && <img src={postSelecionado.imagem} alt="Post" />}
            {postSelecionado.video && (
              <video controls>
                <source src={postSelecionado.video} type="video/mp4" />
                Seu navegador não suporta vídeo.
              </video>
            )}
            <p><strong>Data da Postagem:</strong> {new Date(postSelecionado.dataPostagem).toLocaleString()}</p>
            <p><strong>Curtidas:</strong> {postSelecionado.curtidas}</p>
            <p><strong>Comentários:</strong> {postSelecionado.comentarios}</p>
            <p><strong>Tags:</strong> {postSelecionado.tags?.join(', ')}</p>

            <button onClick={() => deletarPost(postSelecionado.id)} className="btn-deletar-post">
              Deletar Post
            </button>
          </>
        ) : (
          <p>Post não encontrado.</p>
        )}
      </div>
    </div>
  )}
</div>
    </div>
  );
}

export default DenunciasAdmin;
