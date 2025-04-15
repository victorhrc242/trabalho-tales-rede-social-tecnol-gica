import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from "react";
import Login from "./pages/Login";
import Cadastro from './pages/Cadastro';
import RecuperarSenha from './pages/RecuperarSenha';
import Home from './pages/Home';
import Perfil from './pages/perfil'
import Navbar from './Components/Navbar';
import Criar from './pages/Criar';

function App() {
  return (
    <BrowserRouter>
    <Navbar/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar" element={<RecuperarSenha />} />
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/criar" element={<Criar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
