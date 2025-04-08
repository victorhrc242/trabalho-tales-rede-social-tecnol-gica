// Login.jsx
import React, { useState, useEffect } from 'react';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/Home');
    }
  }, [navigate]);

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

        if (data.token) {
          localStorage.setItem('token', data.token);

          if (data.user) {
            localStorage.setItem('usuario', JSON.stringify(data.user));
          } else {
            console.warn('Usuário não retornado pela API.');
          }

          navigate('/Home');
        } else {
          setErro('Token não retornado pelo servidor.');
        }

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
        <br /><br />
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
      <p>Se não tem conta <Link to="/cadastro">Cadastrar</Link></p>
      <p>Se não sabe a senha <Link to="/recuperar">Recuperar</Link></p> 
    </div>
  );
}

export default Login;
