// oi chat aqui eo victor  e antes de tudo bom dia   
// se vc tiver mexendo aqui e por favor tenha cuidado com o codigo  
//  pois tem partes aqui que e muinto importantepara o codigo funcionar
// e manda oi para mim se alguem for altera meu codigo e por favor não esqueça do que falei  
// pois se alterar  algo e quebrar o codigo não sei mais como resolver por isso e m codigo legado
import React, { useEffect, useState, useRef } from 'react';
//  essa parte do codigo aqui e importante pois se vc mexer ou auterar alguma parte da qui vai travar o sisitema e não vai funcionar
import axios from 'axios';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
//css
import './msg.css'
//icon
import { FaUser, FaPaperPlane } from 'react-icons/fa';

axios.defaults.withCredentials = true;
//inicio codigo legado desenvolvido por (Victor)
//FAVOR NÃO MECHER NESSA PARTE POIS E SENSIVEL A MODIFICAÇÃO
const Mensagens = () => {
  const [seguindo, setSeguindo] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [historicoMensagens, setHistoricoMensagens] = useState([]);

  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  const usuarioLogadoId = usuarioLocal?.id;

  const API_URL = 'https://trabalho-tales-rede-social-tecnol-gica.onrender.com';

  // Usar ref para evitar re-criar listeners no SignalR
  const historicoRef = useRef(historicoMensagens);
  historicoRef.current = historicoMensagens;

  // Buscar lista de seguindo
  useEffect(() => {
    const fetchSeguindo = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/Amizades/seguindo/${usuarioLogadoId}`);
        const listaCompletada = await Promise.all(
          res.data.seguindo.map(async (item) => {
            const userRes = await axios.get(`${API_URL}/api/auth/usuario/${item.usuario2}`);
            return {
              idAmizade: item.id,
              dataSolicitacao: item.dataSolicitacao,
              usuario: {
                ...userRes.data.dados,
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

    if (usuarioLogadoId) {
      fetchSeguindo();
    }
  }, [usuarioLogadoId]);

  // Inicializar conexão SignalR uma vez (quando usuário logado mudar)
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

    // Evento: nova mensagem
    connection.on('NovaMensagem', (novaMensagem) => {
      if (
        usuarioSelecionado &&
        (novaMensagem.id_remetente === usuarioSelecionado.id ||
          novaMensagem.id_destinatario === usuarioSelecionado.id)
      ) {
        setHistoricoMensagens((prev) => [...prev, novaMensagem]);
      }
    });

    // Evento: mensagem apagada
    connection.on('MensagemApagada', (mensagemId) => {
      setHistoricoMensagens((prev) => prev.filter((msg) => msg.id !== mensagemId));
    });

    // Evento: mensagem lida
    connection.on('MensagemLida', (mensagemId, lida) => {
      setHistoricoMensagens((prev) =>
        prev.map((msg) => (msg.id === mensagemId ? { ...msg, lida } : msg))
      );
    });

    return () => {
      connection.stop();
    };
  }, [usuarioLogadoId, usuarioSelecionado]);

  // Buscar histórico de mensagens quando trocar usuário selecionado
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

  // Enviar mensagem: chama API REST que salva no banco e o backend notifica via hub
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
        const mensagemSalva = res.data.dados; // pegar o objeto dentro do dados

        setHistoricoMensagens((prev) => [...prev, mensagemSalva]);

        setMensagem('');
      } else {
        console.error('Erro ao salvar mensagem:', res.status);
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };
  // Função para iniciar chat com usuário
  const iniciarChat = (usuario) => {
    setUsuarioSelecionado(usuario);
  };
  //final codigo legado(fim +"se for  mecher mexa com cuidado pois nem eu sei pq funcionou")
  return (
    <div className="app-container">
      <div className="fixed-header"></div>

      <div className="sidebar">
        <div className="sidebar-header">Meu WhatsApp</div>
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
                  src={item.usuario.foto || 'https://via.placeholder.com/40'}
                  alt={item.usuario.nome}
                />
                <span>{item.usuario.nome}</span>
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
                src={usuarioSelecionado.foto || 'https://via.placeholder.com/40'}
                alt={usuarioSelecionado.nome}
              />
              <span>{usuarioSelecionado.nome}</span>
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
