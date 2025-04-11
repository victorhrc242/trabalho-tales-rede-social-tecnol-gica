import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from "react";
import Login from "./Login";
import Cadastro from './Cadastro';
import RecuperarSenha from './RecuperarSenha';
import Home from './Home';
import Perfil from './perfil'
import Navbar from './Components/Navbar';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
