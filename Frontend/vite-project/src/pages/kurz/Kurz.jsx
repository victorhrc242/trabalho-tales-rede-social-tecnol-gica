import React, { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import Comentario from '../../Components/Comentario';
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
      {/* <button className="mute-btn" onClick={toggleMute}>
        {isMuted ? '🔇' : '🔊'}
      </button> */}
    </div>
  );
}

const Kurz = () => {
  const [videos, setVideos] = useState([]);
  const [curtidas, setCurtidas] = useState({});
  const [usuarioCurtidas, setUsuarioCurtidas] = useState([]);
  const [videoAtual, setVideoAtual] = useState(0);
  const [modalComentarios, setModalComentarios] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/videos');
        const data = await res.json();
        setVideos(data);

        const likes = {};
        data.forEach(v => {
          likes[v.id] = v.curtidas || 0;
        });
        setCurtidas(likes);
      } catch (e) {
        console.error(e);
      }
    }
    fetchVideos();
  }, []);

  // Scroll controlado com setas e roda do mouse
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

  // Scroll para o vídeo atual
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const target = container.children[videoAtual];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [videoAtual]);

  const abrirComentarios = (post) => {
    setPostSelecionado(post);
    setModalComentarios(true);
    setComentarioTexto('');
  };

  const fecharComentarios = () => {
    setModalComentarios(false);
    setPostSelecionado(null);
  };

  const curtirPost = (postId) => {
    setCurtidas(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));

    if (!usuarioCurtidas.includes(postId)) {
      setUsuarioCurtidas(prev => [...prev, postId]);
    }
  };

  const comentar = () => {
    if (!comentarioTexto.trim() || !postSelecionado) return;

    const novoComentario = {
      id: Date.now(),
      autorNome: 'Você',
      conteudo: comentarioTexto.trim(),
      autorImagem: null,
    };

    const novosVideos = videos.map(v => {
      if (v.id === postSelecionado.id) {
        return {
          ...v,
          comentarios: [...(v.comentarios || []), novoComentario],
        };
      }
      return v;
    });

    setVideos(novosVideos);

    setPostSelecionado(prev => ({
      ...prev,
      comentarios: [...(prev.comentarios || []), novoComentario],
    }));

    setComentarioTexto('');
  };

  if (!videos.length) return <div className="kurz-loading">Carregando vídeos...</div>;

  return (
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
            <p className="video-caption-text">{video.caption || 'Sem legenda'}</p>
          </div>

          <div className="video-icons">
            <button onClick={() => curtirPost(video.id)}>
              <Heart
                size={28}
                color={curtidas[video.id] > 0 ? 'red' : 'white'}
                fill={curtidas[video.id] > 0 ? 'red' : 'none'}
              />
              <span>{curtidas[video.id]}</span>
            </button>
            <button onClick={() => abrirComentarios(video)}>
              <MessageCircle size={28} color="white" />
              <span>{video.comentarios?.length || 0}</span>
            </button>
          </div>
        </div>
      ))}

      {modalComentarios && postSelecionado && (
        <Comentario
          post={postSelecionado}
          comentarios={postSelecionado.comentarios || []}
          comentarioTexto={comentarioTexto}
          setComentarioTexto={setComentarioTexto}
          comentar={comentar}
          fechar={fecharComentarios}
          curtirPost={curtirPost}
          usuarioCurtidas={usuarioCurtidas}
        />
      )}
    </div>
  );
};

export default Kurz;
