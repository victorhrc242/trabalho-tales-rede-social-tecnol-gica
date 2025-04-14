import React from 'react';
import { Link} from 'react-router-dom';

const Navbar = () => {
  return (
    <div>
      <p><Link to="/home">Home</Link></p>
      <p><Link to="/perfil">Perfil</Link></p>
    </div>
  );
};

export default Navbar;
