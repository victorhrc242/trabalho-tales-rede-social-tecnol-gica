import React, { useEffect, useState, useRef } from 'react';
import './css/explore.css';

function comentario_explorer({
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
      {/* <div className="modal-overlay" /> */}

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
            <strong>{post.autorNome}</strong>
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
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                  2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
                  4.5 2.09C13.09 3.81 14.76 3 
                  16.5 3 19.58 3 22 5.42 22 8.5c0 
                  3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              
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
        </div>
      </div>
    </>
  );
}

export default comentario_explorer;
