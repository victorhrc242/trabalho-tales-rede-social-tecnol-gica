// Components/Home.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import FeedItem from '../Components/Home/FeedItem';
import Comentario from '../Components/Comentario';
import '../css/home.css';

function Home() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState('');
  const [modalComentarios, setModalComentarios] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [videoAtivoId, setVideoAtivoId] = useState(null);
  const videoRefs = useRef({});

  const registerVideoRef = useCallback((postId, node) => {
    if (node) {
      videoRefs.current[postId] = node;
    }
  }, []);

  const salvarPostsLocalmente = (postsParaSalvar) => {
    const dadosFiltrados = postsParaSalvar.slice(0, 5).map(post => ({
      id: post.id,
      conteudo: post.conteudo,
      autorNome: post.autorNome,
      autorImagem: post.autorImagem,
      imagem: post.imagem,
      video: post.video,
      dataPostagem: post.dataPostagem,
      tags: post.tags,
      curtidas: post.curtidas,
      comentarios: post.comentarios,
      autorId: post.autorId,
    }));
    localStorage.setItem('postsSalvos', JSON.stringify(dadosFiltrados));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      try {
        setUsuario(JSON.parse(usuarioString));
      } catch {
        setUsuario({ nome: 'Desconhecido' });
      }
    }
  }, [navigate]);

 useEffect(() => {
  const cache = localStorage.getItem('postsSalvos');
  if (cache) {
    try {
      setPosts(JSON.parse(cache));
    } catch (erro) {
      console.error('Erro ao carregar posts do cache:', erro);
    }
  }
}, []);

  useEffect(() => {
    if (usuario.id) fetchFeed();
  },);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/feedHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
      connection.on('NovoPost', (novoPost) => {
        setPosts(prev => [novoPost, ...prev]);
      });
    });

    return () => connection.stop();
  }, []);

  useEffect(() => {
    const curtidaConnection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/curtidaHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    curtidaConnection.start().then(() => {
      curtidaConnection.on('ReceberCurtida', (postId, usuarioId, foiCurtida) => {
        setPosts(prev =>
          prev.map(post => {
            if (post.id === postId) {
              const curtidasAtualizadas = foiCurtida
                ? (post.curtidas || 0) + 1
                : Math.max(0, (post.curtidas || 0) - 1);
              return { ...post, curtidas: curtidasAtualizadas };
            }
            return post;
          })
        );
      });
    });

    return () => curtidaConnection.stop();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visiveis = entries.filter(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5);
        if (visiveis.length === 0) return setVideoAtivoId(null);
        const postId = visiveis[0].target.getAttribute('data-postid');
        setVideoAtivoId(postId);
      },
      { threshold: 0.5 }
    );

    posts.forEach(post => {
      if (post.video && videoRefs.current[post.id]) {
        observer.observe(videoRefs.current[post.id]);
      }
    });

    return () => {
      posts.forEach(post => {
        if (post.video && videoRefs.current[post.id]) {
          observer.unobserve(videoRefs.current[post.id]);
        }
      });
    };
  }, [posts]);

  const fetchFeed = async () => {
    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/feed/${usuario.id}`);
      const data = await response.json();

      if (response.ok) {
        const postsComAutores = await Promise.all(
          data.map(async post => {
            try {
              const resp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${post.autorId}`);
              const autor = await resp.json();
              return { ...post, autorNome: autor.nome_usuario || 'Usuário', autorImagem: autor.imagem || null };
            } catch {
              return { ...post, autorNome: 'Usuário', autorImagem: null };
            }
          })
        );
        setPosts(postsComAutores);
        salvarPostsLocalmente(postsComAutores);
      } else {
        setErro(data.erro || 'Erro ao carregar o feed');
      }
    } catch {
      setErro('Erro ao conectar com o servidor.');
    }
  };

  const curtirPost = async (postId) => {
    const verificarUrl = `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/post/${postId}`;
    const curtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/curtir';
    const descurtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/descurtir';

    try {
      const res = await fetch(verificarUrl, { method: 'GET' });
      const data = await res.json();
      const jaCurtiu = data.curtidas?.some(c => c.usuarioId === usuario.id);

      const endpoint = jaCurtiu ? descurtirUrl : curtirUrl;
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, usuarioId: usuario.id }),
      });
    } catch (err) {
      console.error('Erro ao curtir/descurtir:', err);
    }
  };

  const abrirComentarios = async (post) => {
    setPostSelecionado(post);
    setComentarioTexto('');
    setComentarios([]);
    setModalComentarios(true);

    try {
      const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`);
      const data = await res.json();

      const comentariosComNomes = await Promise.all(
        data.comentarios.map(async comentario => {
          try {
            const r = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${comentario.autorId}`);
            const u = await r.json();
            return { ...comentario, autorNome: u.nome || 'Usuário' };
          } catch {
            return { ...comentario, autorNome: 'Usuário' };
          }
        })
      );

      setComentarios(comentariosComNomes);
    } catch (err) {
      console.error('Erro ao carregar comentários:', err);
    }
  };

  const comentar = async () => {
    if (!comentarioTexto.trim()) return;
    const comentario = { postId: postSelecionado.id, autorId: usuario.id, conteudo: comentarioTexto };

    try {
      await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comentario),
      });
      setComentarioTexto('');
      abrirComentarios(postSelecionado);
      fetchFeed();
    } catch (err) {
      console.error('Erro ao comentar:', err);
    }
  };

  const irParaPerfil = (id) => {
    navigate(`/perfil/${id}`, { state: { userId: id } });
  };

  useEffect(() => {
    const i = setInterval(() => {
      if (posts.length > 0) salvarPostsLocalmente(posts);
    }, 10000);
    return () => clearInterval(i);
  }, [posts]);

  return (
    <div className="home-container">
      <hr /><br /><br />
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {posts.length === 0 && !erro && <p>Nenhum post encontrado.</p>}

      <ul>
        {posts.map(post => (
          <FeedItem
            key={post.id}
            post={post}
            usuario={usuario}
            videoAtivoId={videoAtivoId}
            curtirPost={curtirPost}
            abrirComentarios={abrirComentarios}
            irParaPerfil={irParaPerfil}
            registerVideoRef={registerVideoRef}
          />
        ))}
      </ul>

      {modalComentarios && postSelecionado && (
        <Comentario
          post={postSelecionado}
          comentarios={comentarios}
          comentarioTexto={comentarioTexto}
          setComentarioTexto={setComentarioTexto}
          comentar={comentar}
          fechar={() => setModalComentarios(false)}
          usuario={usuario}
        />
      )}
    </div>
  );
}

export default Home;
