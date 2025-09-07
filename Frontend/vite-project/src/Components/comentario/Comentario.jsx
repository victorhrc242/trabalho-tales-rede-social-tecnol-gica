import React, { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import { Heart, Share2, Send } from 'lucide-react';
import '../../css/comentario.css';
import CompartilharPost from '../../pages/Home/CompartilharPost.jsx';

function Comentario({ post, usuario, fechar }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [modalHeight, setModalHeight] = useState(window.innerHeight * 0.7);
  const [comentarios, setComentarios] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [curtido, setCurtido] = useState(false);
  const [curtidasCount, setCurtidasCount] = useState(0);
  const [mostrarCompartilhar, setMostrarCompartilhar] = useState(false);

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
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.body.classList.remove('modal-aberto');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [post]);

  useEffect(() => {
    if (!post?.id) return;

async function carregarComentarios() {
  try {
    console.log('Carregando comentários para postId:', post.id);

    const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`);
    if (!res.ok) throw new Error('Erro ao buscar comentários');
    
    const data = await res.json();
    console.log('Resposta API comentários:', data);

    // Verifica se a resposta tem uma propriedade 'comentarios' ou é o array diretamente
    const comentariosRaw = data.comentarios || data;
    
    if (!Array.isArray(comentariosRaw)) {
      throw new Error('Formato de comentários inválido');
    }

    const comentariosComAutores = await Promise.all(
      comentariosRaw.map(async (comentario) => {
        // Se já tiver os dados do autor, usa eles
        if (comentario.autorNome && comentario.autorImagem) {
          return comentario;
        }
        
        // Caso contrário, busca os dados do autor
        if (!comentario.autorId) {
          return {
            ...comentario,
            autorNome: 'Usuário',
            autorImagem: 'https://via.placeholder.com/40',
          };
        }
        
        try {
          const r = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${comentario.autorId}`);
          if (!r.ok) throw new Error('Erro ao buscar autor');
          const u = await r.json();
          return {
            ...comentario,
            autorNome: u.nome_usuario || u.nome_usuario || 'Usuário',
            autorImagem: u.imagem || 'https://via.placeholder.com/40',
          };
        } catch (error) {
          console.warn('Erro ao buscar dados do autor do comentário:', error);
          return {
            ...comentario,
            autorNome: 'Usuário',
            autorImagem: 'https://via.placeholder.com/40',
          };
        }
      })
    );

    setComentarios(comentariosComAutores);
  } catch (err) {
    console.error('Erro ao carregar comentários:', err);
    setComentarios([]);
  }
}

    carregarComentarios();
  }, [post, usuario]);

  useEffect(() => {
    if (!post) return;

    setCurtido(post.foiCurtido || false);
    setCurtidasCount(post.curtidas || 0);

    async function verificarCurtida() {
      try {
        const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/usuario-curtiu?postId=${post.id}&usuarioId=${usuario.id}`);
        const data = await res.json();
        setCurtido(data.curtiu);
      } catch (err) {
        console.error('Erro ao verificar curtida:', err);
      }
    }

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

      // Recarrega comentários após envio
      const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`);
      const data = await res.json();

      const comentariosRaw = Array.isArray(data.comentarios) ? data.comentarios : (Array.isArray(data) ? data : []);

      const comentariosComAutores = await Promise.all(
        comentariosRaw.map(async (comentario) => {
          if (!comentario.autorId) {
            return {
              ...comentario,
              autorNome: 'Usuário',
              autorImagem: 'https://via.placeholder.com/40',
            };
          }
          try {
            const r = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${comentario.autorId}`);
            if (!r.ok) throw new Error('Erro ao buscar autor');
            const u = await r.json();
            return {
              ...comentario,
              autorNome: u.nome || 'Usuário',
              autorImagem: u.imagem || 'https://via.placeholder.com/40',
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

      setComentarios(comentariosComAutores);
    } catch (e) {
      console.error('Erro ao enviar comentário:', e);
    }
  };
console.log(usuario)
  const curtirPost = async () => {
    const novoEstadoCurtido = !curtido;
    const novaContagem = curtidasCount + (novoEstadoCurtido ? 1 : -1);

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
      setCurtido(!novoEstadoCurtido);
      setCurtidasCount(curtidasCount);
    }
  };

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
            setCurtidasCount(prevCount => foiCurtida ? prevCount + 1 : Math.max(0, prevCount - 1));

            if (usuarioId === usuario.id) {
              setCurtido(foiCurtida);
            }
          }
        });
      });

    return () => connection.stop();
  }, [post, usuario]);

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

  const handleFechar = () => {
    setCurtido(false);
    setCurtidasCount(0);
    setComentarios([]);
    setComentarioTexto('');
    if (typeof fechar === 'function') fechar();
  };

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

          <button onClick={() => setMostrarCompartilhar(true)} title="Compartilhar">
            <Share2 size={20} stroke="black" strokeWidth={2} />
          </button>
        </div>

        {mostrarCompartilhar && post && usuario && (
          <CompartilharPost
            post={post}
            usuario={usuario}
            onClose={() => setMostrarCompartilhar(false)}
          />
        )}

        <div className="comentarios-form">
          <input
            type="text"
            placeholder="Adicione um comentário..."
            value={comentarioTexto}
            onChange={(e) => setComentarioTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && comentar()}
          />
          <button onClick={comentar}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Comentario;
