import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import { Heart, MessageCircle } from 'lucide-react';
import '../css/home.css';

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
useEffect(() => {
  if (usuario.id) {
    fetchFeed();
  }
}, [usuario]);
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('https://devisocial.up.railway.app/feedHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log('✅ SignalR conectado na Home');

        connection.on('NovoPost', (novoPost) => {
          console.log('📥 Novo post recebido via SignalR:', novoPost);
          setPosts(prev => [novoPost, ...prev]);
        });
      })
      .catch((err) => {
        console.error('Erro ao conectar ao SignalR na Home:', err);
      });

    return () => {
      connection.stop().then(() => console.log('🔌 SignalR desconectado da Home'));
    };
  }, []);

  const fetchFeed = async () => {
    try {
       if (!usuario.id) return;

  const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/feed-completo/${usuario.id}`);

      const data = await response.json();

      if (response.ok) {
        const postsComAutores = await Promise.all(
          data.map(async (post) => {
            try {
              const autorResp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${post.autorId}`);
              const autorData = await autorResp.json();
              return {
                ...post,
                autorNome: autorData.nome_usuario || 'Usuário',
                autorImagem: autorData.imagem || null,
              };
            } catch {
              return {
                ...post,
                autorNome: 'Usuário',
                autorImagem: null,
              };
            }
          })
        );

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

  const irParaPerfil = (usuarioId) => {
    navigate('/Perfil', { state: { userId: usuarioId } });
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
      const response = await fetch('https://devisocial.up.railway.app/api/Feed/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPost)
      });

      if (response.ok) {
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
      await fetch('https://devisocial.up.railway.app/api/Curtida/curtir', {
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
      const response = await fetch(`https://devisocial.up.railway.app/api/Comentario/comentarios/${post.id}`);
      const data = await response.json();

      const comentariosComNomes = await Promise.all(
        data.comentarios.map(async (comentario) => {
          try {
            const autorResp = await fetch(`https://devisocial.up.railway.app/api/auth/usuario/${comentario.autorId}`);
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
      await fetch('https://devisocial.up.railway.app/api/Comentario/comentar', {
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

  return (
    <div className="home-container">
      <hr />
      <h2>Feed</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {posts.length === 0 && !erro && <p>Nenhum post encontrado.</p>}

      <ul>
        {posts.map(post => (
          <li key={post.id} style={{ marginBottom: '20px' }}>
          <div className="autor-container">
  <img
    src={post.autorImagem || 'https://sigeventos.unifesspa.edu.br/sigeventos/verArquivo?idArquivo=899786&key=7b31619566f4f78b8a447ec38d196e12'}
    alt={`Foto de perfil de ${post.autorNome}`}
    onClick={() => irParaPerfil(post.autorId)}
  />
  <span className="autor-nome" onClick={() => irParaPerfil(post.autorId)}>{post.autorNome}</span>
</div>


{post.imagem && (
  <img src={post.imagem} alt="Imagem do post" className="imagem-post-feed" />
)}

<div className="botoes-post">

  <button className="botao-acao" onClick={() => curtirPost(post.id)}>
    <Heart
      size={20}
      color={post.curtidas > 0 ? 'red' : 'black'}
      fill={post.curtidas > 0 ? 'red' : 'none'}
      style={{ marginRight: '5px' }}
    />
   {/* Mostra a contagem só se o usuário for o dono do post */}
   {usuario?.id === post.autorId && post.curtidas !== undefined && `(${post.curtidas})`}
  </button>

  <button className="botao-acao" onClick={() => abrirComentarios(post)}>
    <MessageCircle size={20} style={{ marginRight: '5px' }} />
    ({post.comentarios})
  </button>
</div>

<div className="post-description">
  <p>
    {post.conteudo}
    {post.tags && post.tags.length > 0 && (
      <>
        {' '}
        {post.tags.map(tag => `#${tag.trim()}`).join(' ')}
      </>
    )}
  </p>
  <p>{new Date(post.dataPostagem).toLocaleString()}</p>
</div>

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
              <button className='button-confirme' type="submit">Enviar</button>
              <button className='button-cancel' type="button" onClick={fecharModal} style={{ marginLeft: '10px' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

    {modalComentarios && postSelecionado && (
      <div className="modal-overlay">
        <div className="comentarios-modal">
      <div className="imagem-container">
        <img
          src={postSelecionado.imagem}
          alt="Imagem do post"
          className="imagem-post"
        />
      </div>
       <div className="comentarios-container">
         <div className="comentarios-header">
           <strong>{postSelecionado.autorNome}</strong>
          </div>
      <div className="comentarios-lista">
  {comentarios.map((c, i) => (
    <div key={i} className="comentario-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <img
        src={c.autorImagem || 'https://sigeventos.unifesspa.edu.br/sigeventos/verArquivo?idArquivo=899786&key=7b31619566f4f78b8a447ec38d196e12'}
        alt={`Foto de perfil de ${c.autorNome}`}
        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '10px' }}
      />
      <span><strong>{c.autorNome}</strong>: {c.conteudo}</span>
    </div>
  ))}
</div>
          <div className="comentarios-form">
             <input
    type="text"
    placeholder="Adicione um comentário..."
    value={comentarioTexto}
    onChange={(e) => setComentarioTexto(e.target.value)}
  />
             <button onClick={comentar}>Enviar</button>
           </div>
              <button className="fechar-modal" onClick={() => setModalComentarios(false)}>×</button>
          </div>
        </div>
        </div>
    )}
    </div>
  );
}

export default Home;
