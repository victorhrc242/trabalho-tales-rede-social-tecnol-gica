// Components/Home.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import FeedItem from './FeedItem.jsx';
import Comentario from '../../Components/Comentario/Comentario.jsx';
import Notificacoes from '../Notificacao/Notificacoes.jsx';
import '../../css/home.css';
import useRegistrarVisualizacoes from './useRegistrarVisualizacoes.jsx';
import Story from './Story.jsx';
import { FaSearch, FaBell } from 'react-icons/fa';
import Solicitacoes from './Solicitacoes.jsx';
function Home() {
  const navigate = useNavigate();

  // Estado do usuário logado
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  // Feed de posts
  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState('');
  // Loader
  const [carregandoMais, setCarregandoMais] = useState(false);
  // Modal de comentários e seus dados
  const [modalComentarios, setModalComentarios] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState(null);
  // Controle de vídeo ativo no feed para autoplay/pausar
  const [videoAtivoId, setVideoAtivoId] = useState(null);
  const videoRefs = useRef({}); // Referências dos vídeos para o IntersectionObserver
  // Notificações do usuário
  const [notificacoes, setNotificacoes] = useState([]);
  // Resultados da busca por usuários
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  // Paginação e controle fim do feed
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [fimDoFeed, setFimDoFeed] = useState(false);  
  // Estado para controlar carregamento do feed
const [loadingFeed, setLoadingFeed] = useState(true);
  // Estado para erros de carregamento do feed
const [solicitacoes, setSolicitacoes] = useState([]);

  // Registra referência do vídeo
  const registerVideoRef = useCallback((postId, node) => {
    if (node) {
      videoRefs.current[postId] = node;
    }
  }, []);


  useRegistrarVisualizacoes(posts, usuario);

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
function abrirComentarios(post) {
  setPostSelecionado(post);
}
  // Quando usuario.id mudar, reset feed e busca primeira página
  useEffect(() => {
    if (usuario.id) {
      setPaginaAtual(1);
      setFimDoFeed(false);

      fetchFeed(1);
      fetchNotificacoes();
    }
  }, [usuario.id]);

  // Quando paginaAtual aumentar (exceto para 1 que já foi buscado), busca página seguinte
  useEffect(() => {
    if (paginaAtual > 1 && !carregandoMais && !fimDoFeed) {
      fetchFeed(paginaAtual);
    }
  }, [paginaAtual]);

  // Função para buscar feed com controle de carregamento do feed
async function fetchFeed(pagina = 1) {
  if (fimDoFeed) return;

  setCarregandoMais(true);
  if (pagina === 1) setLoadingFeed(true);

  try {
    const response = await fetch(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/feed-dinamico-algoritimo-home/${usuario.id}?page=${pagina}&pageSize=10`
    );
    if (!response.ok) throw new Error('Erro na API');

    const data = await response.json();

    if (data.length === 0) {
      setFimDoFeed(true);
    } else {
      const postsComAutores = await Promise.all(
        data.map(async post => {
          try {
            const resp = await fetch(
              `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${post.autorId}`
            );
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

      if (pagina === 1) {
        setPosts(postsComAutores);
      } else {
        setPosts(prev => [...prev, ...postsComAutores]);
      }
    }

    setErro('');
  } catch (error) {
    console.error('Erro ao buscar feed:', error);
    setErro('Erro ao carregar feed.');
  } finally {
    setCarregandoMais(false);
    if (pagina === 1) setLoadingFeed(false);
  }
}

  // Scroll infinito: aumenta paginaAtual quando chegar perto do fim da página
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        !carregandoMais &&
        !fimDoFeed
      ) {
        setPaginaAtual(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [carregandoMais, fimDoFeed]);

  // Busca notificações
async function fetchNotificacoes() {
  try {
    const response = await fetch(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Notificacoes/${usuario.id}`
    );
    const data = await response.json();

    if (data.notificacoes) {
      const notificacoesComRemetente = await Promise.all(
        data.notificacoes.map(async n => {
          const remetenteId = n.usuarioRemetenteId;
          if (remetenteId) {
            try {
              const resp = await fetch(
                `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${remetenteId}`
              );
              const remetenteData = await resp.json();
              const remetente = {
                id: remetenteData.id || remetenteData.usuario_id || remetenteData.userId,
                nome: remetenteData.nome || remetenteData.nome_usuario,
                nome_usuario: remetenteData.nome_usuario,
                imagem: remetenteData.imagem || null
              };

              const nomeRemetente = remetente.nome || 'Desconhecido';
              const imagemRemetente =
                remetente.imagem ||
                'https://ui-avatars.com/api/?name=Desconhecido';

              return {
                ...n,
                remetente,
                nomeRemetente,
                imagemRemetente,
              };

            } catch {
              return { ...n };
            }
          }
          return { ...n };
        })
      );

      // 🔹 Filtra para não incluir interações do próprio usuário logado
      const notificacoesFiltradas = notificacoesComRemetente.filter(
        n => n.usuarioRemetenteId !== usuario.id
      );

      setNotificacoes(notificacoesFiltradas);
    }
  } catch (err) {
    console.error('Erro ao buscar notificações:', err);
  }
}
  //Fim notificações

  // Salva primeiros 5 posts no localStorage como cache
  function salvarPostsLocalmente(postsParaSalvar) {
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
  }

async function curtirPost(postId) {
  try {
    const verificarUrl = `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/usuario-curtiu?postId=${postId}&usuarioId=${usuario.id}`;
    const curtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/curtir';
    const descurtirUrl = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/descurtir';

    console.log('Verificando se já curtiu:', verificarUrl);
    const resVerifica = await fetch(verificarUrl);
    if (!resVerifica.ok) {
      console.error('Erro ao verificar curtida');
      return { sucesso: false };
    }
    const dataVerifica = await resVerifica.json();
    console.log('Resposta verificação curtida:', dataVerifica);

    const jaCurtiu = dataVerifica.curtiu;

    const endpoint = jaCurtiu ? descurtirUrl : curtirUrl;
    console.log('Enviando para endpoint:', endpoint);

    const resPost = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, usuarioId: usuario.id }),
    });

    if (!resPost.ok) {
      console.error('Erro no POST de curtir/descurtir');
      return { sucesso: false };
    }

    const dataPost = await resPost.json();
    console.log('Resposta do backend após curtir/descurtir:', dataPost);

    const curtiuAgora = !jaCurtiu;

    // Atualiza o estado com curtidasTotais do backend
    setPosts(postsAntigos =>
      postsAntigos.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            foiCurtido: curtiuAgora,
            curtidas: dataPost.curtidasTotais,
            qtdCurtidas: dataPost.curtidasTotais,
          };
        }
        return post;
      })
    );

    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao curtir/descurtir:', error);
    return { sucesso: false };
  }
}
  // Buscar usuários pelo termo digitado
 async function buscarUsuarios(termo) {
  if (!termo.trim()) {
    setResultadosBusca([]);
    return;
  }

  try {
    // Chama seu endpoint de busca por nome, passando o termo
    const response = await fetch(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/buscar-por-nome/${encodeURIComponent(termo)}`
    );
    if (!response.ok) throw new Error('Erro na busca');

    const data = await response.json();

    if (!Array.isArray(data)) {
      setResultadosBusca([]);
      return;
    }

    // Se quiser, filtrar quem não é o usuário atual (igual seu código anterior)
    const resultadosFiltrados = data.filter(u => u.id !== usuario.id);

    // Se quiser, trazer info de seguidores para mostrar status "Seguindo"
    const resSeguidores = await fetch(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${usuario.id}`
    );
    const dataSeguidores = await resSeguidores.json();
    const idsSeguindo = dataSeguidores.seguindo?.map(s => s.usuario2) || [];

    const resultadosComStatus = resultadosFiltrados.map(u => ({
      ...u,
      jaSegue: idsSeguindo.includes(u.id),
    }));

    setResultadosBusca(resultadosComStatus);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    setResultadosBusca([]);
  }
}


  // Seguir usuário rapidamente
  async function seguirUsuarioRapido(idUsuario) {
    try {
      const resposta = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/solicitar-e-aceitar-automaticamente`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario1: usuario.id, usuario2: idUsuario }),
        }
      );

      if (resposta.ok) {
        setResultadosBusca(prev =>
          prev.map(u => (u.id === idUsuario ? { ...u, jaSegue: true } : u))
        );
      } else {
        console.error('Erro ao seguir:', resposta.status);
      }
    } catch (err) {
      console.error('Erro ao seguir usuário rapidamente:', err);
    }
  }

  // Navegar para perfil
  function irParaPerfil(id) {
    navigate(`/perfil/${id}`, { state: { userId: id } });
  }
  // Conexão SignalR para curtidas
  useEffect(() => {
    const curtidaConnection = new HubConnectionBuilder()
      .withUrl(
        'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/curtidaHub',
        { transport: HttpTransportType.LongPolling }
      )
      .withAutomaticReconnect()
      .build();

    curtidaConnection
      .start()
      .then(() => {
        curtidaConnection.on(
          'ReceberCurtida',
          (postId, usuarioId, foiCurtida) => {
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
          }
        );
      })
      .catch(err => console.error('Erro ao conectar curtidaHub:', err));

    return () => curtidaConnection.stop();
  }, []);

  // IntersectionObserver para controlar vídeo ativo (autoplay)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visiveis = entries.filter(
          entry => entry.isIntersecting && entry.intersectionRatio >= 0.5
        );
        if (visiveis.length === 0) {
          setVideoAtivoId(null);
          return;
        }
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

  // Salvar posts no localStorage a cada 10s para cache
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (posts.length > 0) salvarPostsLocalmente(posts);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [posts]);



  return (
    <div className="pagina-container">
      {/* Feed principal */}
      <div className="home-container">
            <Story  />
        <hr />
        <br />
        <br />
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        {loadingFeed ? (
          <p></p>
        ) : posts.length === 0 ? (
          <p>Nenhum post encontrado.</p>
        ) : (
          <ul>
            {posts.map(post => (
            <FeedItem
          post={post}
          usuario={usuario}
          videoAtivoId={videoAtivoId}
          registerVideoRef={registerVideoRef}
          curtirPost={curtirPost}
          abrirComentarios={abrirComentarios} // ✅ Aqui
          irParaPerfil={irParaPerfil}
        />
            ))}
          </ul>
        )}
        {/* modal carregando */}
      {carregandoMais && (
          <div className="loader-container">
            <div className="spinner" />
          </div>
        )}

        {/* Modal de comentários */}
     {postSelecionado && (
        <Comentario
          post={postSelecionado}
          usuario={usuario}
          fechar={() => setPostSelecionado(null)}
        />
      )}
      </div>

      {/* Lateral direita: busca e notificações */}
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
              if (valor.trim() === '') {
                setResultadosBusca([]);
              } else {
                buscarUsuarios(valor);
              }
            }}
          />

          {/* Buscar */}
          {termoBusca.trim() !== '' && resultadosBusca.length > 0 && (
          <ul className="resultados-busca">
            {resultadosBusca.map(usuarioPesquisado => (
              <li key={usuarioPesquisado.id} className="usuario-pesquisado">
                <img
                  src={
                    usuarioPesquisado.imagem ||
                    'https://via.placeholder.com/40'
                  }
                  alt="avatar"
                  className="avatar-busca"
                  onClick={() => irParaPerfil(usuarioPesquisado.id)}
                  style={{ cursor: 'pointer' }}
                />
                <div className="info-usuario">
                  <span
                    onClick={() => irParaPerfil(usuarioPesquisado.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {usuarioPesquisado.nome_usuario || usuarioPesquisado.nome}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>
        {/* Solicitações */}
        <Solicitacoes
        usuarioId={usuario.id}
        solicitacoes={solicitacoes}
        setSolicitacoes={setSolicitacoes}
        irParaPerfil={irParaPerfil}
      />

          {/* Notificações */}
        <div className="notificacoes-box">
          <h4>
            <FaBell /> Notificações
          </h4>
              <ul>
          {notificacoes.length === 0 ? (
            <li>Não há notificações</li>
          ) : (
            notificacoes.map(notificacao => {
              const remetente = notificacao.remetente || {};
              return (
                <li key={notificacao.id} className="notificacao-item">
                  <img
                    src={remetente?.imagem || 'https://via.placeholder.com/40'}
                    alt="Foto de perfil"
                    className="avatar-busca"
                    onClick={() => remetente.id && irParaPerfil(remetente.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div
                    className="info-notificacao"
                    onClick={() => remetente.id && irParaPerfil(remetente.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <p>
                      <strong>
                        {remetente.nome_usuario || remetente.nome || 'Alguém'}
                      </strong>{' '}
                      {notificacao.mensagem}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
        </div>
        
      </div>
    </div>
  );
}

export default Home;
