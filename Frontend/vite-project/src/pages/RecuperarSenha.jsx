import React, { useState } from 'react';
import '../css/recuperarSenha.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function RecuperarSenha() {
  const [etapa, setEtapa] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const enviarCodigo = async () => {
    setCarregando(true);
    try {
      await axios.post('https://devisocial.up.railway.app/api/auth/Enviar-codigo', {
        email
      });
      setMensagem('Código enviado para seu e-mail.');
      setEtapa(2);
    } catch (erro) {
      setMensagem(erro.response?.data || 'Erro ao enviar código.');
    }
    setCarregando(false);
  };

  const validarCodigo = async () => {
    if (!codigo.trim()) {
      setMensagem('Digite o código recebido.');
      return;
    }
    // Simplesmente avança para etapa 3, pois a validação de código será feita na hora de redefinir senha
    setEtapa(3);
    setMensagem('');
  };

  const redefinirSenha = async () => {
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
      setMensagem('Senha atualizada com sucesso!');
      setTimeout(() => {
        navigate('/'); // redireciona para login
      }, 2000);
    } catch (erro) {
      setMensagem(erro.response?.data || 'Erro ao redefinir senha.');
    }
    setCarregando(false);
  };

  const handleReenviarCodigo = () => {
    enviarCodigo();
  };

  return (
    <div className="recuperar-container">
      <div className="recuperar-box">
        <h2>Recuperar Senha</h2>

        {etapa === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); enviarCodigo(); }}>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
              <button type="button" onClick={handleReenviarCodigo} disabled={carregando}>
                {carregando ? "Reenviando..." : "Renviar codigo"}
              </button>
              <button type="submit">
                Enviar
              </button>
            </div>
          </form>
        )}

        {etapa === 3 && (
          <form onSubmit={(e) => { e.preventDefault(); redefinirSenha(); }}>
            <input
              type="password"
              placeholder="Nova Senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirme a Nova Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
            <button type="submit" disabled={carregando}>
              {carregando ? "Atualizando..." : "Atualizar Senha"}
            </button>
          </form>
        )}
   {mensagem && <p className="mensagem">{mensagem}</p>}
        <p><Link to="/">Voltar para o login</Link></p>
      </div>
    </div>
  );
}
