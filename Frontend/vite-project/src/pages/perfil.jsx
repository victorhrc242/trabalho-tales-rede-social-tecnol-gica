import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../css/Perfil.css';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const [novoComentario, setNovoComentario] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    if (!userId) return navigate('/');
    const carregarDados = async () => {
      try {
        const { data: userData } = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${userId}`
        );
        setUsuario(userData);

        const { data: postsData } = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/posts/usuario/${userId}`
        );
        setPosts(postsData);

        const seguidoresRes = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguidores/${userId}`
        );
        const seguindoRes = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${userId}`
        );
        setSeguidoresInfo({
          seguidores: seguidoresRes.data.length,
          seguindo: seguindoRes.data.length
        });
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [userId, navigate]);

  const fetchComentarios = async (postId) => {
    try {
      const response = await axios.get(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/post/${postId}?comAutor=true`
      );
      setComentarios(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
    }
  };

  const abrirModalPost = async (post) => {
    setModalPost(post);
    setComentarios([]);
    await fetchComentarios(post.id);
  };

  const fecharModalPost = () => {
    setModalPost(null);
    setComentarios([]);
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;
    const payload = {
      postId: modalPost.id,
      autorId: usuario.id,
      conteudo: novoComentario
    };
    try {
      await axios.post(
        'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentarios',
        payload
      );
      setNovoComentario('');
      inputRef.current?.focus();
      await fetchComentarios(modalPost.id);
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
    }
  };

  if (loading) return <div className="loading">Carregando perfil...</div>;
  if (!usuario) return <div className="erro">Usuário não encontrado.</div>;

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        {usuario.fotoPerfil ? (
          <img
            src={`https://seuservidor.com${usuario.fotoPerfil}`}
            alt={`Foto de ${usuario.nome}`}
            className="foto-perfil"
          />
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
        {posts.map((post) => (
          <div
            key={post.id}
            className="post"
            onClick={() => abrirModalPost(post)}
            style={{ cursor: 'pointer' }}
          >
            {post.imagem && <img src={post.imagem} alt="Imagem do post" />}
            <hr />
          </div>
        ))}
      </div>

      {modalPost && (
        <div className="modal-overlay" onClick={fecharModalPost}>
          <div className="modal-post" onClick={(e) => e.stopPropagation()}>
            <div className="modal-post-imagem">
              {modalPost.imagem && (<img src={modalPost.imagem} alt="Imagem do post" />)}
            </div>
            <div className="modal-post-detalhes">
              <div className="modal-post-header">
                <h3>{usuario.nome}</h3>
              </div>
              <div className="modal-post-comentarios">
                {comentarios.map((c, i) => (
                  <div key={i} className="comentario">
                    <strong>{c.autor?.nome || 'Anônimo'}:</strong> {c.conteudo}
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
              <button className="fechar-btn" onClick={fecharModalPost}>
                Fechar
              </button>
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
