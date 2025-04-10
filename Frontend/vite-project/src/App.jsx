import { BrowserRouter, Routes, Route } from 'react-router';
import React from "react";
import Login from "./Login";
import Cadastro from './Cadastro';
import RecuperarSenha from './RecuperarSenha';
import Home from './Home';
import Perfil from './perfil';
function App() {


  return (
 <>
 <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/Recuperar" element={<RecuperarSenha/>} />
        <Route path="/Home" element={<Home/>}/>
        <Route path="/Perfil" element={<Perfil/>}></Route>
      </Routes>
    </BrowserRouter>
 </>

  );
}

export default App;
