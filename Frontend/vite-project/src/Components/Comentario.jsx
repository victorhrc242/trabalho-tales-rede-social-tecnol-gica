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
  usuario,  // ID e dados do usuário logado, usado para curtidas
  setComentarios // para atualizar comentários após curtir/descurtir
}) {
  // Estado para identificar se está em tela mobile (largura <= 768px)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // Estado que controla a altura do modal no mobile para drag resizing
  const [modalHeight, setModalHeight] = useState(window.innerHeight * 0.7);
  

  // Refs para controlar posição inicial do drag no modal
  const startY = useRef(null);
  const startHeight = useRef(null);

  // Estado local dos comentários (para atualizar curtidas UI em tempo real)
  const [comentariosState, setComentariosState] = useState(comentarios || []);

    // Atualiza isMobile
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

  // Sincroniza o estado local sempre que o prop "comentarios" mudar
  useEffect(() => {
    setComentariosState(comentarios);
  }, [comentarios]);

  // Carrega os dados dos autores dos comentários (nome e imagem)
  // Se o comentário ainda não tiver esses dados, faz fetch na API para buscar
  useEffect(() => {
    const carregarAutores = async () => {
      const atualizados = await Promise.all(
        comentariosState.map(async (comentario) => {
          if (!comentario.autorNome || !comentario.autorImagem) {
            try {
              const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${comentario.autorId}`);
              const autor = await res.json();

              // Retorna o comentário com dados do autor anexados
              return {
                ...comentario,
                autorNome: autor.nome_usuario || 'Usuário',
                autorImagem: autor.imagem || 'https://via.placeholder.com/40',
              };
            } catch (err) {
              console.error('Erro ao buscar autor do comentário:', err);
              // Se falhar, retorna com valores padrão
              return {
                ...comentario,
                autorNome: 'Usuário',
                autorImagem: 'https://via.placeholder.com/40',
              };
            }
          } else {
            return comentario;
          }
        })
      );

      setComentariosState(atualizados);
    };

    // Só carrega se houver comentários na lista
    if (comentariosState?.length > 0) {
      carregarAutores();
    }
  }, [comentariosState]);

  // Carrega comentários + autores do post atual
  useEffect(() => {
    if (!post?.id) return;

    const carregarComentariosDoPost = async () => {
      try {
        const res = await fetch(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`
        );
        const data = await res.json();

        const comentariosComAutor = await Promise.all(
          (data.comentarios || []).map(async (comentario) => {
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
            } catch {
              return {
                ...comentario,
                autorNome: 'Usuário',
                autorImagem: 'https://via.placeholder.com/40',
              };
            }
          })
        );

        setComentariosState(comentariosComAutor);
        setComentarios?.(comentariosComAutor);
      } catch (e) {
        console.error('Erro ao carregar comentários:', e);
      }
    };

    carregarComentariosDoPost();
  }, [post?.id]);

  // Envia novo comentário
  const enviarComentario = async () => {
    if (!comentarioTexto.trim() || !post?.id) return;

    try {
      await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          autorId: usuario.id,
          conteudo: comentarioTexto,
        }),
      });

      setComentarioTexto('');

      // Recarrega comentários
      const res = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`
      );
      const data = await res.json();
      setComentariosState(data.comentarios || []);
      setComentarios?.(data.comentarios || []);
    } catch (e) {
      console.error('Erro ao enviar comentário:', e);
    }
  };

    // SignalR
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/curtidaHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
      connection.on('ReceberCurtida', (postIdRecebido, usuarioId, foiCurtida) => {
        setComentariosState(prev =>
          prev.map(c => {
            if (c.id === postIdRecebido) {
              const count = c.curtidas || 0;
              return { ...c, curtidas: foiCurtida ? count + 1 : Math.max(0, count - 1) };
            }
            return c;
          })
        );
      });
    }).catch(err => console.error('Erro ao conectar SignalR:', err));

    return () => connection.stop();
  }, []);

  // Detecta mudanças no tamanho da janela para ajustar UI mobile/desktop
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

    handleResize(); // Executa na montagem

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configura conexão SignalR para receber atualizações em tempo real de curtidas nos comentários
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/curtidaHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        // Quando receber um evento de curtida, atualiza o estado local de comentários
        connection.on('ReceberCurtida', (postIdRecebido, usuarioId, foiCurtida) => {
          setComentariosState(prevComentarios =>
            prevComentarios.map(c => {
              if (c.id === postIdRecebido) {
                const curtidasAtualizadas = foiCurtida
                  ? (c.curtidas || 0) + 1
                  : Math.max(0, (c.curtidas || 0) - 1);
                return { ...c, curtidas: curtidasAtualizadas };
              }
              return c;
            })
          );
        });
      })
      .catch(err => console.error('Erro ao conectar curtidaHub:', err));

    // Cleanup desconecta SignalR ao desmontar componente
    return () => connection.stop();
  }, []);

  // Função para curtir ou descurtir um comentário
  // Faz requisições para APIs apropriadas e atualiza UI localmente
  // Curtida em comentário (opcional)
  const curtirPost = async (comentarioId) => {
    const verificarUrl = `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/post/${comentarioId}`;
    const curtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/curtir';
    const descurtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/descurtir';

    try {
      // Verifica se usuário já curtiu
      const res = await fetch(verificarUrl, { method: 'GET' });
      const data = await res.json();
      const jaCurtiu = data.curtidas?.some(c => c.usuarioId === usuario.id);

      const endpoint = jaCurtiu ? descurtirUrl : curtirUrl;

      // Envia curtida ou descurtida para o servidor
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: comentarioId, usuarioId: usuario.id }),
      });

      // Atualiza curtidas localmente para feedback imediato
      setComentariosState(prev =>
        prev.map(c => {
          if (c.id === comentarioId) {
            const count = c.curtidas || 0;
            return { ...c, curtidas: jaCurtiu ? count - 1 : count + 1 };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Erro ao curtir/descurtir:', err);
    }
  };

  // Funções para arrastar e redimensionar o modal (somente mobile)
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
        {/* Handle para arrastar modal no mobile */}
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

        {/* Exibição do post: vídeo ou imagem */}
        {!isMobile && (
          <div className="imagem-container">
            {post.video ? (
              <video src={post.video} className="imagem-post"
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
          {/* Cabeçalho com dados do autor do post e botão fechar */}
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
              x
            </button>
          </div>

          {/* Conteúdo do post e tags */}
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

          {/* Lista de comentários */}
          <div className="comentarios-lista">
            {comentariosState.map((c, i) => {
              // Verifica se o usuário atual já curtiu este comentário
              const comentarioJaCurtiu = usuarioCurtidas?.includes(c.id);
              return (
                <div key={c.id || i} className="comentario-item">
                  {/* Link para perfil do autor do comentário */}
                  <a href={`/perfil/${c.autorId}`} className="comentario-avatar-link">
                    <img
                      src={
                        c.autor?.imagem || c.autorImagem ||
                        'https://via.placeholder.com/40'
                      }
                      alt={`Foto de ${c.autor?.nome_usuario || c.autorNome || 'Usuário'}`}
                      className="comentario-avatar"
                    />
                  </a>

                  <div className="comentario-conteudo">
                    <div className="comentario-header">
                      <span className="comentario-autor">{c.autorNome}</span>
                    </div>
                    <span className="comentario-texto">{c.conteudo}</span>

                    {/* Botão para curtir/descurtir comentário */}
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

          {/* Formulário para adicionar novo comentário */}
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
