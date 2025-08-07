import { FaSearch } from 'react-icons/fa';

function SearchBar({
  termoBusca,
  setTermoBusca,
  resultadosBusca,
  buscarUsuarios,
  seguirUsuarioRapido,
  irParaPerfil,
  usuario
}) {
  return (
    <div className="campo-busca">
      <FaSearch className="icone-busca" />
      <input
        placeholder="Buscar usuários..."
        className="barra-pesquisa-usuarios"
        value={termoBusca}
        onChange={(e) => {
          const valor = e.target.value;
          setTermoBusca(valor);
          if (valor.trim() === '') {
            setResultadosBusca([]);
          } else {
            buscarUsuarios(valor);
          }
        }}
      />

      {termoBusca.trim() !== '' && resultadosBusca.length > 0 && (
        <ul className="resultados-busca">
          {resultadosBusca.map((usuarioPesquisado) => (
            <li key={usuarioPesquisado.id} className="usuario-pesquisado">
              <img
                src={usuarioPesquisado.imagem || 'https://via.placeholder.com/40'}
                alt="avatar"
                className="avatar-busca"
                onClick={() => irParaPerfil(usuarioPesquisado.id)}
                style={{ cursor: 'pointer' }}
              />
              <div className="info-usuario">
                <span
                  onClick={() => irParaPerfil(usuarioPesquisado.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {usuarioPesquisado.nome_usuario || usuarioPesquisado.nome}
                </span>
                <button
                  onClick={() => seguirUsuarioRapido(usuarioPesquisado.id)}
                  disabled={usuarioPesquisado.jaSegue}
                >
                  {usuarioPesquisado.jaSegue ? 'Seguindo' : 'Seguir'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;