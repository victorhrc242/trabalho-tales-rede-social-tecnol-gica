// Components/Navbar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Ícones usados no Navbar
import {
  FaHome, FaSearch, FaCompass, FaVideo, FaPaperPlane,
  FaHeart, FaPlusSquare, FaCog
} from 'react-icons/fa';

import axios from 'axios';

// Modais importados
import CriarPostModal from '../Criar/Criar.jsx';
import TrocarConta from '../configuraçãoes/TrocarConta.jsx'; 

import '../../css/navbar.css';

// Biblioteca para conexão em tempo real (SignalR)
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';

function Navbar({ usuarioLogado, deslogar }) {
  // Estado para controle da barra de busca
  const [busca, setBusca] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);

  // Estado para controle dos modais: busca, opções, confirmar logout
  const [modal, setModal] = useState({ busca: false, opcoes: false, confirmarLogout: false });

  // Estado para imagem do perfil do usuário logado
  const [imagem, setImagem] = useState('');

  // Estado para abrir modal de criar post e trocar conta
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarTrocarConta, setMostrarTrocarConta] = useState(false);

  // Estado para expandir/minimizar a navbar
  const [expandida, setExpandida] = useState(false);

  // Estado para mensagens não lidas (objeto com ids de remetentes e contagem)
  const [naoLidas, setNaoLidas] = useState({});

  // Navegação programática do react-router-dom
  const navigate = useNavigate();

  // Função para expandir/minimizar navbar ao passar o mouse
  const toggleNavbar = () => setExpandida(!expandida);

  // Função para buscar usuários pelo texto digitado (API)
  const handleBusca = useCallback(async () => {
    if (!busca.trim()) return; // evita buscas com texto vazio

    try {
      const response = await fetch(`https://devisocial.up.railway.app/api/auth/buscar/${busca}`);
      const data = await response.json();
      setUsuariosEncontrados(data); // atualiza lista com resultados
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  }, [busca]);

  // Função para ir para a página de configurações e fechar modal de opções
  const irParaConfiguracoes = () => {
    fecharModalOpcoes();
    navigate('/configuracoes');
  };

  // Função para carregar dados do perfil (imagem) do usuário logado via API
  const carregarDados = useCallback(async () => {
    if (!usuarioLogado?.id) return;

    try {
      const { data } = await axios.get(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${usuarioLogado.id}`
      );
      setImagem(data.imagem); // atualiza imagem do perfil
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    }
  }, [usuarioLogado?.id]);

  // Chama carregarDados quando o usuário logado mudar
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Configura conexão SignalR para mensagens em tempo real e contagem de mensagens não lidas
  useEffect(() => {
    if (!usuarioLogado?.id) return;

    const usuarioLogadoId = usuarioLogado.id;

    // Cria conexão SignalR com url contendo userId
    const connection = new HubConnectionBuilder()
      .withUrl(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/mensagensHub?userId=${usuarioLogadoId}`, {
        transport: HttpTransportType.WebSockets,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    // Função para buscar as mensagens não lidas da API
    const fetchNaoLidas = async () => {
      try {
        const res = await axios.get(`https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/Mensagens/nao-lidas/${usuarioLogadoId}`);
        if (res.data.sucesso) {
          setNaoLidas(res.data.naoLidas); // atualiza estado com as mensagens não lidas
        }
      } catch (e) {
        console.error('Erro ao buscar mensagens não lidas:', e);
      }
    };

    // Inicia a conexão
    connection.start()
      .then(() => {
        console.log('✅ Conectado ao SignalR');

        // Escuta evento de nova mensagem
        connection.on('NovaMensagem', (novaMensagem) => {
          const remetente = novaMensagem.id_remetente;
          const destinatario = novaMensagem.id_destinatario;

          // Só atualiza se destinatário for o usuário logado
          if (destinatario === usuarioLogadoId) {
            setNaoLidas((prev) => {
              const count = prev[remetente] || 0;
              return { ...prev, [remetente]: count + 1 }; // incrementa contador
            });
          }
        });

        // Atualiza contagem ao receber eventos de mensagem lida ou apagada
        connection.on('MensagemLida', fetchNaoLidas);
        connection.on('MensagemApagada', fetchNaoLidas);

        // Busca inicial das mensagens não lidas
        fetchNaoLidas();
      })
      .catch((err) => {
        console.error('❌ Erro ao conectar no SignalR:', err);
      });

    // Para a conexão quando o componente desmontar
    return () => {
      connection.stop();
    };
  }, [usuarioLogado?.id]);

  // Função para navegar para o perfil do usuário logado
  const irParaPerfil = () => {
    if (usuarioLogado?.id) {
      navigate('/perfil/:id', { state: { userId: usuarioLogado.id } });
    }
  };

  // Funções para abrir e fechar modais
  const abrirModalOpcoes = () => setModal(prev => ({ ...prev, opcoes: true }));
  const fecharModalOpcoes = () => setModal(prev => ({ ...prev, opcoes: false }));

  // Função para abrir modal de confirmação de logout e fechar opções
  const confirmarLogoutFunc = () => setModal({ confirmarLogout: true, opcoes: false, busca: false });

  // Função para cancelar logout
  const cancelarLogout = () => setModal(prev => ({ ...prev, confirmarLogout: false }));

  // Função para deslogar e redirecionar para a página inicial
  const deslogarERedirecionar = () => {
    deslogar(); // função passada via props que faz o logout
    navigate('/');
  };

  return (
    <div
      className={`navbar-lateral ${expandida ? 'expandida' : 'minimizada'}`}
      onMouseEnter={() => setExpandida(true)}  // Expande navbar ao passar mouse
      onMouseLeave={() => setExpandida(false)} // Minimiza navbar ao tirar mouse
    >
      <nav className="navbar-menu">
        {/* Logo com link para Home */}
        <div className="logo-navbar">
          <Link to="/home">
            <img src="https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/imagens-usuarios/perfil/LogoParadise.jpg" alt="Logo" className="imagem-logo" />
          </Link>
        </div>

        <Link to="/home" className="nav-item"><FaHome /> <span>Home</span></Link>

        {/* Botão para abrir/fechar barra de busca */}
        <div className="nav-buscar">
          <div className="nav-item" onClick={() => setModal(prev => ({ ...prev, busca: !modal.busca }))}>
            <FaSearch /> <span>Buscar</span>
          </div>
        </div>

        {/* Barra de pesquisa exibida quando modal.busca == true */}
        {modal.busca && (
          <div className="barra-pesquisa">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar usuários"
              onKeyDown={(e) => e.key === 'Enter' && handleBusca()} // Busca ao pressionar Enter
            />
            <button onClick={handleBusca}>Buscar</button>
          </div>
        )}

        {usuariosEncontrados.length > 0 && (
          <div className="resultados-pesquisa">
            {usuariosEncontrados.map((usuario) => (
              <div key={usuario.id} className="resultado-usuario">
                <span>{usuario.nome}</span>
              </div>
            ))}
          </div>
        )}


        <div className="nav-explore"><Link to="/explore" className="nav-item"><FaCompass /> <span>Explorar</span></Link></div>

 
        <div className="nav-reels"><Link to="/kurz" className="nav-item"><FaVideo /> <span>kurz</span></Link></div>

        {/* Mensagens  */}
        <div className="nav-mensagens">
          <Link to="/mensagen" className="nav-item">
            <div className="mensagem-icone-wrapper">
              <FaPaperPlane />
              {Object.values(naoLidas).reduce((a, b) => a + b, 0) > 0 && (
                <span className="badge-mensagens">
                  {Object.values(naoLidas).reduce((a, b) => a + b, 0)}
                </span>
              )}
            </div>
            <span>Mensagens</span>
          </Link>
        </div>

        {/* Link para Notificações */}
        <div className="nav-notificacoes"><Link to="/notificacoes" className="nav-item"><FaHeart /> <span>Notificações</span></Link></div>

        {/* Botão para abrir modal de Criar Post */}
        <div className="nav-item" onClick={() => setMostrarModal(true)}>
          <FaPlusSquare /> <span>Criar Post</span>
        </div>

        {/* Exibe foto do perfil do usuário logado que ao clicar vai para perfil */}
        {usuarioLogado && (
          <div className="nav-item">
            <a onClick={irParaPerfil} className="perfil-foto" aria-label="Ir para o perfil">
              <img
                src={imagem || 'https://via.placeholder.com/100x100.png?text=Foto'}
                alt="Perfil"
                className="foto-perfil-redonda"
              />
            </a>
          </div>
        )}

        <div className="perfil-configuracao" onClick={abrirModalOpcoes}>
          <FaCog />
        </div>
      </nav>

      {/* Modal de confirmação de logout */}
      {modal.confirmarLogout && (
        <div className="modal">
          <div className="modal-conteudo">
            <p>Tem certeza que deseja sair?</p>
            <div className="botoes-modal">
              <button className="btn-cancelar" onClick={deslogarERedirecionar}>Sim</button>
              <button className="btn-confirmar" onClick={cancelarLogout}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de opções: sair, configurações, trocar conta */}
      {modal.opcoes && (
        <div className="modal">
          <div className="modal-conteudo">
            <ul>
              <li onClick={confirmarLogoutFunc}>Sair</li>
              <li onClick={irParaConfiguracoes}>Configurações</li>
              <li onClick={() => {
                fecharModalOpcoes();
                setMostrarTrocarConta(true);
              }}>
                Trocar de Conta
              </li>
            </ul>
            <button className="fechar-modal" onClick={fecharModalOpcoes}>x</button>
          </div>
        </div>
      )}

      {/* Modal de Criar Post */}
      {mostrarModal && (
        <CriarPostModal usuarioLogado={usuarioLogado} onClose={() => setMostrarModal(false)} />
      )}

      {/* Modal de Trocar Conta */}
      {mostrarTrocarConta && (
        <TrocarConta fechar={() => setMostrarTrocarConta(false)} />
      )}
    </div>
  );
}

export default Navbar;
