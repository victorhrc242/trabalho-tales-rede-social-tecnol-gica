import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome, FaSearch, FaCompass, FaVideo,
  FaPaperPlane, FaHeart, FaPlusSquare, FaCog
} from 'react-icons/fa';
import '../css/navbar.css';

function Navbar({ usuarioLogado, deslogar }) {
  const [busca, setBusca] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [modal, setModal] = useState({ busca: false, opcoes: false, confirmarLogout: false });

  const [mostrarModal, setMostrarModal] = useState(false);
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState('');
  const [tags, setTags] = useState('');
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
    if (usuarioLogado && usuarioLogado.id) {
      navigate('/perfil', { state: { userId: usuarioLogado.id } });
    } else {
      console.warn('Usuário não encontrado');
    }
  };

  const abrirModalOpcoes = () => setModal({ ...modal, opcoes: true });
  const fecharModalOpcoes = () => setModal({ ...modal, opcoes: false });
  const confirmarLogoutFunc = () => setModal({ confirmarLogout: true, opcoes: false, busca: false });
  const cancelarLogout = () => setModal({ ...modal, confirmarLogout: false });

  const deslogarERedirecionar = () => {
    deslogar();
    navigate('/');
  };
  
  const handleCriarPost = async (e) => {
    e.preventDefault();
    const novoPost = {
      autorId: usuarioLogado.id,
      conteudo,
      imagem,
      tags: tags.split(',').map(tag => tag.trim())
    };

    try {
      const response = await fetch('https://devisocial.up.railway.app/api/Feed/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPost)
      });

      if (response.ok) {
        setMostrarModal(false);
        setConteudo('');
        setImagem('');
        setTags('');
      } else {
        const erroResp = await response.json();
        setErro(erroResp.erro || 'Erro ao criar o post');
      }
    } catch (err) {
      console.error('Erro ao criar post:', err);
      setErro('Erro de conexão com o servidor.');
    }
  };


  return (
    <div className="navbar-lateral">
      <nav className="navbar-menu">
        <Link to="/home" className="nav-item">
          <FaHome /> <span>Home</span>
        </Link>

        <div
          className="nav-item"
          onClick={() => setModal({ ...modal, busca: !modal.busca })}
        >
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

        <Link to="/explore" className="nav-item">
          <FaCompass /> <span>Explorar</span>
        </Link>
        <Link to="/reels" className="nav-item">
          <FaVideo /> <span>kurz</span>
        </Link>
        <Link to="/mensagens" className="nav-item">
          <FaPaperPlane /> <span>Mensagens</span>
        </Link>
        <Link to="/notificacoes" className="nav-item">
          <FaHeart /> <span>Notificações</span>
        </Link>
        <div className="nav-item" onClick={() => setMostrarModal(true)}>
  <FaPlusSquare /> <span>Criar Post</span>
</div>

        {usuarioLogado && (
          <div className="nav-item">
            <button
              onClick={irParaPerfil}
              className="perfil-foto"
              aria-label="Ir para o perfil"
            >
              <img
                src={
                  usuarioLogado.foto
                    ? usuarioLogado.foto
                    : 'https://sigeventos.unifesspa.edu.br/sigeventos/verArquivo?idArquivo=899786&key=7b31619566f4f78b8a447ec38d196e12'
                }
                alt="Foto do usuário"
                className="foto-perfil-redonda"
              />
              <span className="ola">Perfil</span>
            </button>
          </div>
        )}

        <div
          className="perfil-configuracao"
          onClick={abrirModalOpcoes}
          aria-label="Abrir configurações"
        >
          <FaCog />
        </div>
      </nav>

      {/* Modal de Opções */}
      {modal.opcoes && (
        <div className="modal">
          <div className="modal-conteudo">
            <ul>
              <li onClick={confirmarLogoutFunc}>Sair</li>
              <li onClick={() => alert('Em breve')}>Configurações</li>
              <li onClick={() => alert('Em breve')}>Trocar de Conta</li>
            </ul>
            <button className="fechar-modal" onClick={fecharModalOpcoes}>
              Fechar
            </button>
          </div>
        </div>
      )}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Criar Novo Post</h2>
            <form onSubmit={handleCriarPost}>
              <textarea
                placeholder="Escreva algo..."
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="URL da imagem (opcional)"
                value={imagem}
                onChange={(e) => setImagem(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tags separadas por vírgula"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <br />
              <button type="submit" className="button-confirme">Publicar</button>
              <button type="button" className="button-cancel" onClick={() => setMostrarModal(false)} style={{ marginLeft: '10px' }}>Cancelar</button>
              {erro && <p style={{ color: 'red' }}>{erro}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Logout */}
      {modal.confirmarLogout && (
        <div className="modal">
          <div className="modal-conteudo">
            <h2>Você tem certeza que deseja deslogar?</h2>
            <div className="botoes-modal">
              <button className="btn-confirmar" onClick={deslogarERedirecionar}>
                Sim
              </button>
              <button className="btn-cancelar" onClick={cancelarLogout}>
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
