import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuarios, setUsuarios] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuarios');
        const data = await response.json();
        if (Array.isArray(data)) {
          setUsuarios(data);
        }
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
      }
    };

    fetchUsuarios();
  }, []);

  const handleBusca = (e) => {
    const termo = e.target.value.toLowerCase();
    setTermoBusca(termo);
    const filtrados = usuarios.filter(usuario =>
      usuario.nome.toLowerCase().includes(termo)
    );
    setResultados(filtrados);
  };

  const irParaPerfilUsuario = (userId) => {
    navigate('/perfil', { state: { userId } });
    setTermoBusca('');
    setResultados([]);
  };

  // Ocultar navbar nas rotas de login/cadastro/recuperação
  if (['/', '/cadastro', '/recuperar'].includes(location.pathname)) return null;

  return (
    <div className="navbar-lateral">
      <h2 className="logo">MyApp</h2>
      <nav>
        <Link to="/home">🏠 Home</Link>
        <Link to="/perfil">👤 Perfil</Link>
      </nav>

      <input
        type="text"
        placeholder="Buscar usuário..."
        value={termoBusca}
        onChange={handleBusca}
        className="barra-pesquisa"
      />
      {termoBusca && (
        <ul className="resultados-pesquisa">
          {resultados.length > 0 ? (
            resultados.map((usuario) => (
              <li key={usuario.id} onClick={() => irParaPerfilUsuario(usuario.id)}>
                {usuario.nome}
              </li>
            ))
          ) : (
            <li>Nenhum usuário encontrado</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default Navbar;
