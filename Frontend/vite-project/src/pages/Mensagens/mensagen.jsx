import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import './msg.css';
import { FaPaperPlane, FaSearch, FaArrowLeft, FaUser, FaPaintBrush, FaBellSlash, FaTrash, FaVideo } from 'react-icons/fa';

import Comentario from '../../Components/Comentario';




// Define que o axios deve enviar cookies (importante para autenticação com sessões)
axios.defaults.withCredentials = true;

// Componente principal
const Mensagens = () => {
  // Estados utilizados no componente
  const [seguindo, setSeguindo] = useState([]); // Lista de usuários que o logado está seguindo
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null); // Usuário com quem está conversando
  const [mensagem, setMensagem] = useState(''); // Mensagem atual sendo digitada
  const [historicoMensagens, setHistoricoMensagens] = useState([]); // Histórico de mensagens do chat atual
  const [usuarioLogado, setUsuarioLogado] = useState(null); // Dados do usuário logado
  const [busca, setBusca] = useState(''); // Texto de busca na lista de usuários
  const [seguindoFiltrado, setSeguindoFiltrado] = useState([]); // Lista filtrada com base na busca
  const [usuariosSeguidos, setUsuariosSeguidos] = useState([]);
  const [naoLidas, setNaoLidas] = useState({}); // Contador de mensagens não lidas por usuário
  const [modalAberto, setModalAberto] = useState(false); // Estado para controle do modal (menu do chat)
const [previewsPosts, setPreviewsPosts] = useState({});
  // Recupera o usuário logado do localStorage
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  const usuarioLogadoId = usuarioLocal?.id;
const [postSelecionado, setPostSelecionado] = useState(null);

  // Ações no Menu 
const [silenciado, setSilenciado] = useState(false);
const [confirmApagarTudo, setConfirmApagarTudo] = useState(false);
const [apagarMensagemIndividual, setApagarMensagemIndividual] = useState(false);
//Modal de Confirmação 
const confirmRef = useRef(null);
const [apagandoTudo, setApagandoTudo] = useState(false);


  // URL da API
  const API_URL = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com';

  //  usada para rolar a visualização para a última mensagem
  const fimDasMensagensRef = useRef(null);

  // Referência para detectar cliques fora do modal
  const modalRef = useRef(null);

  // Função para rolar para a última mensagem
  const rolarParaFim = () => {
    if (fimDasMensagensRef.current) {
      fimDasMensagensRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sempre que o histórico de mensagens mudar, rola para a última mensagem
  useEffect(() => {
    rolarParaFim();
  }, [historicoMensagens]);

  // Carrega os dados do usuário logado
  useEffect(() => {
    const fetchUsuarioLogado = async () => {
      try {
        if (!usuarioLogadoId) return;
        const res = await axios.get(`${API_URL}/api/auth/usuario/${usuarioLogadoId}`);
        setUsuarioLogado(res.data.dados || res.data);
      } catch (err) {
        console.error('Erro ao carregar dados do usuário logado:', err);
      }
    };
    fetchUsuarioLogado();
  }, [usuarioLogadoId]);

 // Carrega os chats atuais (usuários com quem já conversou)
useEffect(() => {
  const fetchChats = async () => {
    try {
      if (!usuarioLogadoId) return;

      const res = await axios.get(`${API_URL}/api/Mensagens/conversas/${usuarioLogadoId}`);

      const listaChats = res.data.usuarios.map((item) => ({
        idAmizade: item.id,
        usuario: {
          id: item.id,
          nome_usuario: item.nome_usuario,
          imagem: item.fotoPerfil,
        },
      }));

      setSeguindo(listaChats);
      setSeguindoFiltrado(listaChats);

    } catch (err) {
      console.error(err);
    }
  };

  fetchChats();
}, [usuarioLogadoId]);

// Carrega lista completa de usuários seguidos para busca
useEffect(() => {
  const fetchSeguidos = async () => {
    try {
      if (!usuarioLogadoId) return;

      const res = await axios.get(`${API_URL}/api/Amizades/seguindo/${usuarioLogadoId}`);
      const amizades = res.data.seguindo || [];

      const usuarios = await Promise.all(
        amizades.map(async (amizade) => {
          const userRes = await axios.get(`${API_URL}/api/auth/usuario/${amizade.usuario2}`);
          const dados = userRes.data.dados || userRes.data;

          return {
            idAmizade: amizade.id,
            usuario: {
              id: dados.id,
              nome_usuario: dados.nome_usuario,
              imagem: dados.imagem || dados.fotoPerfil,
            },
          };
        })
      );

      setUsuariosSeguidos(usuarios.filter(Boolean));
    } catch (err) {
      console.error(err);
    }
  };

  fetchSeguidos();
}, [usuarioLogadoId]);

// Efeito que filtra os usuários a mostrar baseado na busca
useEffect(() => {
  if (busca.trim() === '') {
    // Quando não digita nada, mostra só os chats atuais
    setSeguindoFiltrado(seguindo);
  } else {
    // Quando digita algo, filtra a lista completa de usuários seguidos
    const filtrados = usuariosSeguidos.filter((item) =>
      item.usuario.nome_usuario.toLowerCase().includes(busca.toLowerCase())
    );
    setSeguindoFiltrado(filtrados);
  }
}, [busca, seguindo, usuariosSeguidos]);
 
// Busca informações de um post específico por ID
const buscarPostPorId = async (postId) => {
  try {
    const res = await axios.get(`${API_URL}/api/Feed/feed-porID/${postId}`);
    return res.data.dados || res.data;
  } catch (err) {
    console.error('Erro ao buscar post:', err);
    return null;
  }
};
// carrega as pré-visualizações dos posts associados às mensagens
useEffect(() => {
  const carregarPreviews = async () => {
    const mensagensComPostId = historicoMensagens.filter(msg => msg.postid && !previewsPosts[msg.postid]);

    const novasPreviews = {};

    for (const msg of mensagensComPostId) {
      const post = await buscarPostPorId(msg.postid);
      if (post) {
        novasPreviews[msg.postid] = post;
      }
    }

    setPreviewsPosts(prev => ({ ...prev, ...novasPreviews }));
  };

  carregarPreviews();
}, [historicoMensagens]);
  // Conecta ao SignalR e escuta eventos em tempo real
  useEffect(() => {
    if (!usuarioLogadoId) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/mensagensHub?userId=${usuarioLogadoId}`, {
        transport: HttpTransportType.WebSockets,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    // Inicia a conexão
    connection
      .start()
      .then(() => console.log('Conexão SignalR estabelecida'))
      .catch((err) => console.error('Erro ao conectar no SignalR:', err));

    // Recebe nova mensagem
   connection.on('NovaMensagem', (novaMensagem) => {
  const remetente = novaMensagem.id_remetente;
  const destinatario = novaMensagem.id_destinatario;

  // Se a mensagem é para o chat aberto
  if (usuarioSelecionado && (remetente === usuarioSelecionado.id || destinatario === usuarioSelecionado.id)) {
    setHistoricoMensagens(prev => [...prev, novaMensagem]);
    
    // Se for mensagem recebida, marca como lida
    if (remetente !== usuarioLogadoId) {
      marcarMensagemComoLida(novaMensagem.id);
      setNaoLidas(prev => ({ ...prev, [remetente]: 0 }));
    }
  } 
  // Se for mensagem recebida em outro chat
  else if (remetente !== usuarioLogadoId) {
    setNaoLidas(prev => ({
      ...prev,
      [remetente]: (prev[remetente] || 0) + 1
    }));
  }
});
connection.on('MensagensLidas', ({ usuarioId }) => {
  setNaoLidas(prev => ({
    ...prev,
    [usuarioId]: 0
  }));
});
    // Remove mensagem apagada
    connection.on('MensagemApagada', (mensagemId) => {
      setHistoricoMensagens((prev) => prev.filter((msg) => msg.id !== mensagemId));
    });

    // Finaliza a conexão ao desmontar o componente
    return () => {
      connection.stop();
    };
  }, [usuarioLogadoId, usuarioSelecionado]);

  // Carrega as mensagens do usuário selecionado
  useEffect(() => {
    if (!usuarioSelecionado) {
      setHistoricoMensagens([]);
      return;
    }

// Quando o usuário selecionado ou o usuário logado mudam,
// esta função busca todas as mensagens trocadas entre eles na API.
// O resultado é armazenado no estado `historicoMensagens` para exibir no chat.
// Caso a requisição falhe, um erro será exibido no console.
    const fetchMensagens = async () => {
  try {
    const res = await axios.get(
      `${API_URL}/api/Mensagens/mensagens/${usuarioLogadoId}/${usuarioSelecionado.id}`
    );

    // Marcar todas as mensagens carregadas como lidas (para o usuário selecionado)
    const mensagensCarregadas = res.data.mensagens || [];
    setHistoricoMensagens(mensagensCarregadas);

    // Marcar cada mensagem não lida como lida, só as que são do outro usuário
    mensagensCarregadas.forEach((msg) => {
      if (msg.id_remetente !== usuarioLogadoId && !msg.lida) { // supondo que existe o campo 'lida'
        marcarMensagemComoLida(msg.id);
      }
    });

    // Limpa o contador de mensagens não lidas para o usuário selecionado
    setNaoLidas((prev) => {
      const copy = { ...prev };
      copy[usuarioSelecionado.id] = 0;
      return copy;
    });

  } catch (err) {
    console.error('Erro ao buscar histórico de mensagens:', err);
  }
};

    fetchMensagens();
  }, [usuarioSelecionado, usuarioLogadoId]);

  // Envia nova mensagem
  const enviarMensagem = async () => {
    if (!mensagem.trim() || !usuarioSelecionado) {
      console.warn('Mensagem vazia ou usuário não selecionado');
      return;
    }

    try {
      const novaMensagem = {
        idRemetente: usuarioLogadoId,
        idDestinatario: usuarioSelecionado.id,
        conteudo: mensagem,
      };

      const res = await axios.post(`${API_URL}/api/Mensagens/enviar`, novaMensagem);

      if (res.status === 201 || res.status === 200) {
        const mensagemSalva = res.data.dados;
        setHistoricoMensagens((prev) => [...prev, mensagemSalva]);
        setMensagem('');
      } else {
        console.error('Erro ao salvar mensagem:', res.status);
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  // Quando clico em um usuário da lista para iniciar o chat
  const iniciarChat = async (usuario) => {
  setUsuarioSelecionado(usuario);
  
  // Se houver mensagens não lidas, marca como lidas
  if (naoLidas[usuario.id] > 0) {
    try {
      await axios.post(`${API_URL}/api/Mensagens/marcar-lidas`, {
        remetenteId: usuario.id,
        destinatarioId: usuarioLogadoId
      });
      
      // Atualiza o estado local
      setNaoLidas(prev => ({
        ...prev,
        [usuario.id]: 0
      }));
    } catch (err) {
      console.error('Erro ao marcar mensagens como lidas:', err);
    }
  }
};

  // Voltar para home
  const voltarParaHome = () => {
    window.location.href = '/home';
  };

  // Voltar para a lista de usuários
  const voltarParaSidebar = () => {
    setUsuarioSelecionado(null);
  };

  // Abrir e fechar modal
  const abrirModal = () => {
    setModalAberto(true);
  };
  const fecharModal = () => {
    setModalAberto(false);
  };

  // Fecha apenas o menu de opções se clicar fora dele
useEffect(() => {
  function handleClickForaMenu(event) {
    if (modalAberto && modalRef.current && !modalRef.current.contains(event.target)) {
      fecharModal();
    }
  }

  document.addEventListener('mousedown', handleClickForaMenu);
  return () => {
    document.removeEventListener('mousedown', handleClickForaMenu);
  };
}, [modalAberto]);

// Fecha somente o modal de confirmação (Sim/Não) se clicar fora dele
useEffect(() => {
  function handleClickForaConfirm(event) {
    if (
      confirmApagarTudo &&
      confirmRef.current &&
      !confirmRef.current.contains(event.target)
    ) {
      setConfirmApagarTudo(false);
    }
  }

  document.addEventListener('mousedown', handleClickForaConfirm);
  return () => {
    document.removeEventListener('mousedown', handleClickForaConfirm);
  };
}, [confirmApagarTudo]);


  // Levar ao perfil do usuário selecionado
const handleVerPerfil = () => {
  window.location.href = `/perfil/${usuarioSelecionado.id}`;
};

// Toggle silenciar/ativar notificação (implementação a depender da sua API)
const handleToggleNotificacao = async () => {
  try {
    const endpoint = silenciado ? '/api/notifications/ativar' : '/api/notifications/silenciar';
await axios.post(
  API_URL + endpoint,
  { userId: usuarioSelecionado.id }, // body (dados)
  { withCredentials: true }          // config (opções)
);
    setSilenciado(!silenciado);
  } catch (err) {
    console.error('Erro ao alterar notificação', err);
  }
};

// Iniciar seleção de mensagem para apagar
const removerMensagem = async (msgId) => {
  try {
    await axios.delete(`${API_URL}/api/Mensagens/${msgId}`);
    setHistoricoMensagens(prev => prev.filter(m => m.id !== msgId));
  } catch (err) {
    console.error('Erro ao apagar mensagem', err);
  } finally {
    setApagarMensagemIndividual(false); // desativa o modo de apagar após a ação
  }
};
const handleApagarMensagem = () => setApagarMensagemIndividual(true);

// Apagar todas mensagens
const confirmarApagarTudo = async () => {
  setApagandoTudo(true);
  setConfirmApagarTudo(false); // fecha o modal de confirmação
  setModalAberto(false);       // fecha o menu também

  try {
    // Faz um DELETE para cada mensagem do histórico
    await Promise.all(
      historicoMensagens.map((mensagem) =>
        axios.delete(`${API_URL}/api/Mensagens/${mensagem.id}`)
      )
    );

    // Limpa o estado local após apagar todas
    setHistoricoMensagens([]);
  } catch (err) {
    console.error('Erro ao apagar mensagens:', err);
  } finally {
    setApagandoTudo(false);
  }
};

// Função para marcar uma mensagem como lida pela API
const marcarMensagemComoLida = async (mensagemId) => {
  try {
    await axios.put(`${API_URL}/api/Mensagens/marcar-como-lida/${mensagemId}`);
    // Pode atualizar localmente se quiser (ex: atualizar contador ou status da mensagem)
  } catch (err) {
    console.error('Erro ao marcar mensagem como lida:', err);
  }
};
useEffect(() => {
  const fetchNaoLidas = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/Mensagens/nao-lidas/${usuarioLogadoId}`);
      setNaoLidas(res.data.naoLidas || {});
    } catch (err) {
      console.error('Erro ao buscar mensagens não lidas:', err);
    }
  };
  
  if (usuarioLogadoId) {
    fetchNaoLidas();
  }
}, [usuarioLogadoId]);

  return (
    <div className="app-container">
      {/* Modal com Mensagem Apagando todas Mensagens */}
       {apagandoTudo && (
      <div className="mensagem-apagando-overlay">
        Apagando mensagens...
      </div>
    )}
      {/* Cabeçalho fixo, pode ser usado para título ou estilo visual */}
      <div className={`fixed-header ${usuarioSelecionado ? 'hidden-mobile' : ''}`}></div>
      <div className="fixed-header"></div>

      {/* Sidebar: Lista de usuários que você está seguindo */}
      <div className={`sidebar ${usuarioSelecionado ? 'hidden-mobile' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-header">
            {/* Botão para voltar à tela inicial Somnete no Mobile */}
            <button
              className="btn-voltar-home"
              onClick={voltarParaHome}
              aria-label="Voltar para Home"
            >
              <FaArrowLeft />
            </button>
            Mensagens
          </div>
        </div>

        {/* Campo de busca para filtrar a lista de usuários */}
        <div className="search-bar">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <span className="search-icon">
              <FaSearch />
            </span>
          </div>
        </div>

        {/* Lista de usuários com quem é possível iniciar conversas */}
       <div className="chat-list">
  {seguindoFiltrado.length === 0 ? (
    <p className="texto-sem-seguidores">Nenhum usuário encontrado.</p>
  ) : (
    seguindoFiltrado.map((item) => (
      <div
        key={item.idAmizade}
        className="chat-item"
        onClick={() => iniciarChat(item.usuario)}
      >
        <img
          src={item.usuario.imagem || item.usuario.FotoPerfil || 'https://via.placeholder.com/40'}
          alt={item.usuario.nome_usuario}
        />
        <div className="chat-item-info">
          <div className="chat-item-header">
            <span className="chat-item-nome">{item.usuario.nome_usuario}</span>
            {naoLidas[item.usuario.id] > 0 && (
              <span className="bolota-azul">
                {naoLidas[item.usuario.id]}
              </span>
            )}
          </div>
        </div>
      </div>
    ))
  )}
</div>

      </div>

      {/* Área principal do chat (exibida quando um usuário é selecionado) */}
      <div className={`chat-area ${usuarioSelecionado ? '' : 'hidden-mobile'}`}>
        {usuarioSelecionado ? (
          <>
            {/* Cabeçalho do chat com botão de voltar, nome e imagem do usuário (Somente Mobile) */}
            <div className="chat-header">
              <button className="btn-voltar-chat" onClick={voltarParaSidebar} aria-label="Voltar">
                <FaArrowLeft />
              </button>
              <img
                src={usuarioSelecionado.imagem || 'https://via.placeholder.com/40'}
                alt={usuarioSelecionado.nome_usuario}
              />
              <span>{usuarioSelecionado.nome_usuario}</span>

              {/* Botão de menu (3 pontos) para abrir o modal com opções */}
              <button
                className="btn-tres-pontos"
                onClick={abrirModal}
                aria-label="Abrir opções"
              >
                &#x22EE; {/* Código do caractere de 3 pontos verticais */}
              </button>
            </div>

            {/* Lista de mensagens do chat atual */}
            <div className="messages">
              {historicoMensagens.map((msg, index) => {
                const isRemetente = msg.id_remetente === usuarioLogadoId;

                // Formata a data da mensagem
                const dataEnvio = msg.data_envio || msg.dataEnvio || new Date().toISOString();
                const dataFormatada = new Date(dataEnvio).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                <div
                key={index}
                  className={`message ${isRemetente ? 'sent' : 'received'}`}
                >
               {/* Preview de post */}
{msg.postid && previewsPosts[msg.postid] && (
  <div
    className="ig-preview"
    onClick={() => setPostSelecionado(previewsPosts[msg.postid])}
  >
    {/* Header com usuário genérico */}
    <div className="ig-header">
      <img
        src="https://pm1.aminoapps.com/7660/570fad39a152eb801851e9a2b4ca662b7efb72f3r1-720-689v2_hq.jpg" // avatar genérico
        alt="usuario_preview"
        className="ig-avatar"
      />
      <span className="ig-username">usuario_preview</span>
    </div>

    {/* Imagem ou vídeo */}
 {previewsPosts[msg.postid].video ? (
  <div className="ig-video-wrapper" style={{ position: "relative" }}>
    <video
      src={previewsPosts[msg.postid].video}
      className="ig-preview-video"
      muted
      preload="metadata"
    />
    {/* Ícone de vídeo sobreposto */}
    <FaVideo
      style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        color: "#fff",
        fontSize: "20px",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: "50%",
        padding: "4px",
      }}
    />
  </div>
) : previewsPosts[msg.postid].imagem ? (
  <img
    src={previewsPosts[msg.postid].imagem}
    alt="Imagem do post"
    className="ig-preview-img"
  />
) : null}


    {/* Conteúdo textual */}
    <div className="ig-caption">
      <strong>{previewsPosts[msg.postid].titulo || ""}</strong>
      <p>{previewsPosts[msg.postid].descricao?.slice(0, 100) || ""}</p>
    </div>
  </div>
)}


{postSelecionado && (
  <Comentario
    post={postSelecionado}
    usuario={usuarioLogado}
    fechar={() => setPostSelecionado(null)}
  />
)}
                {/* Exibe a mensagem */}

                 <div className="message-content">
                  <p>{msg.conteudo}</p>
                  {/* Ícones de status de leitura: dois risquinhos */}
                  {isRemetente && (
                    <span
                      className={`status-risquinhos ${msg.lida ? 'lida' : 'nao-lida'}`}
                      title={msg.lida ? 'Lida' : 'Entregue'}
                    >
                      ✓✓
                    </span>
                  )}
                  {apagarMensagemIndividual && isRemetente && (
                    <button
                      className="btn-apagar-mensagem"
                      onClick={() => removerMensagem(msg.id)}
                      title="Apagar mensagem"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                  <div className="timestamp">{dataFormatada}</div>
                </div>
                );
              })}

              {/* Referência para rolar até o final das mensagens */}
              <div ref={fimDasMensagensRef} />
            </div>

            {/* Área de input para digitar e enviar nova mensagem */}
            <div className="chat-input">
              <textarea
                className="input-mensagem"
                placeholder="Digite sua mensagem..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={1}
              />
              <button
                onClick={enviarMensagem}
                className="botao-enviar"
                aria-label="Enviar mensagem"
              >
                <FaPaperPlane />
              </button>
            </div>

                    {/* Modal com opções do chat */}
          {modalAberto && (
            <div className="menu-mobile-overlay">
              <div className="menu-mobile-content" ref={modalRef}>
                <div className="menu-item" onClick={handleVerPerfil}>Perfil</div>
                <div className="menu-item" onClick={handleToggleNotificacao}>
                  {silenciado ? 'Ativar notificações' : 'Silenciar notificações'}
                </div>
                <div className="menu-item" onClick={handleApagarMensagem}>Apagar Mensagem</div>
                <div className="menu-item" onClick={() => setConfirmApagarTudo(true)}>Apagar Todas Mensagens</div>
              </div>
            </div>
          )}
          {/* Fim Modal de opiçoes */}

          {/*  Modal de Confirmação - FORA do menu! */}
          {confirmApagarTudo && (
            <div className="confirm-modal" ref={confirmRef}>
              <p>Deseja apagar todas as Mensagens?</p>
              {/* Sim */}
              <button
              className="btn-sim"
              onClick={(e) => {
                e.stopPropagation();
                if (!apagandoTudo) confirmarApagarTudo();
              }}
              disabled={apagandoTudo}
            >{apagandoTudo ? 'Apagando...' : 'Sim'}</button>
            {/* Não */}
            <button
              className="btn-nao"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmApagarTudo(false);
                setModalAberto(false);
              }}
              disabled={apagandoTudo}
            >Não </button>
            </div>
          )}
          {/* Fim Modal Confirmação */}

          </>
        ) : (
          // Texto exibido quando nenhum usuário foi selecionado ainda
          <p className="selecionar-usuario-msg">Selecione um usuário para iniciar o chat.</p>
        )}
      </div>
      
    </div>
  );
};

export default Mensagens;
