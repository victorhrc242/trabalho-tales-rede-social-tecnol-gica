import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import './msg.css';
import { FaPaperPlane, FaSearch, FaArrowLeft, FaUser, FaPaintBrush, FaBellSlash, FaTrash   } from 'react-icons/fa';

axios.defaults.withCredentials = true;

const Mensagens = () => {
  const [seguindo, setSeguindo] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [historicoMensagens, setHistoricoMensagens] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [busca, setBusca] = useState('');
  const [seguindoFiltrado, setSeguindoFiltrado] = useState([]);
  const [naoLidas, setNaoLidas] = useState({});
  const [modalAberto, setModalAberto] = useState(false);

  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  const usuarioLogadoId = usuarioLocal?.id;
  const API_URL = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com';
  const fimDasMensagensRef = useRef(null);

  const modalRef = useRef(null);

  const rolarParaFim = () => {
    if (fimDasMensagensRef.current) {
      fimDasMensagensRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    rolarParaFim();
  }, [historicoMensagens]);

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

  useEffect(() => {
    if (!usuarioLogadoId) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/mensagensHub?userId=${usuarioLogadoId}`, {
        transport: HttpTransportType.WebSockets,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => console.log('Conexão SignalR estabelecida'))
      .catch((err) => console.error('Erro ao conectar no SignalR:', err));

    connection.on('NovaMensagem', (novaMensagem) => {
      const remetente = novaMensagem.id_remetente;
      const destinatario = novaMensagem.id_destinatario;

      if (
        usuarioSelecionado &&
        (remetente === usuarioSelecionado.id || destinatario === usuarioSelecionado.id)
      ) {
        setHistoricoMensagens((prev) => [...prev, novaMensagem]);

        if (remetente !== usuarioLogadoId) {
          setNaoLidas((prev) => {
            const copy = { ...prev };
            copy[remetente] = 0;
            return copy;
          });
        }
      } else {
        if (remetente !== usuarioLogadoId) {
          setNaoLidas((prev) => {
            const count = prev[remetente] || 0;
            return { ...prev, [remetente]: count + 1 };
          });
        }
      }
    });

    connection.on('MensagemApagada', (mensagemId) => {
      setHistoricoMensagens((prev) => prev.filter((msg) => msg.id !== mensagemId));
    });

    connection.on('MensagemLida', (mensagemId, lida) => {
      setHistoricoMensagens((prev) =>
        prev.map((msg) => (msg.id === mensagemId ? { ...msg, lida } : msg))
      );
    });

    return () => {
      connection.stop();
    };
  }, [usuarioLogadoId, usuarioSelecionado]);

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

  const iniciarChat = (usuario) => {
    setUsuarioSelecionado(usuario);
    setNaoLidas((prev) => {
      const copy = { ...prev };
      copy[usuario.id] = 0;
      return copy;
    });
  };

  const voltarParaHome = () => {
    window.location.href = '/';
  };

  const voltarParaSidebar = () => {
    setUsuarioSelecionado(null);
  };

  const abrirModal = () => {
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  // Modal
  useEffect(() => {
  function handleClickFora(event) {
    if (modalAberto && modalRef.current && !modalRef.current.contains(event.target)) {
      fecharModal();
    }
  }

  if (modalAberto) {
    document.addEventListener('mousedown', handleClickFora);
  } else {
    document.removeEventListener('mousedown', handleClickFora);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickFora);
  };
}, [modalAberto]);


  return (
    <div className="app-container">
      <div className={`fixed-header ${usuarioSelecionado ? 'hidden-mobile' : ''}`}></div>
      <div className="fixed-header"></div>

      {/* Sidebar */}
      <div className={`sidebar ${usuarioSelecionado ? 'hidden-mobile' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-header">
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

      {/* Chat area */}
      <div className={`chat-area ${usuarioSelecionado ? '' : 'hidden-mobile'}`}>
        {usuarioSelecionado ? (
          <>
           <div className="chat-header">
  <button className="btn-voltar" onClick={voltarParaSidebar} aria-label="Voltar">
    <FaArrowLeft />
  </button>
  <img
    src={usuarioSelecionado.imagem || 'https://via.placeholder.com/40'}
    alt={usuarioSelecionado.nome_usuario}
  />
  <span>{usuarioSelecionado.nome_usuario}</span>
  <button
    className="btn-tres-pontos"
    onClick={abrirModal}
    aria-label="Abrir opções"
  >
    &#x22EE; {/* ícone vertical três pontos */}
  </button>
</div>


            <div className="messages">
              {historicoMensagens.map((msg, index) => {
                const isRemetente = msg.id_remetente === usuarioLogadoId;
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
                    </div>
                    <div className="timestamp">{dataFormatada}</div>
                  </div>
                );
              })}
              <div ref={fimDasMensagensRef} />
            </div>

            <div className="chat-input">
              <textarea
                className="input-mensagem"
                placeholder="Digite sua mensagem..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={1}
              />
              <button onClick={enviarMensagem} className="botao-enviar" aria-label="Enviar mensagem">
                <FaPaperPlane />
              </button>
            </div>

            {/* Modal Perfil */}
         {modalAberto && (
          <div className="menu-mobile-overlay">
            <div
              className="menu-mobile-content"
              ref={modalRef}
            >
              <div className="menu-item">Perfil</div>
              <div className="menu-item">Silenciar notificações</div>
              <div className="menu-item">Apagar Mensagem</div>
              <div className="menu-item">Tema</div>
            </div>
          </div>
        )}


          </>
        ) : (
          <p className="selecionar-usuario-msg">Selecione um usuário para iniciar o chat.</p>
        )}
      </div>
    </div>
  );
};

export default Mensagens;
