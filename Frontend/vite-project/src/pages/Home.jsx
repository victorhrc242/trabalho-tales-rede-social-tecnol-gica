// Components/Home.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import FeedItem from '../Components/Home/FeedItem';
import Comentario from '../Components/Comentario';
import '../css/home.css';
import { FaSearch, FaBell } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState('');
  const [modalComentarios, setModalComentarios] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [videoAtivoId, setVideoAtivoId] = useState(null);
  const videoRefs = useRef({});

  // Registra a referência dos vídeos para o observer de interseção 
  const registerVideoRef = useCallback((postId, node) => {
    if (node) {
      videoRefs.current[postId] = node;
    }
  }, []);

  // Salva localmente os posts no localStorage para cache 
  const salvarPostsLocalmente = (postsParaSalvar) => {
    const dadosFiltrados = postsParaSalvar.slice(0, 5).map(post => ({
      id: post.id,
      conteudo: post.conteudo,
      autorNome: post.autorNome,
      autorImagem: post.autorImagem,
      imagem: post.imagem,
      video: post.video,
      dataPostagem: post.dataPostagem,
      tags: post.tags,
      curtidas: post.curtidas,
      comentarios: post.comentarios,
      autorId: post.autorId,
    }));
    localStorage.setItem('postsSalvos', JSON.stringify(dadosFiltrados));
  };

  // Verifica token e carrega dados do usuário ao montar 
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      try {
        setUsuario(JSON.parse(usuarioString));
      } catch {
        setUsuario({ nome: 'Desconhecido' });
      }
    }
  }, [navigate]);

  //  Tenta carregar posts do cache localStorage antes de buscar na API 
  useEffect(() => {
    const cache = localStorage.getItem('postsSalvos');
    if (cache) {
      try {
        setPosts(JSON.parse(cache));
      } catch (erro) {
        console.error('Erro ao carregar posts do cache:', erro);
      }
    }
  }, []);

  //  Sempre que usuário mudar (ou carregar), busca o feed atualizado 
  useEffect(() => {
    if (usuario.id) fetchFeed();
  }, [usuario.id]); //  Corrigido: adicionado dependência correta para evitar chamadas infinitas 

  const [notificacoes, setNotificacoes] = useState([
    'Você curtiu um post.',
    'Alguém comentou sua foto.',
  ]); // mock inicial

  //  Conexão SignalR para receber novos posts em tempo real 
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/feedHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
      connection.on('NovoPost', (novoPost) => {
        setPosts(prev => [novoPost, ...prev]);
      });
    });

    return () => connection.stop();
  }, []);

  //  Conexão SignalR para atualizações de curtidas em tempo real 
  useEffect(() => {
    const curtidaConnection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/curtidaHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    curtidaConnection.start().then(() => {
      curtidaConnection.on('ReceberCurtida', (postId, usuarioId, foiCurtida) => {
        setPosts(prev =>
          prev.map(post => {
            if (post.id === postId) {
              const curtidasAtualizadas = foiCurtida
                ? (post.curtidas || 0) + 1
                : Math.max(0, (post.curtidas || 0) - 1);
              return { ...post, curtidas: curtidasAtualizadas };
            }
            return post;
          })
        );
      });
    });

    return () => curtidaConnection.stop();
  }, []);

  //  Observer para controlar qual vídeo está ativo (visível) 
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visiveis = entries.filter(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5);
        if (visiveis.length === 0) return setVideoAtivoId(null);
        const postId = visiveis[0].target.getAttribute('data-postid');
        setVideoAtivoId(postId);
      },
      { threshold: 0.5 }
    );

    posts.forEach(post => {
      if (post.video && videoRefs.current[post.id]) {
        observer.observe(videoRefs.current[post.id]);
      }
    });

    return () => {
      posts.forEach(post => {
        if (post.video && videoRefs.current[post.id]) {
          observer.unobserve(videoRefs.current[post.id]);
        }
      });
    };
  }, [posts]);

  //  Busca os posts do feed da API e adiciona dados do autor 
  const fetchFeed = async () => {
    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/feed/${usuario.id}`);
      const data = await response.json();

      if (response.ok) {
        const postsComAutores = await Promise.all(
          data.map(async post => {
            try {
              const resp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${post.autorId}`);
              const autor = await resp.json();
              return { ...post, autorNome: autor.nome_usuario || 'Usuário', autorImagem: autor.imagem || null };
            } catch {
              return { ...post, autorNome: 'Usuário', autorImagem: null };
            }
          })
        );
        setPosts(postsComAutores);
        salvarPostsLocalmente(postsComAutores);
      } else {
        setErro(data.erro || 'Erro ao carregar o feed');
      }
    } catch {
      setErro('Erro ao conectar com o servidor.');
    }
  };

  //  Função para curtir ou descurtir um post 
  const curtirPost = async (postId) => {
    const verificarUrl = `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/post/${postId}`;
    const curtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/curtir';
    const descurtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/descurtir';

    try {
      const res = await fetch(verificarUrl, { method: 'GET' });
      const data = await res.json();
      const jaCurtiu = data.curtidas?.some(c => c.usuarioId === usuario.id);

      const endpoint = jaCurtiu ? descurtirUrl : curtirUrl;
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, usuarioId: usuario.id }),
      });
    } catch (err) {
      console.error('Erro ao curtir/descurtir:', err);
    }
  };

  //  Abre modal de comentários carregando os comentários do post 
  const abrirComentarios = async (post) => {
    setPostSelecionado(post);
    setComentarioTexto('');
    setComentarios([]);
    setModalComentarios(true);

    try {
      const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`);
      const data = await res.json();

      const comentariosComNomes = await Promise.all(
        data.comentarios.map(async comentario => {
          try {
            const r = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${comentario.autorId}`);
            const u = await r.json();
            return { ...comentario, autorNome: u.nome || 'Usuário' };
          } catch {
            return { ...comentario, autorNome: 'Usuário' };
          }
        })
      );

      setComentarios(comentariosComNomes);
    } catch (err) {
      console.error('Erro ao carregar comentários:', err);
    }
  };

  // Envia um novo comentário e atualiza os dados do post 
  const comentar = async () => {
    if (!comentarioTexto.trim()) return;
    const comentario = { postId: postSelecionado.id, autorId: usuario.id, conteudo: comentarioTexto };

    try {
      await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comentario),
      });
      setComentarioTexto('');
      abrirComentarios(postSelecionado);
      fetchFeed();
    } catch (err) {
      console.error('Erro ao comentar:', err);
    }
  };

  //  Navega para o perfil do usuário 
  const irParaPerfil = (id) => {
    navigate(`/perfil/${id}`, { state: { userId: id } });
  };

  //  Salva os posts periodicamente no localStorage para cache 
  useEffect(() => {
    const i = setInterval(() => {
      if (posts.length > 0) salvarPostsLocalmente(posts);
    }, 10000);
    return () => clearInterval(i);
  }, [posts]);

  // Buscar
  const [resultadosBusca, setResultadosBusca] = useState([]);

  //Busca usuários pelo termo digitado 
  const buscarUsuarios = async (termo) => {
    if (!termo.trim()) {
      setResultadosBusca([]);
      return;
    }
    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario`);
      const data = await response.json();

      if (Array.isArray(data)) {
        const resultadosFiltrados = data.filter(u =>
          u.nome_usuario?.toLowerCase().startsWith(termo.toLowerCase())
        );
        setResultadosBusca(resultadosFiltrados);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setResultadosBusca([]);
    }
  };

  return (
    <div className="pagina-container">
      {/* Feed principal */}
      <div className="home-container">
        <hr /><br /><br />
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        {posts.length === 0 && !erro && <p>Nenhum post encontrado.</p>}

        <ul>
          {posts.map(post => (
            <FeedItem
              key={post.id}
              post={post}
              usuario={usuario}
              videoAtivoId={videoAtivoId}
              curtirPost={curtirPost}
              abrirComentarios={abrirComentarios}
              irParaPerfil={irParaPerfil}
              registerVideoRef={registerVideoRef}
            />
          ))}
        </ul>

        {modalComentarios && postSelecionado && (
          <Comentario
            post={postSelecionado}
            comentarios={comentarios}
            comentarioTexto={comentarioTexto}
            setComentarioTexto={setComentarioTexto}
            comentar={comentar}
            fechar={() => setModalComentarios(false)}
            usuario={usuario}
          />
        )}
      </div>

      {/* Lateral direita: Notificações + busca */}
      <div className="lateral-direita">
        <div style={{ position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', top: '40%', left: '10px', transform: 'translateY(-50%)', color: '#888' }} />
          <input
            type="text"
            placeholder="Buscar usuários..."
            className="barra-pesquisa-usuarios"
            style={{ paddingLeft: '30px', borderRadius: '20px' }}
            onChange={e => buscarUsuarios(e.target.value)}
          />

          {/* Resultados da busca */}
          {resultadosBusca.length > 0 && (
            <ul className="resultados-busca">
              {resultadosBusca.map((usuario, index) => (
                <li
                  key={index}
                  onClick={() => irParaPerfil(usuario.id)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0' }}
                >
                  <img
                    src={usuario.imagem || 'https://via.placeholder.com/40'}
                    alt="avatar"
                    className="avatar-busca"
                    style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                  />
                  <span>{usuario.nome_usuario || usuario.nome}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="notificacoes-box">
          <h4 style={{ textAlign: 'center' }}>
            <FaBell style={{ marginRight: '6px' }} /> Notificações
          </h4>
          <ul>
            {notificacoes.map((n, index) => (
              <li key={index}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
