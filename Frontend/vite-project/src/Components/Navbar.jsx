import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome, FaSearch, FaCompass, FaVideo,
  FaPaperPlane, FaHeart, FaPlusSquare, FaCog
} from 'react-icons/fa';
import '../css/navbar.css';

function Navbar({ usuarioLogado, deslogar }) {
  const [busca, setBusca] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [confirmarLogout, setConfirmarLogout] = useState(false);
  const navigate = useNavigate();

  const handleBusca = async () => {
    if (!busca.trim()) return;
    try {
      const response = await fetch(`https://devisocial.up.railway.app/api/auth/buscar/${busca}`);
      const data = await response.json();
      setUsuariosEncontrados(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const irParaPerfil = () => {
    if (usuarioLogado?.id) {
      navigate('/Perfil', { state: { userId: usuarioLogado.id } });
    }
  };

  const abrirModal = () => setMostrarModal(true);
  const fecharModal = () => setMostrarModal(false);

  const confirmarLogoutFunc = () => {
    setConfirmarLogout(true);
    setMostrarModal(false);
  };

  const cancelarLogout = () => setConfirmarLogout(false);

  const deslogarERedirecionar = () => {
    deslogar();
    navigate('/');
  };

  return (
    <div className="navbar-lateral">
      <nav className="navbar-menu">
        <Link to="/home" className="nav-item"><FaHome /> <span>Home</span></Link>

        <div className="nav-item" onClick={() => setMostrarBusca(!mostrarBusca)}>
          <FaSearch /> <span>Buscar</span>
        </div>

        {mostrarBusca && (
          <div className="barra-pesquisa">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar usuários"
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

        <Link to="/explore" className="nav-item"><FaCompass /> <span>Explorar</span></Link>
<<<<<<< HEAD
        <Link to="/reels" className="nav-item"><FaVideo /> <span>kurz</span></Link>
=======
        <Link to="/reels" className="nav-item"><FaVideo /> <span>Reels</span></Link>
>>>>>>> erros
        <Link to="/mensagens" className="nav-item"><FaPaperPlane /> <span>Mensagens</span></Link>
        <Link to="/notificacoes" className="nav-item"><FaHeart /> <span>Notificações</span></Link>
        <Link to="/criar" className="nav-item"><FaPlusSquare /> <span>Criar</span></Link>

        {usuarioLogado && (
          <div className="usuario-area">
            <button onClick={irParaPerfil} className="perfil-foto">
              <img
                src={usuarioLogado.foto || '/default-avatar.png'}
                alt="F"
                className="foto-perfil-redonda"
              />
            </button>
            <div className="perfil-configuracao" onClick={abrirModal}>
              <FaCog />
            </div>
          </div>
        )}
      </nav>

      {mostrarModal && (
        <div className="modal">
          <div className="modal-conteudo">
            <ul>
              <li onClick={confirmarLogoutFunc}>Sair</li>
              <li>Configurações</li>
              <li>Trocar de Conta</li>
            </ul>
            <button className="fechar-modal" onClick={fecharModal}>Fechar</button>
          </div>
        </div>
      )}

      {confirmarLogout && (
        <div className="modal">
          <div className="modal-conteudo">
            <h2>Você tem certeza que deseja deslogar?</h2>
            <button onClick={deslogarERedirecionar}>Sim</button>
            <button onClick={cancelarLogout}>Não</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
