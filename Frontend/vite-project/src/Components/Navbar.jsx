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
  const [busca, setBusca] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [modal, setModal] = useState({ busca: false, opcoes: false, confirmarLogout: false });
  const [imagem, setImagem] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [expandida, setExpandida] = useState(false);
  const navigate = useNavigate();

  const toggleNavbar = () => setExpandida(!expandida);

  const handleBusca = useCallback(async () => {
    if (!busca.trim()) return;
    try {
      const response = await fetch(`https://devisocial.up.railway.app/api/auth/buscar/${busca}`);
      const data = await response.json();
      setUsuariosEncontrados(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  }, [busca]);
  //      configuração
const irParaConfiguracoes = () => {
  fecharModalOpcoes(); // fecha o modal antes de navegar
  navigate('/configuracoes'); // rota que você deve criar
};
  const carregarDados = useCallback(async () => {
    if (!usuarioLogado?.id) return;
    try {
      const { data } = await axios.get(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${usuarioLogado.id}`
      );
      setImagem(data.imagem);
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    }
  }, [usuarioLogado?.id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const irParaPerfil = () => {
    if (usuarioLogado?.id) {
      navigate('/perfil/:id', { state: { userId: usuarioLogado.id } });
    }
  };

  const abrirModalOpcoes = () => setModal(prev => ({ ...prev, opcoes: true }));
  const fecharModalOpcoes = () => setModal(prev => ({ ...prev, opcoes: false }));
  const confirmarLogoutFunc = () => setModal({ confirmarLogout: true, opcoes: false, busca: false });
  const cancelarLogout = () => setModal(prev => ({ ...prev, confirmarLogout: false }));
  const deslogarERedirecionar = () => {
    deslogar();
    navigate('/');
  };

  return (
    <div
      className={`navbar-lateral ${expandida ? 'expandida' : 'minimizada'}`}
      onMouseEnter={() => setExpandida(true)}
      onMouseLeave={() => setExpandida(false)}
    >
      <nav className="navbar-menu">
        <div className="logo-navbar">
  <Link to="/home">
    <img src="../LogoParadise.jpg" alt="Logo" className="imagem-logo" />
  </Link>
</div>
        <Link to="/home" className="nav-item"><FaHome /> <span>Home</span></Link>

        <div className='nav-buscar'><div className="nav-item" onClick={() => setModal(prev => ({ ...prev, busca: !modal.busca }))}>
          <FaSearch /> <span>Buscar</span>
        </div>
        </div>

        {modal.busca && (
          <div className="barra-pesquisa">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar usuários"
              onKeyDown={(e) => e.key === 'Enter' && handleBusca()}
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

        <div className='nav-explore'><Link to="/explore" className="nav-item"><FaCompass /> <span>Explorar</span></Link></div>
        <div className='nav-reels'><Link to="/kurz" className="nav-item"><FaVideo /> <span>kurz</span></Link></div>
        <div className='nav-mensagens'><Link to="/mensagen" className="nav-item"><FaPaperPlane /> <span>Mensagens</span></Link></div>
        <div className='nav-notificacoes'><Link to="/notificacoes" className="nav-item"><FaHeart /> <span>Notificações</span></Link></div>

        <div className="nav-item" onClick={() => setMostrarModal(true)}>
          <FaPlusSquare /> <span>Criar Post</span>
        </div>

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

   {modal.opcoes && (
  <div className="modal">
    <div className="modal-conteudo">
      <ul>
        <li onClick={confirmarLogoutFunc}>Sair</li>
        <li onClick={irParaConfiguracoes}>Configurações</li>
        <li onClick={() => alert('Troca de conta em breve')}>Trocar de Conta</li>
      </ul>
      <button className="fechar-modal" onClick={fecharModalOpcoes}>x</button>
    </div>
  </div>
)}
      {mostrarModal && (
        <CriarPostModal usuarioLogado={usuarioLogado} onClose={() => setMostrarModal(false)} />
      )}
    </div>
  );
}

export default Navbar;
