import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../../css/Perfil.css';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Comentario from '../../Components/Comentario/Comentario.jsx'; // ajuste o caminho se necessário
import { FaCog, FaPlay  } from 'react-icons/fa';
import TrocarConta from '../../Components/configuracaoes/TrocarConta.jsx';
import StoryModal from '../Home/StoryModal.jsx';


const Perfil = ({ usuarioLogado, deslogar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: idDaUrl } = useParams();

  // Pega o ID do usuário logado, preferindo a prop, senão pega do localStorage
  const usuarioArmazenado = JSON.parse(localStorage.getItem('usuario'));
  const usuarioLogadoId = usuarioLogado?.id || usuarioArmazenado?.id;

  // ID do perfil que está sendo visualizado (vem da URL ou do estado da rota)
  const userId = location.state?.userId || idDaUrl;
const [postParaComentar, setPostParaComentar] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [posts, setPosts] = useState([]);
  const [seguidoresInfo, setSeguidoresInfo] = useState({ seguidores: 0, seguindo: 0 });
  const [loading, setLoading] = useState(true);
  const [mostrarConfirmarLogout, setMostrarConfirmarLogout] = useState(false);
  const [modalOpcoes, setModalOpcoes] = useState(false);
  const [modalPost, setModalPost] = useState(null);
  const [verStoryModal, setVerStoryModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mostrarModalSeguidores, setMostrarModalSeguidores] = useState(false);
  const [abaSeguidoresAtiva, setAbaSeguidoresAtiva] = useState('seguidores');
  const [listaSeguidores, setListaSeguidores] = useState([]);
  const [listaSeguindo, setListaSeguindo] = useState([]);
  const [modalSeguidoresData, setModalSeguidoresData] = useState([]);
  const [estaSeguindo, setEstaSeguindo] = useState(false);
  const [hoveringSeguindo, setHoveringSeguindo] = useState(false);
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [showEditarModalMobile, setShowEditarModalMobile] = useState(false);
  const [nome, setNome] = useState('');
  const [biografia, setBiografia] = useState('');
  const [imagem, setImagem] = useState('');
  const inputRef = useRef();
  const [mostrarTrocarConta, setMostrarTrocarConta] = useState(false);
  const [perfilPublico, setPerfilPublico] = useState(true);
  const [autorizadoVisualizar, setAutorizadoVisualizar] = useState(true);
  // Verifica se o perfil visualizado é o próprio usuário logado
  const isPerfilProprio = usuarioLogadoId && userId && usuarioLogadoId.toString() === userId.toString();
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const seguirUsuario = async () => {
    try {
    // Verifica se o perfil é privado
    if (!usuario.publico) {
      // Se for privado, envia solicitação de amizade
      await axios.post(
        "https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/solicitar",
        {
          usuario1: usuarioLogadoId,
          usuario2: userId,
        }
      );
      alert('Solicitação de amizade enviada! Aguarde aprovação.');
    } else {
      // Se for público, segue diretamente
      await axios.post(
        "https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/solicitar-e-aceitar-automaticamente",
        {
          usuario1: usuarioLogadoId,
          usuario2: userId,
        }
      );
      setEstaSeguindo(true);
      alert('Agora você está seguindo este usuário!');
    }
  } catch (err) {
    console.error('Erro ao seguir/solicitar amizade:', err);
    alert('Erro ao processar sua solicitação. Tente novamente.');
  }
};

const carregarSeguidoresESeguindo = async () => {
  try {
    // 1. Fazendo as requisições para obter os arrays de seguidores e seguindo
    const [resSeguidores, resSeguindo] = await Promise.all([
      axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguidores/${userId}`),
      axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${userId}`)
    ]);

    const seguidoresArray = Array.isArray(resSeguidores.data)
      ? resSeguidores.data
      : resSeguidores.data.seguidores || resSeguidores.data.usuarios || [];

    const seguindoArray = Array.isArray(resSeguindo.data)
      ? resSeguindo.data
      : resSeguindo.data.seguindo || resSeguindo.data.usuarios || [];

    // 2. Extrair IDs válidos
    const seguidoresIds = seguidoresArray
      .map((item) => item.usuario1)
      .filter((id) => id !== undefined && id !== null);

    const seguindoIds = seguindoArray
      .map((item) => item.usuario2)
      .filter((id) => id !== undefined && id !== null);

    // 3. Função para buscar os dados completos do usuário (nome e imagem)
    const buscarDadosUsuario = async (id) => {
      try {
        const res = await axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${id}`);
        return {
          nome_usuario: res.data.nome_usuario,
          imagem: res.data.imagem,
          id: res.data.id
        };
      } catch (err) {
        console.warn(`❌ Erro ao buscar dados do usuário ${id}:`, err);
        return null;
      }
    };

    // 4. Buscar dados de todos os seguidores e seguidos individualmente
    const dadosSeguidores = (await Promise.all(
      seguidoresIds.map((id) => buscarDadosUsuario(id))
    )).filter(Boolean); // Remove valores nulos

    const dadosSeguindo = (await Promise.all(
      seguindoIds.map((id) => buscarDadosUsuario(id))
    )).filter(Boolean);

    // 5. Atualizando os estados
    setListaSeguidores(dadosSeguidores);
    setListaSeguindo(dadosSeguindo);
    setModalSeguidoresData(dadosSeguidores);

  } catch (error) {
    console.error("❌ Erro ao carregar seguidores/seguindo:", error);
  }
};

const fecharModalSeguidores = () => {
  setMostrarModalSeguidores(false);
  setListaSeguidores([]);
  setListaSeguindo([]);
};

useEffect(() => {
  if (!userId) {
    navigate('/');
    return;
  }

  const cacheKey = `perfil_${userId}`;
  const perfilCache = localStorage.getItem(cacheKey);
  const agora = Date.now();

  // 1. Primeiro: Tenta carregar do cache
  if (perfilCache) {
    const { data } = JSON.parse(perfilCache);

    setUsuario(data.usuario);
    setNome(data.usuario.nome || '');
    setBiografia(data.usuario.biografia || '');
    setImagem(data.usuario.imagem || '');
    setPosts(data.posts);
    setSeguidoresInfo(data.seguidoresInfo);
    setLoading(false); // Mostra algo de imediato
  }

  // 2. Depois: Busca dados atualizados em segundo plano
  const carregarDados = async () => {
  try {
    // 1. Buscar dados do usuário (inclui se é público)
    const { data: userData } = await axios.get(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${userId}`
    );

    // Salva os dados básicos do usuário
    setUsuario(userData);
    setNome(userData.nome_usuario || '');
    setBiografia(userData.biografia || '');
    setImagem(userData.imagem || '');

    const seguidoresRes = await axios.get(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguidores/${userId}`
    );
    const seguindoRes = await axios.get(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${userId}`
    );

    const infoSeguidores = {
      seguidores: seguidoresRes.data?.seguidores?.length || 0,
      seguindo: seguindoRes.data?.seguindo?.length || 0,
    };
    setSeguidoresInfo(infoSeguidores);

    let podeVisualizarPosts = false;

    // Perfil próprio => pode visualizar tudo
    if (usuarioLogadoId === userId) {
      podeVisualizarPosts = true;
    }
    // Conta pública => pode visualizar tudo
    else if (userData.publico) {
      podeVisualizarPosts = true;
    }
    // Conta privada => precisa verificar se está seguindo
    else {
      try {
        const { data } = await axios.get(
          `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/segue`,
          {
            params: {
              usuario1: usuarioLogadoId,
              usuario2: userId,
            },
          }
        );

        setEstaSeguindo(data.estaSeguindo);
        podeVisualizarPosts = data.estaSeguindo;
      } catch (err) {
        console.error('Erro ao verificar se está seguindo perfil privado:', err);
      }
    }

    if (podeVisualizarPosts) {
      const { data: postsData } = await axios.get(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Feed/posts/usuario/${userId}`
      );
      const novosDados = {
        usuario: userData,
        posts: postsData,
        seguidoresInfo: infoSeguidores,
      };

      // Compara com o cache
      const cacheAntigo = perfilCache ? JSON.parse(perfilCache).data : null;
      const dadosAlteraram = JSON.stringify(novosDados) !== JSON.stringify(cacheAntigo);

      if (dadosAlteraram) {
        setPosts(postsData);

        localStorage.setItem(cacheKey, JSON.stringify({
          data: novosDados,
          timestamp: agora,
        }));
      }
    } else {
      // Conta privada e usuário não está seguindo
      setPosts([]); // Não mostrar nenhum post
    }

  } catch (err) {
    console.error('Erro ao buscar dados atualizados do perfil:', err);
  } finally {
    setLoading(false);
  }
};

  carregarDados();
}, [userId, navigate, usuarioLogadoId]);

if (verStoryModal && usuario?.id) {
      // Busca stories do usuário atual
      fetch(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Stories/usuario-listar-stories-de-todo-mundo/${usuarioLogadoId}/visualizar/${usuarioLogadoId}`)
        .then((res) => res.json())
        .then((data) => {
          // Estrutura no formato que o StoryModal espera
          setGrupoUnico({
            usuarioId: usuario.id,
            stories: data, // a API deve retornar array de stories
          });
        })
        .catch((err) => console.error("Erro ao buscar stories:", err));
    }
   [verStoryModal, usuario];


  const uploadImagem = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar imagem para Cloudinary");
  }

  const data = await response.json();
  return data.secure_url; // URL pública da imagem
};


const editarPerfil = async () => {
  try {
    const payload = {};

    // Ajuste os nomes dos campos para corresponder ao esperado pelo backend
    if (nome !== usuario.nome_usuario) payload.Nome = nome;
    if (biografia !== usuario.biografia) payload.Biografia = biografia;
    
    if (imagemArquivo) {
      const novaUrlImagem = await uploadImagem(imagemArquivo);
      payload.Imagem = novaUrlImagem;
      setImagem(novaUrlImagem);
    } else if (imagem !== usuario.imagem) {
      payload.Imagem = imagem;
    }

    if (Object.keys(payload).length === 0) {
      alert('Não há dados para atualizar.');
      return;
    }

    const response = await axios.put(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/editarusuarios/${userId}`,
      payload
    );

    // Tratamento da resposta considerando que o backend pode retornar um array ou objeto direto
    const updatedUser = Array.isArray(response.data) ? response.data[0] : response.data;

    // Atualize o estado do usuário mantendo os dados existentes e sobrescrevendo apenas os atualizados
    setUsuario(prev => ({
      ...prev,
      nome_usuario: updatedUser.Nome_usuario || prev.nome_usuario,
      biografia: updatedUser.Biografia || prev.biografia,
      imagem: updatedUser.Imagem || updatedUser.FotoPerfil || prev.imagem
    }));

    setIsEditing(false);
    setShowEditarModalMobile(false);
  } catch (err) {
    console.error('Erro ao editar perfil:', err);
    alert('Erro ao editar perfil. Verifique os dados e tente novamente.');  
  }
};
const confirmarLogout = () => {
  deslogar();       // <- chama a função passada via props, que deve limpar o estado global
  navigate('/');    // <- redireciona para a página de login (ou onde a rota "/" leve)
};
const cancelarLogout = () => {
  setMostrarConfirmarLogout(false); // apenas fecha o modal
};
const deseguirUsuario = async () => {
  try {
    await axios.delete(
      `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/deseguir`,
      {
        params: {
          usuario1: usuarioLogadoId,
          usuario2: userId,
        },
      }
    );
    
    setEstaSeguindo(false);
    alert('Você deixou de seguir este usuário.');
    
    // Atualiza a contagem de seguidores
    const [seguidoresRes, seguindoRes] = await Promise.all([
      axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguidores/${userId}`),
      axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Amizades/seguindo/${userId}`)
    ]);

    setSeguidoresInfo({
      seguidores: seguidoresRes.data?.seguidores?.length || 0,
      seguindo: seguindoRes.data?.seguindo?.length || 0,
    });

    // Se o modal de seguidores estiver aberto, atualiza a lista
    if (mostrarModalSeguidores) {
      carregarSeguidoresESeguindo();
    }

  } catch (err) {
    console.error('Erro ao deixar de seguir:', err);
    if (err.response?.status === 404) {
      alert('Você já não seguia este usuário.');
      setEstaSeguindo(false); // Força a atualização do estado
    } else {
      alert('Erro ao deixar de seguir. Tente novamente.');
    }
  }
};
  if (loading) return <div className="loading">Carregando perfil...</div>;
  if (!usuario) return <div className="erro">Usuário não encontrado.</div>;
 return (
  <div className="perfil-container">
<div className="perfil-header">
  {isPerfilProprio && (
  <div className="configuracao-mobile">
    <FaCog onClick={() => setModalOpcoes(true)} />
  </div>
)}
  <div className="foto-perfil-bloco">
    <div
        className="foto-perfil-bloco"
        onClick={() => setVerStoryModal(true)}
        style={{ cursor: "pointer" }}
      >
        <div className="foto-perfil">
          <img
            src={usuario.imagem || "https://via.placeholder.com/150"}
            alt={`Foto de perfil de ${usuario.nome_usuario}`}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    {/* VERSÃO MOBILE */}
    <div className="nome-e-editar nome-e-editar-mobile">
      <h1 className="nome-mobile">{usuario.nome_usuario}</h1>
      {usuario.biografia && (
    <p className='bio-mobile'>{usuario.biografia}</p>
  )} 
      {isPerfilProprio && !isEditing && (
        <button
          className="btn-editar-perfil"
          onClick={() => setShowEditarModalMobile(true)}
        >
          Editar Perfil
        </button>
      )}
    </div>
  </div>

  {/* VERSÃO DESKTOP - movida para ao lado da imagem */}
  <div className="perfil-info-desktop">
    <div className="topo-nome-botao">
      <h1 className="nome-desktop">{usuario.nome_usuario}</h1>
      
    </div>
    <div className="infor-pessoais-desktop">
      <div className='infor-seguidores-desktop'>
      <p><strong><button className="botao-link" onClick={() => {
            carregarSeguidoresESeguindo();
            setAbaSeguidoresAtiva('seguidores');
            setMostrarModalSeguidores(true);
          }}>Seguidores:
        </button>
      </strong> {seguidoresInfo.seguidores}
    </p>
    <p><strong><button className="botao-link" onClick={() => {
            carregarSeguidoresESeguindo();
            setAbaSeguidoresAtiva('seguindo');
            setMostrarModalSeguidores(true);
          }}>Seguindo:
        </button></strong> {seguidoresInfo.seguindo}</p>
  </div>
      {usuario.biografia && (
    <p className="biografia">{usuario.biografia}</p>
  )} 
    </div>

    {isPerfilProprio && !isEditing && (
        <button
          className="btn-editar-perfil"
          onClick={() => setIsEditing(true)}
        >
          Editar Perfil
        </button>
      )}

  </div>

{verStoryModal && grupoUnico && (
        <StoryModal
          grupo={grupoUnico}
          indiceStory={0}
          setIndiceStory={() => {}}
          fechar={() => setVerStoryModal(false)}
          usuarios={{ [usuario.id]: usuario }}
          usuarioLogadoId={usuarioLogado?.id}
          grupos={[grupoUnico]} // só este grupo
          irParaProximoGrupo={() => {}} // sem mudança de grupo
        />
      )}

  <div className="perfil-info">
    {!isEditing && (
      <div className="infor-pessoais">
        <p><strong><button className="botao-link" onClick={() => {
            carregarSeguidoresESeguindo();
            setAbaSeguidoresAtiva('seguidores');
            setMostrarModalSeguidores(true);
          }}>Seguidores:
        </button></strong> {seguidoresInfo.seguidores}</p>
        <p><strong><button className="botao-link" onClick={() => {
            carregarSeguidoresESeguindo();
            setAbaSeguidoresAtiva('seguindo');
            setMostrarModalSeguidores(true);
          }}>Seguindo:
        </button></strong> {seguidoresInfo.seguindo}</p>
      </div>
    )}

        {isPerfilProprio ? (
  <>
    {/* MODAL DE EDIÇÃO - DESKTOP */}
    {isEditing && (
  <div className="modal-overlay" onClick={() => setIsEditing(false)}>
    <div className="modal-editar-desktop" onClick={(e) => e.stopPropagation()}>
      <div className="editar-header">
        <h2>Editar Perfil</h2>
        <button className="btn-fechar" onClick={() => setIsEditing(false)}>×</button>
      </div>
      <div className="editar-conteudo">
        <div className="editar-foto-container-desktop">
          <div className="foto-wrapper">
            <label className="editar-foto-label">
              <img
                src={imagem || usuario.imagem || 'https://via.placeholder.com/150'}
                alt={`Foto de perfil de ${usuario.nome_usuario}`}
                className="foto-perfil-preview"
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.type.startsWith('image/')) {
                    setImagemArquivo(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setImagem(reader.result); // mostra a prévia
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <label>Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
        />
        <label>Biografia</label>
        <textarea
          value={biografia}
          onChange={(e) => setBiografia(e.target.value)}
          placeholder="Biografia"
        />
        <div className="editar-botoes">
          <button className='btn-confirmar-edi' onClick={editarPerfil}>Salvar</button>
          <button className='btn-cancelar-edi' onClick={() => setIsEditing(false)}>Cancelar</button>
        </div>
      </div>
    </div>
  </div>
)}
  </>
        ) : (
  <div className="botoes-perfil">
  {estaSeguindo ? (
    <>
      <button
        onMouseEnter={() => setHoveringSeguindo(true)}
        onMouseLeave={() => setHoveringSeguindo(false)}
        onClick={() => {
          if (hoveringSeguindo) deseguirUsuario();
        }}
      >
        {hoveringSeguindo ? 'Deixar de seguir' : 'Seguindo'}
      </button>

      <Link to="/mensagen">
        <button>Enviar Mensagem</button>
      </Link>
    </>
  ) : (
    <button onClick={seguirUsuario}>
      {usuario.publico ? 'Seguir' : 'Enviar solicitação'}
    </button>
  )}
</div>
)}
      </div>
    </div>

{/* modal editar mobile */} 
{showEditarModalMobile && (
  <div className="modal-editar-mobile">
    <div className="editar-topo">
      <h2>Editar Perfil</h2>
      <button onClick={() => setShowEditarModalMobile(false)}>×</button>
    </div>

    <div className="editar-foto-container">
      <label className="editar-foto-label">
        <img
          src={imagem || usuario.imagem || 'https://via.placeholder.com/150'}
          alt={`Foto de perfil de ${usuario.nome_usuario}`}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
            margin: '0 auto',
            border: '2px solid #ccc'
          }}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
              setImagemArquivo(file);
              const reader = new FileReader();
              reader.onloadend = () => setImagem(reader.result); // mostra a prévia
              reader.readAsDataURL(file);
            }
          }}
        />
      </label>
    </div>

    <div className="editar-campos">
      <h5>Nome</h5>
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome"
      />
      <h5>Biografia</h5>
      <textarea
        value={biografia}
        onChange={(e) => setBiografia(e.target.value)}
        placeholder="Biografia"
      />
    </div>

    <div className="editar-botoes">
      <button className='btn-confirmar-edi' onClick={editarPerfil}>Salvar</button>
      <button className='btn-cancelar-edi' onClick={() => setShowEditarModalMobile(false)}>Cancelar</button>
    </div>
  </div>
)}
{/*Fim modal editar mobile */}


{/* post perfil*/}
<div className="explore-grid">
  {(isPerfilProprio || usuario.publico || estaSeguindo) && posts.length > -1 ? (
    posts.map((post) => (
      <div
        key={post.id}
        className="grid-item"
        onClick={() => setPostParaComentar({
          ...post,
          autorId: usuario.id,
          autorNome: usuario.nome_usuario,
          autorImagem: usuario.imagem,
          conteudo: post.conteudo || '',
          tags: post.tags || []
        })}
        style={{ cursor: 'pointer' }}
      >
        {post.imagem && (
          <img
            src={post.imagem}
            alt="Imagem do post"
            style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }}
          />
        )}

        {post.video && (
          <div style={{ position: 'relative' }}>
            <video
              muted
              preload="metadata"
              playsInline
              style={{
                width: '100%',
                borderRadius: '8px',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            >
              <source src={post.video + '#t=0.1'} type="video/mp4" />
              Seu navegador não suporta o elemento de vídeo.
            </video>
            <FaPlay
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                color: 'white',
                background: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '50%',
                padding: '4px',
                fontSize: '14px',
              }}
            />
          </div>
        )}
      </div>
    ))
  ) : (
    <div><p className='perfil-parag1'>Este perfil é privado. Siga para ver os posts.</p></div>
  )}
</div>

{postParaComentar && (
  <Comentario 
    post={postParaComentar}
    usuario={{
      ...(usuarioLogado || usuarioArmazenado),
      id: usuarioLogadoId
    }}
    fechar={() => setPostParaComentar(null)}
  />
)}
{mostrarConfirmarLogout && (
  <div className="modal-logout-overlay" onClick={cancelarLogout}>
    <div className="modal-logout-content" onClick={(e) => e.stopPropagation()}>
      <p className="modal-logout-text">Tem certeza que deseja sair?</p>
      <div className="modal-logout-buttons">
        <button className="btn-confirmar" onClick={confirmarLogout}>Sair</button>
        <button className="btn-cancelar" onClick={cancelarLogout}>Cancelar</button>
      </div>
    </div>
  </div>
)}

{mostrarModalSeguidores && (
  <div className="modal-overlay" onClick={fecharModalSeguidores}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <button
          className={abaSeguidoresAtiva === 'seguidores' ? 'ativo' : ''}
          onClick={() => setAbaSeguidoresAtiva('seguidores')}
        >
          Seguidores
        </button>
        <button
          className={abaSeguidoresAtiva === 'seguindo' ? 'ativo' : ''}
          onClick={() => setAbaSeguidoresAtiva('seguindo')}
        >
          Seguindo
        </button>
        <button
          className="fechar-modal"
          onClick={fecharModalSeguidores}
        >
          X
        </button>
      </div>

{(isPerfilProprio || usuario.publico || estaSeguindo) ? (
  <div className="modal-seguir-conteudo">
    {abaSeguidoresAtiva === 'seguidores' ? (
      Array.isArray(listaSeguidores) && listaSeguidores.length > 0 ? (
        listaSeguidores.map((user, i) => (
          <div key={i} className="usuario-item">
            <Link
              className="botao-link"
              to={`/perfil/${user.id}`}
              onClick={fecharModalSeguidores}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <img
                src={user.imagem || '/img/placeholder.png'}
                alt={`Foto de ${user.nome_usuario}`}
                className="foto-perfil-seguidores"
              />
              <span className="nome-usuario-seguidores">{user.nome_usuario}</span>
            </Link>
          </div>
        ))
      ) : (
        <p>Nenhum seguidor encontrado.</p>
      )
    ) : Array.isArray(listaSeguindo) && listaSeguindo.length > 0 ? (
      listaSeguindo.map((user, i) => (
        <div key={i} className="usuario-item">
          <Link
            className="botao-link"
            to={`/perfil/${user.id}`}
            onClick={fecharModalSeguidores}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <img
              src={user.imagem || '/img/placeholder.png'}
              alt={`Foto de ${user.nome_usuario}`}
              className="foto-perfil-seguidores"
            />
            <span className="nome-usuario-seguidores">{user.nome_usuario}</span>
          </Link>
        </div>
      ))
    ) : (
      <p>Você não está seguindo ninguém.</p>
    )}
  </div>
) : (
  <p>Você precisa seguir esse usuário para ver seus seguidores e quem ele segue.</p>
)}
    </div>
  </div>
)}
    
                {modalOpcoes && (
            <div className="modal">
              <div className="modal-conteudo">
                <ul>
                  <li onClick={() => {
                  setModalOpcoes(false);
                  setMostrarConfirmarLogout(true);
                }}>Sair</li>
                  <li onClick={() => {
                    setModalOpcoes(false);
                    navigate('/configuracoes');
                  }}>Configurações</li>
                  <li onClick={() => {
                    setModalOpcoes(false);
                    setMostrarTrocarConta(true);
                  }}>Trocar de Conta</li>
                </ul>
                <button className="fechar-modal" onClick={() => setModalOpcoes(false)}>x</button>
              </div>
            </div>
          )}
          {mostrarTrocarConta && (
  <TrocarConta fechar={() => setMostrarTrocarConta(false)} />
)}

  </div>
)};
export default Perfil;
