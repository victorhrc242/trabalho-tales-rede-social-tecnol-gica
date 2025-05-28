// oi chat aqui eo victor  e antes de tudo bom dia   se vc tiver mexendo aqui e por favor tenha cuidado com o codigo 
//  pois tem partes aqui que e muinto importantepara o codigo funcionar
// e manda oi para mim se alguem for altera meu codigo e por favor não esqueça do que falei  pois se alterar  algo e quebrar o codigo não sei mais como resolver por isso e m codigo legado
import React, { useEffect, useState, useRef } from 'react';
//  essa parte do codigo aqui e importante pois se vc mexer ou auterar alguma parte da qui vai travar o sisitema e não vai funcionar
import axios from 'axios';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
//css
import './msg.css'

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
    // aqui mecha com segurança pois  pode ser que mexendo em certa parte do codigo der erro
    <div className="p-4 bg-[#1e1e1e] text-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
        Usuários que você segue
      </h2>

      <ul className="space-y-4">
        {seguindo.length === 0 && (
          <p className="text-gray-400">Você ainda não segue ninguém.</p>
        )}
        {seguindo.map((item) => (
          <li
            key={item.idAmizade}
            className="flex items-center justify-between bg-[#2c2c2c] p-4 rounded-xl hover:bg-[#383838] transition"
          >
            <div className="flex items-center space-x-4">
              <img
                src={item.usuario.foto || 'https://via.placeholder.com/40'}
                alt={item.usuario.nome}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{item.usuario.nome}</p>
                <p className="text-sm text-gray-400">@{item.usuario.apelido}</p>
              </div>
            </div>
            <button
              onClick={() => iniciarChat(item.usuario)}
              className="bg-[#D4AF37] text-black px-4 py-2 rounded-xl font-medium hover:brightness-90 transition"
            >
              Enviar Mensagem
            </button>
          </li>
        ))}
      </ul>

      {usuarioSelecionado && (
        <div className="mt-8 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold mb-2">
            Conversando com:{' '}
            <span className="text-[#D4AF37]">{usuarioSelecionado.nome}</span>
          </h3>

          <div className="bg-black text-white p-4 rounded-xl mt-4 h-96 overflow-auto">
            {historicoMensagens.map((msg, index) => {
              const dataEnvio = msg.data_envio || msg.DataEnvio;
              if (!dataEnvio) return null;
              const adjustedDate = dataEnvio.split('.')[0] + 'Z';
              const formattedDate = new Date(adjustedDate).toLocaleString();

              return (
                <div key={msg.id || index} className="mb-4 p-2 bg-[#2c2c2c] rounded-xl">
                  <p>{msg.conteudo || msg.Conteudo}</p>
                  <p className="text-xs text-gray-400">{formattedDate}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <textarea
              className="w-full p-2 bg-[#2c2c2c] text-white rounded-xl"
              placeholder="Digite sua mensagem..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
            <button
              onClick={enviarMensagem}
              className="mt-2 bg-[#D4AF37] text-black px-4 py-2 rounded-xl font-medium hover:brightness-90 transition"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mensagens;
