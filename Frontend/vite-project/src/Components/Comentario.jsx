import React, { useEffect, useState, useRef } from 'react';
import '../css/comentario.css';

function Comentario({
  post,
  comentarios,
  comentarioTexto,
  setComentarioTexto,
  comentar,
  fechar,
  curtirPost,
  usuarioCurtidas
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [modalHeight, setModalHeight] = useState(window.innerHeight * 0.7);
  const startY = useRef(null);
  const startHeight = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setModalHeight(null);
      } else {
        setModalHeight(window.innerHeight * 0.7);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onDragStart = (e) => {
    startY.current = e.touches ? e.touches[0].clientY : e.clientY;
    startHeight.current = modalHeight;
    document.addEventListener('touchmove', onDragMove);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('touchend', onDragEnd);
    document.addEventListener('mouseup', onDragEnd);
  };

  const onDragMove = (e) => {
    if (startY.current === null) return;
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    let diff = startY.current - currentY;
    let newHeight = startHeight.current + diff;

    const minHeight = window.innerHeight * 0.5;
    const maxHeight = window.innerHeight;
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

    setModalHeight(newHeight);
  };

  const onDragEnd = () => {
    startY.current = null;
    startHeight.current = null;
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
    document.removeEventListener('mouseup', onDragEnd);
  };

  const jaCurtiu = usuarioCurtidas?.includes(post.id);

  return (
    <>
      <div
        className={`comentarios-modal ${isMobile ? 'mobile' : ''}`}
        style={isMobile && modalHeight ? { height: modalHeight } : {}}
      >
        {isMobile && (
          <div
            className="drag-handle"
            onTouchStart={onDragStart}
            onMouseDown={onDragStart}
            style={{
              width: '40px',
              height: '6px',
              backgroundColor: '#ccc',
              borderRadius: '3px',
              margin: '8px auto',
              cursor: 'grab',
            }}
          />
        )}

        {!isMobile && (
          <div className="imagem-container">
            {post.video ? (
              <video
                src={post.video}
                className="imagem-post"
                controls
                autoPlay
                muted
                loop
              />
            ) : (
              <img src={post.imagem} alt="Imagem do post" className="imagem-post" />
            )}
          </div>
        )}

        <div className="comentarios-container">
          <div className="comentarios-header">
            <div className="autor-info">
              <img
                src={post.autorImagem || 'https://via.placeholder.com/40'}
                alt={`Foto de perfil de ${post.autorNome}`}
                className="autor-imagem"
              />
              <strong>{post.autorNome}</strong>
            </div>
            <button className="fechar-modal" onClick={fechar}>
              ×
            </button>
          </div>

          <div className="post-conteudo">
            <p>{post.conteudo}</p>
            {post.tags?.length > 0 && (
              <p style={{ color: '#555' }}>
                {post.tags.map((tag, idx) => (
                  <span key={idx} style={{ marginRight: '5px' }}>
                    #{tag.trim()}
                  </span>
                ))}
              </p>
            )}
          </div>

        <div className="comentarios-lista">
  {comentarios.map((c, i) => {
    const comentarioJaCurtiu = usuarioCurtidas?.includes(c.id);
    return (
      <div key={c.id || i} className="comentario-item">
        <img
          src={c.autorImagem || 'https://via.placeholder.com/40'}
          alt={`Foto de perfil de ${c.autorNome}`}
          className="autor-imagem"
        />
        <div className="comentario-conteudo">
          <div className="comentario-header">
            <span className="comentario-autor">{c.autorNome}</span>
          </div>
          <span className="comentario-texto">{c.conteudo}</span>
          <div className="botao-acao">
            <button className={`botao-acao ${comentarioJaCurtiu ? 'curtido' : ''}`} onClick={() => curtirPost(c.id)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={comentarioJaCurtiu ? 'red' : 'none'}
                stroke={comentarioJaCurtiu ? 'red' : 'black'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61c-1.54-1.34-3.76-1.34-5.3 0L12 7.17l-3.54-2.56c-1.54-1.34-3.76-1.34-5.3 0-1.78 1.54-1.78 4.04 0 5.58L12 21.35l8.84-11.16c1.78-1.54 1.78-4.04 0-5.58z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  })}
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
        </div>
      </div>
    </>
  );
}

export default Comentario;
