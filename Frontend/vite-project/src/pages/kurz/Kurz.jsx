import React, { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import './kurz_css.css';

function VideoPlayer({ videoUrl, isActive }) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
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
      <button className="mute-btn" onClick={toggleMute}>
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

const Kurz = () => {
  const [videos, setVideos] = useState([]);
  const [curtidas, setCurtidas] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [videoAtual, setVideoAtual] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/videos');
        const data = await res.json();
        setVideos(data);
        const likes = {};
        const comments = {};
        data.forEach(v => {
          likes[v.id] = v.curtidas || 0;
          comments[v.id] = v.comentarios || 0;
        });
        setCurtidas(likes);
        setComentarios(comments);
      } catch (err) {
        console.error('Erro ao buscar vídeos:', err);
      }
    };
    fetchVideos();
  }, []);

  const curtir = id => setCurtidas(prev => ({ ...prev, [id]: prev[id] + 1 }));
  const comentar = id => alert(`Abrir comentários do vídeo ID: ${id}`);

  // Foca container ao montar
  useEffect(() => {
    containerRef.current?.focus();
  }, [videos]);

  // Navegação por teclado no container
  const handleKeyDown = e => {
    if (e.key === 'ArrowDown') {
      setVideoAtual(prev => Math.min(prev + 1, videos.length - 1));
    } else if (e.key === 'ArrowUp') {
      setVideoAtual(prev => Math.max(prev - 1, 0));
    }
  };

  useEffect(() => {
    const node = containerRef.current?.children[videoAtual];
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [videoAtual]);

  if (!videos.length) return <div className="kurz-loading">Carregando vídeos...</div>;

  return (
    <div
      className="kurz-feed"
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {videos.map((video, index) => (
        <div key={video.id} className="kurz-card">
          <div className="video-container">
            <VideoPlayer
              videoUrl={video.video}
              isActive={videoAtual === index}
            />
            <div className="video-icons">
              <button onClick={() => curtir(video.id)}>
                <Heart
                  size={28}
                  color={curtidas[video.id] > 0 ? 'red' : 'white'}
                  fill={curtidas[video.id] > 0 ? 'red' : 'none'}
                />
                <span>{curtidas[video.id]}</span>
              </button>
              <button onClick={() => comentar(video.id)}>
                <MessageCircle size={28} color="white" />
                <span>{comentarios[video.id]}</span>
              </button>
            </div>
          </div>
          <div className="video-caption">{video.caption || 'Sem legenda'}</div>
        </div>
      ))}
    </div>
  );
};

export default Kurz;
