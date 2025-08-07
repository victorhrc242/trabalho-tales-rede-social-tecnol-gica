import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, MoreVertical, Share2 } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import './modal.css';

function FeedItem({ 
  post, 
  usuario, 
  videoAtivoId, 
  registerVideoRef, 
  irParaPerfil,
  onAbrirComentarios,
  onCurtirPost 
}) {
  // Estados do componente
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarTiposDenuncia, setMostrarTiposDenuncia] = useState(false);
  const [foiCurtido, setFoiCurtido] = useState(false);
  const [totalCurtidas, setTotalCurtidas] = useState(post.curtidas || 0);
  const [modalAberto, setModalAberto] = useState(false);
  const [destinatarioId, setDestinatarioId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [seguindo, setSeguindo] = useState([]);
  const [curtindo, setCurtindo] = useState(false);
  const [toast, setToast] = useState(null);
  
  const opcoesRef = useRef(null);

  // Verifica se o usuário já curtiu o post
  useEffect(() => {
    async function checkCurtida() {
      try {
        const res = await fetch(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/usuario-curtiu?postId=${post.id}&usuarioId=${usuario.id}`
        );
        const data = await res.json();
        setFoiCurtido(data.curtiu);
      } catch (error) {
        console.error('Erro ao verificar curtida:', error);
      }
    }
    
    if (usuario?.id) {
      checkCurtida();
    }
  }, [post.id, usuario.id]);

  // Busca usuários que o usuário atual segue (para compartilhamento)
  useEffect(() => {
    const buscarUsuariosSeguindo = async () => {
      try {
        const res = await fetch(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${usuario.id}`
        );
        const data = await res.json();

        if (data.sucesso && Array.isArray(data.seguindo)) {
          const usuariosDetalhados = await Promise.all(
            data.seguindo.map(async ({ usuario2 }) => {
              const resUser = await fetch(
                `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${usuario2}`
              );
              const userData = await resUser.json();
              return {
                id: usuario2,
                nome: userData.nome,
                imagem: userData.imagem
              };
            })
          );
          setSeguindo(usuariosDetalhados);
        }
      } catch (err) {
        console.error('Erro ao buscar usuários seguindo:', err);
      }
    };

    if (modalAberto && usuario?.id) {
      buscarUsuariosSeguindo();
    }
  }, [modalAberto, usuario.id]);

  // Fecha menus quando clica fora
  useEffect(() => {
    const handleClickFora = (e) => {
      if (opcoesRef.current && !opcoesRef.current.contains(e.target)) {
        setMostrarMenu(false);
        setMostrarTiposDenuncia(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  // Função para denunciar post
  const denunciarPost = async (descricao) => {
    try {
      await fetch(
        'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/denuncias/adicionar_denuncia', 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postid: post.id,
            usuarioid: usuario.id,
            descricao: descricao
          })
        }
      );
      alert('Denúncia enviada com sucesso!');
      setMostrarMenu(false);
      setMostrarTiposDenuncia(false);
    } catch (err) {
      console.error('Erro ao denunciar:', err);
      alert('Erro ao enviar denúncia.');
    }
  };

  // Função para curtir/descurtir
  const handleCurtir = async () => {
    if (curtindo || !usuario?.id) return;
    setCurtindo(true);

    // Otimista UI update
    setFoiCurtido(prev => !prev);
    setTotalCurtidas(prev => (foiCurtido ? prev - 1 : prev + 1));

    try {
      const resultado = await onCurtirPost(post.id);
      
      if (!resultado?.sucesso) {
        // Reverte se falhar
        setFoiCurtido(prev => !prev);
        setTotalCurtidas(prev => (foiCurtido ? prev + 1 : prev - 1));
      }
    } finally {
      setCurtindo(false);
    }
  };

  // Função para enviar mensagem
  const enviarMensagem = async () => {
    if (!destinatarioId || !mensagem.trim()) return;

    const corpo = {
      idRemetente: usuario.id,
      idDestinatario: destinatarioId,
      conteudo: mensagem,
      postCompartilhadoId: post.id
    };

    try {
      const response = await fetch(
        "https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Mensagens/enviar-com-post", 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corpo)
        }
      );

      const data = await response.json();
      if (data.sucesso) {
        setToast({ mensagem: "Enviada com sucesso!", tipo: "sucesso" });
        setModalAberto(false);
        setMensagem("");
        setDestinatarioId("");
      } else {
        setToast({ mensagem: "Erro: " + data.mensagem, tipo: "erro" });
      }
    } catch (erro) {
      setToast({ mensagem: "Erro ao enviar: " + erro.message, tipo: "erro" });
    }
  };

  // Componente Toast
  function Toast({ mensagem, tipo = 'sucesso', onClose }) {
    useEffect(() => {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <div className={`toast ${tipo}`} onClick={onClose}>
        {mensagem}
      </div>
    );
  }

  if (!usuario?.id) {
    return null;
  }

  return (
    <li style={{ marginBottom: '20px' }}>
      {/* Cabeçalho do post */}
      <div className="autor-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={post.autorImagem || 'https://via.placeholder.com/40'}
            alt={`Foto de ${post.autorNome}`}
            onClick={() => irParaPerfil(post.autorId)}
            style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10, cursor: 'pointer' }}
          />
          <span onClick={() => irParaPerfil(post.autorId)} style={{ fontWeight: 'bold', cursor: 'pointer' }}>
            {post.autorNome}
          </span>
        </div>

        {/* Toast de mensagem */}
        {toast && (
          <Toast
            mensagem={toast.mensagem}
            tipo={toast.tipo}
            onClose={() => setToast(null)}
          />
        )}

        {/* Menu de opções */}
        <div style={{ position: 'relative' }} ref={opcoesRef}>
          <MoreVertical
            size={20}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setMostrarMenu(!mostrarMenu);
              setMostrarTiposDenuncia(false);
            }}
          />

          {mostrarMenu && (
            <div style={{
              position: 'absolute',
              top: 30,
              right: 0,
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: 10,
              zIndex: 10,
              minWidth: 200,
              display: 'flex'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  onClick={() => setMostrarTiposDenuncia(prev => !prev)}
                  style={{ padding: 8, cursor: 'pointer', color: 'red' }}
                >
                  🚨 Denunciar
                </div>
              </div>

              {mostrarTiposDenuncia && (
                <div style={{
                  marginLeft: 10,
                  borderLeft: '1px solid #ddd',
                  paddingLeft: 10,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div onClick={() => denunciarPost("Conteúdo ofensivo")} style={{ padding: 6, cursor: 'pointer' }}>🚫 Conteúdo ofensivo</div>
                  <div onClick={() => denunciarPost("Propaganda repetitiva")} style={{ padding: 6, cursor: 'pointer' }}>📢 Propaganda repetitiva</div>
                  <div onClick={() => denunciarPost("Fake news ou desinformação")} style={{ padding: 6, cursor: 'pointer' }}>📰 Fake news</div>
                  <div onClick={() => denunciarPost("Assédio ou discurso de ódio")} style={{ padding: 6, cursor: 'pointer' }}>⚠️ Assédio ou ódio</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo do post */}
      <article data-postid={post.id} style={{ marginBottom: '20px' }} className="post-item">
        {post.imagem && (
          <img src={post.imagem} alt="Imagem" className="imagem-post-feed" />
        )}

        {post.video && (
          <div ref={(node) => registerVideoRef(post.id, node)}>
            <VideoPlayer
              videoUrl={post.video}
              isActive={videoAtivoId === String(post.id)}
            />
          </div>
        )}

        {/* Ações do post */}
        <div className="botoes-post">
          <button className="botao-acao" onClick={handleCurtir}>
            <Heart
              size={20}
              color={foiCurtido ? 'red' : 'black'}
              fill={foiCurtido ? 'red' : 'none'}
            />
            {usuario?.id === post.autorId && (
              <span> ({totalCurtidas})</span>
            )}
          </button>

          <button className="botao-acao" onClick={() => onAbrirComentarios(post)}>
            <MessageCircle size={20} /> ({post.comentarios})
          </button>

          <button onClick={() => setModalAberto(true)} className="botao-enviar-dm">
            <Share2 size={20} />
          </button>
        </div>

        {/* Modal de compartilhamento */}
        {modalAberto && (
          <div className="modal-overlay-story" onClick={() => setModalAberto(false)}>
            <div className="modal-content-story" onClick={(e) => e.stopPropagation()}>
              <h3>Compartilhar</h3>

              <ul className="lista-usuarios-horizontal">
                {seguindo.map((usuario) => (
                  <li
                    key={usuario.id}
                    onClick={() => setDestinatarioId(usuario.id)}
                    style={{
                      backgroundColor: destinatarioId === usuario.id ? '#ddd' : undefined,
                    }}
                  >
                    <img src={usuario.imagem} alt="avatar" />
                    <span style={{ fontSize: 12 }}>{usuario.nome}</span>
                  </li>
                ))}
              </ul>

              {destinatarioId && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 10,
                  backgroundColor: '#f0f0f0',
                  padding: '8px 12px',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={seguindo.find(u => u.id === destinatarioId)?.imagem}
                      alt="Selecionado"
                      style={{ width: 40, height: 40, borderRadius: '50%' }}
                    />
                    <strong>{seguindo.find(u => u.id === destinatarioId)?.nome}</strong>
                  </div>
                  <button
                    onClick={() => setDestinatarioId("")}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: 18,
                      cursor: 'pointer',
                      color: '#888',
                      fontWeight: 'bold'
                    }}
                    title="Cancelar destinatário"
                  >
                    ✖
                  </button>
                </div>
              )}

              {destinatarioId && (
                <>
                  <textarea
                    className="textarea-mensagem"
                    placeholder="Escreva uma mensagem..."
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    style={{ width: '100%', marginBottom: 10 }}
                  />
                  <button className="botao-enviar-dm-story" onClick={enviarMensagem}>Enviar</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Rodapé do post */}
        <div className="post-description">
          <p>
            {post.conteudo} {post.tags?.map((tag) => `#${tag.trim()}`).join(' ')}
          </p>
          <p>{new Date(post.dataPostagem).toLocaleString()}</p>
        </div>

        <hr />
      </article>
    </li>
  );
}

export default FeedItem;