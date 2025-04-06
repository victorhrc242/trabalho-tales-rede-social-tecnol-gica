import { BrowserRouter, Routes, Route } from 'react-router';
import React from "react";
import Login from "./Login";
import Cadastro from './Cadastro';
import RecuperarSenha from './RecuperarSenha';
function App() {


  return (
 <>
 <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/Recuperar" element={<RecuperarSenha/>} />
      </Routes>
    </BrowserRouter>
 </>

  );
}

export default App;
