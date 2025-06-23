import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome, FaSearch, FaCompass, FaVideo, FaPaperPlane,
  FaHeart, FaPlusSquare, FaCog
} from 'react-icons/fa';
import axios from 'axios';
import CriarPostModal from '../Components/Criar.jsx';
import '../css/navbar.css';

function Navbar({ usuarioLogado, deslogar }) {
  const [busca, setBusca] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [modal, setModal] = useState({ busca: false, opcoes: false, confirmarLogout: false });
  const [imagem, setImagem] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [expandida, setExpandida] = useState(false);
  const navigate = useNavigate();

  const toggleNavbar = () => setExpandida(!expandida);

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
  //      configuração
const irParaConfiguracoes = () => {
  fecharModalOpcoes(); // fecha o modal antes de navegar
  navigate('/configuracoes'); // rota que você deve criar
};
  const carregarDados = useCallback(async () => {
    if (!usuarioLogado?.id) return;
    try {
      const { data } = await axios.get(
        `https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/usuario/${usuarioLogado.id}`
      );
      setImagem(data.imagem);
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    }
  }, [usuarioLogado?.id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const irParaPerfil = () => {
    if (usuarioLogado?.id) {
      navigate('/perfil', { state: { userId: usuarioLogado.id } });
    }
  };

  const abrirModalOpcoes = () => setModal(prev => ({ ...prev, opcoes: true }));
  const fecharModalOpcoes = () => setModal(prev => ({ ...prev, opcoes: false }));
  const confirmarLogoutFunc = () => setModal({ confirmarLogout: true, opcoes: false, busca: false });
  const cancelarLogout = () => setModal(prev => ({ ...prev, confirmarLogout: false }));
  const deslogarERedirecionar = () => {
    deslogar();
    navigate('/');
  };

  return (
    <div
      className={`navbar-lateral ${expandida ? 'expandida' : 'minimizada'}`}
      onMouseEnter={() => setExpandida(true)}
      onMouseLeave={() => setExpandida(false)}
    >
      <nav className="navbar-menu">
        <div className="logo-navbar">
  <Link to="/home">
    <img src="./public/logoParadise.jpg" alt="Logo" className="imagem-logo" />
  </Link>
</div>
        <Link to="/home" className="nav-item"><FaHome /> <span>Home</span></Link>

        <div className='nav-buscar'><div className="nav-item" onClick={() => setModal(prev => ({ ...prev, busca: !modal.busca }))}>
          <FaSearch /> <span>Buscar</span>
        </div>
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

        <div className='nav-explore'><Link to="/explore" className="nav-item"><FaCompass /> <span>Explorar</span></Link></div>
        <div className='nav-reels'><Link to="/reels" className="nav-item"><FaVideo /> <span>kurz</span></Link></div>
        <div className='nav-mensagens'><Link to="/mensagen" className="nav-item"><FaPaperPlane /> <span>Mensagens</span></Link></div>
        <div className='nav-notificacoes'><Link to="/notificacoes" className="nav-item"><FaHeart /> <span>Notificações</span></Link></div>

        <div className="nav-item" onClick={() => setMostrarModal(true)}>
          <FaPlusSquare /> <span>Criar Post</span>
        </div>

        {usuarioLogado && (
          <div className="nav-item">
            <a onClick={irParaPerfil} className="perfil-foto" aria-label="Ir para o perfil">
              <img
                src={imagem || 'https://via.placeholder.com/100x100.png?text=Foto'}
                alt="Perfil"
                className="foto-perfil-redonda"
              />
            </a>
          </div>
        )}
        <div className="perfil-configuracao" onClick={abrirModalOpcoes}>
          <FaCog />
        </div>
      </nav>

            {/* Modal de Criarção de Post 
      {mostrarModal && (
    <div className="modal-overlay" onClick={() => {
      setMostrarModal(false);
      setEtapa(1); // resetar ao fechar
    }}>
    <div className={`modal-CriarPost ${etapa === 2 ? 'modal-CriarPost-etapa2' : ''}`}
      onClick={(e) => e.stopPropagation()} // impede que clique dentro feche o modal
    >
    <form className="form-criar-post" onSubmit={handleCriarPost}>
  <h2>Criar Novo Post</h2>

  Etapa 1 - Seleção de imagem
  {etapa === 1 && (
    <>
          {!imagemArquivo && (
      <div
        className="area-upload"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setImagemArquivo(e.dataTransfer.files[0]);
        }}
      >
        <p>Arraste uma imagem aqui ou clique para selecionar</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagemArquivo(e.target.files[0])}
        />
      </div>
    )}

    {imagem && (
      <div className="preview-imagem2">
        <img
          src={imagem}
          alt="Pré-visualização"
          className={`imagem-preview ${filtroSelecionado}`}
        />
      </div>
    )}
        {imagemArquivo && (
      <div>
                 <button
                 type="button"
                 className="button-trocar-imagem"
                 onClick={() => {
                   setImagemArquivo(null);
                   setImagem('');
                 }}
               >
                 Trocar imagem
     </button>
     <div>
      <button
        type="button"
        className="button-proximo"
        onClick={() => setEtapa(2)}
      >
        Próximo
      </button>
      </div>
      </div>
    )}
    </>
  )}
   Etapa 2 - Filtros 
  {etapa === 2 && imagem && (
    <>
<div className="preview-e-filtros">
  <div className="preview-imagem2">
    <img
      src={imagem}
      alt="Pré-visualização"
      className={`imagem-preview ${filtroSelecionado}`}
    />
  </div>

  <div className="filtros-preview">
    {['none', 'grayscale', 'sepia', 'invert', 'contrast', 'saturate'].map((filtro) => (
      <div
        key={filtro}
        className={`filtro-miniatura ${filtroSelecionado === filtro ? 'ativo' : ''}`}
        onClick={() => {
          setFiltroSelecionado(filtro);
          setFiltroConfirmado(false); // ao trocar, precisa confirmar de novo
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=200&q=80"
          alt={`Filtro ${filtro}`}
          className={`imagem-miniatura ${filtro}`}
        />
        <span>{filtro}</span>
      </div>
    ))}
  </div>
</div>

<div className="botoes-acoes">
  {!filtroConfirmado ? (
    <button
      type="button"
      className="button-confirmar"
      onClick={() => {
        setFiltroConfirmado(true);
        setFiltroConfirmadoValor(filtroSelecionado); // salvar o filtro atual
      }}
    >
      Confirmar filtro
    </button>
  ) : (
    <button
      type="button"
      className="button-proximo"
      onClick={() => setEtapa(3)}
    >
      Próximo
    </button>
  )}
</div>
    </>
  )}
     Etapa 3 - Texto e Tags 
              {etapa === 3 && (
                <>
                  <textarea placeholder="Escreva algo..." value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)} required />
                  <input type="text" placeholder="Tags separadas por vírgula"
                    value={tags} onChange={(e) => setTags(e.target.value)} />
                  <div className="botoes-acoes">
                    <button type="submit">Publicar</button>
                    <button type="button" onClick={() => { setMostrarModal(false); setEtapa(1); }}>Cancelar</button>
                  </div>
                </>
              )}
      </form>
      </div>
      ) */}

      {modal.opcoes && (
        <div className="modal">
          <div className="modal-conteudo">
            <ul>
              <li onClick={confirmarLogoutFunc}>Sair</li>
              <li onClick={() => alert('Configurações em breve')}>Configurações</li>
              <li onClick={() => alert('Troca de conta em breve')}>Trocar de Conta</li>
            </ul>
            <button className="fechar-modal" onClick={fecharModalOpcoes}>x</button>
          </div>
        </div>
      )}

   {modal.opcoes && (
  <div className="modal">
    <div className="modal-conteudo">
      <ul>
        <li onClick={confirmarLogoutFunc}>Sair</li>
        <li onClick={irParaConfiguracoes}>Configurações</li>
        <li onClick={() => alert('Troca de conta em breve')}>Trocar de Conta</li>
      </ul>
      <button className="fechar-modal" onClick={fecharModalOpcoes}>x</button>
    </div>
  </div>
)}
      {mostrarModal && (
        <CriarPostModal usuarioLogado={usuarioLogado} onClose={() => setMostrarModal(false)} />
      )}
    </div>
  );
}

export default Navbar;
