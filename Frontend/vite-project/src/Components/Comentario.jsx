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

  const comentar = async () => {
    if (!comentarioTexto.trim()) return;

    try {
      await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, autorId: usuario.id, conteudo: comentarioTexto }),
      });
      setComentarioTexto('');
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

  const curtirPost = async () => {
  try {
    // Verifica se usuário já curtiu o post
    const verificarUrl = `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/usuario-curtiu?postId=${post.id}&usuarioId=${usuario.id}`;
    const curtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/curtir';
    const descurtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/descurtir';

    const resVerifica = await fetch(verificarUrl);
    if (!resVerifica.ok) {
      console.error('Erro ao verificar curtida do post');
      return;
    }
    const dataVerifica = await resVerifica.json();
    const jaCurtiu = dataVerifica.curtiu;

    // Decide se vai curtir ou descurtir
    const endpoint = jaCurtiu ? descurtirUrl : curtirUrl;

    // Envia requisição para curtir ou descurtir
    const resPost = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, usuarioId: usuario.id }),
    });

    if (!resPost.ok) {
      console.error('Erro ao curtir/descurtir post');
      return;
    }

    const dataPost = await resPost.json();
    const curtiuAgora = !jaCurtiu;

    // Atualiza o estado local do post no modal (para mostrar a contagem atualizada)
    // Se o post aqui for só uma prop, você pode precisar de callback para atualizar no feed principal
    // Mas aqui vamos atualizar localmente:

    post.curtidas = dataPost.curtidasTotais;
    post.foiCurtido = curtiuAgora;

    // Força re-render (se post for estado, use setState)
    // Como post é prop, pode usar state local para isso:
    setPostSelecionado({ ...post });

  } catch (err) {
    console.error('Erro ao curtir/descurtir post:', err);
  }
};
useEffect(() => {
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
          // Atualiza a curtida local do post modal
          const curtidasAtualizadas = foiCurtida
            ? (post.curtidas || 0) + 1
            : Math.max(0, (post.curtidas || 0) - 1);

          setPostSelecionado(prev => ({
            ...prev,
            curtidas: curtidasAtualizadas,
            foiCurtido: usuarioId === usuario.id ? foiCurtida : prev.foiCurtido,
          }));
        }
      });
    })
    .catch(err => console.error('Erro ao conectar ao SignalR:', err));

  return () => connection.stop();
}, [post, usuario]);


  const compartilharPost = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link do post copiado para a área de transferência!');
  };
useEffect(() => {
  const bloquearScroll = (e) => {
    e.preventDefault();
  };

  if (post) {
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', bloquearScroll, { passive: false });
    document.addEventListener('wheel', bloquearScroll, { passive: false });
  }

  return () => {
    document.body.style.overflow = '';
    document.removeEventListener('touchmove', bloquearScroll);
    document.removeEventListener('wheel', bloquearScroll);
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
          <button className="fechar-modals" onClick={fechar}>x</button>
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
        {/* Botões de ação do POST */}
 <div className="post-acoes">
<button onClick={curtirPost} title="Curtir">
  <Heart
    size={20}
    stroke={post.foiCurtido ? "red" : "black"}
    strokeWidth={2}
    fill={post.foiCurtido ? "red" : "none"}
  />
  <span>{post.curtidas || 0}</span>
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
