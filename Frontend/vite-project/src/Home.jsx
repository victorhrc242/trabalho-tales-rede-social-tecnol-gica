import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import './css/home.css'; // Você pode criar estilos aqui

function Home() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState('');

  // Modal states
  const [mostrarModal, setMostrarModal] = useState(false);
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      try {
        const usuarioObj = JSON.parse(usuarioString);
        setUsuario(usuarioObj);
      } catch (err) {
        console.error('Erro ao analisar os dados do usuário:', err);
        setUsuario({ nome: 'Desconhecido' });
      }
    }

    fetchFeed();
  }, [navigate]);

  const fetchFeed = async () => {
    try {
      const response = await fetch('https://localhost:7051/api/Feed/feed');
      const data = await response.json();

      if (response.ok) {
        setPosts(data);
      } else {
        setErro(data.erro || 'Erro ao carregar o feed');
      }
    } catch (err) {
      console.error('Erro ao buscar o feed:', err);
      setErro('Erro ao conectar com o servidor.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const abrirModal = () => {
    setConteudo('');
    setImagem('');
    setTags('');
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
  };

  const handleCriarPost = async (e) => {
    e.preventDefault();

    const novoPost = {
      autorId: usuario.id,
      conteudo,
      imagem,
      tags: tags.split(',').map(tag => tag.trim())
    };

    try {
      const response = await fetch('https://localhost:7051/api/feed/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPost)
      });

      if (response.ok) {
        const postCriado = await response.json();
        setPosts(prev => [postCriado, ...prev]); // Adiciona o novo post no topo
        fecharModal();
      } else {
        const erroResp = await response.json();
        setErro(erroResp.erro || 'Erro ao criar o post');
      }
    } catch (err) {
      console.error('Erro ao criar post:', err);
      setErro('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="home-container">
      <h1>Olá, {usuario.nome}!</h1>
      <p>Seja bem-vindo à Home!</p>
      <button onClick={handleLogout}>Sair</button>
      <button onClick={abrirModal} style={{ marginLeft: '10px' }}>Criar Post</button>

      <hr />

      <h2>Feed</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {posts.length === 0 && !erro && <p>Nenhum post encontrado.</p>}

      <ul>
        {posts.map(post => (
          <li key={post.id} style={{ marginBottom: '20px' }}>
            <p><strong>Conteúdo:</strong> {post.conteudo}</p>
            {post.imagem && (
              <img src={post.imagem} alt="Imagem do post" style={{ maxWidth: '300px' }} />
            )}
            <p><strong>Tags:</strong> {post.tags?.join(', ')}</p>
            <p><strong>Data:</strong> {new Date(post.dataPostagem).toLocaleString()}</p>
            <p><strong>Curtidas:</strong> {post.curtidas} | <strong>Comentários:</strong> {post.comentarios}</p>
            <hr />
          </li>
        ))}
      </ul>

      {/* Modal para criar post */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Criar Novo Post</h2>
            <form onSubmit={handleCriarPost}>
              <textarea
                placeholder="Escreva algo..."
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                required
              ></textarea>
              <input
                type="text"
                placeholder="URL da imagem (opcional)"
                value={imagem}
                onChange={(e) => setImagem(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tags separadas por vírgula"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <br />
              <button type="submit">Publicar</button>
              <button type="button" onClick={fecharModal} style={{ marginLeft: '10px' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;