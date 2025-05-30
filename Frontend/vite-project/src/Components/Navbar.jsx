import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome, FaSearch, FaCompass, FaVideo,
  FaPaperPlane, FaHeart, FaPlusSquare, FaCog
} from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import '../css/navbar.css';
import logo from '../Components/img/LogoParadise.jpg';

// Supabase client
const supabase = createClient(
  'https://vffnyarjcfuagqsgovkd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZm55YXJqY2Z1YWdxc2dvdmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUyNjE0NywiZXhwIjoyMDU5MTAyMTQ3fQ.CvLdiGKqykKGTsPzdw7PyiB6POS-bEJTuo6sPE4fUKg'
);

function Navbar({ usuarioLogado, deslogar }) {
  const [busca, setBusca] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [modal, setModal] = useState({ busca: false, opcoes: false, confirmarLogout: false });
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState('');
  const [filtroConfirmado, setFiltroConfirmado] = useState(false);
  const [etapa, setEtapa] = useState(1);
  const [tags, setTags] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [expandida, setExpandida] = useState(false);
  const toggleNavbar = () => setExpandida(!expandida);
  const [filtroSelecionado, setFiltroSelecionado] = useState('none');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleBusca = useCallback(async () => {
    if (!busca.trim()) return;

    try {
      const response = await fetch(`https://devisocial.up.railway.app/api/auth/buscar/${busca}`);
      const data = await response.json();
      setUsuariosEncontrados(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  }, [busca]);

  const irParaPerfil = () => {
    if (usuarioLogado?.id) {
      navigate('/perfil', { state: { userId: usuarioLogado.id } });
    }
  };

useEffect(() => {
  const buscarUsuario = async () => {
    try {
      const response = await axios.get(`https://devisocial.up.railway.app/api/auth/usuario/${usuarioLogado.id}`);
      setUsuario(response.data);
      setImagem(response.data.FotoPerfil);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  if (usuarioLogado?.id) buscarUsuario();
}, [usuarioLogado]);
  

  const abrirModalOpcoes = () => setModal({ ...modal, opcoes: true });
  const fecharModalOpcoes = () => setModal({ ...modal, opcoes: false });
  const confirmarLogoutFunc = () => setModal({ confirmarLogout: true, opcoes: false, busca: false });
  const cancelarLogout = () => setModal({ ...modal, confirmarLogout: false });
  const deslogarERedirecionar = () => {
    deslogar();
    navigate('/');
  };

  // 🧩 Upload da imagem via Supabase (igual cadastro)
  const uploadImagem = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('post-usuarios')
      .upload(`posts/${fileName}`, file);

    if (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }

    return `https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/post-usuarios/posts/${fileName}`;
  };

  const handleCriarPost = async (e) => {
    e.preventDefault();

    if (!imagemArquivo) {
      setErro('Selecione uma imagem para o post.');
      return;
    }

    try {
      const imagemUrl = await uploadImagem(imagemArquivo);

      const novoPost = {
        autorId: usuarioLogado.id,
        conteudo,
        imagem: imagemUrl,
        tags: tags.split(',').map(tag => tag.trim()),
        filtro: filtroSelecionado
      };

      const response = await fetch('https://devisocial.up.railway.app/api/Feed/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPost)
      });

      if (response.ok) {
        setMostrarModal(false);
        setEtapa(1);
        setImagem('');
        setImagemArquivo(null);
        setErro('');
        setFiltroSelecionado('none');
        setConteudo('');
        setTags('');
      } else {
        const erroResp = await response.json();
        setErro(erroResp.erro || 'Erro ao criar o post');
      }
    } catch (err) {
      console.error('Erro ao criar post:', err);
      setErro('Erro ao enviar imagem ou conectar ao servidor.');
    }
  };

  useEffect(() => {
    if (imagemArquivo) {
      const url = URL.createObjectURL(imagemArquivo);
      setImagem(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imagemArquivo]);

  return (
    <div className={`navbar-lateral ${expandida ? 'expandida' : 'minimizada'}`}
      onMouseEnter={() => setExpandida(true)}
      onMouseLeave={() => setExpandida(false)}>
      <nav className="navbar-menu">
        <Link to="/home" className="logo-link">
  <div className="logo-site">
    <img src={logo} alt="Logo" />
    <span>Paradise</span></div></Link>
        <Link to="/home" className="nav-item"><FaHome /> <span>Home</span></Link>
        <div className="nav-item" onClick={() => setModal({ ...modal, busca: !modal.busca })}>
          <FaSearch /> <span>Buscar</span>
        </div>
        {modal.busca && (
          <div className="barra-pesquisa">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar usuários"
              onKeyDown={(e) => e.key === 'Enter' && handleBusca()}
            />
            <button onClick={handleBusca}>Buscar</button>
          </div>
        )}
        {usuariosEncontrados.length > 0 && (
          <div className="resultados-pesquisa">
            {usuariosEncontrados.map((usuario) => (
              <div key={usuario.id} className="resultado-usuario">
                <span>{usuario.nome}</span>
              </div>
            ))}
          </div>
        )}
        <Link to="/explore" className="nav-item"><FaCompass /> <span>Explorar</span></Link>
        <Link to="/reels" className="nav-item"><FaVideo /> <span>kurz</span></Link>
        <Link to="/mensagen" className="nav-item"><FaPaperPlane /> <span>Mensagens</span></Link>
        <Link to="/notificacoes" className="nav-item"><FaHeart /> <span>Notificações</span></Link>
        <div className="nav-item" onClick={() => setMostrarModal(true)}>
          <FaPlusSquare /> <span>Criar Post</span>
        </div>

        {usuarioLogado && (
          <div className="nav-item">
              <a onClick={irParaPerfil} className="perfil-foto" aria-label="Ir para o perfil">
              <img
                src={usuarioLogado?.imagem || 'https://via.placeholder.com/150'}
                alt={`Fotodeperfil${usuarioLogado?.nome}`}
              />
              <span className="autor-nome" onClick={irParaPerfil}>
                {usuarioLogado.nome}
              </span>
            </a>
          </div>
        )}

        <div className="perfil-configuracao" onClick={abrirModalOpcoes}>
          <FaCog />
        </div>
      </nav>

      {/* Modais */}
      {modal.opcoes && (
        <div className="modal">
          <div className="modal-conteudo">
            <ul>
              <li onClick={confirmarLogoutFunc}>Sair</li>
              <li onClick={() => alert('Em breve')}>Configurações</li>
              <li onClick={() => alert('Em breve')}>Trocar de Conta</li>
            </ul>
            <button className="fechar-modal" onClick={fecharModalOpcoes}>Fechar</button>
          </div>
        </div>
      )}

      {mostrarModal && (
        <div className="modal-overlay" onClick={() => { setMostrarModal(false); setEtapa(1); }}>
          <div className={`modal-CriarPost ${etapa === 2 ? 'modal-CriarPost-etapa2' : ''}`}
            onClick={(e) => e.stopPropagation()}>
            <form className="form-criar-post" onSubmit={handleCriarPost}>
              <h2>Criar Novo Post</h2>

              {etapa === 1 && (
                <>
                  {!imagemArquivo && (
                    <div className="area-upload" onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        setImagemArquivo(e.dataTransfer.files[0]);
                      }}>
                      <p>Arraste uma imagem aqui ou clique para selecionar</p>
                      <input type="file" accept="image/*"
                        onChange={(e) => setImagemArquivo(e.target.files[0])} />
                    </div>
                  )}
                  {imagem && (
                    <div className="preview-imagem2">
                      <img src={imagem} alt="Pré-visualização" className={`imagem-preview ${filtroSelecionado}`} />
                    </div>
                  )}
                  {imagemArquivo && (
                    <div>
                      <button type="button" className='button-trocar-imagem' onClick={() => { setImagemArquivo(null); setImagem(''); }}>
                        Trocar imagem
                      </button>
                      <button type="button" className='button-proximo' onClick={() => setEtapa(2)}>Próximo</button>
                    </div>
                  )}
                </>
              )}

              {etapa === 2 && imagem && (
                <>
                  <div className="preview-e-filtros">
                    <div className="preview-imagem2">
                      <img src={imagem} alt="Pré-visualização" className={`imagem-preview ${filtroSelecionado}`} />
                    </div>
                    <div className="filtros-preview">
                      {['none', 'grayscale', 'sepia', 'invert', 'contrast', 'saturate'].map((filtro) => (
                        <div key={filtro} className={`filtro-miniatura ${filtroSelecionado === filtro ? 'ativo' : ''}`}
                          onClick={() => {
                            setFiltroSelecionado(filtro);
                            setFiltroConfirmado(false);
                          }}>
                          <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=200&q=80"
                            alt={`Filtro ${filtro}`} className={`imagem-miniatura ${filtro}`} />
                          <span>{filtro}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="botoes-acoes">
                    {!filtroConfirmado ? (
                      <button type="button" className='button-proximo' onClick={() => { setFiltroConfirmado(true); }}>Confirmar filtro</button>
                    ) : (
                      <button type="button" className='button-proximo' onClick={() => setEtapa(3)}>Próximo</button>
                    )}
                  </div>
                </>
              )}

              {etapa === 3 && (
                <>
                  <textarea placeholder="Escreva algo..." value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)} required />
                  <input type="text" placeholder="Tags separadas por vírgula"
                    value={tags} onChange={(e) => setTags(e.target.value)} />
                  <div className="botoes-acoes">
                    <button type="submit" className='button-confirme'>Publicar</button>
                    <button type="button" className='button-cancel' onClick={() => { setMostrarModal(false); setEtapa(1); }}>Cancelar</button>
                  </div>
                </>
              )}

              {erro && <p style={{ color: 'red' }}>{erro}</p>}
            </form>
            <button className={`fechar-modal-x ${etapa === 2 ? 'fechar-modal-x-etapa2' : ''}`}
              onClick={() => { setMostrarModal(false); setEtapa(1); }}>
              &times;
            </button>
          </div>
        </div>
      )}

      {modal.confirmarLogout && (
        <div className="modal">
          <div className="modal-conteudo">
            <h2>Você tem certeza que deseja deslogar?</h2>
            <div className="botoes-modal">
              <button className='button-confirme' onClick={deslogarERedirecionar}>Sim</button>
              <button className='button-cancel' onClick={cancelarLogout}>Não</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
