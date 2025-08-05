// Components/VideoPlayer.jsx
import React, { useRef, useState, useEffect } from 'react';

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

        // quero que voce faça com que o whidth do video fique 100% porem continue centralizado na tela como etsa agora, pois toda vez ele so arreda para o lado e não diminui de tamanho sem contar que o obotão de mute sair de dentro do video como estava anteriormente
      style={{
          width: '100%',              // Responsivo
          height: 'auto',             // Mantém a proporção
          aspectRatio: '9 / 16',      // Portrait ratio comum para vídeos verticais
          objectFit: 'cover',
          borderRadius: '12px',
          display: 'block',
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
          right: 10, // Corrigido: botão dentro do vídeo
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

export default VideoPlayer;
