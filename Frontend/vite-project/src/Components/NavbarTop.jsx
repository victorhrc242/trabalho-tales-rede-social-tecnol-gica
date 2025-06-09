import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaHeart } from 'react-icons/fa';

function NavbarTop() {
  const [buscaAtiva, setBuscaAtiva] = useState(false);
  const [busca, setBusca] = useState('');

  return (
    <div className="navbar-top">
      <div className="logo">
        <Link to="/home">
          <img src="./public/logoParadise.jpg" alt="Logo" className="imagem-logo-top" />
        </Link>
      </div>

      <div className="icones-topo">
        <div className="nav-buscar" onClick={() => setBuscaAtiva(!buscaAtiva)}>
          <FaSearch />
        </div>

        <Link to="/notificacoes" className="nav-notificacoes">
          <FaHeart />
        </Link>
      </div>

      {buscaAtiva && (
        <div className="barra-pesquisa-topo">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar usuários"
          />
          {/* Você pode adicionar botão de buscar se quiser */}
        </div>
      )}
    </div>
  );
}

export default NavbarTop;