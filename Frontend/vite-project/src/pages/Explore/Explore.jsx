import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';  // importar para navegação
import '../Explore/css/explore.css';
import Comentario from "../../Components/Comentario.jsx";


function Explore() {
  const navigate = useNavigate();

  const POSTS_BATCH_SIZE = 6;

  const [allPosts, setAllPosts] = useState([]); // Todos os posts carregados da API
  const [displayedPosts, setDisplayedPosts] = useState([]); // Posts exibidos na tela (incrementais)
  const [erro, setErro] = useState(null);

  // Estados para busca de usuários
  const [buscaTexto, setBuscaTexto] = useState('');
  const [resultadosUsuarios, setResultadosUsuarios] = useState([]);
  const [erroBuscaUsuarios, setErroBuscaUsuarios] = useState(null);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);

  // Comentários e post selecionado para modal
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState('');

  // Vídeos refs e estado de vídeo ativo
  const videoRefs = useRef({});
  const [videoAtivoId, setVideoAtivoId] = useState(null);

  const LS_POSTS_KEY = 'explore_posts_cache';

  // Função para adicionar dados do autor aos posts
  const addAuthorData = useCallback(async (posts) => {
    const postsComAutores = await Promise.all(
      posts.map(async (post) => {
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
    return postsComAutores;
  }, []);

  // Buscar posts da API e carregar cache localStorage para posts já exibidos
  useEffect(() => {
    const fetchPosts = async () => {
      // Tenta carregar posts já exibidos do localStorage
      const cached = localStorage.getItem(LS_POSTS_KEY);
      if (cached) {
        try {
          const cachedPosts = JSON.parse(cached);
          setDisplayedPosts(cachedPosts);
        } catch {
          localStorage.removeItem(LS_POSTS_KEY);
        }
      }

      // Busca todos os posts da API
      try {
        const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/feed`);
        const data = await response.json();

        if (response.ok) {
          const postsComAutores = await addAuthorData(data);
          setAllPosts(postsComAutores);

          // Se não há posts exibidos (ex: primeira carga), exibe os primeiros 6
          setDisplayedPosts(prev => prev.length === 0 ? postsComAutores.slice(0, POSTS_BATCH_SIZE) : prev);
        } else {
          setErro(data.erro || 'Erro ao carregar o feed');
        }
      } catch (err) {
        console.error('Erro ao buscar o feed:', err);
        setErro('Erro ao conectar com o servidor.');
      }
    };

    fetchPosts();
  }, [addAuthorData]);

  // Salva posts exibidos no localStorage sempre que eles mudam
  useEffect(() => {
    if (displayedPosts.length > 0) {
      localStorage.setItem(LS_POSTS_KEY, JSON.stringify(displayedPosts));
    }
  }, [displayedPosts]);

  // Carregar mais posts ao chegar perto do fim da lista (infinite scroll)
  const loadMorePosts = useCallback(() => {
    if (displayedPosts.length >= allPosts.length) return;

    const nextBatch = allPosts.slice(displayedPosts.length, displayedPosts.length + POSTS_BATCH_SIZE);
    setDisplayedPosts(prev => [...prev, ...nextBatch]);
  }, [allPosts, displayedPosts]);

  // Detecta scroll para disparar carregamento incremental
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const nearBottom = document.documentElement.offsetHeight - 300;

      if (scrollPosition >= nearBottom) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMorePosts]);

  // Abrir modal de comentários e carregar comentários
  const abrirComentarios = async (post) => {
    setPostSelecionado(post);

    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/comentarios/${post.id}`);
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

  // Enviar comentário
  const comentar = async () => {
    if (!comentarioTexto.trim()) return;

    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/comentarios/${postSelecionado.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo: comentarioTexto }),
      });
      if (response.ok) {
        const novoComentario = await response.json();
        setComentarios(prev => [...prev, novoComentario]);
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

  // Controlar refs dos vídeos
  const registerVideoRef = (id, node) => {
    if (node) {
      videoRefs.current[id] = node;
    }
  };

  // IntersectionObserver para play/pause dos vídeos automaticamente
  useEffect(() => {
    if (!displayedPosts.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            video.play().catch(() => {});
            setVideoAtivoId(video.dataset.postid);
          } else {
            video.pause();
            if (video.dataset.postid === videoAtivoId) setVideoAtivoId(null);
          }
        });
      },
      { threshold: 0.5 }
    );

    displayedPosts.forEach(post => {
      if (post.video && videoRefs.current[post.id]) {
        observer.observe(videoRefs.current[post.id]);
      }
    });

    return () => {
      displayedPosts.forEach(post => {
        if (post.video && videoRefs.current[post.id]) {
          observer.unobserve(videoRefs.current[post.id]);
        }
      });
    };
  }, [displayedPosts, videoAtivoId]);

  // Função para buscar usuários pela API, pelo nome digitado


  const buscarUsuarios = async (texto) => {
    if (!texto.trim()) {
      setResultadosUsuarios([]);
      setErroBuscaUsuarios(null);
      return;
    }

    setBuscandoUsuarios(true);
    setErroBuscaUsuarios(null);

    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuarios/busca?nome=${encodeURIComponent(texto)}`);
      const data = await response.json();

      if (response.ok) {
        setResultadosUsuarios(data || []);
      } else {
        setErroBuscaUsuarios(data.erro || 'Erro na busca de usuários.');
        setResultadosUsuarios([]);
      }
    } catch (err) {
  console.error('Erro na comunicação com o servidor:', err);
  setErroBuscaUsuarios('Erro na comunicação com o servidor.');
  setResultadosUsuarios([]);
    } finally {
      setBuscandoUsuarios(false);
    }
  };

  // Chamar a busca sempre que o texto mudar com debounce simples
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      buscarUsuarios(buscaTexto);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [buscaTexto]);

  // Navegar para perfil do usuário
  const irParaPerfil = (usuarioId) => {
    navigate(`/perfil/${usuarioId}`);
  };

  // CODIGO PARA PASSAR OS POST PARA FRENTE 

  

  return (
    <div className="explore-page">

      <div style={{ marginBottom: '20px' }}>
        <input
  type="text"
  placeholder="Buscar usuários pelo nome..."
  value={buscaTexto}
  onChange={e => setBuscaTexto(e.target.value)}
  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
/>

{buscandoUsuarios && <p>Buscando usuários...</p>}
{erroBuscaUsuarios && <p style={{ color: 'red' }}>{erroBuscaUsuarios}</p>}

{resultadosUsuarios.length > 0 && (
  <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', border: '1px solid #ddd', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
    {resultadosUsuarios.map(user => (
      <li
          key={user.id}
        style={{ padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #eee' }}
        onClick={() => irParaPerfil(user.id)}
      >
        <img
          src={user.imagem || 'https://via.placeholder.com/40'}
          alt={user.nome_usuario}
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <span>{user.nome_usuario}</span>
      </li>
    ))}
  </ul>
)}
      </div>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <div className="explore-grid">
        {displayedPosts.map(post => {
          const isVideo = post.video && post.video !== "";

          return (
            <div
              key={post.id}
              className={`grid-item ${isVideo ? "video" : ""}`}
              onClick={() => abrirComentarios(post)}
              style={{ cursor: 'pointer' }}
            >
              {isVideo ? (
                <video
                  src={post.video}
                  muted
                  loop
                  playsInline
                  data-postid={post.id}
                  ref={node => registerVideoRef(post.id, node)}
                  style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src={post.imagem}
                  alt={`Post de ${post.autorNome}`}
                  style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {postSelecionado && (
        <Comentario
          post={postSelecionado}
          comentarios={comentarios}
          comentarioTexto={comentarioTexto}
          setComentarioTexto={setComentarioTexto}
          comentar={comentar}
          fechar={fecharComentarios}
        />
      )}
    </div>
  );
}

export default Explore;
