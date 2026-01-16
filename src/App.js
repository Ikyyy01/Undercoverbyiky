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
  const [eliminatedInfo, setEliminatedInfo] = useState(null);
  const [mrWhiteGuess, setMrWhiteGuess] = useState("");
  const [leaderboard, setLeaderboard] = useState({});

  // LOAD LEADERBOARD DARI LOCAL STORAGE
  useEffect(() => {
    const savedStats = localStorage.getItem("undercover_stats");
    if (savedStats) setLeaderboard(JSON.parse(savedStats));
  }, []);

  // SISTEM SUARA (WEB AUDIO)
  const playSfx = (type) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);

    if (type === "ding") { // Suara saat kartu dibuka
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === "tick") { // Suara voting
      osc.type = "square";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    } else if (type === "boom") { // Suara eliminasi
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    }
  };

  // HAPTIC FEEDBACK
  const vibrate = (pattern) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const updateStats = (winningRole) => {
    const newStats = { ...leaderboard };
    gameData.forEach(p => {
      if (!newStats[p.name]) newStats[p.name] = 0;
      // Jika role-nya cocok dengan pemenang, tambah poin
      if (p.role.includes(winningRole) || (winningRole === "Impostor" && (p.role === "Undercover" || p.role === "Mr. White"))) {
        newStats[p.name] += 1;
      }
    });
    setLeaderboard(newStats);
    localStorage.setItem("undercover_stats", JSON.stringify(newStats));
  };

  const addPlayer = () => {
    if (name.trim()) {
      setPlayers([...players, { id: Date.now(), name: name.trim() }]);
      setName("");
      playSfx("ding");
    }
  };

  const startGame = () => {
    const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
    let rolesPool = [];
    for (let i = 0; i < countUndercover; i++) rolesPool.push({ role: "Undercover", word: pair.undercover });
    for (let i = 0; i < countMrWhite; i++) rolesPool.push({ role: "Mr. White", word: "???" });
    const civCount = players.length - rolesPool.length;
    for (let i = 0; i < civCount; i++) rolesPool.push({ role: "Civilian", word: pair.civilian });

    const shuffled = rolesPool.sort(() => Math.random() - 0.5);
    setGameData(players.map((p, i) => ({ ...p, ...shuffled[i], eliminated: false })));
    setStep("distribute");
    setCurrentPlayerIdx(0);
  };

  const handleEliminate = (id) => {
    playSfx("boom");
    vibrate([200, 100, 200]);
    const updated = gameData.map(p => p.id === id ? { ...p, eliminated: true } : p);
    setEliminatedInfo(updated.find(p => p.id === id));
    setGameData(updated);
  };

  const finalizeWinner = (roleName) => {
    setWinner(roleName);
    updateStats(roleName);
    setStep("end");
  };

  return (
    <div className="container">
      {step === "setup" && (
        <div className="glass-card">
          <h1 className="title">🕵️ Undercover</h1>
          
          <div className="input-box">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Player..." />
            <button className="btn-add" onClick={addPlayer}>+</button>
          </div>

          <div className="player-grid">
            {players.map(p => <div key={p.id} className="player-tag">{p.name}</div>)}
          </div>

          <div className="role-settings">
            <div className="role-control">
              <span>😈 Undercover: {countUndercover}</span>
              <div className="counter">
                <button onClick={() => setCountUndercover(Math.max(1, countUndercover - 1))}>-</button>
                <button onClick={() => setCountUndercover(countUndercover + 1)}>+</button>
              </div>
            </div>
            <div className="role-control">
              <span>⚪ Mr. White: {countMrWhite}</span>
              <div className="counter">
                <button onClick={() => setCountMrWhite(Math.max(0, countMrWhite - 1))}>-</button>
                <button onClick={() => setCountMrWhite(countMrWhite + 1)}>+</button>
              </div>
            </div>
          </div>

          {/* LEADERBOARD MINI */}
          {Object.keys(leaderboard).length > 0 && (
            <div className="leaderboard-section">
              <h4>🏆 Sesi Leaderboard</h4>
              {Object.entries(leaderboard).sort((a,b) => b[1] - a[1]).slice(0, 3).map(([n, s]) => (
                <div key={n} className="lb-row"><span>{n}</span> <span>{s} Win</span></div>
              ))}
            </div>
          )}

          {players.length >= 3 && <button className="btn-main" onClick={startGame}>Mulai Game</button>}
        </div>
      )}

      {step === "distribute" && (
        <div className="glass-card center">
          <p>Oper ke:</p>
          <h2 className="highlight">{gameData[currentPlayerIdx]?.name}</h2>
          <div className={`secret-box ${isWordVisible ? "active" : ""}`} onClick={() => { 
            setIsWordVisible(!isWordVisible); 
            playSfx("ding");
            if (!isWordVisible && (gameData[currentPlayerIdx].role !== "Civilian")) vibrate(400); // Getar panjang buat impostor
          }}>
            {isWordVisible ? <h3>{gameData[currentPlayerIdx]?.word}</h3> : <p>Tap Kartu</p>}
          </div>
          {isWordVisible && (
            <button className="btn-main" onClick={() => {
              setIsWordVisible(false);
              vibrate(50); // Getar pendek tiap pindah
              if (currentPlayerIdx < gameData.length - 1) setCurrentPlayerIdx(c => c + 1);
              else setStep("voting");
            }}>Lanjut</button>
          )}
        </div>
      )}

      {step === "voting" && (
        <div className="glass-card">
          <h2 className="center">Siapa Pengkhianatnya?</h2>
          <div className="vote-grid">
            {gameData.map(p => (
              <button key={p.id} disabled={p.eliminated} className={`vote-btn ${p.eliminated ? 'dead' : ''}`} onClick={() => { playSfx("tick"); handleEliminate(p.id); }}>
                {p.name} {p.eliminated && "💀"}
              </button>
            ))}
          </div>
        </div>
      )}

      {eliminatedInfo && (
        <div className="modal-overlay">
          <div className="glass-card center modal-content">
            <h3>HASIL VOTING</h3>
            <h1 className="name-reveal">{eliminatedInfo.name}</h1>
            <div className="role-badge">{eliminatedInfo.role}</div>
            <button className="btn-main" onClick={() => {
              const role = eliminatedInfo.role;
              setEliminatedInfo(null);
              if (role === "Mr. White") setStep("mrwhite_guess");
              else {
                const active = gameData.filter(p => !p.eliminated);
                const imp = active.filter(p => p.role !== "Civilian");
                if (imp.length === 0) finalizeWinner("Civilian");
                else if (active.length <= 2) finalizeWinner("Impostor");
              }
            }}>Lanjut</button>
          </div>
        </div>
      )}

      {step === "mrwhite_guess" && (
        <div className="glass-card center">
          <h2>😈 Mr. White Guess!</h2>
          <input className="input-full" onChange={(e) => setMrWhiteGuess(e.target.value)} placeholder="Tebak kata..." />
          <button className="btn-main" onClick={() => {
             const civWord = gameData.find(p => p.role === "Civilian").word;
             if (mrWhiteGuess.toLowerCase() === civWord.toLowerCase()) finalizeWinner("Mr. White");
             else setStep("voting");
          }}>Konfirmasi Tebakan</button>
        </div>
      )}

      {step === "end" && (
        <div className="glass-card center">
          <h1 className="title">🏆 SELESAI</h1>
          <h2 className="winner-text">{winner} MENANG!</h2>
          <button className="btn-main" onClick={() => setStep("setup")}>Main Lagi</button>
          <button className="btn-secondary" onClick={() => { localStorage.clear(); setLeaderboard({}); }}>Reset Skor</button>
        </div>
      )}
    </div>
  );
}
