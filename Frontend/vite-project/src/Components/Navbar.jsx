import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome, FaSearch, FaCompass, FaVideo,
  FaPaperPlane, FaHeart, FaPlusSquare, FaCog
} from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import '../css/navbar.css';

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
 const carregarDados = useCallback(async () => {
    if (!usuarioLogado?.id) return;

    try {
      const { data: userData } = await axios.get(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${usuarioLogado.id}`
      );
      setImagem(userData.imagem);
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    }
  }, [usuarioLogado?.id]);
  const irParaPerfil = () => {
    if (usuarioLogado?.id) {
      navigate('/perfil', { state: { userId: usuarioLogado.id } });
    }
  };
  // Carregar dados do usuário
 
  const abrirModalOpcoes = () => setModal({ ...modal, opcoes: true });
  const fecharModalOpcoes = () => setModal({ ...modal, opcoes: false });
  const confirmarLogoutFunc = () => setModal({ confirmarLogout: true, opcoes: false, busca: false });
  const cancelarLogout = () => setModal({ ...modal, confirmarLogout: false });
  const deslogarERedirecionar = () => {
    deslogar();
    navigate('/');
  };

  useEffect(() => {
    if (imagemArquivo) {
      const url = URL.createObjectURL(imagemArquivo);
      setImagem(url);
      return () => URL.revokeObjectURL(url);
    }
      carregarDados();
  }, [imagemArquivo],[usuarioLogado?.id, carregarDados]);

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

  return (
    <div className={`navbar-lateral ${expandida ? 'expandida' : 'minimizada'}`}
      onMouseEnter={() => setExpandida(true)}
      onMouseLeave={() => setExpandida(false)}>
      <nav className="navbar-menu">
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
                src={usuarioLogado.imagem || 'https://via.placeholder.com/100x100.png?text=Foto'}
                alt=""
                className="foto-perfil-redonda"
              />
              <span className="ola"></span>
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
            <button className="fechar-modal" onClick={fecharModalOpcoes}>x</button>
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
                      <button className='button-trocar-imagem' type="button" onClick={() => { setImagemArquivo(null); setImagem(''); }}>
                        Trocar imagem
                      </button>
                      <button className='button-proximo' type="button" onClick={() => setEtapa(2)}>Próximo</button>
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
                      <button className='button-proximo' type="button" onClick={() => { setFiltroConfirmado(true); }}>Confirmar filtro</button>
                    ) : (
                      <button className='button-proximo' type="button" onClick={() => setEtapa(3)}>Próximo</button>
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
                    <button className='button-confirme' type="submit">Publicar</button>
                    <button className='button-cancel' type="button" onClick={() => { setMostrarModal(false); setEtapa(1); }}>Cancelar</button>
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
