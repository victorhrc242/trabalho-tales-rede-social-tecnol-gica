import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/home.css';

function Home() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState('');
  const [tags, setTags] = useState('');
  const [modalComentarios, setModalComentarios] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [postSelecionado, setPostSelecionado] = useState(null);

  const irParaPerfil = () => {
    navigate('/Perfil', { state: { userId: usuario.id } });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      try {
        const usuarioObj = JSON.parse(usuarioString);
        setUsuario(usuarioObj);
      } catch (err) {
        console.error('Erro ao analisar os dados do usuário:', err);
        setUsuario({ nome: 'Desconhecido' });
      }
    }

    fetchFeed();
  }, [navigate]);

  const buscarAutorDoPost = async (autorId) => {
    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${autorId}`);
      const data = await response.json();
      return data.nome || 'Autor';
    } catch {
      return 'Autor';
    }
  };

  const fetchFeed = async () => {
    try {
      const response = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/feed');
      const data = await response.json();
      if (response.ok) {
        const postsComAutores = await Promise.all(data.map(async (post) => {
          const autorNome = await buscarAutorDoPost(post.autorId);
          let comentarioDestaque = '';

          try {
            const resComentarios = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/post/${post.id}`);
            const dados = await resComentarios.json();

            if (dados.comentarios.length > 0) {
              const maisCurtido = [...dados.comentarios].sort((a, b) => (b.curtidas || 0) - (a.curtidas || 0))[0];
              const autorComentarioResp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${maisCurtido.autorId}`);
              const autorComentario = await autorComentarioResp.json();
              comentarioDestaque = `${autorComentario.nome || 'Usuário'}: ${maisCurtido.conteudo}`;
            }
          } catch (err) {
            console.error('Erro ao buscar comentário destaque:', err);
          }

          return { ...post, autorNome, comentarioDestaque };
        }));
        setPosts(postsComAutores);
      } else {
        setErro(data.erro || 'Erro ao carregar o feed');
      }
    } catch (err) {
      console.error('Erro ao buscar o feed:', err);
      setErro('Erro ao conectar com o servidor.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const abrirModal = () => {
    setConteudo('');
    setImagem('');
    setTags('');
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
  };

  const handleCriarPost = async (e) => {
    e.preventDefault();

    const novoPost = {
      autorId: usuario.id,
      conteudo,
      imagem,
      tags: tags.split(',').map(tag => tag.trim())
    };

    try {
      const response = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPost)
      });

      if (response.ok) {
        await response.json();
        fetchFeed();
        fecharModal();
      } else {
        const erroResp = await response.json();
        setErro(erroResp.erro || 'Erro ao criar o post');
      }
    } catch (err) {
      console.error('Erro ao criar post:', err);
      setErro('Erro de conexão com o servidor.');
    }
  };

  const curtirPost = async (postId) => {
    try {
      await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/curtir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, usuarioId: usuario.id })
      });
      fetchFeed();
    } catch (err) {
      console.error('Erro ao curtir:', err);
    }
  };

  const abrirComentarios = async (post) => {
    setPostSelecionado(post);
    setComentarioTexto('');
    setComentarios([]);
    setModalComentarios(true);

    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/post/${post.id}`);
      const data = await response.json();

      const comentariosComNomes = await Promise.all(
        data.comentarios.map(async (comentario) => {
          try {
            const autorResp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${comentario.autorId}`);
            const autorData = await autorResp.json();
            return {
              ...comentario,
              autorNome: autorData.nome || 'Usuário'
            };
          } catch {
            return {
              ...comentario,
              autorNome: 'Usuário'
            };
          }
        })
      );

      setComentarios(comentariosComNomes);
    } catch (err) {
      console.error('Erro ao carregar comentários:', err);
    }
  };

  const comentar = async () => {
    if (!comentarioTexto.trim()) return;

    const comentario = {
      postId: postSelecionado.id,
      autorId: usuario.id,
      conteudo: comentarioTexto
    };

    try {
      await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comentario)
      });

      setComentarioTexto('');
      abrirComentarios(postSelecionado);
      fetchFeed();
    } catch (err) {
      console.error('Erro ao comentar:', err);
    }
  };

  const fecharComentarios = () => {
    setModalComentarios(false);
    setPostSelecionado(null);
  };

  return (
    <div className="home-container">
      <h1>Olá, {usuario.nome}!</h1>
      <button onClick={handleLogout}>Sair</button>
      <button onClick={abrirModal} style={{ marginLeft: '10px' }}>Criar Post</button>
      <button onClick={irParaPerfil}>Ir para meu perfil</button>
      <hr />
      <h2>Feed</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {posts.length === 0 && !erro && <p>Nenhum post encontrado.</p>}

      <ul>
        {posts.map(post => (
          <li key={post.id} style={{ marginBottom: '20px' }}>
            <p><strong>Autor:</strong> {post.autorNome}</p>
            <p><strong>Conteúdo:</strong> {post.conteudo}</p>
            {post.imagem && (
              <img src={post.imagem} alt="Imagem do post" style={{ maxWidth: '300px' }} />
            )}
            <p><strong>Tags:</strong> {post.tags?.join(', ')}</p>
            <p><strong>Data:</strong> {new Date(post.dataPostagem).toLocaleString()}</p>
            <p><strong>Curtidas:</strong> {post.curtidas} | <strong>Comentários:</strong> {post.comentarios}</p>
            {post.comentarioDestaque && (
              <p><em>💬 {post.comentarioDestaque}</em></p>
            )}
            <button onClick={() => curtirPost(post.id)} title="Curtir">
              <svg width="24" height="24" fill={post.usuarioCurtiu ? "red" : "transparent"} stroke="red" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                  2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
                  4.5 2.09C13.09 3.81 14.76 3 16.5 3 
                  19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                  6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
            <button onClick={() => abrirComentarios(post)} style={{ marginLeft: '10px' }}>Comentar</button>
            <hr />
          </li>
        ))}
      </ul>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Criar Novo Post</h2>
            <form onSubmit={handleCriarPost}>
              <textarea placeholder="Escreva algo..." value={conteudo} onChange={(e) => setConteudo(e.target.value)} required />
              <input type="text" placeholder="URL da imagem (opcional)" value={imagem} onChange={(e) => setImagem(e.target.value)} />
              <input type="text" placeholder="Tags separadas por vírgula" value={tags} onChange={(e) => setTags(e.target.value)} />
              <br />
              <button type="submit">Publicar</button>
              <button type="button" onClick={fecharModal} style={{ marginLeft: '10px' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {modalComentarios && postSelecionado && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Comentários</h2>
            <p><strong>Post:</strong> {postSelecionado.conteudo}</p>
            <ul>
              {comentarios.map((comentario) => (
                <li key={comentario.id}>
                  <strong>{comentario.autorNome}:</strong> {comentario.conteudo}
                </li>
              ))}
            </ul>
            <textarea
              placeholder="Digite seu comentário"
              value={comentarioTexto}
              onChange={(e) => setComentarioTexto(e.target.value)}
            />
            <button onClick={comentar}>Comentar</button>
            <button onClick={fecharComentarios} style={{ marginLeft: '10px' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
