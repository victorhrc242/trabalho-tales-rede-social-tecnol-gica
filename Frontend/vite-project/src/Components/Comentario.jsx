import React, { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import '../css/comentario.css';

function Comentario({
  post,
  comentarios,
  comentarioTexto,
  setComentarioTexto,
  comentar,
  fechar,
  usuarioCurtidas,
  usuario,  // adicionei para usar o id do usuário
  setComentarios // para atualizar a lista de comentários quando curtir/descurtir
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [modalHeight, setModalHeight] = useState(window.innerHeight * 0.7);
  const startY = useRef(null);
  const startHeight = useRef(null);

  // Estado local para curtidas nos comentários, para atualizar UI na hora
  const [comentariosState, setComentariosState] = useState(comentarios || []);

  useEffect(() => {
    setComentariosState(comentarios);
  }, [comentarios]);

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

  // Conexão SignalR para receber curtidas em comentários em tempo real
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/curtidaHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.on('ReceberCurtida', (postIdRecebido, usuarioId, foiCurtida) => {
          // Atualiza só se for o post do modal aberto
          if (postIdRecebido === post.id) {
            // Atualiza curtidas no post (se quiser, pode implementar, mas no seu componente original não tem)
            // Atualiza curtidas dos comentários (caso seja comentário)
            setComentariosState(prevComentarios =>
              prevComentarios.map(c => {
                if (c.id === postIdRecebido) {
                  // Aqui postIdRecebido é do post, não comentário, então provavelmente você quer atualizar apenas o post
                  // Para comentários, provavelmente a conexão precisaria diferenciar
                  return c;
                }
                return c;
              })
            );
          }
        });
      })
      .catch(err => console.error('Erro ao conectar curtidaHub:', err));

    return () => connection.stop();
  }, [post.id]);

  // Função curtirPost que verifica se o usuário já curtiu e faz requisição para curtir/descurtir
  const curtirPost = async (comentarioId) => {
    const verificarUrl = `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/post/${comentarioId}`;
    const curtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/curtir';
    const descurtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/descurtir';

    try {
      // Verifica se já curtiu o comentário
      const res = await fetch(verificarUrl, { method: 'GET' });
      const data = await res.json();
      const jaCurtiuAgora = data.curtidas?.some(c => c.usuarioId === usuario.id);

      const endpoint = jaCurtiuAgora ? descurtirUrl : curtirUrl;

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: comentarioId, usuarioId: usuario.id }),
      });

      // Atualiza localmente para UX instantâneo (opcional)
      setComentariosState(prev =>
        prev.map(c => {
          if (c.id === comentarioId) {
            const curtidasCount = c.curtidas || 0;
            return {
              ...c,
              curtidas: jaCurtiuAgora ? curtidasCount - 1 : curtidasCount + 1,
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Erro ao curtir/descurtir:', err);
    }
  };

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
            {comentariosState.map((c, i) => {
              const comentarioJaCurtiu = usuarioCurtidas?.includes(c.id);
              return (
                <div key={c.id || i} className="comentario-item">
                      <a href={`/perfil/${c.autorId}`} className="comentario-avatar-link">
                  <img
                    src={c.autorImagem || 'https://via.placeholder.com/40'}
                    alt={`Foto de perfil de ${c.autorNome}`}
                    className="autor-imagem"
                  />
                  </a>
                  <div className="comentario-conteudo">
                    <div className="comentario-header">
                      <span className="comentario-autor">{c.autorNome}</span>
                    </div>
                    <span className="comentario-texto">{c.conteudo}</span>
                    <div className="botao-acao">
                      <button
                        className={`botao-acao ${comentarioJaCurtiu ? 'curtido' : ''}`}
                        onClick={() => curtirPost(c.id)}
                      >
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
                        <span style={{ marginLeft: '6px' }}>{c.curtidas || 0}</span>
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
