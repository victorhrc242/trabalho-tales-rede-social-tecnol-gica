import React from 'react';

const PoliticaDeCookies = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" role="dialog" aria-modal="true">
        <h2>Política de Cookies</h2>

        <p>
          A <strong>Paradise</strong> utiliza cookies e tecnologias semelhantes para melhorar sua experiência na plataforma,
          personalizar conteúdos e entender melhor o comportamento dos usuários.
        </p>

        <h3>1. O que são Cookies?</h3>
        <p>
          Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você acessa a plataforma.
          Eles permitem que o site reconheça seu navegador em visitas futuras.
        </p>

        <h3>2. Por que usamos Cookies?</h3>
        <ul>
          <li>Para manter você logado de forma segura;</li>
          <li>Para lembrar suas preferências e configurações;</li>
          <li>Para analisar como você interage com o conteúdo (comportamento de uso);</li>
          <li>Para otimizar performance e corrigir problemas técnicos.</li>
        </ul>

        <h3>3. Tipos de Cookies que Utilizamos</h3>
        <ul>
          <li><strong>Essenciais:</strong> Necessários para funcionamento básico da Paradise;</li>
          <li><strong>De desempenho:</strong> Ajudam a entender o uso da plataforma e melhorar o desempenho;</li>
          <li><strong>De funcionalidade:</strong> Guardam preferências como idioma, tema, etc.</li>
        </ul>

        <h3>4. Gerenciamento de Cookies</h3>
        <p>
          Você pode controlar e/ou excluir cookies a qualquer momento nas configurações do seu navegador.
          No entanto, desabilitar cookies essenciais pode afetar o funcionamento da plataforma.
        </p>

        <p><strong>Última atualização:</strong> 25 de julho de 2025</p>

        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default PoliticaDeCookies;
