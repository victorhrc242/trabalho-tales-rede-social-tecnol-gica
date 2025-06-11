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

function AppWrapper() {
  const location = useLocation();

  const esconderAmbas = ["/", "/cadastro", "/recuperar"];
  const deveEsconderNavbar = esconderAmbas.includes(location.pathname)|| esconderAmbas.includes(location.pathname);

  const esconderSomenteNavbarTop = ["/mensagen"];
  const deveEsconderNavbarTop = esconderAmbas.includes(location.pathname) || esconderSomenteNavbarTop.includes(location.pathname);


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

  const deslogar = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUsuario(null);
  };


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
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/criar" element={<Criar />} />
        <Route path="/mensagen" element={<Msg/>} />
        <Route path="/explore" element={<Explore/>}/>
     
        <Route path="/notificacoes" element={<Notificacoes/>}/>
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
