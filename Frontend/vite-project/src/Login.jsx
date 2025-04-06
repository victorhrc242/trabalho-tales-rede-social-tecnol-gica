import React, { useState } from 'react';
import './login.css';
import { Link } from 'react-router';
function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://localhost:7051/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login bem-sucedido:', data);
        // Aqui você pode salvar o token no localStorage e redirecionar
        localStorage.setItem('token', data.token);
        // Redirecionar ou mostrar tela de sucesso
      } else {
        setErro(data.message || 'Falha no login');
      }

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErro('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className='login-container'>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
<br />
<br />
        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
<br /><br />
        <button type="submit">Entrar</button>
      </form>

      {erro && <p className="erro">{erro}</p>}
      <p>Se não tem Conta <Link to="/cadastro">Cadastrar</Link></p>
      <p>Se não sabe a senha <Link to="/Recuperar">Recuperar</Link></p> 
    </div>
  );
}

export default Login;
