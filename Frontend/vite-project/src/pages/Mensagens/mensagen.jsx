import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HubConnectionBuilder } from '@microsoft/signalr';

const Mensagens = () => {
  const [seguindo, setSeguindo] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [historicoMensagens, setHistoricoMensagens] = useState([]);
  const [conexao, setConexao] = useState(null);

  // Corrigido: extrair apenas o ID do objeto salvo no localStorage
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  const usuarioLogadoId = usuarioLocal?.id;

  useEffect(() => {
    const fetchSeguindo = async () => {
      try {
        console.log("ID do usuário:", usuarioLogadoId);
        const res = await axios.get(`https://localhost:7051/api/Amizades/seguindo/${usuarioLogadoId}`);
        const listaCompletada = await Promise.all(
          res.data.seguindo.map(async (item) => {
            const userRes = await axios.get(`https://localhost:7051/api/auth/usuario/${item.usuario2}`);
            return {
              idAmizade: item.id,
              dataSolicitacao: item.dataSolicitacao,
              usuario: {
                ...userRes.data.dados,
                id: item.usuario2
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

  useEffect(() => {
    if (!usuarioSelecionado) return;

    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7051/mensagensHub')
      .build();
    connection.start().then(() => {
      console.log('Conexão SignalR estabelecida! com o Hub mensagensHub');
    }).catch(err => {
      console.error('Erro ao conectar no SignalR:', err);
    });

    connection.on('ReceberMensagem', (novaMensagem) => {
      setHistoricoMensagens(prev => [...prev, novaMensagem]);
    });

    connection.on('MensagemApagada', (mensagemId) => {
      setHistoricoMensagens(prev => prev.filter(msg => msg.id !== mensagemId));
    });

    connection.on('MensagemLida', (mensagemId, lida) => {
      setHistoricoMensagens(prev =>
        prev.map(msg => msg.id === mensagemId ? { ...msg, lida } : msg)
      );
    });

    setConexao(connection);

    const fetchMensagens = async () => {
      try {
        const res = await axios.get(`https://localhost:7051/api/Mensagens/mensagens/${usuarioLogadoId}/${usuarioSelecionado.id}`);
        setHistoricoMensagens(res.data.mensagens || []);
      } catch (err) {
        console.error('Erro ao buscar histórico de mensagens', err);
      }
    };

    fetchMensagens();

    return () => {
      connection.stop();
      setConexao(null);
    };
  }, [usuarioSelecionado, usuarioLogadoId]);

  const enviarMensagem = async () => {
    if (mensagem.trim() !== '') {
      try {
        const res = await axios.post('https://localhost:7051/api/Mensagens/enviar', {
          IdRemetente: usuarioLogadoId,
          IdDestinatario: usuarioSelecionado.id,
          Conteudo: mensagem,
        });

        const novaMensagem = res.data.dados;
        setHistoricoMensagens(prev => [...prev, novaMensagem]);

        if (conexao) {
          await conexao.invoke('ReceberMensagem', novaMensagem);
        }

        setMensagem('');
      } catch (err) {
        console.error('Erro ao enviar mensagem', err);
      }
    }
  };

  const iniciarChat = (usuario) => {
    setUsuarioSelecionado(usuario);
    setHistoricoMensagens([]);
  };

  return (
    <div className="p-4 bg-[#1e1e1e] text-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
        Usuários que você segue
      </h2>

      <ul className="space-y-4">
        {seguindo.length === 0 && <p className="text-gray-400">Você ainda não segue ninguém.</p>}
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
            Conversando com: <span className="text-[#D4AF37]">{usuarioSelecionado.nome}</span>
          </h3>
          <p className="text-sm text-gray-300">ID do destinatário: {usuarioSelecionado.id}</p>
          <p className="text-sm text-gray-300 mb-2">Seu ID: {usuarioLogadoId}</p>

          <div className="bg-black text-white p-4 rounded-xl mt-4 h-96 overflow-auto">
            {historicoMensagens.map((msg) => (
              <div key={msg.id} className="mb-4 p-2 bg-[#2c2c2c] rounded-xl">
                <p>{msg.conteudo}</p>
                <p className="text-xs text-gray-400">{new Date(msg.data_envio).toLocaleString()}</p>
              </div>
            ))}
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
