import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const Home = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('usuario');

    if (!token || !user || user === 'undefined') {
      // Redireciona apenas uma vez
      navigate('/');
    } else {
      try {
        const usuarioObj = JSON.parse(user);
        setUsuario(usuarioObj);
      } catch (error) {
        console.error('Erro ao fazer parse do usuário:', error);
        navigate('/');
      }
    }
  }, []); // Executa apenas uma vez na montagem

  useEffect(() => {
    if (usuario) {
      carregarFeed();
    }
  }, [usuario]); // Só executa quando "usuario" for setado com sucesso

  const carregarFeed = async () => {
    try {
      const response = await fetch('https://localhost:7051/api/Feed');

      if (!response.ok) {
        throw new Error('Erro ao carregar feed');
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Erro ao buscar feed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bem-vindo, {usuario?.nome || 'usuário'}!</h1>
      <button onClick={handleLogout}>Sair</button>

      <h2>Feed</h2>
      {posts.length === 0 ? (
        <p>Nenhum post encontrado.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
              <p><strong>Autor:</strong> {post.autorId}</p>
              <p><strong>Conteúdo:</strong> {post.conteudo}</p>
              {post.imagem && <img src={post.imagem} alt="Post" width="200" />}
              <p><strong>Tags:</strong> {post.tags?.join(', ')}</p>
              <p><strong>Postado em:</strong> {new Date(post.dataPostagem).toLocaleString()}</p>
              <p><strong>Curtidas:</strong> {post.curtidas} | <strong>Comentários:</strong> {post.comentarios}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Home;
