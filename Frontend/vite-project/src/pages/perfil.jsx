import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../css/Perfil.css';
import { useLocation, useNavigate } from 'react-router-dom';

const Perfil = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const [usuario, setUsuario] = useState(null);
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
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

    if (usuarioLogado?.id && userId && usuarioLogado.id !== userId) {
  const verificarSeSegue = async () => {
    try {
      const res = await axios.get(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/verificar/${usuarioLogado.id}/${userId}`
      );
      setSeguindoUsuario(res.data?.seguindo || false);
    } catch (err) {
      console.error('Erro ao verificar se está seguindo:', err);
    }
  };
  verificarSeSegue();
}

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

const seguirUsuario = async () => {
  try {
    await axios.post(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguir`,
      {
        seguidorId: usuarioLogado.id,
        seguindoId: userId
      }
    );
    setSeguindoUsuario(true);
    setSeguidoresInfo(prev => ({
      ...prev,
      seguidores: prev.seguidores + 1
    }));
  } catch (err) {
    console.error('Erro ao seguir usuário:', err);
  }
};

const deixarDeSeguir = async () => {
  try {
    await axios.delete(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/deixar/${usuarioLogado.id}/${userId}`
    );
    setSeguindoUsuario(false);
    setSeguidoresInfo(prev => ({
      ...prev,
      seguidores: Math.max(0, prev.seguidores - 1)
    }));
  } catch (err) {
    console.error('Erro ao deixar de seguir usuário:', err);
  }
};

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
        'https://devisocial.up.railway.app/api/Comentario/comentarios/',
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
            {usuarioLogado?.id === usuario.id ? (
              !isEditing && (
                <div className="botoes-perfil">
                  <button onClick={() => setIsEditing(true)}>Editar Perfil</button>
                </div>
              )
            ) : (
              <div className="botoes-perfil">
                <button onClick={seguindoUsuario ? deixarDeSeguir : seguirUsuario}>
                  {seguindoUsuario ? 'Deixar de Seguir' : 'Seguir'}
                </button>
                <button onClick={() => alert("Função de mensagem ainda não implementada.")}>Mensagem</button>
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
              <p><strong></strong> {usuario.biografia || 'Sem biografia'}</p><br/>
              <p><strong>Seguidores:</strong> {seguidoresInfo.seguidores}</p><br/>
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
    <div className="modal-post-container" onClick={e => e.stopPropagation()}>
      <div className="modal-post-imagem-container">
        {modalPost.imagem && (
          <img src={modalPost.imagem} alt="Imagem do post" />
        )}
      </div>
      <div className="modal-post-conteudo">
        <div className="modal-post-header">
          <h3>{usuario.nome_usuario}</h3>
          <button className="fechar-btn" onClick={fecharModalPost}>×</button>
        </div>

        <div className="modal-post-comentarios">
          {comentarios.length === 0 && <p>Sem comentários ainda.</p>}
          {comentarios.map((c, idx) => (
            <div key={idx} className="comentario-item">
              <strong>{c.autor?.nome || 'Anônimo'}</strong>: {c.conteudo}
              {c.autor?.id === usuario.id && (
                <button
                  className="excluir-comentario-btn"
                  onClick={async () => {
                    try {
                      await axios.delete(
                        `https://devisocial.up.railway.app/api/Comentario/comentarios/${c.id}`
                      );
                      await fetchComentarios(modalPost.id);
                    } catch (error) {
                      console.error('Erro ao excluir comentário:', error);
                    }
                  }}
                  title="Excluir comentário"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="modal-comentar-box">
          <input
            ref={inputRef}
            type="text"
            value={novoComentario}
            onChange={e => setNovoComentario(e.target.value)}
            placeholder="Adicione um comentário..."
            onKeyDown={e => e.key === 'Enter' && enviarComentario()}
          />
          <button onClick={enviarComentario}>Enviar</button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Perfil;
