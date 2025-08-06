import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Comentario from '../../Components/Comentario.jsx';
import '../Explore/css/explore.css';
import { FaVideo } from 'react-icons/fa';

function Explore({ usuarioLogado }) {
  const navigate = useNavigate();
  const usuarioId = usuarioLogado?.id;
  const videoRefs = useRef({});
  const API = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api';

  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState(null);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [resultadosUsuarios, setResultadosUsuarios] = useState([]);
  const [seguindoUsuario, setSeguindoUsuario] = useState({});
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);
  const [erroBuscaUsuarios, setErroBuscaUsuarios] = useState(null);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState('');

  const irParaPerfil = (nome) => navigate(`/perfil/${nome}`);

  const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro');
    return res.json();
  };

  const fetchAutorData = async (id) => {
    try {
      const data = await fetchJson(`${API}/auth/usuario/${id}`);
      return { nome: data.nome_usuario || 'Usuário', imagem: data.imagem || null };
    } catch {
      return { nome: 'Usuário', imagem: null };
    }
  };

  const enrichWithAutor = async (items) => {
    return Promise.all(items.map(async (item) => {
      const autor = await fetchAutorData(item.autorId);
      return { ...item, autorNome: autor.nome, autorImagem: autor.imagem };
    }));
  };

  const fetchPosts = async () => {
    try {
      const data = await fetchJson(`${API}/Feed/feed`);
      const enriched = await enrichWithAutor(data);
      // Marcar aleatoriamente até 3 posts como destaque
      const indicesAleatorios = enriched
        .map((_, i) => i)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const finalPosts = enriched.map((post, i) => ({
        ...post,
        destaque: indicesAleatorios.includes(i),
      }));
      setPosts(finalPosts);
    } catch (e) {
      setErro(e.message);
    }
  };

  const abrirComentarios = async (post) => {
    setPostSelecionado(post);
    try {
      const data = await fetchJson(`${API}/Comentario/comentarios/${post.id}`);
      const enriched = await enrichWithAutor(data);
      setComentarios(enriched);
    } catch {
      setComentarios([]);
    }
  };

  const comentar = async () => {
    if (!comentarioTexto.trim()) return;
    try {
      const res = await fetch(`${API}/Feed/comentarios/${postSelecionado.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo: comentarioTexto }),
      });

      if (res.ok) {
        const novo = await res.json();
        const autor = await fetchAutorData(novo.autorId);
        setComentarios(prev => [...prev, { ...novo, autorNome: autor.nome, autorImagem: autor.imagem }]);
        setComentarioTexto('');
      }
    } catch {}
  };

  const buscarUsuarios = async (texto) => {
    if (!texto.trim()) {
      setResultadosUsuarios([]);
      setErroBuscaUsuarios(null);
      return;
    }

    setBuscandoUsuarios(true);
    try {
      const data = await fetchJson(`${API}/auth/buscar-por-nome/${encodeURIComponent(texto)}`);
      setResultadosUsuarios(data);

      const status = {};
      await Promise.all(data.map(async (user) => {
        try {
          const followData = await fetchJson(`${API}/Amizades/segue?usuario1=${usuarioId}&usuario2=${user.id}`);
          status[user.id] = followData.estaSeguindo;
        } catch {
          status[user.id] = false;
        }
      }));

      setSeguindoUsuario(status);
    } catch {
      setErroBuscaUsuarios('Erro ao buscar usuários.');
      setResultadosUsuarios([]);
    } finally {
      setBuscandoUsuarios(false);
    }
  };

  const seguirUsuario = async (id) => {
    try {
      const res = await fetch(`${API}/Amizades/solicitar-e-aceitar-automaticamente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario1: usuarioId, usuario2: id }),
      });
      if (res.ok) setSeguindoUsuario(prev => ({ ...prev, [id]: true }));
    } catch {}
  };

  useEffect(() => {
    const delay = setTimeout(() => buscarUsuarios(buscaTexto), 400);
    return () => clearTimeout(delay);
  }, [buscaTexto]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleVideoMouseEnter = (id) => videoRefs.current[id]?.play().catch(() => {});
  const handleVideoMouseLeave = (id) => videoRefs.current[id]?.pause();

  return (
    <div className="explore-page">
      <input
        className="barra-pesquisa"
        type="text"
        placeholder="Buscar usuários pelo nome..."
        value={buscaTexto}
        onChange={e => setBuscaTexto(e.target.value)}
      />

      {erroBuscaUsuarios && <p className="erro">{erroBuscaUsuarios}</p>}

      {resultadosUsuarios.length > 0 && (
        <ul className="usuarios-resultado">
          {resultadosUsuarios.map(user => (
            <li key={user.id}>
              <div onClick={() => irParaPerfil(user.nome_usuario)}>
                <img src={user.imagem || 'https://via.placeholder.com/40'} alt={user.nome_usuario} />
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

      {erro && <p className="erro">{erro}</p>}

      <div className="explore-grid">
        {posts.map(post => (
          <div
            key={post.id}
            className={`grid-item ${post.video ? 'video' : ''} ${post.destaque ? 'destaque' : ''}`}
            onClick={() => abrirComentarios(post)}
          >
            {post.video ? (
              <div className="video-wrapper">
                <video
                  src={post.video}
                  muted
                  loop
                  playsInline
                  ref={node => (videoRefs.current[post.id] = node)}
                  onMouseEnter={() => handleVideoMouseEnter(post.id)}
                  onMouseLeave={() => handleVideoMouseLeave(post.id)}
                />
                <span className="video-icon"><FaVideo /></span>
              </div>
            ) : (
              <img src={post.imagem} alt={`Post de ${post.autorNome}`} className="post-img" />
            )}
          </div>
        ))}
      </div>

      {postSelecionado && (
        <Comentario
          post={postSelecionado}
          comentarios={comentarios}
          comentarioTexto={comentarioTexto}
          setComentarioTexto={setComentarioTexto}
          comentar={comentar}
          fechar={() => {
            setPostSelecionado(null);
            setComentarios([]);
            setComentarioTexto('');
          }}
        />
      )}
    </div>
  );
}

export default Explore;
