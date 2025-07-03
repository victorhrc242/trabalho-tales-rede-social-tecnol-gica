import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Explore/css/explore.css';
import Comentario from '../../Components/Comentario.jsx';

function Explore({ usuarioLogado }) {
  const navigate = useNavigate();
const usuario = JSON.parse(localStorage.getItem('usuario'));
const usuarioPrincipalId = usuario?.id;
  const POSTS_BATCH_SIZE = 6;

  const [allPosts, setAllPosts] = useState([]);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [erro, setErro] = useState(null);

  const [buscaTexto, setBuscaTexto] = useState('');
  const [resultadosUsuarios, setResultadosUsuarios] = useState([]);
  const [erroBuscaUsuarios, setErroBuscaUsuarios] = useState(null);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);

  const [postSelecionado, setPostSelecionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState('');

  const videoRefs = useRef({});
  const [videoAtivoId, setVideoAtivoId] = useState(null);

  // Aqui: estado para quem você já segue
  // Inicialize como um objeto: { usuarioId: true }
const [seguindoUsuario, setSeguindoUsuario] = useState({});


  const LS_POSTS_KEY = 'explore_posts_cache';

  const addAuthorData = async posts => {
    return Promise.all(
      posts.map(async post => {
        try {
          const res = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${post.autorId}`);
          const data = await res.json();
          return {
            ...post,
            autorNome: data.nome_usuario || 'Usuário',
            autorImagem: data.imagem || null,
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
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const cached = localStorage.getItem(LS_POSTS_KEY);
        if (cached) {
          setDisplayedPosts(JSON.parse(cached));
        }
      } catch {
        localStorage.removeItem(LS_POSTS_KEY);
      }

      try {
        const resp = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/feed');
        const data = await resp.json();

        if (!resp.ok) throw new Error(data.erro || 'Erro ao carregar feed');

        const postsComAutores = await addAuthorData(data);
        setAllPosts(postsComAutores);

        setDisplayedPosts(prev =>
          prev.length === 0 ? postsComAutores.slice(0, POSTS_BATCH_SIZE) : prev
        );
      } catch (e) {
        console.error(e);
        setErro(e.message);
      }
    };

    fetchPosts();

    // Opcional: buscar quem você já segue ao montar o componente,
    // para isso, você precisaria de uma API que retorne os ids seguidos.
    // Exemplo simples:
    // fetch('API_PARA_LISTAR_SEGUIDOS')
    //   .then(res => res.json())
    //   .then(data => setSeguindoUsuario(data.reduce((acc, u) => ({ ...acc, [u.id]: true }), {})))
    //   .catch(() => {});
  }, []);

  useEffect(() => {
    if (displayedPosts.length) {
      localStorage.setItem(LS_POSTS_KEY, JSON.stringify(displayedPosts));
    }
  }, [displayedPosts]);

  const loadMorePosts = () => {
    setDisplayedPosts(prev => {
      const nextBatch = allPosts.slice(prev.length, prev.length + POSTS_BATCH_SIZE);
      const merged = [...prev, ...nextBatch];

      const uniquePosts = Array.from(new Map(merged.map(p => [p.id, p])).values());

      return uniquePosts;
    });
  };

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
  }, [allPosts]);

  useEffect(() => {
    const ids = displayedPosts.map(p => p.id);
    const duplicados = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicados.length > 0) {
      console.warn('⚠️ IDs duplicados detectados:', duplicados);
    }
  }, [displayedPosts]);

  const abrirComentarios = async post => {
    setPostSelecionado(post);
    try {
      // const resp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentarios/${post.id}`);
      const data = await resp.json();
      setComentarios(resp.ok ? data : []);
    } catch {
      setComentarios([]);
    }
  };

  const comentar = async () => {
    if (!comentarioTexto.trim()) return;

    try {
      const resp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/comentarios/${postSelecionado.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo: comentarioTexto }),
      });
      const novo = await resp.json();
      if (resp.ok) {
        setComentarios(prev => [...prev, novo]);
        setComentarioTexto('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fecharComentarios = () => {
    setPostSelecionado(null);
    setComentarios([]);
    setComentarioTexto('');
  };

  const registerVideoRef = (id, node) => {
    if (node) videoRefs.current[id] = node;
  };

  useEffect(() => {
    if (!displayedPosts.length) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target;
          const id = video.dataset.postid;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            video.play().catch(() => {});
            setVideoAtivoId(id);
          } else {
            video.pause();
            if (id === videoAtivoId) setVideoAtivoId(null);
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

 const buscarUsuarios = async texto => {
  if (!texto.trim()) {
    setResultadosUsuarios([]);
    setErroBuscaUsuarios(null);
    setSeguindoUsuario({});
    return;
  }

  setBuscandoUsuarios(true);
  setErroBuscaUsuarios(null);

  try {
    const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/buscar-por-nome/${encodeURIComponent(texto)}`);
    const data = await response.json();

  if (response.ok && Array.isArray(data)) {
  setResultadosUsuarios(data);

  // Opcional: buscar se segue cada um
  for (const usuario of data) {
    const seguirResp = await fetch(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/segue?usuario1=${usuarioPrincipalId}&usuario2=${usuario.id}`
    );
    const seguirData = await seguirResp.json();

    setSeguindoUsuario(prev => ({
      ...prev,
      [usuario.id]: seguirResp.ok && seguirData.estaSeguindo,
    }));
  }
}
 else {
      setResultadosUsuarios([]);
      setErroBuscaUsuarios('Usuário não encontrado.');
      setSeguindoUsuario({});
    }
  } catch {
    setErroBuscaUsuarios('Erro na comunicação com o servidor.');
    setResultadosUsuarios([]);
    setSeguindoUsuario({});
  } finally {
    setBuscandoUsuarios(false);
  }
};


  useEffect(() => {
    const delay = setTimeout(() => {
      buscarUsuarios(buscaTexto);
    }, 400);

    return () => clearTimeout(delay);
  }, [buscaTexto]);

  const irParaPerfil = nomeUsuario => {
    navigate(`/perfil/${nomeUsuario}`);
  };

 const seguirUsuario = async usuarioIdParaSeguir => {
  try {
    const resp = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/solicitar-e-aceitar-automaticamente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario1: usuarioPrincipalId,
        usuario2: usuarioIdParaSeguir,
      }),
    });

    if (resp.ok) {
      setSeguindoUsuario(prev => ({
        ...prev,
        [usuarioIdParaSeguir]: true,
      }));
    } else {
      console.error('Erro ao seguir usuário');
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
};

  return (
    <div className="explore-page">
      <div style={{ marginBottom: '20px' }}>
       <input
        className="barra-pesquisa"
       type="text"  //esta impedindo de arredondar as bordas
        placeholder="Buscar usuários pelo nome..."
        value={buscaTexto}
        onChange={e => setBuscaTexto(e.target.value)}
        style={{borderRadius: '15px'}}
      />

        {buscandoUsuarios && <p></p>}
        {erroBuscaUsuarios && <p style={{ color: 'red' }}>{erroBuscaUsuarios}</p>}

        {resultadosUsuarios.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              marginTop: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {resultadosUsuarios.map(user => (
              <li
                key={user.id}
                style={{
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '1px solid #eee',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => irParaPerfil(user.nome_usuario)}
                >
                  <img
                    src={user.imagem || 'https://via.placeholder.com/40'}
                    alt={user.nome_usuario}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span>{user.nome_usuario}</span>
                </div>

               {!seguindoUsuario[user.id] ? (
  <button onClick={() => seguirUsuario(user.id)}>Seguir</button>
) : (
  <span>Seguindo</span>
)}

              </li>
            ))}
          </ul>
        )}
      </div>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <div className="explore-grid">
        {displayedPosts.map((post, index) => {
          const isVideo = Boolean(post.video);
          return (
            <div
              key={`${post.id}-${index}`} // Fallback para garantir unicidade mesmo que algum id se repita
              className={`grid-item ${isVideo ? 'video' : ''}`}
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
