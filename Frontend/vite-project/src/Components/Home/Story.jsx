// Components/Story.jsx
import React from 'react';
import "../../css/story.css"; // certifique-se de que o caminho está correto

function Story({ stories }) {
  return (
    <div className="story-wrapper">
      {stories.length === 0 ? (
        <div className="story-empty">
          <p>Nenhum story disponível 😕</p>
        </div>
      ) : (
        <div className="story-container">
          {stories.map((story, index) => (
            <div
              key={index}
              className={`story-item ${story.visto ? 'visto' : 'nao-visto'}`}
            >
              <img
                src={story.imagem}
                alt="Foto do usuário"
                className="story-imagem"
              />
            </div>
          ))}<br/><br/><br/><br/>
        </div>
      )}
    </div>
  );
}

export default Story;
