import React, { useEffect, useState } from 'react';
import '../Explore/css/explore.css';

function Explore() {
  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState(null);

  const fetexplore = async () => {
    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/feed`);
      const data = await response.json();

      if (response.ok) {
        const postsComAutores = await Promise.all(
          data.map(async (post) => {
            try {
              const autorResp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${post.autorId}`);
              const autorData = await autorResp.json();
              return {
                ...post,
                autorNome: autorData.nome_usuario || 'Usuário',
                autorImagem: autorData.imagem || null,
              };
            } catch {
              return {
                ...post,
                autorNome: 'Usuário',
                autorImagem: null,
              };
            }
          })
        );

        setPosts(postsComAutores);
      } else {
        setErro(data.erro || 'Erro ao carregar o feed');
      }
    } catch (err) {
      console.error('Erro ao buscar o feed:', err);
      setErro('Erro ao conectar com o servidor.');
    }
  };

  useEffect(() => {
    fetexplore();
  }, []);

  return (
    <div className="explore-container">
      <h2 className="explore-title">Explore</h2>

      {erro && <p className="error-message">{erro}</p>}

      {posts.length === 0 && !erro && <p className="loading-message">Carregando posts...</p>}

      {posts.map((post) => (
        <div key={post.id} className="post">
          {post.autorImagem && (
            <img src={post.autorImagem} alt={post.autorNome} />
          )}
          <div className="post-content">
            <div className="post-author">{post.autorNome}</div>
            <div><img src={post.imagem} alt="" />
            {post.conteudo}</div>
          </div>
        </div>
      ))}
      
    </div>
  );
}

export default Explore;
