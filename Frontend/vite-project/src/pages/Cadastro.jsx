import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import '../css/cadastro.css';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [biografia, setBiografia] = useState('');
  const [dataAniversario, setDataAniversario] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('senha', senha);
    formData.append('FotoPerfil', fotoPerfil);
    formData.append('biografia', biografia);
    formData.append('dataaniversario', dataAniversario);
    formData.append('data_criacao', new Date().toISOString());

    try {
      const response = await fetch('https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/register', {
        method: 'POST',
        body: formData,
        credentials: 'include' // ✅ Necessário se o backend usa cookies/autenticação
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
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
        <form onSubmit={handleCadastro} className="cadastro-form" encType="multipart/form-data">
          <h2>Cadastro</h2>

          <input
            type="text"
            placeholder="Nome de usuário"
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
            type="file"
            accept="image/*"
            onChange={(e) => setFotoPerfil(e.target.files[0])}
          />

          <textarea
            placeholder="Biografia"
            value={biografia}
            onChange={(e) => setBiografia(e.target.value)}
          />

          <input
            type="date"
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
