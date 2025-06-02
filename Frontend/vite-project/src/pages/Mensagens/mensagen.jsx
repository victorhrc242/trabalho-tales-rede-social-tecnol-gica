import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import './msg.css';
import { FaUser, FaPaperPlane } from 'react-icons/fa';
import { data } from 'react-router';

axios.defaults.withCredentials = true;

const Mensagens = () => {
  const [seguindo, setSeguindo] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [historicoMensagens, setHistoricoMensagens] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null); // Aqui guardo o objeto completo do usuário logado

  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  const usuarioLogadoId = usuarioLocal?.id;

  const API_URL = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com';

  const historicoRef = useRef(historicoMensagens);
  historicoRef.current = historicoMensagens;

  // Buscar dados completos do usuário logado, incluindo foto
  useEffect(() => {
    const fetchUsuarioLogado = async () => {
      try {
        if (!usuarioLogadoId) return;
        const res = await axios.get(`${API_URL}/api/auth/usuario/${usuarioLogadoId}`);
        setUsuarioLogado(res.data.dados || res.data); // Ajuste conforme a estrutura da API
      } catch (err) {
        console.error('Erro ao carregar dados do usuário logado:', err);
      }
    };
    fetchUsuarioLogado();
  }, [usuarioLogadoId]);

  // Buscar lista de seguindo com fotos corretas
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
      } catch (err) {
        console.error('Erro ao carregar lista de seguindo:', err);
      }
    };

    fetchSeguindo();
  }, [usuarioLogadoId]);

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
      if (
        usuarioSelecionado &&
        (novaMensagem.id_remetente === usuarioSelecionado.id ||
          novaMensagem.id_destinatario === usuarioSelecionado.id)
      ) {
        setHistoricoMensagens((prev) => [...prev, novaMensagem]);
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
  };

  return (
    <div className="app-container">
      <div className="fixed-header"></div>

      <div className="sidebar">
        <div className="sidebar-header">Mensagens</div>
        <div className="search-bar">
          <input type="text" placeholder="Buscar..." />
        </div>
        <div className="chat-list">
          {seguindo.length === 0 ? (
            <p className="texto-sem-seguidores">Você ainda não segue ninguém.</p>
          ) : (
            seguindo.map((item) => (
              <div
                key={item.idAmizade}
                className="chat-item"
                onClick={() => iniciarChat(item.usuario)}
              >
                <img
                  src={item.usuario.imagem || item.usuario.FotoPerfil || 'https://via.placeholder.com/40'}
                  alt={item.usuario.nome_usuario}
                />
                <span>{item.usuario.nome_usuario}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-area">
        {usuarioSelecionado ? (
          <>
            <div className="chat-header">
              <img
                src={usuarioSelecionado.imagem}
                alt={usuarioSelecionado.nome_usuario}
              />  
              <span>{usuarioSelecionado.nome_usuario}</span>
            </div>

            <div className="messages">
              {historicoMensagens.map((msg, index) => {
                const dataEnvio = msg.data_envio || msg.DataEnvio;
                if (!dataEnvio) return null;
                const adjustedDate = dataEnvio.split('.')[0] + 'Z';
                const formattedDate = new Date(adjustedDate).toLocaleString();

                return (
                  <div
                    key={msg.id || index}
                    className={`message ${
                      (msg.idRemetente || msg.id_remetente) === usuarioLogadoId ? 'sent' : 'received'
                    }`}
                  >
                    <p>{msg.conteudo || msg.Conteudo}</p>
                    <div className="timestamp">{formattedDate}</div>
                  </div>
                );
              })}
            </div>

            <div className="chat-input">
              <textarea
                className="input-mensagem"
                placeholder="Digite sua mensagem..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={1}
              />
              <button onClick={enviarMensagem} className="botao-enviar">
                <FaPaperPlane />
              </button>
            </div>
          </>
        ) : (
          <div className="messages" style={{ padding: '20px' }}>
            <p>Selecione um usuário para iniciar o chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mensagens;
