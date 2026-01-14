import React from "react";

export default function Reveal({ player, onNext }) {
  return (
    <div className="screen gradient fade-in">
      <h2>{player.name}</h2>

      <div className="card">
        {player.word ? (
          <h1>{player.word}</h1>
        ) : (
          <>
            <h1>❓</h1>
            <p>Kamu tidak mendapat kata</p>
          </>
        )}
      </div>

      <p>Pastikan hanya kamu yang melihat layar</p>

      <button onClick={onNext}>LANJUT</button>
    </div>
  );
}
