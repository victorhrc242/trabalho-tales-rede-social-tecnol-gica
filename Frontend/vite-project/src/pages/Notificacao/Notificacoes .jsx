import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
export const Notificacoes  = () => {
     const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
   useEffect(() => {
    if (!userId) return navigate('/');
  console.log(userId)});
    if (!usuario) return <div className="erro">Usuário não encontrado.</div>;
  return (
    <div>Notificacoes </div>
  )
}
export  default Notificacoes;