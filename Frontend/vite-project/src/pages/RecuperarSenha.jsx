import React, { useState } from 'react'; 
import '../css/recuperarSenha.css'
import axios from 'axios';
import { Link } from 'react-router-dom'; // corrigido para react-router-dom

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resposta = await axios.put('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/Recuperar-senha', {
        email,
        novaSenha
      });

      setMensagem(resposta.data);
    } catch (erro) {
      if (erro.response) {
        setMensagem(erro.response.data);
      } else {
        setMensagem("Erro ao conectar com o servidor.");
      }
    }
  };

  return (
    <div className="recuperar-container">
      <div className="recuperar-box">
        <h2>Recuperar Senha</h2>
        <form onSubmit={handleSubmit}>
      
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

         
          <input
            type="password"
            placeholder="Digite a nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />

          <button type="submit">Atualizar Senha</button>
        </form>

        <p><Link to="/">Voltar</Link></p>

        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    </div>
  );
}
