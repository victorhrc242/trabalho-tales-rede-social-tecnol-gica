import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHome, FaSearch, FaCompass, FaVideo, FaPaperPlane,
  FaHeart, FaPlusSquare, FaCog
} from 'react-icons/fa';
import '../css/NavbarTop.css';


function NavbarTop({ usuarioLogado }) {
  const [modal, setModal] = useState({ busca: false, opcoes: false, confirmarLogout: false });
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

  return (
    <div className="navbar-top">
      <div className="logo">
        <Link to="/home">
          <img src="./public/logoParadise.jpg" alt="Logo" className="imagem-logo-top" />
        </Link>
      </div>

      <div className="icones-topo">
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

      <div className='nav-notificacoes'><Link to="/notificacoes" className="nav-item"><FaHeart /> <span>Notificações</span></Link></div>
      <div className='nav-mensagens'><Link to="/mensagen" className="nav-item"><FaPaperPlane /> <span>Mensagens</span></Link></div>
      </div>
    </div>
  );
}

export default NavbarTop;