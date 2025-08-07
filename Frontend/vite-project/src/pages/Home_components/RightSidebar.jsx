import SearchBar from './SearchBar';
import NotificationsList from './NotificationsList';

function RightSidebar({
  termoBusca,
  setTermoBusca,
  resultadosBusca,
  buscarUsuarios,
  seguirUsuarioRapido,
  notificacoes,
  irParaPerfil,
  usuario
}) {
  return (
    <div className="lateral-direita">
      <SearchBar
        termoBusca={termoBusca}
        setTermoBusca={setTermoBusca}
        resultadosBusca={resultadosBusca}
        buscarUsuarios={buscarUsuarios}
        seguirUsuarioRapido={seguirUsuarioRapido}
        irParaPerfil={irParaPerfil}
        usuario={usuario}
      />
      
      <NotificationsList 
        notificacoes={notificacoes} 
        irParaPerfil={irParaPerfil} 
      />
    </div>
  );
}

export default RightSidebar;