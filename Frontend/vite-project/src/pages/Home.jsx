import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';

// Componentes
import FeedItem from '../Components/Home/FeedItem';
import Comentario from '../Components/Comentario';
import Story from '../Components/Home/Story';
import LoadingSpinner from './Home_components/LoadingSpinner';
import SearchBar from './Home_components/SearchBar';
import NotificationsList from './Home_components/NotificationsList';

// Hooks e CSS
import useRegistrarVisualizacoes from '../Components/Home/useRegistrarVisualizacoes';
import '../css/home.css';

function Home() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nome: '', id: '' });
  const [posts, setPosts] = useState([]);
  const [erro, setErro] = useState('');
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [videoAtivoId, setVideoAtivoId] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [fimDoFeed, setFimDoFeed] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(true);
  
  const videoRefs = useRef({});

  // Registra referências dos vídeos
  const registerVideoRef = useCallback((postId, node) => {
    if (node) videoRefs.current[postId] = node;
  }, []);

  // Busca o feed de posts
  const fetchFeed = async (pagina = 1) => {
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

        setPosts(prev => pagina === 1 ? postsComAutores : [...prev, ...postsComAutores]);
        setErro('');
      }
    } catch (error) {
      console.error('Erro ao buscar feed:', error);
      setErro('Erro ao carregar feed.');
    } finally {
      setCarregandoMais(false);
      if (pagina === 1) setLoadingFeed(false);
    }
  };

  // Busca notificações
  const fetchNotificacoes = async () => {
    try {
      const response = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Notificacoes/${usuario.id}`
      );
      const data = await response.json();

      if (data.notificacoes) {
        const notificacoesComRemetente = await Promise.all(
          data.notificacoes.map(async n => {
            if (!n.usuarioRemetenteId) return n;
            
            try {
              const resp = await fetch(
                `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${n.usuarioRemetenteId}`
              );
              const remetenteData = await resp.json();
              
              return {
                ...n,
                remetente: {
                  id: remetenteData.id || remetenteData.usuario_id,
                  nome: remetenteData.nome || remetenteData.nome_usuario,
                  imagem: remetenteData.imagem || null
                },
                nomeRemetente: remetenteData.nome || 'Desconhecido',
                imagemRemetente: remetenteData.imagem || 'https://ui-avatars.com/api/?name=Desconhecido',
              };
            } catch {
              return n;
            }
          })
        );
        setNotificacoes(notificacoesComRemetente);
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  // Curtir/descurtir post
  const curtirPost = async (postId) => {
    try {
      const verificarUrl = `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/usuario-curtiu?postId=${postId}&usuarioId=${usuario.id}`;
      const resVerifica = await fetch(verificarUrl);
      if (!resVerifica.ok) return { sucesso: false };
      
      const { curtiu } = await resVerifica.json();
      const endpoint = curtiu ? 'descurtir' : 'curtir';
      
      const resPost = await fetch(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Curtida/${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, usuarioId: usuario.id }),
        }
      );

      if (!resPost.ok) return { sucesso: false };
      const { curtidasTotais } = await resPost.json();

      setPosts(prev => prev.map(post => 
        post.id === postId ? {
          ...post,
          foiCurtido: !curtiu,
          curtidas: curtidasTotais,
          qtdCurtidas: curtidasTotais,
        } : post
      ));

      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error);
      return { sucesso: false };
    }
  };

  // Navegação para perfil
  const irParaPerfil = (id) => {
    navigate(`/perfil/${id}`, { state: { userId: id } });
  };

  // Efeitos
  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioString = localStorage.getItem('usuario');
    
    if (!token) {
      navigate('/');
      return;
    }

    if (usuarioString) {
      try {
        setUsuario(JSON.parse(usuarioString));
      } catch {
        setUsuario({ nome: 'Desconhecido' });
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (usuario.id) {
      setPaginaAtual(1);
      setFimDoFeed(false);
      fetchFeed(1);
      fetchNotificacoes();
      
      // Conexão SignalR para feed
      const connection = new HubConnectionBuilder()
        .withUrl('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/feedHub', {
          transport: HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .build();

      connection.start()
        .then(() => {
          connection.on('NovoPost', novoPost => {
            setPosts(prev => [novoPost, ...prev]);
          });
        })
        .catch(err => console.error('Erro ao conectar feedHub:', err));

      return () => connection.stop();
    }
  }, [usuario.id]);

  useEffect(() => {
    if (paginaAtual > 1 && !carregandoMais && !fimDoFeed) {
      fetchFeed(paginaAtual);
    }
  }, [paginaAtual]);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
          !carregandoMais && !fimDoFeed) {
        setPaginaAtual(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [carregandoMais, fimDoFeed]);

  // Registra visualizações
  useRegistrarVisualizacoes(posts, usuario);

  return (
    <div className="pagina-container">
      <div className="home-container">
        <Story />
        <hr />
        
        {erro && <p className="erro-feed">{erro}</p>}
        
        {loadingFeed ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <p className="sem-posts">Nenhum post encontrado.</p>
        ) : (
          <ul className="lista-posts">
            {posts.map(post => (
              <FeedItem
                key={post.id}
                post={post}
                usuario={usuario}
                videoAtivoId={videoAtivoId}
                registerVideoRef={registerVideoRef}
                onCurtirPost={curtirPost}
                onAbrirComentarios={setPostSelecionado}
                onIrParaPerfil={irParaPerfil}
              />
            ))}
          </ul>
        )}

        {carregandoMais && <LoadingSpinner />}

        {postSelecionado && (
          <Comentario
            post={postSelecionado}
            usuario={usuario}
            fechar={() => setPostSelecionado(null)}
          />
        )}
      </div>

      <div className="lateral-direita">
        <SearchBar
          termoBusca={termoBusca}
          onTermoBuscaChange={setTermoBusca}
          resultadosBusca={resultadosBusca}
          onBuscarUsuarios={async (termo) => {
            if (!termo.trim()) {
              setResultadosBusca([]);
              return;
            }
            
            try {
              const response = await fetch(
                `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/buscar-por-nome/${encodeURIComponent(termo)}`
              );
              const data = await response.json();
              
              if (Array.isArray(data)) {
                const resultadosFiltrados = data.filter(u => u.id !== usuario.id);
                const resSeguidores = await fetch(
                  `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${usuario.id}`
                );
                const { seguindo } = await resSeguidores.json();
                const idsSeguindo = seguindo?.map(s => s.usuario2) || [];
                
                setResultadosBusca(resultadosFiltrados.map(u => ({
                  ...u,
                  jaSegue: idsSeguindo.includes(u.id),
                })));
              }
            } catch (error) {
              console.error('Erro ao buscar usuários:', error);
              setResultadosBusca([]);
            }
          }}
          onSeguirUsuario={async (idUsuario) => {
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
              }
            } catch (err) {
              console.error('Erro ao seguir usuário:', err);
            }
          }}
          onIrParaPerfil={irParaPerfil}
        />

        <NotificationsList 
          notificacoes={notificacoes} 
          onIrParaPerfil={irParaPerfil} 
        />
      </div>
    </div>
  );
}

export default Home;