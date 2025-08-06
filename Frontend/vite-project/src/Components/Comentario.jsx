import React, { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import { Heart, Share2 } from 'lucide-react';
import '../css/comentario.css';

function Comentario({ post, usuario, fechar }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [modalHeight, setModalHeight] = useState(window.innerHeight * 0.7);
  const [comentarios, setComentarios] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [usuarioCurtidas, setUsuarioCurtidas] = useState([]);

  // Curtida otimista estados locais para post
  const [curtido, setCurtido] = useState(false);
  const [curtidasCount, setCurtidasCount] = useState(0);

  const startY = useRef(null);
  const startHeight = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setModalHeight(mobile ? window.innerHeight * 0.7 : null);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (post) {
      document.body.classList.add('modal-aberto');
    }
    return () => {
      document.body.classList.remove('modal-aberto');
    };
  }, [post]);

  // Carregar comentários e curtidas dos comentários
  useEffect(() => {
    if (!post?.id) return;

    async function carregarComentarios() {
      try {
        const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`);
        const data = await res.json();

        const comentariosComAutores = await Promise.all(
          (data.comentarios || []).map(async (comentario) => {
            try {
              const r = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${comentario.autorId}`);
              const u = await r.json();
              return { ...comentario, autorNome: u.nome || 'Usuário', autorImagem: u.imagem || 'https://via.placeholder.com/40' };
            } catch {
              return { ...comentario, autorNome: 'Usuário', autorImagem: 'https://via.placeholder.com/40' };
            }
          })
        );
        setComentarios(comentariosComAutores);

        const resCurtidas = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/usuario-curtiu-comentarios?postId=${post.id}&usuarioId=${usuario.id}`);
        const dadosCurtidas = await resCurtidas.json();
        setUsuarioCurtidas(dadosCurtidas.curtidas || []);
      } catch (err) {
        console.error('Erro ao carregar comentários:', err);
      }
    }

    carregarComentarios();
  }, [post, usuario]);

  // Verificar curtida do post assim que abrir modal e definir estado local para curtida otimista
  useEffect(() => {
    if (!post) return;

    // Inicializa curtidas a partir do post
    setCurtido(post.foiCurtido || false);
    setCurtidasCount(post.curtidas || 0);

    const verificarCurtida = async () => {
      try {
        const verificarUrl = `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/usuario-curtiu?postId=${post.id}&usuarioId=${usuario.id}`;
        const res = await fetch(verificarUrl);
        const data = await res.json();
        setCurtido(data.curtiu);
      } catch (err) {
        console.error('Erro ao verificar curtida:', err);
      }
    };

    verificarCurtida();
  }, [post, usuario]);

  const comentar = async () => {
    if (!comentarioTexto.trim()) return;

    try {
      await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, autorId: usuario.id, conteudo: comentarioTexto }),
      });
      setComentarioTexto('');

      // Recarrega comentários após enviar
      const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`);
      const data = await res.json();

      const comentariosComAutores = await Promise.all(
        (data.comentarios || []).map(async (comentario) => {
          try {
            const r = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${comentario.autorId}`);
            const u = await r.json();
            return { ...comentario, autorNome: u.nome || 'Usuário', autorImagem: u.imagem || 'https://via.placeholder.com/40' };
          } catch {
            return { ...comentario, autorNome: 'Usuário', autorImagem: 'https://via.placeholder.com/40' };
          }
        })
      );
      setComentarios(comentariosComAutores);
    } catch (e) {
      console.error('Erro ao enviar comentário:', e);
    }
  };

  // Curtida otimista no post
  const curtirPost = async () => {
    const novoEstadoCurtido = !curtido;
    const novaContagem = curtidasCount + (novoEstadoCurtido ? 1 : -1);

    // Atualiza otimisticamente
    setCurtido(novoEstadoCurtido);
    setCurtidasCount(novaContagem);

    try {
      const endpoint = novoEstadoCurtido
        ? 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/curtir'
        : 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/descurtir';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, usuarioId: usuario.id }),
      });

      if (!res.ok) throw new Error('Erro na requisição de curtida');
    } catch (err) {
      console.error('Erro ao curtir/descurtir post:', err);
      // Reverte estado em caso de erro
      setCurtido(!novoEstadoCurtido);
      setCurtidasCount(curtidasCount);
    }
  };

  // Curtir/descurtir comentário
  const curtirComentario = async (comentarioId) => {
    try {
      const jaCurtiu = usuarioCurtidas.includes(comentarioId);
      const endpoint = jaCurtiu
        ? 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/descurtir'
        : 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/curtir';

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: comentarioId, usuarioId: usuario.id }),
      });

      setComentarios(prev =>
        prev.map(c => {
          if (c.id === comentarioId) {
            const count = c.curtidas || 0;
            return { ...c, curtidas: jaCurtiu ? count - 1 : count + 1 };
          }
          return c;
        })
      );

      setUsuarioCurtidas(prev => jaCurtiu ? prev.filter(id => id !== comentarioId) : [...prev, comentarioId]);
    } catch (err) {
      console.error('Erro ao curtir/descurtir comentário:', err);
    }
  };

  // SignalR para curtidas de comentários
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/curtidaHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.on('ReceberCurtida', (comentarioId, usuarioId, foiCurtida) => {
          setComentarios(prev =>
            prev.map(c => {
              if (c.id === comentarioId) {
                const curtidasAtualizadas = foiCurtida
                  ? (c.curtidas || 0) + 1
                  : Math.max(0, (c.curtidas || 0) - 1);
                return { ...c, curtidas: curtidasAtualizadas };
              }
              return c;
            })
          );
          if (usuarioId === usuario.id) {
            setUsuarioCurtidas(prev => foiCurtida
              ? [...prev, comentarioId]
              : prev.filter(id => id !== comentarioId)
            );
          }
        });
      })
      .catch(err => console.error('Erro ao conectar ao SignalR:', err));

    return () => connection.stop();
  }, [usuario]);

  // SignalR para curtidas do post modal (atualiza curtidas locais)
  useEffect(() => {
    if (!post) return;

    const connection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/curtidaHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.on('ReceberCurtida', (postId, usuarioId, foiCurtida) => {
          if (post.id === postId) {
            const curtidasAtualizadas = foiCurtida
              ? curtidasCount + 1
              : Math.max(0, curtidasCount - 1);

            setCurtidasCount(curtidasAtualizadas);

            if (usuarioId === usuario.id) {
              setCurtido(foiCurtida);
            }
          }
        });
      })
      .catch(err => console.error('Erro ao conectar ao SignalR:', err));

    return () => connection.stop();
  }, [post, usuario, curtidasCount]);

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
    const diff = startY.current - currentY;
    const newHeight = Math.max(window.innerHeight * 0.5, Math.min(window.innerHeight, startHeight.current + diff));
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

  const compartilharPost = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link do post copiado para a área de transferência!');
  };
  const handleFechar = () => {
    setCurtido(false);
    setCurtidasCount(0);
    setComentarios([]);
    setComentarioTexto('');
    setUsuarioCurtidas([]);
    if (typeof fechar === 'function') {
      fechar();
    }
  };
 useEffect(() => {
  if (post) {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden'; // <== ADICIONE ISTO
  }

  return () => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = ''; // <== E ISTO
  };
}, [post]);



  if (!post) return null;

  return (
    <div
      className={`comentarios-modal ${isMobile ? 'mobile' : ''}`}
      style={isMobile && modalHeight ? { height: modalHeight } : {}}
    >
      {isMobile && (
        <div className="drag-handle" onTouchStart={onDragStart} onMouseDown={onDragStart} />
      )}

      {!isMobile && (
        <div className="imagem-container">
          {post.video ? (
            <video src={post.video} className="imagem-post" controls autoPlay muted loop />
          ) : (
            <img src={post.imagem} alt="Imagem do post" className="imagem-post" />
          )}
        </div>
      )}

      <div className="comentarios-container">
        <div className="comentarios-header">
          <div className="autor-info">
            <img src={post.autorImagem || 'https://via.placeholder.com/40'} alt={`Foto de ${post.autorNome}`} className="autor-imagem" />
            <strong>{post.autorNome}</strong>
          </div>
          <button className="fechar-modals" onClick={handleFechar}>x</button>

        </div>

        <div className="post-conteudo">
          <p>{post.conteudo}</p>
          {post.tags?.length > 0 && (
            <p className="post-tags">
              {post.tags.map((tag, idx) => (
                <span key={idx}>#{tag.trim()} </span>
              ))}
            </p>
          )}
        </div>

        

        <div className="comentarios-lista">
          {comentarios.filter(Boolean).map((comentario) => (
            <div key={comentario.id} className="comentario-item">
              <a href={`/perfil/${comentario.autorId}`} target="_blank" rel="noopener noreferrer">
                <img src={comentario.autorImagem} alt={`Foto de ${comentario.autorNome}`} className="comentario-avatar" />
              </a>
              <div className="comentario-conteudo">
                <span className="comentario-autor">{comentario.autorNome}</span>
                <span className="comentario-texto">{comentario.conteudo}</span>
              </div>
            </div>
          ))}
        </div>
<div className="post-acoes">
          <button onClick={curtirPost} title="Curtir">
            <Heart
              size={20}
              stroke={curtido ? "red" : "black"}
              strokeWidth={2}
              fill={curtido ? "red" : "none"}
            />
            <span>{curtidasCount}</span>
          </button>

          <button onClick={compartilharPost} title="Compartilhar">
            <Share2 size={20} stroke="black" strokeWidth={2} />
          </button>
        </div>
        <div className="comentarios-form">
          <input
            type="text"
            placeholder="Adicione um comentário..."
            value={comentarioTexto}
            onChange={(e) => setComentarioTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && comentar()}
          />
          <button onClick={comentar}>Enviar</button>
        </div>
      </div>
    </div>
  );
}

export default Comentario;
