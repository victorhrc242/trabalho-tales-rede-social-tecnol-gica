import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import Cadastro from './pages/Cadastro';
import RecuperarSenha from './pages/RecuperarSenha';
import Home from './pages/Home';
import Perfil from './pages/perfil';
import Navbar from './Components/Navbar';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Verifica se há usuário logado ao iniciar a aplicação
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');

    if (usuarioSalvo && token) {
      setUsuarioLogado(JSON.parse(usuarioSalvo));
    }
  }, []);

  // Função de login
  const logar = (usuario, token) => {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('token', token);
    setUsuarioLogado(usuario);  // Atualiza o estado para que a Navbar apareça
  };

  // Função de logout
  const deslogar = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuarioLogado(null);  // Atualiza o estado para que a Navbar desapareça
  };

  return (
    <div className="layout">
      <BrowserRouter>
        {usuarioLogado && <Navbar usuarioLogado={usuarioLogado} deslogar={deslogar} />}
        <div className="conteudo-principal">
          <Routes>
            <Route path="/" element={<Login logar={logar} />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/recuperar" element={<RecuperarSenha />} />
            <Route path="/home" element={<Home />} />
            <Route path="/perfil" element={<Perfil />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
