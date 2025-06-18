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
  usuarioCurtidas // boolean
}) {
  const [isMobile, setIsMobile] = useState(false);

  // Estado para altura da modal no mobile
  const [modalHeight, setModalHeight] = useState(window.innerHeight * 0.7); // 70vh inicial
  const startY = useRef(null);
  const startHeight = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setModalHeight(null); // reset quando desktop
      } else if (!modalHeight) {
        setModalHeight(window.innerHeight * 0.7);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [modalHeight]);

  // Eventos de drag (mouse + touch)
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
    let diff = startY.current - currentY; // valor positivo ao arrastar pra cima
    let newHeight = startHeight.current + diff;

    const minHeight = window.innerHeight * 0.7;
    const maxHeight = window.innerHeight;

    if (newHeight < minHeight) newHeight = minHeight;
    if (newHeight > maxHeight) newHeight = maxHeight;

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

  // Opacidade do overlay varia conforme o modal sobe
  const overlayOpacity = isMobile
    ? 0.6 * ((modalHeight - window.innerHeight * 0.7) / (window.innerHeight * 0.3))
    : 0.6;

  return (
    <>
      <div
        className="modal-overlay"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity.toFixed(2)})`,
          transition: 'background-color 0.3s ease',
        }}
      />
      <div
        className={`comentarios-modal ${isMobile ? 'mobile' : ''}`}
        style={
          isMobile
            ? {
                height: modalHeight,
                transition: 'height 0.1s ease-out',
                borderRadius: '20px 20px 0 0',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                zIndex: 1001,
              }
            : {}
        }
      >
        {/* Barra para arrastar */}
        {isMobile && (
          <div
            className="drag-handle"
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            style={{
              width: '40px',
              height: '6px',
              backgroundColor: '#ccc',
              borderRadius: '3px',
              margin: '8px auto',
              cursor: 'grab',
              userSelect: 'none',
            }}
          />
        )}

        <div className="imagem-container" style={{ display: isMobile ? 'none' : 'block' }}>
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

        {/* Comentários (sempre visíveis, mas animam no mobile) */}
        <div className={`comentarios-container ${isMobile ? 'slide-up' : ''}`}>
          <div className="comentarios-header">
            <strong>{post.autorNome}</strong>
          </div>

          <div className="post-conteudo">
            <p>{post.conteudo}</p>
            {post.tags && post.tags.length > 0 && (
              <p style={{ color: '#555' }}>
                {post.tags.map((tag, idx) => (
                  <span key={idx} style={{ marginRight: '5px' }}>
                    #{tag.trim()}
                  </span>
                ))}
              </p>
            )}
          </div>

          <h4>Comentários</h4>

          <div className="comentarios-lista">
            {comentarios.map((c, i) => (
              <div key={c.id || i} className="comentario-item">
                <img
                  src={
                    c.autorImagem ||
                    'https://sigeventos.unifesspa.edu.br/sigeventos/verArquivo?idArquivo=899786&key=7b31619566f4f78b8a447ec38d196e12'
                  }
                  alt={`Foto de perfil de ${c.autorNome}`}
                />
                <div className="comentario-conteudo">
                  <span className="comentario-autor">{c.autorNome}</span>
                  <span className="comentario-texto">{c.conteudo}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Curtir */}
          <div className="botoes-post-comentario">
            <button className="botao-acao" onClick={() => curtirPost(post.id)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill={usuarioCurtidas ? 'red' : 'none'}
                stroke={usuarioCurtidas ? 'red' : 'black'}
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                    2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
                    4.5 2.09C13.09 3.81 14.76 3 
                    16.5 3 19.58 3 22 5.42 22 8.5c0 
                    3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
              {post.curtidas > 0 ? ` (${post.curtidas})` : ''}
            </button>
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

          <button className="fechar-modal" onClick={fechar}>
            ×
          </button>
        </div>
      </div>
    </>
  );
}

export default Comentario;
