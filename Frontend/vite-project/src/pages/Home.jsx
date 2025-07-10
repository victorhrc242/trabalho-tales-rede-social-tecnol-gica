// Components/Home.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';

import FeedItem from '../Components/Home/FeedItem';
import Comentario from '../Components/Comentario';
import '../css/home.css';

import { FaSearch, FaBell } from 'react-icons/fa';
import { MdMargin } from 'react-icons/md';

function Home() {
  const navigate = useNavigate();
  // Estado do usuário logado
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  // Feed de posts
  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState('');
  // Modal de comentários e seus dados
  const [modalComentarios, setModalComentarios] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [postSelecionado, setPostSelecionado] = useState(null);
  // Controle de vídeo ativo no feed para autoplay/pausar
  const [videoAtivoId, setVideoAtivoId] = useState(null);
  const videoRefs = useRef({}); // Referências dos vídeos para o IntersectionObserver
  // Notificações do usuário
  const [notificacoes, setNotificacoes] = useState([]);
  // Resultados da busca por usuários
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  //Carregar
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMaisPosts, setTemMaisPosts] = useState(true);


  // Registra referência do vídeo
  const registerVideoRef = useCallback((postId, node) => {
    if (node) {
      videoRefs.current[postId] = node;
    }
  }, []);

  // Verifica token e carrega dados do usuário ao montar o componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/'); // Redireciona para login se não estiver autenticado
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

  // Carrega posts do cache localStorage para melhorar a experiência inicial
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

  // Sempre que o usuário for definido, busca o feed e notificações atualizadas
  useEffect(() => {
    if (usuario.id) {
      fetchFeed();
      fetchNotificacoes();
    }
  }, [usuario.id]);

  // Busca o feed de posts da API, adiciona dados do autor, e salva localmente
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
        salvarPostsLocalmente(postsComAutores);
      } else {
        setErro(data.erro || 'Erro ao carregar o feed');
      }
    } catch {
      setErro('Erro ao conectar com o servidor.');
    }
  };

  // Busca notificações 
  const fetchNotificacoes = async () => {
    try {
      const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Notificacoes/${usuario.id}`);
      const data = await response.json();

      if (data.notificacoes) {
        const notificacoesComRemetente = await Promise.all(
          data.notificacoes.map(async (n) => {
            const remetenteId = n.mensagem.match(/([0-9a-f\-]{36})/)?.[1];
            if (remetenteId) {
              try {
                const resp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Usuarios/${remetenteId}`);
                const remetente = await resp.json();
                return { ...n, remetente };
              } catch {
                return { ...n };
              }
            }
            return { ...n };
          })
        );
        setNotificacoes(notificacoesComRemetente);
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  // Salva os primeiros 5 posts no localStorage para cache
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

  // Curtir ou descurtir um post
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

  // Abre modal de comentários e carrega comentários do post
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

  // Envia um novo comentário e atualiza feed e modal
  const comentar = async () => {
    if (!comentarioTexto.trim()) return;

    const comentario = {
      postId: postSelecionado.id,
      autorId: usuario.id,
      conteudo: comentarioTexto,
    };

    try {
      await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Comentario/comentar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comentario),
      });

      setComentarioTexto('');
      abrirComentarios(postSelecionado); // Recarrega comentários
      fetchFeed(); // Atualiza feed para refletir nova interação
    } catch (err) {
      console.error('Erro ao comentar:', err);
    }
  };

  // Busca usuários pelo termo digitado
  const buscarUsuarios = async (termo) => {
    if (!termo.trim()) {
      setResultadosBusca([]);
      return;
    }

    try {
      const responseUsuarios = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario`);
      const dataUsuarios = await responseUsuarios.json();

      if (!Array.isArray(dataUsuarios)) return;

      const resultadosFiltrados = dataUsuarios.filter(u =>
        u.nome_usuario?.toLowerCase().startsWith(termo.toLowerCase()) && u.id !== usuario.id
      );

      const resSeguidores = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${usuario.id}`);
      const dataSeguidores = await resSeguidores.json();
      const idsSeguindo = dataSeguidores.seguindo?.map(s => s.usuario2) || [];

      const resultadosComStatus = resultadosFiltrados.map(u => ({
        ...u,
        jaSegue: idsSeguindo.includes(u.id)
      }));

      setResultadosBusca(resultadosComStatus);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setResultadosBusca([]);
    }
  };

  // Seguir usuário rapidamente
  const seguirUsuarioRapido = async (idUsuario) => {
    try {
      const resposta = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/solicitar-e-aceitar-automaticamente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario1: usuario.id, usuario2: idUsuario }),
      });

      if (resposta.ok) {
        setResultadosBusca(prev =>
          prev.map(u =>
            u.id === idUsuario ? { ...u, jaSegue: true } : u
          )
        );
      } else {
        console.error('Erro ao seguir:', resposta.status);
      }
    } catch (err) {
      console.error("Erro ao seguir usuário rapidamente:", err);
    }
  };

  // Ir para o perfil
  const irParaPerfil = (id) => {
    navigate(`/perfil/${id}`, { state: { userId: id } });
  };

  // Conexão com SignalR - feed e curtidas
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/feedHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        connection.on('NovoPost', (novoPost) => {
          setPosts(prev => [novoPost, ...prev]);
        });
      })
      .catch(err => console.error('Erro ao conectar feedHub:', err));

    return () => connection.stop();
  }, []);

  useEffect(() => {
    const curtidaConnection = new HubConnectionBuilder()
      .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/curtidaHub', {
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    curtidaConnection.start()
      .then(() => {
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
      })
      .catch(err => console.error('Erro ao conectar curtidaHub:', err));

    return () => curtidaConnection.stop();
  }, []);

  // IntersectionObserver para vídeos
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

  // Salva posts no cache local a cada 10s
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (posts.length > 0) salvarPostsLocalmente(posts);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [posts]);

  //Loader
 const carregarMaisPosts = async () => {
  if (carregandoMais || !temMaisPosts) return;
  setCarregandoMais(true);

  try {
    const response = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/feedPaginado/${usuario.id}?pagina=${paginaAtual + 1}&tamanhoPagina=5`);
    const data = await response.json();

    if (response.ok && data.length > 0) {
      const novosPostsComAutores = await Promise.all(
        data.map(async post => {
          try {
            const resp = await fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${post.autorId}`);
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

      setPosts(prev => [...prev, ...novosPostsComAutores]);
      setPaginaAtual(prev => prev + 1);

      // ⚠️ Se vierem menos de 5, então não tem mais
      if (data.length < 5) {
        setTemMaisPosts(false);
      }
    } else {
      // ⚠️ Nenhum post novo = acabou
      setTemMaisPosts(false);
    }
  } catch (err) {
    console.error('Erro ao carregar mais posts:', err);
  } finally {
    // ✅ Só finaliza carregamento depois de tudo
    setCarregandoMais(false);
  }
};


useEffect(() => {
  const handleScroll = () => {
    const scrollFinal = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
    if (scrollFinal && !carregandoMais && temMaisPosts) {
      carregarMaisPosts();
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [carregandoMais, temMaisPosts, usuario.id, paginaAtual]);

  

  return (
    <div className="pagina-container">

      {/* Feed principal */}
      <div className="home-container">
        <hr /><br /><br />
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        {posts.length === 0 && !erro && !carregandoMais && <p>Nenhum post encontrado.</p>}
{posts.length === 0 && !erro && carregandoMais && (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <div className="loader"></div>
  </div>
)}


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

 {carregandoMais && (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <div className="loader"></div>
  </div>
)}



        {/* Modal de comentários */}
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

      {/* Lateral: busca + notificações */}
      <div className="lateral-direita">
        <div className="campo-busca">
          <FaSearch className="icone-busca" />
         <input
          placeholder="Buscar usuários..."
          className="barra-pesquisa-usuarios"
          value={termoBusca}
          onChange={e => {
            const valor = e.target.value;
            setTermoBusca(valor);

            // Quando o campo ficar vazio, limpa os resultados imediatamente
            if (valor.trim() === '') {
              setResultadosBusca([]);
            } else {
              buscarUsuarios(valor);
            }
          }}
        />

          {/* Resultados da busca */}
          {resultadosBusca.length > 0 && (
            <ul className="resultados-busca">
              {resultadosBusca.map((usuarioPesquisado, index) => (
                <li key={index} className="usuario-pesquisado">
                  <img
                    src={usuarioPesquisado.imagem || 'https://via.placeholder.com/40'}
                    alt="avatar"
                    className="avatar-busca"
                    onClick={() => irParaPerfil(usuarioPesquisado.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="info-usuario">
                    <span onClick={() => irParaPerfil(usuarioPesquisado.id)} style={{ cursor: 'pointer' }}>
                      {usuarioPesquisado.nome_usuario || usuarioPesquisado.nome}
                    </span>
                    <div className="acao-usuario">
                      {usuarioPesquisado.jaSegue ? (
                        <button className="botao-seguir seguindo" disabled>Seguindo</button>
                      ) : (
                        <button
                          className="botao-seguir"
                          onClick={() => seguirUsuarioRapido(usuarioPesquisado.id)}
                        >
                          Seguir
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notificações */}
        <div className="notificacoes-box">
          <h4><FaBell /> Notificações</h4>
          <ul>
            {notificacoes.length === 0 ? (
              <li>Não há notificações</li>
            ) : (
              notificacoes.map((notificacao) => (
                <li key={notificacao.id} className="notificacao-item">
                  <img
                    src={notificacao.remetente?.imagem || "https://via.placeholder.com/40"}
                    alt="Foto de perfil"
                    className="avatar-busca"
                    onClick={() => irParaPerfil(notificacao.remetente?.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="info-notificacao" onClick={() => irParaPerfil(notificacao.remetente?.id)} style={{ cursor: 'pointer' }}>
                    <p><strong>{notificacao.remetente?.nome_usuario}</strong> {notificacao.mensagem}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
