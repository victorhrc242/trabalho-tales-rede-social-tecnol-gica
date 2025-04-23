import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../css/Perfil.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io("https://trabalho-tales-rede-social-tecnol-gica.onrender.com");

const Perfil = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const [usuario, setUsuario] = useState(null);
  const [posts, setPosts] = useState([]);
  const [seguidoresInfo, setSeguidoresInfo] = useState({ seguidores: 0, seguindo: 0 });
  const [loading, setLoading] = useState(true);
  const [modalPost, setModalPost] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const carregarDados = async () => {
      try {
        const usuarioResponse = await axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${userId}`);
        setUsuario(usuarioResponse.data);

        const postsResponse = await axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/posts/usuario/${userId}`);
        setPosts(postsResponse.data);

        const seguidoresRes = await axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguidores/${userId}`);
        const seguindoRes = await axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${userId}`);

        setSeguidoresInfo({
          seguidores: seguidoresRes.data.length,
          seguindo: seguindoRes.data.length
        });

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
        setLoading(false);
      }
    };

    carregarDados();
  }, [userId, navigate]);

  useEffect(() => {
    socket.on("comentarioRecebido", async (comentario) => {
      if (comentario.postId === modalPost?.id) {
        try {
          const response = await axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentarios/post/${comentario.postId}?comAutor=true`);
          setComentarios(response.data);
        } catch (error) {
          console.error("Erro ao atualizar comentários em tempo real:", error);
        }
      }
    });

    return () => {
      socket.off("comentarioRecebido");
    };
  }, [modalPost]);

  if (loading) return <div className="loading">Carregando perfil...</div>;
  if (!usuario) return <div className="erro">Usuário não encontrado.</div>;

  const baseURL = 'https://seuservidor.com';
  const fotoPerfilURL = usuario.fotoPerfil ? `${baseURL}${usuario.fotoPerfil}` : null;

  const abrirModalPost = async (post) => {
    setModalPost(post);
    try {
      const response = await axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentarios/post/${post.id}?comAutor=true`);
      setComentarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
    }
  };

  const fecharModalPost = () => {
    setModalPost(null);
    setComentarios([]);
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;
    const comentario = {
      postId: modalPost.id,
      conteudo: novoComentario,
      autorId: usuario.id,
    };
    try {
      await axios.post("https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentarios", comentario);
      socket.emit("novoComentario", comentario);
      setNovoComentario("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    }
  };

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        {fotoPerfilURL ? (
          <img src={fotoPerfilURL} alt={`Foto de ${usuario.nome}`} className="foto-perfil" />
        ) : (
          <div className="foto-perfil-placeholder">
            <span>{usuario.nome.charAt(0)}</span>
          </div>
        )}
        <div className="perfil-info">
          <h1>{usuario.nome}</h1>
          <div className="infor-pessoais">
            <p><strong>Biografia:</strong> {usuario.biografia}</p>
            <p><strong>Seguidores:</strong> {seguidoresInfo.seguidores}</p>
            <p><strong>Seguindo:</strong> {seguidoresInfo.seguindo}</p>
          </div>
        </div>
      </div>

      <div className="perfil-posts">
        <h2>Meus Posts</h2>
        {posts.length === 0 ? (
          <p>Este usuário ainda não postou nada.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post" onClick={() => abrirModalPost(post)} style={{ cursor: 'pointer' }}>
              {post.imagem && (
                <img src={post.imagem} alt="Imagem do post" />
              )}
              <p><strong>Conteúdo:</strong> {post.conteudo}</p>
              <p><strong>Tags:</strong> {post.tags?.join(', ')}</p>
              <p><strong>Data:</strong> {new Date(post.dataPostagem).toLocaleString()}</p>
              <p>
                <strong>Curtidas:</strong> {post.curtidas} |{' '}
                <strong>Comentários:</strong> {post.comentarios}
              </p>
              <hr />
            </div>
          ))
        )}
      </div>

      {modalPost && (
        <div className="modal-overlay" onClick={fecharModalPost}>
          <div className="modal-post" onClick={(e) => e.stopPropagation()}>
            <div className="modal-post-imagem">
              {modalPost.imagem && <img src={modalPost.imagem} alt="Imagem do post" />}
            </div>
            <div className="modal-post-detalhes">
              <div className="modal-post-header">
                <h3>{usuario.nome}</h3>
              </div>
              <div className="modal-post-comentarios">
                {comentarios.map((comentario, index) => (
                  <div key={index} className="comentario">
                    <strong>{comentario.autor?.nome || "Anônimo"}:</strong> {comentario.conteudo}
                  </div>
                ))}
              </div>
              <div className="comentar-box">
                <input
                  ref={inputRef}
                  type="text"
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Adicionar um comentário..."
                />
                <button onClick={enviarComentario}>Comentar</button>
              </div>
              <button className="fechar-btn" onClick={fecharModalPost}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      <div className="botoes-perfil">
        <button>Seguir</button>
        <button>Mensagem</button>
      </div>
    </div>
  );
};

export default Perfil;
