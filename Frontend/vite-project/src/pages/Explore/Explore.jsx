import React, { useEffect, useState } from 'react';
import '../Explore/css/explore.css';
import Comentario from "../../Components/Comentario.jsx";

function Explore() {
  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState(null);

  // Estado para o post atualmente selecionado para mostrar comentários
  const [postSelecionado, setPostSelecionado] = useState(null);

  // Estados para controlar comentários
  const [comentarios, setComentarios] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState('');

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

  // Função para abrir o modal de comentários, carregando os comentários do post
  const abrirComentarios = async (post) => {
    setPostSelecionado(post);

    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/comentarios/${post.id}`); // Ajuste a URL conforme sua API
      const data = await response.json();
      if (response.ok) {
        setComentarios(data);
      } else {
        setComentarios([]);
      }
    } catch (err) {
      console.error('Erro ao carregar comentários:', err);
      setComentarios([]);
    }
  };

  // Função para enviar um comentário
  const comentar = async () => {
    if (!comentarioTexto.trim()) return;

    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/comentarios/${postSelecionado.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo: comentarioTexto }),
      });
      if (response.ok) {
        // Atualiza a lista de comentários após enviar
        const novoComentario = await response.json();
        setComentarios([...comentarios, novoComentario]);
        setComentarioTexto('');
      } else {
        console.error('Erro ao enviar comentário');
      }
    } catch (err) {
      console.error('Erro na requisição de comentário:', err);
    }
  };

  // Fechar modal de comentários
  const fecharComentarios = () => {
    setPostSelecionado(null);
    setComentarios([]);
    setComentarioTexto('');
  };

  useEffect(() => {
    fetexplore();
  }, []);

 return (
  <div className="explore-page">
    <div className="explore-grid">
      {posts.map((post) => {
        const isVideo = post.video && post.video !== "";

        return (
          <div
            key={post.id}
            className={`grid-item ${isVideo ? "video" : ""}`}
          >
            {isVideo ? (
              <video src={post.video} controls muted />
            ) : (
              <img src={post.imagem} alt="Postagem" />
            )}
            <div className="overlay">
              <p>{post.conteudo}</p>
            </div>
          </div>
        );
      })}
    
    </div>
  </div>
);

}

export default Explore;
