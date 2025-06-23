import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import './msg.css';
import { FaPaperPlane, FaSearch, FaArrowLeft, FaUser, FaPaintBrush, FaBellSlash, FaTrash   } from 'react-icons/fa';

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
  const [naoLidas, setNaoLidas] = useState({}); // Contador de mensagens não lidas por usuário
  const [modalAberto, setModalAberto] = useState(false); // Estado para controle do modal (menu do chat)

  // Recupera o usuário logado do localStorage
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  const usuarioLogadoId = usuarioLocal?.id;

  // Ações no Menu 
const [silenciado, setSilenciado] = useState(false);
const [confirmApagarTudo, setConfirmApagarTudo] = useState(false);
const [temaSubmenu, setTemaSubmenu] = useState(false);
const [apagarMensagemIndividual, setApagarMensagemIndividual] = useState(false);
//Modal de Confirmação 
const confirmRef = useRef(null);


  // URL da API
  const API_URL = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com';

  // Referência usada para rolar a visualização para a última mensagem
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

  // Carrega os usuários que o logado está seguindo
  useEffect(() => {
    const fetchSeguindo = async () => {
      try {
        if (!usuarioLogadoId) return;
        const res = await axios.get(`${API_URL}/api/Amizades/seguindo/${usuarioLogadoId}`);
        const listaCompletada = await Promise.all(
          res.data.seguindo.map(async (item) => {
            const userRes = await axios.get(`${API_URL}/api/auth/usuario/${item.usuario2}`);
            const usuarioDados = userRes.data.dados || userRes.data;
            return {
              idAmizade: item.id,
              dataSolicitacao: item.dataSolicitacao,
              usuario: {
                ...usuarioDados,
                id: item.usuario2,
              },
            };
          })
        );
        setSeguindo(listaCompletada);
        setSeguindoFiltrado(listaCompletada);
      } catch (err) {
        console.error('Erro ao carregar lista de seguindo:', err);
      }
    };

    fetchSeguindo();
  }, [usuarioLogadoId]);

  // Atualiza a lista de usuários filtrados com base no termo de busca
  useEffect(() => {
    if (busca.trim() === '') {
      setSeguindoFiltrado(seguindo);
    } else {
      const termo = busca.toLowerCase();
      const filtrado = seguindo.filter((item) =>
        item.usuario.nome_usuario.toLowerCase().includes(termo)
      );
      setSeguindoFiltrado(filtrado);
    }
  }, [busca, seguindo]);

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

      // Se estiver conversando com quem enviou, adiciona direto
      if (
        usuarioSelecionado &&
        (remetente === usuarioSelecionado.id || destinatario === usuarioSelecionado.id)
      ) {
        setHistoricoMensagens((prev) => [...prev, novaMensagem]);

        // Zera o contador de mensagens não lidas
        if (remetente !== usuarioLogadoId) {
          setNaoLidas((prev) => {
            const copy = { ...prev };
            copy[remetente] = 0;
            return copy;
          });
        }
      } else {
        // Se for outra conversa, incrementa o contador
        if (remetente !== usuarioLogadoId) {
          setNaoLidas((prev) => {
            const count = prev[remetente] || 0;
            return { ...prev, [remetente]: count + 1 };
          });
        }
      }
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

    const fetchMensagens = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/Mensagens/mensagens/${usuarioLogadoId}/${usuarioSelecionado.id}`
        );
        setHistoricoMensagens(res.data.mensagens || []);
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
  const iniciarChat = (usuario) => {
    setUsuarioSelecionado(usuario);
    setNaoLidas((prev) => {
      const copy = { ...prev };
      copy[usuario.id] = 0;
      return copy;
    });
  };

  // Voltar para home
  const voltarParaHome = () => {
    window.location.href = '/';
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
  setConfirmApagarTudo(false); // <- fecha imediatamente o modal
  
  try {
    await axios.delete(`${API_URL}/api/Mensagens/limpar/${usuarioLogadoId}/${usuarioSelecionado.id}`);
    setHistoricoMensagens([]);
  } catch (err) {
    console.error('Erro ao apagar mensagens', err);
  }
};



// Tema
const toggleTemaSubmenu = () => {
  setTemaSubmenu(!temaSubmenu);
};

const handleTema = (novoTema) => {
  document.documentElement.setAttribute('data-tema', novoTema);
  setTemaSubmenu(false);
};


  return (
    <div className="app-container">
      {/* Cabeçalho fixo, pode ser usado para título ou estilo visual */}
      <div className={`fixed-header ${usuarioSelecionado ? 'hidden-mobile' : ''}`}></div>
      <div className="fixed-header"></div>

      {/* Sidebar: Lista de usuários que você está seguindo */}
      <div className={`sidebar ${usuarioSelecionado ? 'hidden-mobile' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-header">
            {/* Botão para voltar à tela inicial */}
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
                {/* Foto de perfil do usuário */}
                <img
                  src={
                    item.usuario.imagem ||
                    item.usuario.FotoPerfil ||
                    'https://via.placeholder.com/40'
                  }
                  alt={item.usuario.nome_usuario}
                />
                <div className="chat-item-info">
                  <div className="chat-item-header">
                    <span className="chat-item-nome">{item.usuario.nome_usuario}</span>
                    {/* Notificação de mensagens não lidas */}
                    {naoLidas[item.usuario.id] > 0 && (
                      <span className="chat-item-notificacao">{naoLidas[item.usuario.id]}</span>
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
            {/* Cabeçalho do chat com botão de voltar, nome e imagem do usuário */}
            <div className="chat-header">
              <button className="btn-voltar" onClick={voltarParaSidebar} aria-label="Voltar">
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
      <div className="message-content">
        <p>{msg.conteudo}</p>
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
                <div className="menu-item" onClick={toggleTemaSubmenu}>Tema</div>

                {temaSubmenu && (
                  <div className="submenu-tema">
                    <div className="menu-item" onClick={() => handleTema('claro')}>Claro</div>
                    <div className="menu-item" onClick={() => handleTema('escuro')}>Escuro</div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Fim Modal de opiçoes */}

          {/* 🔥 Modal de Confirmação - FORA do menu! */}
          {confirmApagarTudo && (
            <div className="confirm-modal" ref={confirmRef}>
              <p>Deseja apagar todas as Mensagens?</p>
              <button
                className="btn-sim"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmApagarTudo(false);
                  setModalAberto(false); // <- fecha o menu também
                  confirmarApagarTudo(); // <- função correta
                }}
              >Sim</button>
              <button
                className="btn-nao"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmApagarTudo(false);
                  setModalAberto(false); // <- fecha o menu também
                }}
              >Não</button>
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
