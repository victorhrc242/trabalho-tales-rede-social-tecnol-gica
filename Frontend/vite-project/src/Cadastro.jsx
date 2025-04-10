import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
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
      const response = await fetch('https://localhost:7051/api/auth/register', {
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
    <div className='cadastro-container'>
      <h2>Cadastro</h2>

      <form onSubmit={handleCadastro}>
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
<br /><br />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
<br /><br />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
<br /><br />
        <input
          type="text"
          placeholder="Link da foto de perfil (URL)"
          value={fotoPerfil}
          onChange={(e) => setFotoPerfil(e.target.value)}
        />
<br /><br />
        <textarea
          placeholder="Biografia"
          value={biografia}
          onChange={(e) => setBiografia(e.target.value)}
        />
<br /><br />
        <input
          type="date"
          placeholder="Data de nascimento"
          value={dataAniversario}
          onChange={(e) => setDataAniversario(e.target.value)}
          required
        />
<br /><br />
        <button type="submit">Cadastrar</button>
      </form>
          <p>Ja tem Uma conta: <Link to="/">Logar</Link></p>
      {erro && <p className="erro">{erro}</p>}
    </div>
  );
};

export default Cadastro;
