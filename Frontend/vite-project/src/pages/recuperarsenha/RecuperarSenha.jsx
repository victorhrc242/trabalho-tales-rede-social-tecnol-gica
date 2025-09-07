import React, { useState, useEffect, useRef } from 'react';
import '../../css/recuperarSenha.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RecuperarSenha() {
  // Etapas do processo: 1 - Email, 2 - Código, 3 - Nova Senha
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Controle visual dos campos de senha
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  // Cronômetro do código
  const [tempoRestante, setTempoRestante] = useState(0);
  const intervaloRef = useRef(null);
  const navigate = useNavigate();

  // Formata o tempo no formato mm:ss
  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  };

  // Inicia o cronômetro quando o código é enviado
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

  // Envia o código para o email
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

  // Valida o código enviado por email
  const validarCodigo = () => {
    if (!codigo.trim()) {
      setMensagem('Digite o código recebido.');
      return;
    }
    setEtapa(3);
    setMensagem('');
    clearInterval(intervaloRef.current);
  };

  // Redefine a senha com nova validação de segurança
  const redefinirSenha = async () => {
    setMensagem('');

    // Validação personalizada:
    const senhaValida = novaSenha.length >= 6 &&
      /[A-Z]/.test(novaSenha) &&            // Pelo menos uma letra maiúscula
      /[0-9]/.test(novaSenha) &&            // Pelo menos um número
      /[^A-Za-z0-9\s]/.test(novaSenha) &&   // Pelo menos um caractere especial (exceto espaço)
      !/\s/.test(novaSenha);                // Sem espaços

    if (!senhaValida) {
      setMensagem('A senha deve ter no mínimo 6 caracteres, incluindo uma letra maiúscula, um número e um caractere especial (sem espaços).');
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
    <div className="rec-senha-container">

      <div className="rec-senha-box">
        {/* Mensagem de sucesso flutuante */}
        {mensagemSucesso && <div className="rec-senha-sucesso">{mensagemSucesso}</div>}

        {/* Toast de erro flutuante no canto superior direito */}
        {mensagem && !mensagemSucesso && (
          <div className="rec-senha-toast-erro">
            {mensagem}
            <button onClick={() => setMensagem('')} aria-label="Fechar mensagem de erro">×</button>
          </div>
        )}

        <h2>Recuperar Senha</h2>

        {/* Etapa 1: Inserir email */}
        {etapa === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); enviarCodigo(); }}>
            <div className="rec-senha-input-wrapper">
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaEnvelope className="rec-senha-input-icon" />
            </div>
            <button type="submit" disabled={carregando}>
              {carregando ? "Enviando..." : "Enviar Código"}
            </button>
          </form>
        )}

        {/* Etapa 2: Inserir código */}
        {etapa === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); validarCodigo(); }}>
            <input
              type="text"
              placeholder="Digite o código recebido"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <div className="rec-senha-buttons">
              {tempoRestante > 0 ? (
                <div className="rec-senha-cronometro">
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

        {/* Etapa 3: Nova senha */}
        {etapa === 3 && (
          <form onSubmit={(e) => { e.preventDefault(); redefinirSenha(); }}>
            <div className="rec-senha-input-wrapper">
              <input
                type={mostrarNovaSenha ? 'text' : 'password'}
                placeholder="Nova Senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
              {mostrarNovaSenha
                ? <FaEyeSlash className="rec-senha-input-icon" onClick={() => setMostrarNovaSenha(false)} />
                : <FaEye className="rec-senha-input-icon" onClick={() => setMostrarNovaSenha(true)} />}
            </div>

            <div className="rec-senha-input-wrapper">
              <input
                type={mostrarConfirmarSenha ? 'text' : 'password'}
                placeholder="Confirme a Nova Senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
              {mostrarConfirmarSenha
                ? <FaEyeSlash className="rec-senha-input-icon" onClick={() => setMostrarConfirmarSenha(false)} />
                : <FaEye className="rec-senha-input-icon" onClick={() => setMostrarConfirmarSenha(true)} />}
            </div>

            <button type="submit" disabled={carregando}>
              {carregando ? "Atualizando..." : "Atualizar Senha"}
            </button>
          </form>
        )}

        {/* Separador "ou" e links */}
        <div className="rec-senha-ou-separador">
          <div className="rec-senha-linha-esq"></div>
          <div className="rec-senha-ou">ou</div>
          <div className="rec-senha-linha-dir"></div>
        </div>

        <p><Link to="/">Voltar para o login</Link></p>
        <p>Não tem uma conta? <Link to="/cadastro">Cadastrar</Link></p>
      </div>
    </div>
  );
}
