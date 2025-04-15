import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React from "react";
import Login from "./pages/Login";
import Cadastro from './pages/Cadastro';
import RecuperarSenha from './pages/RecuperarSenha';
import Home from './pages/Home';
import Perfil from './pages/perfil';
import Navbar from './Components/Navbar';
import Criar from './pages/Criar';

function AppWrapper() {
  const location = useLocation();

  // Lista de rotas onde a Navbar não deve aparecer
  const esconderNavbar = ["/", "/cadastro", "/recuperar"];
  const deveEsconderNavbar = esconderNavbar.includes(location.pathname);

  return (
    <>
      {!deveEsconderNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar" element={<RecuperarSenha />} />
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/criar" element={<Criar />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
