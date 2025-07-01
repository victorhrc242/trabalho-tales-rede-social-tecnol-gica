import React, { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import './kurz_css.css';

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

  const toggleMute = e => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    videoRef.current.paused
      ? videoRef.current.play().catch(() => {})
      : videoRef.current.pause();
  };

  return (
    <div className="video-wrapper">
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
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  const [videoAtual, setVideoAtual] = useState(0);
  const [modalComentarios, setModalComentarios] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [comentariosAtuais, setComentariosAtuais] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const containerRef = useRef(null);

  // Detecta se é mobile (width <= 768)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/videos');
        const data = await res.json();

        const videosComAutor = await Promise.all(
          data.map(async (video) => {
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

        setVideos(videosComAutor);

        const likes = {};
        videosComAutor.forEach(v => {
          likes[v.id] = v.curtidas || 0;
        });
        setCurtidas(likes);
      } catch (e) {
        console.error(e);
      }
    }
    fetchVideos();
  }, []);

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

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const target = container.children[videoAtual];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [videoAtual]);

  // Abrir modal de comentários e carregar comentários via API
  const abrirComentarios = async (post) => {
    setPostSelecionado(post);
    setModalComentarios(true);
    setComentarioTexto('');
    try {
      const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`);
      const data = await res.json();
      setComentariosAtuais(data.comentarios || []);
    } catch (e) {
      console.error('Erro ao carregar comentários:', e);
      setComentariosAtuais([]);
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
      const jaCurtiu = data.curtidas?.some(c => c.usuarioId === usuario.id);

      const endpoint = jaCurtiu ? descurtirUrl : curtirUrl;
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, usuarioId: usuario.id }),
      });

      setCurtidas(prev => ({
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
      // Atualizar comentários após enviar
      const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${postSelecionado.id}`);
      const data = await res.json();
      setComentariosAtuais(data.comentarios || []);
    } catch (e) {
      console.error('Erro ao enviar comentário:', e);
    }
  };

  if (!videos.length) return <div className="kurz-loading">Carregando vídeos...</div>;

  return (
    <>
      <div className="kurz-feed" ref={containerRef}>
        {videos.map((video, index) => (
          <div className="kurz-card" key={video.id}>
            <VideoPlayer
              videoUrl={video.video}
              isActive={videoAtual === index}
            />

            <div className="video-overlay-info">
              <div className="video-author">
                <img
                  src={video.autorImagem || 'https://i.pravatar.cc/40'}
                  alt={video.autorNome}
                  className="video-author-avatar"
                />
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
                <span>{curtidas[video.id]}</span>
              </button>
              <button onClick={() => abrirComentarios(video)} aria-label="Comentários">
                <MessageCircle size={28} color="white" />
                <span>{video.comentarios?.length || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

     {modalComentarios && !isMobile && (
  <div
    className="modal-lateral-direito-container"
    onClick={fecharComentarios}
  >
    <div
      className="modal-lateral-direito-conteudo"
      onClick={(e) => e.stopPropagation()}
    >
      <button className="fechar-modal-btn" onClick={fecharComentarios}>
        ×
      </button>
      <h3>Comentários</h3>

      <div className="comentarios-lista">
        {comentariosAtuais.length === 0 && <p>Nenhum comentário ainda.</p>}

        {comentariosAtuais.map((c) => (
          <div key={c.id || c._id || Math.random()} className="comentario-item">
            <img
              src={
                c.autorImagem ||
                'https://sigeventos.unifesspa.edu.br/sigeventos/verArquivo?idArquivo=899786&key=7b31619566f4f78b8a447ec38d196e12'
              }
              alt={`Foto de ${c.autorNome || 'Usuário'}`}
              className="comentario-avatar"
            />
            <div className="comentario-conteudo">
              <strong>{c.autorNome || 'Usuário'}</strong>
              <p>{c.conteudo}</p>
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
      }

      .fechar-modal-btn {
        font-size: 2rem;
        background: none;
        border: none;
        cursor: pointer;
        align-self: flex-end;
      }

      .comentarios-lista {
        flex: 1;
        overflow-y: auto;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */
      }
      .comentarios-lista::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
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
        border-radius: 4px;
        cursor: pointer;
        border-radius: 20px;
      }
    `}</style>
  </div>
)}

    </>
  );
};

export default Kurz;
