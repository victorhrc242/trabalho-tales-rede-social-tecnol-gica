import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './cadastro.css';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [biografia, setBiografia] = useState('');
  const [dataAniversario, setDataAniversario] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');

    const novoUsuario = {
      nome,
      email,
      senha,
      FotoPerfil: fotoPerfil,
      biografia,
      dataaniversario: dataAniversario,
      data_criacao: new Date().toISOString()
    };

    try {
      const response = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoUsuario)
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const msg = isJson ? data.message : data;
        setErro(msg || 'Erro ao cadastrar');
        return;
      }

      alert('Cadastro realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setErro('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-box">
        <form onSubmit={handleCadastro} className="cadastro-form">
          <h2>Cadastro</h2>

          <input
            type="text"
            placeholder="Nome de usuario"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Link da foto de perfil (URL)"
            value={fotoPerfil}
            onChange={(e) => setFotoPerfil(e.target.value)}
          />

          <textarea
            placeholder="Biografia"
            value={biografia}
            onChange={(e) => setBiografia(e.target.value)}
          />

          <input
            type="date"
            placeholder="Data de nascimento"
            value={dataAniversario}
            onChange={(e) => setDataAniversario(e.target.value)}
            required
          />

          <button type="submit">Cadastrar</button>

          {erro && <p className="erro">{erro}</p>}

          <p>Já tem uma conta? <Link to="/">Logar</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
