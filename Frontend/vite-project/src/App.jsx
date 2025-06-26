import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Cadastro from './pages/Cadastro';
import RecuperarSenha from './pages/RecuperarSenha';
import Home from './pages/Home';
import Perfil from './pages/perfil';
import Navbar from './Components/Navbar';
import NavbarTop from './Components/NavbarTop';
import Criar from './Components/Criar';
import Msg from './pages/Mensagens/mensagen';
import Explore from './pages/Explore/Explore';
import Notificacoes from './pages/Notificacao/Notificacoes ';
import Configuracoes from './Components/configuraçãoes/Configuraçãoes';
import Kurz from './pages/kurz/Kurz';

function AppWrapper() {
  const location = useLocation();

  // Rotas onde nenhuma navbar deve aparecer
  const esconderAmbas = ["/", "/cadastro", "/recuperar"];

  // Rotas onde só a navbar superior deve ser escondida
  const esconderSomenteNavbarTop = ["/mensagen"];

  // Verifica se a tela está em modo mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Verifica se o usuário está logado
  const [usuario, setUsuario] = useState(null);
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      try {
        setUsuario(JSON.parse(usuarioSalvo));
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    }
  }, []);

  // Função para deslogar o usuário
  const deslogar = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUsuario(null);
  };

  // Esconde a navbar lateral/inferior em:
  //    - rotas públicas como login, cadastro, recuperar
  //    - no mobile, quando estiver na rota /mensagen
  const deveEsconderNavbar =
    esconderAmbas.includes(location.pathname) ||
    (isMobile && location.pathname === "/mensagen");

  //  Esconde a navbar superior em:
  //    - rotas públicas
  //    - rota de mensagens (mobile ou desktop)
  const deveEsconderNavbarTop =
    esconderAmbas.includes(location.pathname) ||
    esconderSomenteNavbarTop.includes(location.pathname);

  return (
    <>
       {usuario && (
        <>
          {!deveEsconderNavbar && (
            <Navbar usuarioLogado={usuario} deslogar={deslogar} />
          )}
          {!deveEsconderNavbarTop && <NavbarTop />}
        </>
      )} 

      <Routes>
  <Route path="/" element={<Login />} />
  <Route path="/cadastro" element={<Cadastro />} />
  <Route path="/recuperar" element={<RecuperarSenha />} />
  <Route path="/home" element={<Home />} />
  <Route path="/perfil/:id" element={<Perfil />} />
  <Route path="/criar" element={<Criar />} />
  <Route path="/mensagen" element={<Msg />} />
  <Route path="/explore" element={<Explore />} />
  <Route path="/notificacoes" element={<Notificacoes />} />
  <Route path="/configuracoes" element={<Configuracoes />} />
  <Route path="/kurz" element={<Kurz />} /> 
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
