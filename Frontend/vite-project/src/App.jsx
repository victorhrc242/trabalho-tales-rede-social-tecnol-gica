import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from "react";
// Páginas
import Login from "./pages/Login/Login.jsx";
import Cadastro from "./pages/Cadastro/Cadastro.jsx";
import Recuperarsenha from "./pages/RecuperarSenha/RecuperarSenha.jsx";
import Home from "./pages/Home/Home.jsx";
import Perfil from "./pages/Perfil/Perfil.jsx";
import Mensagens from "./pages/Mensagens/Mensagen.jsx";
import Explore from "./pages/Explore/Explore.jsx";
import Notificacao from "./pages/Notificacao/Notificacoes.jsx";
import Kurz from "./pages/Kurz/Kurz.jsx";
import DenunciasAdmin from "./adm/DenunciasAdmin.jsx";

// Components
import Navbar from "./Components/Navbar/Navbar.jsx";
import NavbarTop from "./Components/Navbar/NavbarTop.jsx";
import Criar from "./Components/Criar/Criar.jsx";
import Configuracaoes from "./Components/configuraçãoes/Configuraçãoes.jsx";
import TrocarConta from "./Components/configuraçãoes/TrocarConta.jsx";
import SplashScreen from "./Components/temas/SplashScreen.jsx";

function AppWrapper() {
  const location = useLocation();
  // Estado que controla se está carregando a tela splash
  const [loading, setLoading] = useState(true);
  // Rotas onde nenhuma navbar deve aparecer
  const esconderAmbas = ["/", "/cadastro", "/recuperar"];

  // Rotas onde só a navbar superior deve ser escondida
  const esconderSomenteNavbarTop = ["/mensagen", "/explore", "/perfil",  "/perfil/:id"];

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
    esconderSomenteNavbarTop.some(path =>
    location.pathname.startsWith(path.replace(':id', ''))
    );
 // Quando o componente montar, aguarde 2-3 segundos e desabilite o loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2.5 segundos, pode ajustar

    return () => clearTimeout(timer);
  }, []);
    // Se estiver carregando, mostra a splash
  if (loading) {
    return <SplashScreen />;
  }
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
  <Route path="/recuperar" element={<Recuperarsenha />} />
  <Route path="/home" element={<Home />} />
  <Route path="/perfil/:id" element={<Perfil deslogar={deslogar} />} />
  <Route path="/criar" element={<Criar />} />
  <Route path="/mensagen" element={<Mensagens />} />
  <Route path="/explore" element={<Explore />} />
  <Route path="/notificacoes" element={<Notificacao />} />
  <Route path="/configuracoes" element={<Configuracaoes />} />
  <Route path="/kurz" element={<Kurz />} /> 
  <Route path="/trocarConta" element={<TrocarConta />} /> 
  <Route path="/adm-painel-de-denuncias2025/2026" element={<DenunciasAdmin/>}/>
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
