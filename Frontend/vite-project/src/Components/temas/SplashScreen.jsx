import React from 'react';

export default function SplashScreen() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      backgroundColor: '#fff',  // fundo branco limpo
      color: '#262626',         // cor cinza escuro padrão Instagram
      fontFamily: "'Roboto', 'Helvetica Neue', Arial, sans-serif",
      textAlign: 'center',
      padding: 20,
    }}>
      <img 
        src="https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/imagens-usuarios/perfil/LogoParadise.svg" 
        alt="Logo Paradise" 
        style={{ 
          width: 100, 
          marginBottom: 24, 
          filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.1))' 
        }} 
      />
      <h1 style={{ fontWeight: 600, fontSize: 28, margin: 0 }}>Paradise</h1>
      <h2 style={{ fontWeight: 400, fontSize: 16, margin: '8px 0 0' }}>Olicorp Innovations</h2>
      <p style={{ fontWeight: 300, fontSize: 14, marginTop: 12, color: '#999' }}>
        Conectando pessoas com tecnologia inteligente.
      </p>
    </div>
  );
}
