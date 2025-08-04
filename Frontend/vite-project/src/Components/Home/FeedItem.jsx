import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, MoreVertical,Share2 } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import './modal.css'
function FeedItem({ post, usuario, videoAtivoId, registerVideoRef, curtirPost, abrirComentarios, irParaPerfil }) {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarTiposDenuncia, setMostrarTiposDenuncia] = useState(false);
  const opcoesRef = useRef(null);
  const [foiCurtido, setFoiCurtido] = useState(false);
  const [totalCurtidas, setTotalCurtidas] = useState(post.curtidas || 0);
  const [modalAberto, setModalAberto] = useState(false);
const [destinatarioId, setDestinatarioId] = useState("");
const [mensagem, setMensagem] = useState("");
const [seguindo, setSeguindo] = useState([]);
const [curtindo, setCurtindo] = useState(false);
  const denunciarPost = async (descricao) => {
    try {
      await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/denuncias/adicionar_denuncia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postid: post.id,
          usuarioid: usuario.id,
          descricao: descricao
        })
      });
      alert('Denúncia enviada com sucesso!');
      setMostrarMenu(false);
      setMostrarTiposDenuncia(false);
    } catch (err) {
      console.error('Erro ao denunciar:', err);
      alert('Erro ao enviar denúncia.');
    }
  };
useEffect(() => {
  const buscarUsuariosSeguindo = async () => {
    try {
      const res = await fetch(`http://localhost:5124/api/Amizades/seguindo/${usuario.id}`);
      const data = await res.json();

      if (data.sucesso && Array.isArray(data.seguindo)) {
        const usuariosDetalhados = await Promise.all(
          data.seguindo.map(async ({ usuario2 }) => {
            const resUser = await fetch(`http://localhost:5124/api/auth/usuario/${usuario2}`);
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
      console.error('Erro ao buscar detalhes dos usuários seguindo:', err);
    }
  };

  if (modalAberto) {
    buscarUsuariosSeguindo();
  }
}, [modalAberto, usuario.id]);

  useEffect(() => {
    async function checkCurtida() {
      const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/usuario-curtiu?postId=${post.id}&usuarioId=${usuario.id}`);
      const data = await res.json();
      setFoiCurtido(data.curtiu);
    }
    checkCurtida();
  }, [post.id, usuario.id]);
  if (!usuario?.id) {
  alert("Usuário não autenticado.");
  return;
}
const enviarMensagem = async () => {
  const corpo = {
  idRemetente: usuario.id,
  idDestinatario: destinatarioId,
  conteudo: mensagem,
  postCompartilhadoId: post.id
};


  try {
    const response = await fetch("http://localhost:5124/api/Mensagens/enviar-com-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(corpo)
    });

    const data = await response.json();
    if (data.sucesso) {
      alert("Mensagem enviada!");
      setModalAberto(false);
      setMensagem("");
      setDestinatarioId("");
    } else {
      alert("Erro: " + data.mensagem);
    }
  } catch (erro) {
    alert("Erro ao enviar: " + erro.message);
  }
};

async function handleCurtir() {
  if (curtindo) return;
  setCurtindo(true);

  setFoiCurtido(prev => !prev);
  setTotalCurtidas(prev => (foiCurtido ? prev - 1 : prev + 1));

  const resultado = await curtirPost(post.id);

  if (!resultado?.sucesso) {
    setFoiCurtido(prev => !prev);
    setTotalCurtidas(prev => (foiCurtido ? prev + 1 : prev - 1));
  }

  setCurtindo(false);
}




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

  return (
    <li style={{ marginBottom: '20px' }}>
      <div className="autor-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={post.autorImagem || 'https://sigeventos.unifesspa.edu.br/sigeventos/verArquivo?idArquivo=899786&key=7b31619566f4f78b8a447ec38d196e12'}
            alt={`Foto de ${post.autorNome}`}
            onClick={() => irParaPerfil(post.autorId)}
            style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10, cursor: 'pointer' }}
          />
          <span onClick={() => irParaPerfil(post.autorId)} style={{ fontWeight: 'bold', cursor: 'pointer' }}>
            {post.autorNome}
          </span>
        </div>

        {/* Botão e menu de opções */}
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

      <article
        data-postid={post.id}
        style={{ marginBottom: '20px' }}
        className="post-item"
      >
        {/* Conteúdo do post */}
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

        {/* Botões curtir/comentar */}
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



          <button className="botao-acao" onClick={() => abrirComentarios(post)}>
            <MessageCircle size={20} /> ({post.comentarios})
          </button>

          <button onClick={() => setModalAberto(true)} className="botao-enviar-dm">
  <Share2 size={20} />
</button>

        </div>
{modalAberto && (
  <div className="modal-overlay" onClick={() => setModalAberto(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Enviar post por mensagem</h3>

      <p>Selecione um destinatário:</p>
     <ul style={{ maxHeight: 150, overflowY: 'auto', padding: 0 }}>
  {seguindo.map((usuario) => (
    <li
      key={usuario.id}
      onClick={() => setDestinatarioId(usuario.id)}
      style={{
        cursor: 'pointer',
        padding: '5px 10px',
        backgroundColor: destinatarioId === usuario.id ? '#ddd' : '#f5f5f5',
        marginBottom: 5,
        borderRadius: 5,
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}
    >
      <img src={usuario.imagem} alt="avatar" style={{ width: 30, height: 30, borderRadius: '50%' }} />
      <span>{usuario.nome}</span>
    </li>
  ))}
</ul>


      {destinatarioId && (
        <>
          <textarea
            placeholder="Escreva uma mensagem (opcional)"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />
          <button onClick={enviarMensagem}>Enviar</button>
        </>
      )}
    </div>
  </div>
)}
        {/* Texto do post */}
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
