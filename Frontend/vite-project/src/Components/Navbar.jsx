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
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState('');
  const [etapa, setEtapa] = useState(1); // 1: imagem, 2: filtro, 3: texto e tags
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
      {/* Modal de Criarção de Post */}
      {mostrarModal && (
  <div className="modal-overlay">
    <div className="modal-CriarPost">
    <form className="form-criar-post" onSubmit={handleCriarPost}>
  <h2>Criar Novo Post</h2>

  {/* Etapa 1 - Seleção de imagem */}
  {etapa === 1 && (
    <>
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
      {imagem}
      <button
          type="button"
          className="button-proximo"
          onClick={() => setEtapa(2)}
        >
          Próximo
        </button>
    </>
  )}

  {/* Etapa 2 - Filtros */}
  {etapa === 2 && imagem && (
    <>
      <div className="preview-imagem">
        <img
          src={imagem}
          alt="Pré-visualização"
          className={`imagem-preview ${filtroSelecionado}`}
        />
      </div>

      <div className="filtros">
        <p>Escolha um filtro:</p>
        <div className="filtros-opcoes">
          {['none', 'grayscale', 'sepia', 'invert', 'contrast', 'saturate'].map((filtro) => (
            <button
              type="button"
              key={filtro}
              className={`filtro-botao ${filtroSelecionado === filtro ? 'ativo' : ''}`}
              onClick={() => setFiltroSelecionado(filtro)}
            >
              {filtro}
            </button>
          ))}
        </div>
      </div>
      <button
  type="button"
  className="button-proximo"
  onClick={() => setEtapa(3)}
>
  Próximo
</button>
    </>
  )}

  {/* Etapa 3 - Texto e Tags */}
  {etapa === 3 && (
    <>
      <textarea
        placeholder="Escreva algo..."
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Tags separadas por vírgula"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <div className="botoes-acoes">
        <button type="submit" className="button-confirme">Publicar</button>
        <button
          type="button"
          className="button-cancel"
          onClick={() => {
            setMostrarModal(false);
            setEtapa(1); // resetar para a primeira etapa ao fechar
          }}
        >
          Cancelar
        </button>
      </div>
    </>
  )}

  {erro && <p style={{ color: 'red' }}>{erro}</p>}
</form>
<button
  className="fechar-modal-x"
  onClick={() => {
    setMostrarModal(false);
    setEtapa(1); // opcional: resetar para a primeira etapa
  }}
>
  &times;
</button>
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
