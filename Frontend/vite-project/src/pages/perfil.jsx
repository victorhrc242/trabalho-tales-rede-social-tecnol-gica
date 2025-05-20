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
  const [isEditing, setIsEditing] = useState(false);
  const [nome, setNome] = useState('');
  const [biografia, setBiografia] = useState('');
  const [imagem, setImagem] = useState('');
  const inputRef = useRef();
  const [seguindoUsuario, setSeguindoUsuario] = useState(false);


  useEffect(() => {
    if (!userId) return navigate('/');

    const carregarDados = async () => {
      try {
        // Buscar dados do usuário
        const { data: userData } = await axios.get(
          `https://devisocial.up.railway.app/api/auth/usuario/${userId}`
        );
        setUsuario(userData);
        setNome(userData.nome_usuario);
        setBiografia(userData.biografia);
        setImagem(userData.FotoPerfil);

        // Buscar posts do usuário
        const { data: postsData } = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/posts/usuario/${userId}`
        );
        setPosts(postsData);

        // Buscar seguidores e seguindo
        const seguidoresRes = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguidores/${userId}`
        );
        const seguindoRes = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${userId}`
        );

        const seguidoresTotal = seguidoresRes.data?.seguidores?.length || 0;
        const seguindoTotal = seguindoRes.data?.seguindo?.length || 0;

        setSeguidoresInfo({
          seguidores: seguidoresTotal,
          seguindo: seguindoTotal
        });
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [userId, navigate]);

  const editarPerfil = async () => {
    try {
      // Crie um objeto para o payload apenas com os campos que foram alterados
      const payload = {};

      if (nome_usuario !== usuario.nome_usuario) {
        payload.nome_usuario = nome_usuario;
      }

      if (biografia !== usuario.biografia) {
        payload.biografia = biografia;
      }

      if (imagem !== usuario.FotoPerfil) {
        payload.imagem = imagem;
      }

      // Verifique se há dados para atualizar
      if (Object.keys(payload).length === 0) {
        alert("Não há dados para atualizar.");
        return;
      }

      // Envie a requisição de atualização apenas com os campos modificados
      const response = await axios.put(
        `https://devisocial.up.railway.app/api/auth/editarusuarios/${userId}`,
        payload
      );

      // Atualiza o estado com os dados editados
      setUsuario(response.data[0]);
      setIsEditing(false); // Fecha o modo de edição
    } catch (err) {
      console.error('Erro ao editar perfil:', err);
    }
  };

  const fetchComentarios = async (postId) => {
    try {
      const response = await axios.get(
        `https://devisocial.up.railway.app/api/Comentario/post/${postId}?comAutor=true`
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
        'https://devisocial.up.railway.app/api/Comentario/comentar',
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
        <div className="foto-perfil">
          {/* foto de perfil */}
          <img
            src={usuario.imagem || 'https://via.placeholder.com/150'}
            alt={`Foto de perfil de ${usuario.nome}`}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        </div>
        <div className="perfil-info">
          <h1>{usuario.nome_usuario}</h1>
          {usuario.id === userId && !isEditing && (
            <div className="botoes-perfil">
              <button onClick={() => setIsEditing(true)}>Editar Perfil</button>
            </div>
          )}
          {isEditing && (
            <div className="editar-formulario">
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome"
              />
              <textarea
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                placeholder="Biografia"
              />
              <input
                type="text"
                value={imagem}
                onChange={(e) => setImagem(e.target.value)}
                placeholder="Imagem URL"
              />
              <button onClick={editarPerfil}>Salvar</button>
              <button onClick={() => setIsEditing(false)}>Cancelar</button>
            </div>
          )}
          {!isEditing && (
            <div className="infor-pessoais">
              <p><strong>Biografia:</strong> {usuario.biografia || 'Sem biografia'}</p>
              <p><strong>Seguidores:</strong> {seguidoresInfo.seguidores}</p>
              <p><strong>Seguindo:</strong> {seguidoresInfo.seguindo}</p>
            </div>
          )}
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
              {modalPost.imagem && <img src={modalPost.imagem} alt="Imagem do post" />}
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
    </div>
  );
};

export default Perfil;
