import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaSearch, FaHeart, FaPaperPlane
} from 'react-icons/fa';
import '../css/NavbarTop.css';

function NavbarTop({ usuarioLogado }) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Atualiza isMobile ao redimensionar a tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Verifica se está na rota /mensagen
  const isOnMensagensPage = location.pathname === '/mensagen';

  // Se for mobile e estiver na /mensagen, não renderiza nada
  if (isMobile && isOnMensagensPage) {
    return null;
  }

  const [modal, setModal] = useState({ busca: false });
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [busca, setBusca] = useState('');

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

  return (
    <div className="navbar-top">
      <div className="logo">
        <Link to="/home">
          <img src="./public/logoParadise.jpg" alt="Logo" className="imagem-logo-top" />
        </Link>
      </div>

      <div className="icones-topo">
        <div className='nav-buscar'>
          <div className="nav-item" onClick={() => setModal(prev => ({ ...prev, busca: !modal.busca }))}>
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

        <div className='nav-notificacoes'>
          <Link to="/notificacoes" className="nav-item">
            <FaHeart /> <span>Notificações</span>
          </Link>
        </div>

        <div className='nav-mensagens'>
          <Link to="/mensagen" className="nav-item">
            <FaPaperPlane /> <span>Mensagens</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NavbarTop;
