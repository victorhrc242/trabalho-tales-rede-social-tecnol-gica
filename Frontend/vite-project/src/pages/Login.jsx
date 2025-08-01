import React, { useState, useEffect } from 'react';
import '../css/login.css';
import { Link, useNavigate } from 'react-router-dom';
// Importação dos ícones
import { FaEnvelope, FaEye, FaEyeSlash  } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'; // Ícone de seta para voltar


function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();

const location = useLocation();
const [veioDeAdicionarConta, setVeioDeAdicionarConta] = useState(false);

useEffect(() => {
  const params = new URLSearchParams(location.search);
  setVeioDeAdicionarConta(params.get('adicionarConta') === 'true');
}, [location.search]);


  // Função de login
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

      //  Adiciona à lista de contas salvas
      let usuariosRecentes = JSON.parse(localStorage.getItem('usuariosRecentes')) || [];
      usuariosRecentes = usuariosRecentes.filter((u) => u.id !== data.user.id);
      usuariosRecentes.unshift(data.user);
      localStorage.setItem('usuariosRecentes', JSON.stringify(usuariosRecentes));
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

   {/* Seta para voltar visível somente se veio de "Adicionar Conta" */}
      {veioDeAdicionarConta && (
        <button
          onClick={() => navigate(-1)}
          className="botao-voltar-login"
          aria-label="Voltar"
        >
          <FiArrowLeft size={24} />
        </button>
      )}


      <div className="modal-login">
        <div className="formulario">
          <h2 className="titulo-login">Paradise</h2>

          {/* Formulário de login */}
          <form onSubmit={handleLogin}>
            {/* Campo de e-mail com ícone */}
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

            {/* Campo de senha com ícone de olho que alterna a visibilidade */}
            <div className="input-wrapper">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              {/* Ícone de olho que aparece somente fora do foco */}
              {mostrarSenha ? (
                <FaEyeSlash
                  className="input-icon-direita senha"
                  onClick={() => setMostrarSenha(false)}
                />
              ) : (
                <FaEye
                  className="input-icon-direita senha"
                  onClick={() => setMostrarSenha(true)}
                />
              )}
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

        {/* Lado direito com imagem decorativa */}
        <div className="imagem-login"></div>
      </div>
    </div>
  );
}

export default Login;
