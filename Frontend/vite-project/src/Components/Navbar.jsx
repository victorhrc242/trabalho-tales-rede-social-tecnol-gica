import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import {
  FaHome, FaSearch, FaCompass, FaVideo, FaPaperPlane,
  FaHeart, FaPlusSquare, FaCog
} from 'react-icons/fa'; 
import axios from 'axios';
import CriarPostModal from '../Components/Criar.jsx';
import '../css/navbar.css'; 


function Navbar({ usuarioLogado, deslogar }) {
  // Estados de controle
  const [busca, setBusca] = useState(''); // Campo de texto da busca
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]); // Lista de resultados da busca
  const [modal, setModal] = useState({ busca: false, opcoes: false, confirmarLogout: false }); // Controle de modais
  const [imagem, setImagem] = useState(''); // Imagem de perfil
  const [mostrarModal, setMostrarModal] = useState(false); // Controle do modal de criação de post
  const [expandida, setExpandida] = useState(false); // Estado da navbar expandida/minimizada
  const navigate = useNavigate(); // Hook para navegação programática

  // Alternar estado da navbar lateral
  const toggleNavbar = () => setExpandida(!expandida);

  //  Função para buscar usuários com base na palavra digitada
  const handleBusca = useCallback(async () => {
    if (!busca.trim()) return;
    try {
      const response = await fetch(`https://devisocial.up.railway.app/api/auth/buscar/${busca}`);
      const data = await response.json();
      setUsuariosEncontrados(data); // Atualiza a lista com os usuários encontrados
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  }, [busca]);

  // 📸 Função para carregar imagem do perfil do usuário logado
  const carregarDados = useCallback(async () => {
    if (!usuarioLogado?.id) return;
    try {
      const { data } = await axios.get(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${usuarioLogado.id}`
      );
      setImagem(data.imagem); // Define a imagem de perfil
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    }
  }, [usuarioLogado?.id]);

  // 🔁 Executa a função carregarDados quando o componente monta ou o ID do usuário mudar
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // 🔗 Navega para a página de perfil do usuário
  const irParaPerfil = () => {
    if (usuarioLogado?.id) {
      navigate('/perfil', { state: { userId: usuarioLogado.id } });
    }
  };

  //  Abre o modal de opções
  const abrirModalOpcoes = () => setModal(prev => ({ ...prev, opcoes: true }));

  //  Fecha o modal de opções
  const fecharModalOpcoes = () => setModal(prev => ({ ...prev, opcoes: false }));

  //  Confirma intenção de logout
  const confirmarLogoutFunc = () =>
    setModal({ confirmarLogout: true, opcoes: false, busca: false });

  //  Cancela o logout
  const cancelarLogout = () => setModal(prev => ({ ...prev, confirmarLogout: false }));

  //  Executa o logout e redireciona para login
  const deslogarERedirecionar = () => {
    deslogar();         
    navigate('/');     
  };

  return (
    <div
      className={`navbar-lateral ${expandida ? 'expandida' : 'minimizada'}`}
      onMouseEnter={() => setExpandida(true)}  // Expande ao passar o mouse
      onMouseLeave={() => setExpandida(false)} // Minimiza ao sair o mouse
    >
      <nav className="navbar-menu">
        <div className="logo-navbar">
          <Link to="/home">
            <img src="./public/logoParadise.jpg" alt="Logo" className="imagem-logo" />
          </Link>
        </div>

        <Link to="/home" className="nav-item"><FaHome /> <span>Home</span></Link>

        {/*  Menu de busca */}
        <div className='nav-buscar'>
          <div className="nav-item" onClick={() => setModal(prev => ({ ...prev, busca: !modal.busca }))}>
            <FaSearch /> <span>Buscar</span>
          </div>
        </div>

        {/* Campo de busca expandido (modal) */}
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

        {/* Resultados da busca */}
        {usuariosEncontrados.length > 0 && (
          <div className="resultados-pesquisa">
            {usuariosEncontrados.map((usuario) => (
              <div key={usuario.id} className="resultado-usuario">
                <span>{usuario.nome}</span>
              </div>
            ))}
          </div>
        )}

        {/* Outras rotas da navbar */}
        <div className='nav-explore'>
          <Link to="/explore" className="nav-item"><FaCompass /> <span>Explorar</span></Link>
        </div>
        <div className='nav-reels'>
          <Link to="/reels" className="nav-item"><FaVideo /> <span>kurz</span></Link>
        </div>
        <div className='nav-mensagens'>
          <Link to="/mensagen" className="nav-item"><FaPaperPlane /> <span>Mensagens</span></Link>
        </div>
        <div className='nav-notificacoes'>
          <Link to="/notificacoes" className="nav-item"><FaHeart /> <span>Notificações</span></Link>
        </div>

        {/* Abrir modal de criação de post */}
        <div className="nav-item" onClick={() => setMostrarModal(true)}>
          <FaPlusSquare /> <span>Criar Post</span>
        </div>

        {/* Foto de perfil (se estiver logado) */}
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

        {/* Botão de configurações */}
        <div className="perfil-configuracao" onClick={abrirModalOpcoes}>
          <FaCog />
        </div>
      </nav>

      {/* Modal de opções de perfil */}
      {modal.opcoes && (
        <div className="modal">
          <div className="modal-conteudo">
            <ul>
              <li onClick={confirmarLogoutFunc}>Sair</li>
              <li onClick={() => alert('Configurações em breve')}>Configurações</li>
              <li onClick={() => alert('Troca de conta em breve')}>Trocar de Conta</li>
            </ul>
            <button className="fechar-modal" onClick={fecharModalOpcoes}>x</button>
          </div>
        </div>
      )}

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

      {/* Modal para criar novo post */}
      {mostrarModal && (
        <CriarPostModal usuarioLogado={usuarioLogado} onClose={() => setMostrarModal(false)} />
      )}
    </div>
  );
}

export default Navbar;
