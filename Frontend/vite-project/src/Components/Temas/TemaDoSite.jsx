import React, { createContext, useState, useContext, useEffect } from 'react';

const TemaDoSite = createContext();

export const ThemeProvider = ({ children }) => {
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem('tema') === 'escuro';
  });

  useEffect(() => {
    localStorage.setItem('tema', temaEscuro ? 'escuro' : 'claro');
  }, [temaEscuro]);

  const alternarTema = () => setTemaEscuro((prev) => !prev);

  return (
    <TemaDoSite.Provider value={{ temaEscuro, alternarTema }}>
      {children}
    </TemaDoSite.Provider>
  );
};

// Hook para facilitar o uso do contexto
export const useTema = () => useContext(TemaDoSite);
