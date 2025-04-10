import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
      navigate('/'); // Redireciona se o ID não for passado
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

  if (loading) return <div>Carregando perfil...</div>;
  if (!usuario) return <div>Usuário não encontrado.</div>;

  return (
    <div className="perfil-container">
      <h1>Perfil de {usuario.nome}</h1>
      <p>Email: {usuario.email}</p>
      <p>Seguidores: {seguidoresInfo.seguidores}</p>
      <p>Seguindo: {seguidoresInfo.seguindo}</p>

      <h2>Meus Posts</h2>
      {posts.length === 0 ? (
        <p>Este usuário ainda não postou nada.</p>
      ) : (
        posts.map(post => (
          <div key={post.id} style={{ marginBottom: '20px' }}>
            <p><strong>Conteúdo:</strong> {post.conteudo}</p>
            {post.imagem && <img src={post.imagem} alt="Imagem do post" style={{ maxWidth: '300px' }} />}
            <p><strong>Tags:</strong> {post.tags?.join(', ')}</p>
            <p><strong>Data:</strong> {new Date(post.dataPostagem).toLocaleString()}</p>
            <p><strong>Curtidas:</strong> {post.curtidas} | <strong>Comentários:</strong> {post.comentarios}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
};

export default Perfil;
