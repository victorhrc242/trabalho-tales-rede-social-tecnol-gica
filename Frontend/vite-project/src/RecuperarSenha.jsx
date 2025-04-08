import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resposta = await axios.put('https://localhost:7051/api/auth/Recuperar-senha', {
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
    <div>
      <h2>Recuperar Senha</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nova Senha:</label><br />
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
        </div>
        <button type="submit">Atualizar Senha</button>
      </form>
      <p><Link to="/">voltar</Link></p>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}
