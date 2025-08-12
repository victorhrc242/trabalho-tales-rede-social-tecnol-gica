import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Comentario from '../../Components/Comentario.jsx';
import VisualizacaoExploreSelecionado from '../../Components/visualizacaoexploreselecionado.jsx';
import '../Explore/css/explore.css';
import { FaVideo } from 'react-icons/fa';

function Explore({ usuarioLogado }) {
  const navigate = useNavigate();
  const API = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api';

  // Guarda o objeto completo do usuário, igual Home
  const [usuario, setUsuario] = useState(usuarioLogado || JSON.parse(localStorage.getItem('usuario')) || null);

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
  const [carregandoComentarios, setCarregandoComentarios] = useState(false);

  const videoRefs = useRef({});

  // Função para buscar posts + enriquecer com autor igual Home (pode copiar daqui)
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API}/Feed/feed`);
      if (!res.ok) throw new Error('Erro ao buscar posts');
      const data = await res.json();

      // Buscar dados dos autores (igual Home)
      const postsComAutores = await Promise.all(
        data.map(async (post) => {
          try {
            const resp = await fetch(`${API}/auth/usuario/${post.autorId}`);
            const autor = await resp.json();
            return {
              ...post,
              autorNome: autor.nome_usuario || 'Usuário',
              autorImagem: autor.imagem || null,
            };
          } catch {
            return { ...post, autorNome: 'Usuário', autorImagem: null };
          }
        })
      );

      setPosts(postsComAutores);
      setErro(null);
    } catch (e) {
      setErro(e.message);
    }
  };

  // Funções para abrir e buscar comentários (igual Home)
const fetchComentarios = async (postId) => {
  setCarregandoComentarios(true);
  try {
    const res = await fetch(`${API}/Comentario/comentarios/${postId}`);
    if (!res.ok) throw new Error('Erro ao buscar comentários');
    const data = await res.json();
    
    // Processa os comentários da mesma forma que no componente Comentario
    const comentariosRaw = data.comentarios || data;
    
    if (!Array.isArray(comentariosRaw)) {
      throw new Error('Formato de comentários inválido');
    }

    const comentariosProcessados = await Promise.all(
      comentariosRaw.map(async (comentario) => {
        if (!comentario.autorId) {
          return {
            ...comentario,
            autorNome: 'Usuário',
            autorImagem: 'https://via.placeholder.com/40',
          };
        }
        
        try {
          const r = await fetch(`${API}/auth/usuario/${comentario.autorId}`);
          const u = await r.json();
          return {
            ...comentario,
            autorNome: u.nome || u.nome_usuario || 'Usuário',
            autorImagem: u.imagem || 'https://via.placeholder.com/40',
          };
        } catch {
          return {
            ...comentario,
            autorNome: 'Usuário',
            autorImagem: 'https://via.placeholder.com/40',
          };
        }
      })
    );

    setComentarios(comentariosProcessados);
  } catch (e) {
    console.error('Erro ao buscar comentários:', e);
    setComentarios([]);
  } finally {
    setCarregandoComentarios(false);
  }
};

  const abrirComentarios = (post) => {
    setPostSelecionado(post);
    fetchComentarios(post.id);
    setComentarioTexto('');
  };

  // Função para curtir post igual Home (você pode copiar e colar direto)
  async function curtirPost(postId) {
    try {
      const verificarUrl = `${API}/Curtida/usuario-curtiu?postId=${postId}&usuarioId=${usuario?.id}`;
      const curtirUrl = `${API}/Curtida/curtir`;
      const descurtirUrl = `${API}/Curtida/descurtir`;

      const resVerifica = await fetch(verificarUrl);
      if (!resVerifica.ok) return { sucesso: false };
      const dataVerifica = await resVerifica.json();
      const jaCurtiu = dataVerifica.curtiu;

      const endpoint = jaCurtiu ? descurtirUrl : curtirUrl;
      const resPost = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, usuarioId: usuario?.id }),
      });
      if (!resPost.ok) return { sucesso: false };
      const dataPost = await resPost.json();
      const curtiuAgora = !jaCurtiu;

      setPosts((postsAntigos) =>
        postsAntigos.map((post) =>
          post.id === postId
            ? { ...post, foiCurtido: curtiuAgora, curtidas: dataPost.curtidasTotais }
            : post
        )
      );

      return { sucesso: true };
    } catch {
      return { sucesso: false };
    }
  }

  // Navegar para perfil
  const irParaPerfil = (id) => navigate(`/perfil/${id}`, { state: { userId: id } });

  // Monta posts quando o componente carregar
  useEffect(() => {
    fetchPosts();
  }, []);

  // Controle mobile (igual seu código)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers para vídeos (igual seu código)
  const handleVideoMouseEnter = (id) => videoRefs.current[id]?.play().catch(() => {});
  const handleVideoMouseLeave = (id) => videoRefs.current[id]?.pause();

  return (
    <div className="explore-page">
      {/* Sua busca de usuários aqui... */}

      {/* Seus posts aqui */}
      <div className="explore-grid">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`grid-item ${post.video ? 'video' : ''}`}
            onClick={() => abrirComentarios(post)}
          >
            {post.video ? (
              <div className="video-wrapper">
                <video
                  src={post.video}
                  muted
                  loop
                  playsInline
                  ref={(node) => (videoRefs.current[post.id] = node)}
                  onMouseEnter={() => handleVideoMouseEnter(post.id)}
                  onMouseLeave={() => handleVideoMouseLeave(post.id)}
                />
                <span className="video-icon">
                  <FaVideo />
                </span>
              </div>
            ) : (
              <img src={post.imagem} alt={`Post de ${post.autorNome}`} className="post-img" />
            )}
          </div>
        ))}
      </div>

      {/* Modal de comentários */}
      {postSelecionado && (
        isMobile ? (
          <div className="modal-overlay-explorar" onClick={() => setPostSelecionado(null)}>
            <div className="modal-content-explorar" onClick={(e) => e.stopPropagation()}>
              <VisualizacaoExploreSelecionado
                post={postSelecionado}
                comentarios={comentarios}
                comentarioTexto={comentarioTexto}
                setComentarioTexto={setComentarioTexto}
                comentar={() => {}}
                fechar={() => setPostSelecionado(null)}
                foiCurtido={postSelecionado.foiCurtido || false}
                totalCurtidas={postSelecionado.curtidas || 0}
                handleCurtir={curtirPost}
              />
            </div>
          </div>
        ) : (
          <Comentario
            post={postSelecionado}
            usuario={usuario}
            fechar={() => setPostSelecionado(null)}
            curtirPost={curtirPost}
            abrirComentarios={abrirComentarios}
            irParaPerfil={irParaPerfil}
          />
        )
      )}
    </div>
  );
}

export default Explore;
