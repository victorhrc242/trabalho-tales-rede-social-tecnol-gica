import React, { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import './kurz_css.css';
import Comentario from '../../Components/Comentario';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Erro no Comentario:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h2>Erro ao carregar os comentários.</h2>
          <pre>{this.state.error?.toString()}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function VideoPlayer({ videoUrl, isActive }) {
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
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
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
    <div className="video-wrapper" onClick={toggleMute}>
      <video
        ref={videoRef}
        src={videoUrl}
        muted={isMuted}
        loop
        playsInline
        className="video"
        onClick={handleVideoClick}
      />
    </div>
  );
}

const Kurz = () => {
  const [videos, setVideos] = useState([]);
  const [curtidas, setCurtidas] = useState({});
  const [comentariosCount, setComentariosCount] = useState({});
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  const [videoAtual, setVideoAtual] = useState(0);
  const [modalComentarios, setModalComentarios] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [comentariosAtuais, setComentariosAtuais] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const containerRef = useRef(null);
  const [usuarioCurtidas, setUsuarioCurtidas] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Paginação
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 10;
  const [carregando, setCarregando] = useState(false);
  const [temMais, setTemMais] = useState(true);

  // Ajusta isMobile ao redimensionar
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Incrementa página se estiver perto do fim da lista
  useEffect(() => {
    if (videoAtual >= videos.length - 2 && temMais && !carregando) {
      setPagina((prev) => prev + 1);
    }
  }, [videoAtual, videos.length, temMais, carregando]);

  // Pega usuário do localStorage
  useEffect(() => {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      try {
        setUsuario(JSON.parse(usuarioString));
      } catch {
        setUsuario({ nome: 'Desconhecido' });
      }
    }
  }, []);

const carregarVideos = async (paginaAtual) => {
  setCarregando(true);
  console.log(`Carregando página ${paginaAtual}...`);

  try {
    const resposta = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/videos?page=${paginaAtual}&pageSize=${POR_PAGINA}`);
    const data = await resposta.json();

    if (!Array.isArray(data.videos)) {
      console.error('Esperado um array em data.videos, mas recebeu:', data.videos);
      setTemMais(false);
      return;
    }

    // Se a página retornou 0 vídeos, chegamos ao fim
    if (data.videos.length === 0) {
      console.log(`Página ${paginaAtual} sem vídeos. Encerrando paginação.`);
      setTemMais(false);
      return;
    }

    // Enriquecer vídeos com nome/imagem do autor
    const videosComAutor = await Promise.all(
      data.videos.map(async (video) => {
        try {
          const resp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${video.autorId}`);
          const autor = await resp.json();
          return {
            ...video,
            autorNome: autor.nome_usuario || 'Usuário',
            autorImagem: autor.imagem || 'https://i.pravatar.cc/40',
          };
        } catch {
          return {
            ...video,
            autorNome: 'Usuário',
            autorImagem: 'https://i.pravatar.cc/40',
          };
        }
      })
    );

    // Acumula vídeos únicos
    setVideos(prev => {
      const combined = [...prev, ...videosComAutor];
      const unique = combined.filter(
        (v, idx, self) => idx === self.findIndex(item => item.id === v.id)
      );
      return unique;
    });

   


    // 👇 Esses dois estavam fora antes, agora estão dentro corretamente:
    setCurtidas((prev) => {
      const novo = { ...prev };
      videosComAutor.forEach((v) => {
        if (novo[v.id] === undefined) novo[v.id] = v.curtidas || 0;
      });
      return novo;
    });

    setComentariosCount((prev) => {
      const novo = { ...prev };
      videosComAutor.forEach((v) => {
        if (novo[v.id] === undefined) novo[v.id] = v.comentariosCount || 0;
      });
      return novo;
    });

  } catch (erro) {
    console.error('Erro ao carregar vídeos:', erro);
  } finally {
    setCarregando(false); // <- Aqui estava o erro antes: faltava ponto e vírgula antes do `finally`
  }
};

  // Carregar primeira página ou páginas seguintes
useEffect(() => {
  if (temMais && !carregando) {
    carregarVideos(pagina);
    setPagina(prev => prev + 1);
  }
}, [temMais, carregando]);

  // Scroll infinito para carregar mais vídeos
  useEffect(() => {
    const handleScroll = () => {
      if (carregando || !temMais) return;

      const scrollPos = window.innerHeight + window.scrollY;
      const limite = document.documentElement.offsetHeight - 300;

      if (scrollPos >= limite) {
        setPagina((prev) => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [carregando, temMais]);

  // Navegação por teclado e roda do mouse para trocar vídeo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVideoAtual((prev) => Math.min(prev + 1, videos.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVideoAtual((prev) => Math.max(prev - 1, 0));
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        setVideoAtual((prev) => Math.min(prev + 1, videos.length - 1));
      } else {
        setVideoAtual((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (container) container.removeEventListener('wheel', handleWheel);
    };
  }, [videos]);

  // Scroll suave para o vídeo atual
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const target = container.children[videoAtual];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [videoAtual]);

  // Abrir modal de comentários e carregar dados
  const abrirComentarios = async (post) => {
    setPostSelecionado(post);
    setModalComentarios(true);
    setComentarioTexto('');

    try {
      const res = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`
      );
      const data = await res.json();
      const comentarios = data.comentarios || [];

      const comentariosComAutor = await Promise.all(
        comentarios.map(async (comentario) => {
          try {
            const autorRes = await fetch(
              `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${comentario.autorId}`
            );
            const autor = await autorRes.json();

            return {
              ...comentario,
              autorNome: autor.nome_usuario || 'Usuário',
              autorImagem: autor.imagem || 'https://via.placeholder.com/40',
            };
          } catch (error) {
            console.warn('Erro ao buscar autor do comentário', comentario.autorId, error);
            return {
              ...comentario,
              autorNome: 'Usuário',
              autorImagem: 'https://via.placeholder.com/40',
            };
          }
        })
      );

      setComentariosAtuais(comentariosComAutor);

      // Buscar curtidas do usuário logado nesse post
      const curtidasRes = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/post/${post.id}`
      );
      const curtidasData = await curtidasRes.json();

      // IDs dos comentários curtidos pelo usuário
      const curtidosPorUsuario = (curtidasData?.curtidas || [])
        .filter((c) => c.usuarioId === usuario.id && c.tipo === 'comentario')
        .map((c) => c.postId);

      setUsuarioCurtidas(curtidosPorUsuario);
    } catch (e) {
      console.error('Erro ao carregar comentários:', e);
      setComentariosAtuais([]);
      setUsuarioCurtidas([]);
    }
  };

  const fecharComentarios = () => {
    setModalComentarios(false);
    setPostSelecionado(null);
    setComentariosAtuais([]);
    setComentarioTexto('');
  };

  const curtirPost = async (postId) => {
    const verificarUrl = `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/post/${postId}`;
    const curtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/curtir';
    const descurtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/descurtir';

    try {
      const res = await fetch(verificarUrl, { method: 'GET' });
      const data = await res.json();
      const jaCurtiu = data.curtidas?.some((c) => c.usuarioId === usuario.id);

      const endpoint = jaCurtiu ? descurtirUrl : curtirUrl;
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, usuarioId: usuario.id }),
      });

      setCurtidas((prev) => ({
        ...prev,
        [postId]: jaCurtiu ? Math.max(0, (prev[postId] || 0) - 1) : (prev[postId] || 0) + 1,
      }));
    } catch (err) {
      console.error('Erro ao curtir/descurtir:', err);
    }
  };

  const comentar = async () => {
    if (!comentarioTexto.trim() || !postSelecionado) return;

    try {
      await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: postSelecionado.id,
          autorId: usuario.id,
          conteudo: comentarioTexto,
        }),
      });

      setComentarioTexto('');

      // Atualiza comentários após enviar
      const res = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${postSelecionado.id}`
      );
      const data = await res.json();
      setComentariosAtuais(data.comentarios || []);
    } catch (e) {
      console.error('Erro ao enviar comentário:', e);
    }
  };

  if (!videos.length && !carregando)
    return <div className="kurz-loading">Nenhum vídeo disponível.</div>;

  return (
    <>
      <div className="kurz-feed" ref={containerRef}>
        {videos.map((video, index) => (
          <div className="kurz-card" key={`${video.id}-${index}`}>
            <VideoPlayer videoUrl={video.video} isActive={videoAtual === index} />

            <div className="video-overlay-info">
              <div className="video-author">
                <a href={`/perfil/${video.autorId}`} className="video-author-link">
                  <img
                    src={video.autorImagem || 'https://i.pravatar.cc/40'}
                    alt={video.autorNome}
                    className="video-author-avatar"
                  />
                </a>
                <span className="video-author-name">{video.autorNome}</span>
              </div>

              <p className="video-caption-text">{video.conteudo || 'Sem legenda'}</p>
            </div>

            <div className="video-icons">
              <button onClick={() => curtirPost(video.id)} aria-label="Curtir">
                <Heart
                  size={28}
                  color={curtidas[video.id] > 0 ? 'red' : 'white'}
                  fill={curtidas[video.id] > 0 ? 'red' : 'none'}
                />
              </button>
              <button onClick={() => abrirComentarios(video)} aria-label="Comentários">
                <MessageCircle size={28} color="white" />
                <span>{comentariosCount[video.id] || 0}</span>
              </button>
            </div>
          </div>
        ))}
        {carregando && (
          <div style={{ textAlign: 'center', padding: 10, color: '#fff' }}>
            Carregando mais vídeos...
          </div>
        )}
        {!temMais && (
          <div style={{ textAlign: 'center', padding: 10, color: '#888' }}>
            Você chegou ao fim dos vídeos.
          </div>
        )}
      </div>

      {modalComentarios && postSelecionado && (
        <>
          {!isMobile ? (
            <div className="modal-lateral-direito-container" onClick={fecharComentarios}>
              <div className="modal-lateral-direito-conteudo" onClick={(e) => e.stopPropagation()}>
                <button className="fechar-modal-btn" onClick={fecharComentarios}>
                  ×
                </button>
                <h3>Comentários</h3>
                <div className="comentarios-lista">
                  {comentariosAtuais.length === 0 && <p>Nenhum comentário ainda.</p>}
                  {comentariosAtuais.map((c) => (
                    <div key={c.id || c._id || Math.random()} className="comentario-item">
                      <a href={`/perfil/${c.autorId}`} className="comentario-avatar-link">
                        <img
                          src={
                            c.autor?.imagem || c.autorImagem || 'https://via.placeholder.com/40'
                          }
                          alt={`Foto de ${c.autor?.nome_usuario || c.autorNome || 'Usuário'}`}
                          className="comentario-avatar"
                        />
                      </a>
                      <div className="comentario-conteudo">
                        <strong>{c.autor?.nome || c.autorNome || 'Usuário'}</strong>
                        <p>{c.conteudo || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="comentario-input">
                  <input
                    type="text"
                    value={comentarioTexto}
                    onChange={(e) => setComentarioTexto(e.target.value)}
                    placeholder="Escreva um comentário..."
                  />
                  <button onClick={comentar}>Enviar</button>
                </div>
              </div>

              <style>{`
                .modal-lateral-direito-container {
                  position: fixed;
                  top: 0;
                  right: 0;
                  bottom: 0;
                  left: 0;
                  display: flex;
                  justify-content: flex-end;
                  z-index: 9999;
                  background: rgba(0,0,0,0.4);
                }
                .modal-lateral-direito-conteudo {
                  background: #fff;
                  width: 450px;
                  height: 96vh;
                  padding: 16px;
                  display: flex;
                  flex-direction: column;
                  box-shadow: -3px 0 10px rgba(0,0,0,0.1);
                  overflow: hidden;
                  border-radius: 8px 0 0 8px;
                }
                .fechar-modal-btn {
                  font-size: 2rem;
                  background: none;
                  border: none;
                  cursor: pointer;
                  align-self: flex-end;
                  margin-bottom: 10px;
                }
                .comentarios-lista {
                  flex: 1;
                  overflow-y: auto;
                  scrollbar-width: none;
                  -ms-overflow-style: none;
                }
                .comentarios-lista::-webkit-scrollbar {
                  display: none;
                }
                .comentario-item {
                  display: flex;
                  gap: 10px;
                  margin-bottom: 12px;
                  border-bottom: 1px solid #eee;
                  padding-bottom: 8px;
                }
                .comentario-avatar {
                  width: 36px;
                  height: 36px;
                  border-radius: 50%;
                  object-fit: cover;
                }
                .comentario-conteudo p {
                  margin: 4px 0 0 0;
                  font-size: 14px;
                  color: #333;
                }
                .comentario-input {
                  display: flex;
                  gap: 8px;
                  margin-top: 12px;
                }
                .comentario-input input {
                  flex: 1;
                  padding: 8px;
                  border-radius: 4px;
                  border: 1px solid #ccc;
                  font-size: 14px;
                }
                .comentario-input button {
                  padding: 8px 12px;
                  background-color: #007bff;
                  color: white;
                  font-weight: bold;
                  border: none;
                  border-radius: 20px;
                  cursor: pointer;
                }
              `}</style>
            </div>
          ) : (
            <div className={`modal-comentarios ${isMobile ? 'modal-mobile' : ''}`}>
              <ErrorBoundary>
                <Comentario
                  post={postSelecionado}
                  comentarioTexto={comentarioTexto}
                  setComentarioTexto={setComentarioTexto}
                  fechar={fecharComentarios}
                  usuario={usuario}
                  usuarioCurtidas={usuarioCurtidas}
                  setComentarios={setComentariosAtuais}
                />
              </ErrorBoundary>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Kurz;
