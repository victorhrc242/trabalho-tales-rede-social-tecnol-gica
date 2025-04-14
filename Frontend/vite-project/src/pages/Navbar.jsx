import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, User, Search, Compass, Video, MessageCircle
} from 'lucide-react';
import '../css/navbar.css';

function Navbar() {
  const [buscaAtiva, setBuscaAtiva] = useState(false);
  const [busca, setBusca] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const navigate = useNavigate();

  const usuarioString = localStorage.getItem('usuario');
  const usuario = usuarioString ? JSON.parse(usuarioString) : { nome: '', id: '' };

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
    navigate('/perfil', { state: { userId: usuario.id } });
  };

  return (
    <div className="navbar-lateral">
      <div className="logo">DeviSocial</div>

      <div className="menu-item" onClick={() => navigate('/Home')}>
        <Home className="icon" /> <span>Feed</span>
      </div>

      <div className="menu-item" onClick={() => setBuscaAtiva(!buscaAtiva)}>
        <Search className="icon" /> <span>Pesquisa</span>
      </div>

      {buscaAtiva && (
        <div className="barra-pesquisa">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar usuários"
          />
          <button onClick={handleBusca}>Buscar</button>

          {usuariosEncontrados.length > 0 && (
            <div className="resultados-pesquisa">
              {usuariosEncontrados.map((usuario) => (
                <div
                  key={usuario.id}
                  className="resultado-usuario"
                  onClick={() => navigate('/Perfil', { state: { userId: usuario.id } })}
                >
                  {usuario.nome}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="menu-item" onClick={() => navigate('/Explorar')}>
        <Compass className="icon" /> <span>Explorar</span>
      </div>

      <div className="menu-item" onClick={() => navigate('/Reels')}>
        <Video className="icon" /> <span>Reels</span>
      </div>

      <div className="menu-item" onClick={() => navigate('/Mensagens')}>
        <MessageCircle className="icon" /> <span>Mensagens</span>
      </div>

      <div className="menu-item perfil-link" onClick={irParaPerfil}>
  <User className="icon" /> <span>Perfil</span>
</div>

    </div>
  );
}

export default Navbar;
