import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
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
      const response = await fetch('https://devisocial.up.railway.app/api/Feed/feed');
      const data = await response.json();

      if (response.ok) {
        const postsComAutores = await Promise.all(
          data.map(async (post) => {
            try {
              const autorResp = await fetch(`https://devisocial.up.railway.app/api/auth/usuario/${post.autorId}`);
              const autorData = await autorResp.json();
              return {
                ...post,
                autorNome: autorData.nome || 'Usuário',
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

  const irParaPerfil = () => {
    navigate('/Perfil', { state: { userId: usuario.id } });
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
      const response = await fetch(`https://devisocial.up.railway.app/api/Comentario/post/${post.id}`);
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
      <h1>Olá, {usuario.nome}!</h1>
      <button className='button-exit' onClick={handleLogout}>Sair</button>
      <button onClick={irParaPerfil} style={{ marginLeft: '10px' }}>Ir para meu perfil</button>
      <button onClick={() => setMostrarModal(true)} style={{ marginLeft: '10px' }}>Criar Post</button>

      <hr />
      <h2>Feed</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {posts.length === 0 && !erro && <p>Nenhum post encontrado.</p>}

      <ul>
        {posts.map(post => (
          <li key={post.id} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={post.autorImagem || 'https://sigeventos.unifesspa.edu.br/sigeventos/verArquivo?idArquivo=899786&key=7b31619566f4f78b8a447ec38d196e12'}
                alt={`Foto de perfil de ${post.autorNome}`}
                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
              />
              <p><strong></strong> {post.autorNome}</p>
            </div>
            {post.imagem && (
              <img src={post.imagem} alt="Imagem do post" style={{ maxWidth: '300px' }} />
            )}
            <p><strong>Conteúdo:</strong> {post.conteudo}</p>
            <p><strong>Tags:</strong> {post.tags?.join(', ')}</p>
            <p><strong>Data:</strong> {new Date(post.dataPostagem).toLocaleString()}</p>
            <p><strong>Curtidas:</strong> {post.curtidas} | <strong>Comentários:</strong> {post.comentarios}</p>
            <button onClick={() => curtirPost(post.id)}>Curtir</button>
            <button onClick={() => abrirComentarios(post)} style={{ marginLeft: '10px' }}>Comentar</button>
            <hr />
          </li>
        ))}
      </ul>

      {/* Criar novo post */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Criar Novo Post</h2>
            <form onSubmit={handleCriarPost}>
              <textarea placeholder="Escreva algo..." value={conteudo} onChange={(e) => setConteudo(e.target.value)} required />
              <input type="text" placeholder="URL da imagem (opcional)" value={imagem} onChange={(e) => setImagem(e.target.value)} />
              <input type="text" placeholder="Tags separadas por vírgula" value={tags} onChange={(e) => setTags(e.target.value)} />
              <br />
              <button className='button-confirme' type="submit">Publicar</button>
              <button className='button-cancel' type="button" onClick={fecharModal} style={{ marginLeft: '10px' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {modalComentarios && postSelecionado && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Comentários</h2>
            <p><strong>Post:</strong> {postSelecionado.conteudo}</p>
            <div>
              {comentarios.map((c, i) => (
                <p key={i}><strong>{c.autorNome}:</strong> {c.conteudo}</p>
              ))}
            </div>
            <textarea
              placeholder="Digite seu comentário..."
              value={comentarioTexto}
              onChange={(e) => setComentarioTexto(e.target.value)}
            />
            <br />
            <button onClick={comentar}>Comentar</button>
            <button onClick={() => setModalComentarios(false)} style={{ marginLeft: '10px' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
