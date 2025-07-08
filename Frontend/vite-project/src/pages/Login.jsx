import React, { useState, useEffect } from 'react';
import '../css/login.css';
import { Link, useNavigate } from 'react-router-dom';
// icons
import { FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senhaEmFoco, setSenhaEmFoco] = useState(false);
  const navigate = useNavigate();

  // Redireciona se já estiver logado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/Home');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
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
      console.error('Erro ao fazer login');
      setErro('Usuário ou senha incorreta');
    }
  };

  return (
    <div className="container-login">
      {/* Modal flutuante de erro */}
      {erro && (
        <div className="error-toast-login">
          <span>{erro}</span>
          <button onClick={() => setErro('')}>×</button>
        </div>
      )}

      <div className="modal-login">
        <div className="formulario">
          <h2 className="titulo-login">Paradise</h2>
          {/* formulario de login */}
          <form onSubmit={handleLogin}>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaEnvelope className="input-icon-direita" />
            </div>

            <div className="input-wrapper">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onFocus={() => setSenhaEmFoco(true)}
                onBlur={() => setSenhaEmFoco(false)}
                required
              />
              {!senhaEmFoco &&
                (mostrarSenha ? (
                  <FaEyeSlash
                    className="input-icon-direita"
                    onClick={() => setMostrarSenha(false)}
                  />
                ) : (
                  <FaEye
                    className="input-icon-direita"
                    onClick={() => setMostrarSenha(true)}
                  />
                ))}
            </div>

            <br />
            <button className="botao-entrar" type="submit">Entrar</button>
          </form>

          <br />
          <div className="linha-ou-container">
            <div className="linha-esquerda"></div>
            <div className="ou">ou</div>
            <div className="linha-direita"></div>
          </div>

          <br />
          <p className="esq"><Link to="/recuperar">Esqueceu a senha?</Link></p>
          <p>Não tem uma conta? <Link to="/cadastro">Cadastrar</Link></p>
        </div>

        <div className="imagem-login"></div>
      </div>
    </div>
  );
}

export default Login;
