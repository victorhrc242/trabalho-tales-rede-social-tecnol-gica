import React, { useEffect, useState } from 'react';
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

  if (loading) return <div className="loading">Carregando perfil...</div>;
  if (!usuario) return <div className="erro">Usuário não encontrado.</div>;

  const baseURL = 'https://seuservidor.com'; // substitua pela URL base do seu servidor
  const fotoPerfilURL = usuario.fotoPerfil ? `${baseURL}${usuario.fotoPerfil}` : null;

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
            <div key={post.id} className="post">
              <p><strong>Conteúdo:</strong> {post.conteudo}</p>
              {post.imagem && (
                <img src={post.imagem} alt="Imagem do post" />
              )}
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

      {/* Botões de interação */}
      <div className="botoes-perfil">
        <button>Seguir</button>
        <button>Mensagem</button>
      </div>
    </div>
  );
};

export default Perfil;
