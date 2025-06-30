import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import '../css/cadastro.css';
//importaçao dos icons
import { FaUser, FaEnvelope, FaLock, FaUserCircle } from 'react-icons/fa';


// Supabase config
const supabase = createClient(
  'https://vffnyarjcfuagqsgovkd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZm55YXJqY2Z1YWdxc2dvdmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUyNjE0NywiZXhwIjoyMDU5MTAyMTQ3fQ.CvLdiGKqykKGTsPzdw7PyiB6POS-bEJTuo6sPE4fUKg'
);

const Cadastro = () => {
  const [etapa, setEtapa] = useState(1);
  const [nome, setNome] = useState('');
  const [nome_usuario, setNome_usuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [repetirSenha, setRepetirSenha] = useState('');
  const [fotoPerfilArquivo, setFotoPerfilArquivo] = useState(null);
  const [biografia, setBiografia] = useState('');
  const [dataAniversario, setDataAniversario] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  // Carregar imagem padrão como arquivo para o preview da foto
  useEffect(() => {
    // Só carregar quando entrar na etapa 2 e se ainda não tiver foto selecionada
    if (etapa === 2 && !fotoPerfilArquivo) {
      const carregarImagemPadrao = async () => {
        try {
          const resposta = await fetch('https://th.bing.com/th/id/OIP.UF-gmvY1iFxXDL_dHPmuHgAAAA?rs=1&pid=ImgDetMain?text=Foto');
          const blob = await resposta.blob();
          const arquivoPadrao = new File([blob], 'fotoPadrao.png', { type: blob.type });
          setFotoPerfilArquivo(arquivoPadrao);
        } catch (error) {
          console.error('Erro ao carregar imagem padrão:', error);
        }
      };
      carregarImagemPadrao();
    }
  }, [etapa, fotoPerfilArquivo]);

  const uploadImagem = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('imagens-usuarios')
      .upload(`perfil/${fileName}`, file);

    if (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }

    const urlPublica = `https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/imagens-usuarios/perfil/${fileName}`;
    return urlPublica;
  };

  const handleProximaEtapa = (e) => {
    e.preventDefault();
    setErro('');

    if (senha !== repetirSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    setEtapa(2);
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
        nome_usuario,
        email,
        senha,
        FotoPerfil: fotoPerfilURL,
        biografia,
        dataaniversario: dataAniversario,
        data_criacao: new Date().toISOString(),
      };

      const response = await fetch(
        'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoUsuario),
        }
      );

      const isJson = response.headers
        .get('content-type')
        ?.includes('application/json');
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
  <footer>
    <div className="signup-container">
      <div className="signup-box">
        <form
          className={`signup-form ${etapa === 1 ? 'step-one' : 'step-two'}`}
          onSubmit={etapa === 1 ? handleProximaEtapa : handleCadastro}
        >
          <h2>Devisocial</h2>
          <p>Cadastre-se para ver fotos e vídeos dos seus amigos.</p>

          {etapa === 1 ? (
            <>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
                <FaUser className="input-icon" />
              </div>
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FaEnvelope className="input-icon" />
              </div>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="Senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                <FaLock className="input-icon" />
              </div>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="Confirme senha"
                  value={repetirSenha}
                  onChange={(e) => setRepetirSenha(e.target.value)}
                  required
                />
                <FaLock className="input-icon" />
              </div>

              <div className="input-wrapper">
              <label htmlFor="data-nascimento" className="input-label">Data de Nascimento</label>
              <input
                id="data-nascimento"
                type="date"
                value={dataAniversario}
                onChange={(e) => setDataAniversario(e.target.value)}
                required
              />
            </div>

              
              <button type="submit" className="next-button">Próximo</button>

            <div className="divider-with-text">
            <span className="line"></span>
            <span className="or">ou</span>
            <span className="line"></span>
          </div>

            </>
          ) : (
            <>
              {/* Foto de perfil - preview circular e clicável */}
              <label htmlFor="photoInput">
                <img
                  src={
                    fotoPerfilArquivo
                      ? URL.createObjectURL(fotoPerfilArquivo)
                      : 'https://via.placeholder.com/100x100.png?text=Foto'
                  }
                  alt="Foto de perfil"
                  className="profile-photo-preview"
                />
              </label>
              <input
                type="file"
                id="photoInput"
                accept="image/*"
                className="file-input-hidden"
                onChange={(e) => setFotoPerfilArquivo(e.target.files[0])}
              />

              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Nome de usuário"
                  value={nome_usuario}
                  onChange={(e) => setNome_usuario(e.target.value)}
                  required
                />
                <FaUserCircle className="input-icon" />
              </div>

              <div className="input-wrapper">
                <textarea
                  placeholder="Biografia"
                  value={biografia}
                  onChange={(e) => setBiografia(e.target.value)}
                />
              </div>

              <p>
                As pessoas que usam nosso serviço podem ter carregado suas informações
                de contato no Instagram. <a href="#">Saiba mais</a>. Ao se cadastrar,
                você concorda com nossos <a href="#">Termos</a>,{' '}
                <a href="#">Política de Privacidade</a> e{' '}
                <a href="#">Política de Cookies</a>.
              </p>

              <button type="submit" className="signup-button">Cadastrar</button>
            </>
          )}

          <p>
            Já tem uma conta? <Link to="/">Logar</Link>
          </p>

          {erro && <p className="error-message">{erro}</p>}
        </form>
      </div>
    </div>
  </footer>
);

};

export default Cadastro;
