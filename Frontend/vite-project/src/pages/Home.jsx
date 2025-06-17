import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import { Heart, MessageCircle } from 'lucide-react';
import '../css/home.css';
import Comentario from '../Components/Comentario.jsx';

function VideoPlayer({ videoUrl, isActive, className }) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVideoClick = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        muted={isMuted}
        loop
        playsInline
        className={className}
        onClick={handleVideoClick}
        style={{
          width: '120%', // Agora ocupa 120% do container para dar zoom
          height: '600px',
          objectFit: 'cover',
          borderRadius: '12px',
          display: 'block',
          margin: '0 auto',
          cursor: 'pointer',
          backgroundColor: 'black',
        }}
      >
        Seu navegador não suporta vídeos.
      </video>
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 30,
          height: 30,
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: '30px',
          textAlign: 'center',
          padding: 0,
        }}
        aria-label={isMuted ? 'Desmutar vídeo' : 'Mutar vídeo'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

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

  const [videoAtivoId, setVideoAtivoId] = useState(null);
  const videoRefs = useRef({});

  const registerVideoRef = useCallback((postId, node) => {
    if (node) {
      videoRefs.current[postId] = node;
    }
  }, []);

  // Função para salvar os posts localmente (cache)
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
  }, [navigate]);

  // Carregar posts do cache ao montar
  useEffect(() => {
    const cache = localStorage.getItem('postsSalvos');
    if (cache) {
      try {
        const dadosCache = JSON.parse(cache);
        setPosts(dadosCache);
        console.log('⚡ Feed carregado do cache');
      } catch (err) {
        console.error('Erro ao ler o cache dos posts:', err);
      }
    }
  }, []);

  // Quando o usuário estiver setado, busca o feed
  useEffect(() => {
    if (usuario.id) {
      fetchFeed();
    }
  }, [usuario]);

  // SignalR para novos posts
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/feedHub', {
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

  // IntersectionObserver para controlar qual vídeo está ativo (visível)
  useEffect(() => {
    if (!posts.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visiveis = entries.filter(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5);

        if (visiveis.length === 0) {
          setVideoAtivoId(null);
          return;
        }

        // Pega o primeiro vídeo visível
        const primeiroVisivel = visiveis[0];
        const postId = primeiroVisivel.target.getAttribute('data-postid');
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

  // Função para buscar feed do backend e salvar localmente
  const fetchFeed = async () => {
    try {
      if (!usuario.id) return;

      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/feed/${usuario.id}`);
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
        salvarPostsLocalmente(postsComAutores);
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

  const curtirPost = async (postId) => {
    try {
      await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/curtir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, usuarioId: usuario.id }),
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
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`);
      const data = await response.json();

      const comentariosComNomes = await Promise.all(
        data.comentarios.map(async (comentario) => {
          try {
            const autorResp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${comentario.autorId}`);
            const autorData = await autorResp.json();
            return {
              ...comentario,
              autorNome: autorData.nome || 'Usuário',
            };
          } catch {
            return {
              ...comentario,
              autorNome: 'Usuário',
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
      conteudo: comentarioTexto,
    };

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

  const irParaPerfil = (id) => {
    navigate(`/perfil/${id}`);
  };

  // Salvar posts no cache a cada 10 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (posts.length > 0) {
        salvarPostsLocalmente(posts);
        console.log('💾 Posts salvos no cache a cada 10 segundos');
      }
    }, 10000);

    return () => clearInterval(intervalo);
  }, [posts]);

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
                style={{ cursor: 'pointer' }}
              />
              <span className="autor-nome" onClick={() => irParaPerfil(post.autorId)} style={{ cursor: 'pointer' }}>
                {post.autorNome}
              </span>
            </div>

            {post.imagem && (
              <img src={post.imagem} alt="Imagem do post" className="imagem-post-feed" />
            )}

            {post.video && (
              <div data-postid={post.id} ref={node => registerVideoRef(post.id, node)}>
                <VideoPlayer
                  className="imagem-post-feed"
                  videoUrl={post.video}
                  isActive={videoAtivoId === String(post.id)}
                />
              </div>
            )}

            <div className="botoes-post">
              <button className="botao-acao" onClick={() => curtirPost(post.id)}>
                <Heart
                  size={20}
                  color={post.curtidas > 0 ? 'red' : 'black'}
                  fill={post.curtidas > 0 ? 'red' : 'none'}
                  style={{ marginRight: '5px' }}
                />
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

      {modalComentarios && postSelecionado && (
      <Comentario
  post={postSelecionado}
  comentarios={comentarios}
  comentarioTexto={comentarioTexto}
  setComentarioTexto={setComentarioTexto}
  comentar={comentar}
  fechar={() => setModalComentarios(false)}
  usuario={usuario} // Passando o usuário para a função de curtida
/>


      )}
   


    </div>
    
  );
}

export default Home;
