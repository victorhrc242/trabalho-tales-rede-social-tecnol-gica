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
        style={{
          width: '120%', // Agora ocupa 120% do container para dar zoom
          height: '600px',
          objectFit: 'cover',
          borderRadius: '12px',
          display: 'block',
          margin: '0 auto',
          cursor: 'pointer',
          backgroundColor: 'black',
          marginLeft:'-42px'
        }}
      >
        Seu navegador não suporta vídeos.
      </video>
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          bottom: 10,
          right: -25,
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
