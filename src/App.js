import React, { useState } from "react";
import "./App.css";

const WORD_PAIRS = [
  { civilian: "Pantai", undercover: "Pulau" },
  { civilian: "Gunung", undercover: "Bukit" },
  { civilian: "Sekolah", undercover: "Kampus" },
  { civilian: "Guru", undercover: "Dosen" },
  { civilian: "Kucing", undercover: "Harimau" },
  { civilian: "Anjing", undercover: "Serigala" },
  { civilian: "Mobil", undercover: "Motor" },
  { civilian: "Bus", undercover: "Kereta" },
  { civilian: "Pesawat", undercover: "Helikopter" },
  { civilian: "Bandara", undercover: "Pelabuhan" },
  { civilian: "Dokter", undercover: "Perawat" },
  { civilian: "Rumah Sakit", undercover: "Klinik" },
  { civilian: "Obat", undercover: "Vitamin" },
  { civilian: "Laptop", undercover: "Komputer" },
  { civilian: "Keyboard", undercover: "Mouse" },
  { civilian: "Monitor", undercover: "Televisi" },
  { civilian: "Internet", undercover: "WiFi" },
  { civilian: "Website", undercover: "Aplikasi" },
  { civilian: "Instagram", undercover: "TikTok" },
  { civilian: "YouTube", undercover: "Netflix" },
  { civilian: "Film", undercover: "Series" },
  { civilian: "Aktor", undercover: "Aktris" },
  { civilian: "Musik", undercover: "Lagu" },
  { civilian: "Gitar", undercover: "Bass" },
  { civilian: "Drum", undercover: "Keyboard" },
  { civilian: "Konser", undercover: "Festival" },
  { civilian: "Pizza", undercover: "Burger" },
  { civilian: "Nasi Goreng", undercover: "Mie Goreng" },
  { civilian: "Bakso", undercover: "Soto" },
  { civilian: "Rendang", undercover: "Gulai" },
  { civilian: "Sate", undercover: "Tongseng" },
  { civilian: "Kopi", undercover: "Teh" },
  { civilian: "Latte", undercover: "Cappuccino" },
  { civilian: "Sarapan", undercover: "Makan Siang" },
  { civilian: "Tidur", undercover: "Istirahat" },
  { civilian: "Liburan", undercover: "Cuti" },
  { civilian: "Hotel", undercover: "Villa" },
  { civilian: "Mall", undercover: "Pasar" },
  { civilian: "Belanja", undercover: "Shopping" },
  { civilian: "Uang", undercover: "Saldo" },
  { civilian: "Dompet", undercover: "E-Wallet" },
  { civilian: "ATM", undercover: "Mobile Banking" },
  { civilian: "Game", undercover: "E-Sport" },
  { civilian: "Console", undercover: "PC" },
  { civilian: "Mobile Game", undercover: "Game Online" }
];


export default function App() {
  const [step, setStep] = useState("setup"); 
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [countUndercover, setCountUndercover] = useState(1);
  const [countMrWhite, setCountMrWhite] = useState(1);
  const [gameData, setGameData] = useState([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [isWordVisible, setIsWordVisible] = useState(false);
  const [winner, setWinner] = useState(null);
  const [mrWhiteGuess, setMrWhiteGuess] = useState("");
  const [eliminatedInfo, setEliminatedInfo] = useState(null);

  const addPlayer = () => {
    if (name.trim() && players.length < 15) {
      setPlayers([...players, { id: Date.now(), name: name.trim() }]);
      setName("");
    }
  };

  const startGame = () => {
    if (players.length < (countUndercover + countMrWhite + 1)) {
      alert("Pemain kurang! Tambahkan pemain atau kurangi role jahat.");
      return;
    }

    const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
    let rolesPool = [];

    for (let i = 0; i < countUndercover; i++) rolesPool.push({ role: "Undercover", word: pair.undercover });
    for (let i = 0; i < countMrWhite; i++) rolesPool.push({ role: "Mr. White", word: "???" });
    
    const civilianCount = players.length - rolesPool.length;
    for (let i = 0; i < civilianCount; i++) rolesPool.push({ role: "Civilian", word: pair.civilian });

    rolesPool = rolesPool.sort(() => Math.random() - 0.5);

    const data = players.map((p, index) => ({
      ...p,
      ...rolesPool[index],
      eliminated: false
    }));

    setGameData(data);
    setCurrentPlayerIdx(0);
    setIsWordVisible(false);
    setWinner(null);
    setStep("distribute");
  };

  const handleEliminate = (id) => {
    const updated = gameData.map(p => p.id === id ? { ...p, eliminated: true } : p);
    const target = updated.find(p => p.id === id);
    setGameData(updated);
    setEliminatedInfo(target);
    if (window.navigator.vibrate) window.navigator.vibrate(200);
  };

  const closeEliminatedModal = () => {
    const role = eliminatedInfo.role;
    setEliminatedInfo(null);

    // Jika Mr. White yang keluar, dia diberi kesempatan tebak dulu
    if (role === "Mr. White") {
      setStep("mrwhite_guess");
    } else {
      checkWinner(gameData);
    }
  };

  const handleMrWhiteGuess = () => {
    const civWord = gameData.find(p => p.role === "Civilian").word;
    
    if (mrWhiteGuess.toLowerCase() === civWord.toLowerCase()) {
      // Jika tebakan BENAR, Mr. White langsung menang
      setWinner("Mr. White Menang! 😈 (Tebakan Benar)");
      setStep("end");
    } else {
      // Jika tebakan SALAH, game lanjut untuk cari impostor sisa
      alert("Tebakan Mr. White SALAH! Game berlanjut...");
      setMrWhiteGuess("");
      setStep("voting");
      checkWinner(gameData);
    }
  };

  const checkWinner = (currentData) => {
    const active = currentData.filter(p => !p.eliminated);
    const impostors = active.filter(p => p.role === "Undercover" || p.role === "Mr. White");
    
    if (impostors.length === 0) {
      setWinner("Civilian Menang! 🎉");
      setStep("end");
    } else if (active.length <= 2) {
      // Jika sisa 2 orang dan masih ada impostor, impostor menang
      setWinner("Impostor Menang! 😈");
      setStep("end");
    }
  };

  // Fungsi main lagi tanpa hapus pemain
  const playAgain = () => {
    setWinner(null);
    setGameData([]);
    setStep("setup");
  };

  return (
    <div className="container">
      {/* 1. SETUP */}
      {step === "setup" && (
        <div className="glass-card">
          <h1 className="title">🕵️ Undercover</h1>
          <div className="input-box">
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Nama Player..." 
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            />
            <button onClick={addPlayer} className="btn-add">+</button>
          </div>
          <div className="player-grid">
            {players.map(p => (
              <div key={p.id} className="player-tag">
                {p.name} 
                <span onClick={() => setPlayers(players.filter(pl => pl.id !== p.id))} style={{marginLeft: '8px', color: '#ef4444'}}>×</span>
              </div>
            ))}
          </div>
          <div className="role-settings">
             <div className="role-control">
                <span>😈 Undercover</span>
                <div className="counter">
                  <button onClick={() => setCountUndercover(Math.max(1, countUndercover - 1))}>-</button>
                  <span className="count-val">{countUndercover}</span>
                  <button onClick={() => setCountUndercover(countUndercover + 1)}>+</button>
                </div>
             </div>
             <div className="role-control">
                <span>⚪ Mr. White</span>
                <div className="counter">
                  <button onClick={() => setCountMrWhite(Math.max(0, countMrWhite - 1))}>-</button>
                  <span className="count-val">{countMrWhite}</span>
                  <button onClick={() => setCountMrWhite(countMrWhite + 1)}>+</button>
                </div>
             </div>
          </div>
          {players.length >= 3 && <button className="btn-main" onClick={startGame}>Mulai Game</button>}
        </div>
      )}

      {/* 2. DISTRIBUTE */}
      {step === "distribute" && (
        <div className="glass-card center">
          <p>Oper HP ke:</p>
          <h2 className="highlight">{gameData[currentPlayerIdx]?.name}</h2>
          <div className={`secret-box ${isWordVisible ? "active" : ""}`} onClick={() => setIsWordVisible(!isWordVisible)}>
            {isWordVisible ? <h3>{gameData[currentPlayerIdx]?.word}</h3> : <p>Tap untuk lihat kata</p>}
          </div>
          {isWordVisible && (
            <button className="btn-main" onClick={() => {
              setIsWordVisible(false);
              if (currentPlayerIdx < gameData.length - 1) setCurrentPlayerIdx(c => c + 1);
              else setStep("voting");
            }}>OK, Lanjut!</button>
          )}
        </div>
      )}

      {/* 3. VOTING */}
      {step === "voting" && (
        <div className="glass-card">
          <h2 className="center">🗳️ Siapa Undercover?</h2>
          <div className="vote-grid">
            {gameData.map(p => (
              <button 
                key={p.id} 
                disabled={p.eliminated} 
                className={`vote-btn ${p.eliminated ? "dead" : ""}`} 
                onClick={() => handleEliminate(p.id)}
              >
                {p.name} {p.eliminated && "💀"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. MODAL ELIMINASI */}
      {eliminatedInfo && (
        <div className="modal-overlay">
          <div className="glass-card center modal-content">
            <h3 style={{color: '#ef4444', margin: 0}}>TERELIMINASI</h3>
            <h1 className="name-reveal">{eliminatedInfo.name}</h1>
            <p>Perannya adalah:</p>
            <div className="role-badge">{eliminatedInfo.role}</div>
            <button className="btn-main" onClick={closeEliminatedModal}>OK</button>
          </div>
        </div>
      )}

      {/* 5. MR WHITE GUESS */}
      {step === "mrwhite_guess" && (
        <div className="glass-card center">
          <h2>😈 Mr. White Menebak!</h2>
          <p>Jika salah, game berlanjut...</p>
          <input 
            className="input-full" 
            value={mrWhiteGuess}
            onChange={(e) => setMrWhiteGuess(e.target.value)} 
            placeholder="Ketik kata civilian..." 
          />
          <button className="btn-main" onClick={handleMrWhiteGuess}>Konfirmasi</button>
        </div>
      )}

      {/* 6. END */}
      {step === "end" && (
        <div className="glass-card center">
          <h1 className="title">GAME OVER</h1>
          <h2 className="winner-text">{winner}</h2>
          <button className="btn-main" onClick={playAgain}>Main Lagi (Nama Tetap)</button>
          <button className="btn-main" style={{background: 'none', border: '1px solid var(--border)', marginTop: '10px'}} onClick={() => window.location.reload()}>Reset Semua</button>
        </div>
      )}
    </div>
  );
}