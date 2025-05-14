import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome, FaSearch, FaCompass, FaVideo,
  FaPaperPlane, FaHeart, FaPlusSquare, FaCog
} from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import '../css/navbar.css';

function Navbar({ usuarioLogado, deslogar }) {
  const [busca, setBusca] = useState('');
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [modal, setModal] = useState({ busca: false, opcoes: false, confirmarLogout: false });
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState('');
  const [filtroConfirmadoValor, setFiltroConfirmadoValor] = useState('none');
  const [filtroConfirmado, setFiltroConfirmado] = useState(false);
  const [etapa, setEtapa] = useState(1); // 1: imagem, 2: filtro, 3: texto e tags
  const [tags, setTags] = useState('');
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

  useEffect(() => {
    if (imagemArquivo) {
      const url = URL.createObjectURL(imagemArquivo);
      setImagem(url);
  
      // limpa a URL anterior da memória quando a imagem muda ou componente desmonta
      return () => URL.revokeObjectURL(url);
    }
  }, [imagemArquivo]);
  const handleCriarPost = async (e) => {
    e.preventDefault();
  
    if (!imagemArquivo) {
      setErro('Selecione uma imagem para o post.');
      return;
    }
  
    // Função auxiliar para converter imagem para base64
    const converterParaBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };
  
    try {
      const imagemBase64 = await converterParaBase64(imagemArquivo);
  
      const novoPost = {
        autorId: usuarioLogado.id,
        conteudo,
        imagem: imagemBase64, // imagem agora em base64
        tags: tags.split(',').map(tag => tag.trim()),
        filtro: filtroSelecionado
      };
  
      const response = await fetch('https://devisocial.up.railway.app/api/Feed/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPost)
      });
  
      if (response.ok) {
        // Resetar os campos após publicação
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
      setErro('Erro de conexão com o servidor ou ao converter imagem.');
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
        <Link to="/mensagen" className="nav-item">
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
  {/* Etapa 2 - Filtros */}
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
