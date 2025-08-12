import React, { useState, useEffect } from 'react';
import '../css/login.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false); // estado para loading

  const navigate = useNavigate();
  const location = useLocation();
  const [veioDeAdicionarConta, setVeioDeAdicionarConta] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setVeioDeAdicionarConta(params.get('adicionarConta') === 'true');
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true); // ativa o loading

    try {
      const response = await fetch(
        'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log('Login bem-sucedido:', data);

        if (data.token) {
          localStorage.setItem('token', data.token);

          if (data.user) {
            localStorage.setItem('usuario', JSON.stringify(data.user));

            let usuariosRecentes =
              JSON.parse(localStorage.getItem('usuariosRecentes')) || [];
            usuariosRecentes = usuariosRecentes.filter(
              (u) => u.id !== data.user.id
            );
            usuariosRecentes.unshift(data.user);
            localStorage.setItem(
              'usuariosRecentes',
              JSON.stringify(usuariosRecentes)
            );
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
    } finally {
      setCarregando(false); // desativa o loading
    }
  };

  return (
    <div className="container-login">
      {erro && (
        <div className="error-toast-login">
          <span>{erro}</span>
          <button onClick={() => setErro('')}>×</button>
        </div>
      )}

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
                required
              />
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
            <button
              className="botao-entrar"
              type="submit"
              disabled={carregando} // desativa botão enquanto carrega
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <br />
          <div className="linha-ou-container">
            <div className="linha-esquerda"></div>
            <div className="ou">ou</div>
            <div className="linha-direita"></div>
          </div>

          <br />
          <p className="esq">
            <Link to="/recuperar">Esqueceu a senha?</Link>
          </p>
          <p>
            Não tem uma conta? <Link to="/cadastro">Cadastrar</Link>
          </p>
        </div>

        <div className="imagem-login"></div>
      </div>
    </div>
  );
}

export default Login;
