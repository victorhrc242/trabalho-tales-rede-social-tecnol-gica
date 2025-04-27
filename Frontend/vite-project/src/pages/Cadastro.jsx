import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import '../css/cadastro.css'; // Estilo atualizado com base no login

// Configuração do Supabase
const supabase = createClient('https://vffnyarjcfuagqsgovkd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZm55YXJqY2Z1YWdxc2dvdmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUyNjE0NywiZXhwIjoyMDU5MTAyMTQ3fQ.CvLdiGKqykKGTsPzdw7PyiB6POS-bEJTuo6sPE4fUKg');

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [fotoPerfilArquivo, setFotoPerfilArquivo] = useState(null);
  const [biografia, setBiografia] = useState('');
  const [dataAniversario, setDataAniversario] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const uploadImagem = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;

    const { data, error } = await supabase
      .storage
      .from('imagens-usuarios') // 🔥 Substitua aqui pelo nome do seu bucket!
      .upload(`perfil/${fileName}`, file);

    if (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }

    const urlPublica = `https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/imagens-usuarios/perfil/${fileName}`;
    return urlPublica;
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      let fotoPerfilURL = '';

      if (fotoPerfilArquivo) {
        fotoPerfilURL = await uploadImagem(fotoPerfilArquivo);
      }

      const novoUsuario = {
        nome,
        email,
        senha,
        FotoPerfil: fotoPerfilURL, // agora usando a URL do Supabase
        biografia,
        dataaniversario: dataAniversario,
        data_criacao: new Date().toISOString()
      };

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
        <form className="cadastro-form" onSubmit={handleCadastro}>
          <h2>Cadastro</h2>

          <input
            type="text"
            placeholder="Nome completo"
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

          {/* Upload de foto */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFotoPerfilArquivo(e.target.files[0])}
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

          <p>Já tem uma conta? <Link to="/">Logar</Link></p>

          {erro && <p className="erro">{erro}</p>}
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
