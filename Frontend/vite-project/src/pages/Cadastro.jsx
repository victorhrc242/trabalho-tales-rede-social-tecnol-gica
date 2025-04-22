import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/cadastro.css'; // Estilo atualizado com base no login

const Cadastro = () => {
  // Estados para os campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [biografia, setBiografia] = useState('');
  const [dataAniversario, setDataAniversario] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  // Função para lidar com o envio do formulário
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
    // Container principal centralizado
    <div className="cadastro-container">
      {/* Modal/box onde o formulário ficará estruturado */}
      <div className="cadastro-box">
        {/* Formulário estilizado com os campos alinhados */}
        <form className="cadastro-form" onSubmit={handleCadastro}>
          {/* Título estilizado */}
          <h2>Cadastro</h2>

          {/* Campo Nome */}
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          {/* Campo Email */}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Campo Senha */}
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {/* Campo URL da foto */}
          <input
            type="text"
            placeholder="Link da foto de perfil (URL)"
            value={fotoPerfil}
            onChange={(e) => setFotoPerfil(e.target.value)}
          />

          {/* Campo Biografia */}
          <textarea
            placeholder="Biografia"
            value={biografia}
            onChange={(e) => setBiografia(e.target.value)}
          />

          {/* Campo Data de Nascimento */}
          <input
            type="date"
            placeholder="Data de nascimento"
            value={dataAniversario}
            onChange={(e) => setDataAniversario(e.target.value)}
            required
          />

          {/* Botão de cadastro */}
          <button type="submit">Cadastrar</button>

          {/* Link para login */}
          <p>Já tem uma conta? <Link to="/">Logar</Link></p>

          {/* Exibição de erro, se houver */}
          {erro && <p className="erro">{erro}</p>}
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
