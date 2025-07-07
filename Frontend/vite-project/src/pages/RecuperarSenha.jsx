import React, { useState, useEffect, useRef } from 'react';
import '../css/recuperarSenha.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RecuperarSenha() {
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [novaSenhaEmFoco, setNovaSenhaEmFoco] = useState(false);
  const [confirmarSenhaEmFoco, setConfirmarSenhaEmFoco] = useState(false);

  const [tempoRestante, setTempoRestante] = useState(0);
  const intervaloRef = useRef(null);
  const navigate = useNavigate();

  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (etapa === 2 && tempoRestante > 0) {
      intervaloRef.current = setInterval(() => {
        setTempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(intervaloRef.current);
            setMensagem('Código expirado. Por favor, reenvie o código.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervaloRef.current);
  }, [etapa, tempoRestante]);

  const enviarCodigo = async () => {
    setCarregando(true);
    try {
      await axios.post('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/Enviar-codigo', { email });
      setTempoRestante(300);
      setMensagem('');
      setEtapa(2);
    } catch (erro) {
      setMensagem(erro.response?.data || 'Erro ao enviar código.');
    }
    setCarregando(false);
  };

  const validarCodigo = () => {
    if (!codigo.trim()) {
      setMensagem('Digite o código recebido.');
      return;
    }
    setEtapa(3);
    setMensagem('');
    clearInterval(intervaloRef.current);
  };

  const redefinirSenha = async () => {
    setMensagem('');

    if (novaSenha.length < 8) {
      setMensagem('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(novaSenha)) {
      setMensagem('A senha deve conter pelo menos uma letra maiúscula.');
      return;
    }
    if (!/[a-z]/.test(novaSenha)) {
      setMensagem('A senha deve conter pelo menos uma letra minúscula.');
      return;
    }
    if (!/[0-9]/.test(novaSenha)) {
      setMensagem('A senha deve conter pelo menos um número.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      await axios.put('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/Recuperar-senha', {
        email,
        novaSenha,
        codigoRecuperacao: codigo
      });
      setMensagem('');
      setMensagemSucesso('Senha alterada com sucesso!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (erro) {
      setMensagem(erro.response?.data || 'Erro ao redefinir senha.');
    }
    setCarregando(false);
  };

  const handleReenviarCodigo = () => {
    enviarCodigo();
    setMensagem('');
  };

  return (
    <div className="recuperar-container">
      <div className="recuperar-box">

        {/* Toast de sucesso */}
        {mensagemSucesso && (
          <div className="box-sucesso">{mensagemSucesso}</div>
        )}

        {/* Toast de erro flutuante */}
        {mensagem && !mensagemSucesso && (
          <div className="toast-erro">
            {mensagem}
            <button onClick={() => setMensagem('')}>×</button>
          </div>
        )}

        <h2>Recuperar Senha</h2>

        {etapa === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); enviarCodigo(); }}>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaEnvelope className="input-icon-direita" />
            </div>
            <button type="submit" disabled={carregando}>
              {carregando ? "Enviando..." : "Enviar Código"}
            </button>
          </form>
        )}

        {etapa === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); validarCodigo(); }}>
            <input
              type="text"
              placeholder="Digite o código recebido"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <div className="recuperar-buttons">
              {tempoRestante > 0 ? (
                <div className="cronometro">
                  Código válido por: <strong>{formatarTempo(tempoRestante)}</strong>
                </div>
              ) : (
                <button type="button" onClick={handleReenviarCodigo} disabled={carregando}>
                  {carregando ? "Reenviando..." : "Reenviar código"}
                </button>
              )}
              <button type="submit">Enviar</button>
            </div>
          </form>
        )}

        {etapa === 3 && (
          <form onSubmit={(e) => { e.preventDefault(); redefinirSenha(); }}>
            <div className="input-wrapper">
              <input
                type={mostrarNovaSenha ? 'text' : 'password'}
                placeholder="Nova Senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                onFocus={() => setNovaSenhaEmFoco(true)}
                onBlur={() => setNovaSenhaEmFoco(false)}
                required
              />
              {!novaSenhaEmFoco && (
                mostrarNovaSenha
                  ? <FaEyeSlash className="input-icon-direita" onClick={() => setMostrarNovaSenha(false)} />
                  : <FaEye className="input-icon-direita" onClick={() => setMostrarNovaSenha(true)} />
              )}
            </div>

            <div className="input-wrapper">
              <input
                type={mostrarConfirmarSenha ? 'text' : 'password'}
                placeholder="Confirme a Nova Senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                onFocus={() => setConfirmarSenhaEmFoco(true)}
                onBlur={() => setConfirmarSenhaEmFoco(false)}
                required
              />
              {!confirmarSenhaEmFoco && (
                mostrarConfirmarSenha
                  ? <FaEyeSlash className="input-icon-direita" onClick={() => setMostrarConfirmarSenha(false)} />
                  : <FaEye className="input-icon-direita" onClick={() => setMostrarConfirmarSenha(true)} />
              )}
            </div>

            <button type="submit" disabled={carregando}>
              {carregando ? "Atualizando..." : "Atualizar Senha"}
            </button>
          </form>
        )}

        <div className="separador-ou">
          <div className="linha-esquerda"></div>
          <div className="ou">ou</div>
          <div className="linha-direita"></div>
        </div>
        <p><Link to="/">Voltar para o login</Link></p>
        <p>Não tem uma conta? <Link to="/cadastro">Cadastrar</Link></p>
      </div>
    </div>
  );
}
