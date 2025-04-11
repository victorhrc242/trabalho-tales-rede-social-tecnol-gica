import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/navbar.css';

function Navbar() {
  const [busca, setBusca] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

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

  const abrirModalPerfil = async (usuario) => {
    try {
      const response = await fetch(`https://devisocial.up.railway.app/api/auth/usuario/${usuario.id}`);
      const data = await response.json();
      setUsuarioSelecionado(data);
      setMostrarModal(true);
    } catch (err) {
      console.error('Erro ao buscar dados do perfil:', err);
    }
  };

  return (
    <div className="navbar-lateral">
      <Link to="/Home">Home</Link>
      <Link to="/Perfil">Perfil</Link>

      <div className="barra-pesquisa">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar usuários"
        />
        <button onClick={handleBusca}>Buscar</button>
      </div>

      {usuariosEncontrados.length > 0 && (
        <div className="resultados-pesquisa">
          {usuariosEncontrados.map((usuario) => (
            <div
              key={usuario.id}
              className="resultado-usuario"
              onClick={() => abrirModalPerfil(usuario)}
            >
              <span>{usuario.nome}</span>
            </div>
          ))}
        </div>
      )}

      {mostrarModal && usuarioSelecionado && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Perfil de {usuarioSelecionado.nome}</h2>
            <p><strong>Email:</strong> {usuarioSelecionado.email}</p>
            <p><strong>ID:</strong> {usuarioSelecionado.id}</p>
            {/* Adicione mais campos se desejar */}
            <button onClick={() => setMostrarModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
