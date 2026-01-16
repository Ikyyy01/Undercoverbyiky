import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

/* --- DATABASE KATA DENGAN KATEGORI --- */
const CATEGORIES = {
  UMUM: [
    { civ: "Pantai", und: "Pulau" }, { civ: "Gunung", und: "Bukit" },
    { civ: "Sekolah", und: "Kampus" }, { civ: "Gitar", und: "Bass" }
  ],
  TEKNOLOGI: [
    { civ: "Laptop", und: "Komputer" }, { civ: "Instagram", und: "TikTok" },
    { civ: "Android", und: "iPhone" }, { civ: "Wifi", und: "Hotspot" }
  ],
  MAKANAN: [
    { civ: "Nasi Goreng", und: "Mie Goreng" }, { civ: "Pizza", und: "Burger" },
    { civ: "Kopi", und: "Teh" }, { civ: "Sate", und: "Gulai" }
  ],
  SULIT: [
    { civ: "Cinta", und: "Sayang" }, { civ: "Sedih", und: "Kecewa" },
    { civ: "Pintar", und: "Cerdas" }, { civ: "Benci", und: "Dendam" }
  ]
};

/* --- AUDIO ENGINE (SYNTHESIZER) --- */
const playSound = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);

  const now = ctx.currentTime;
  if (type === "click") {
    osc.type = "sine"; osc.frequency.setValueAtTime(800, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(); osc.stop(now + 0.1);
  } else if (type === "flip") {
    osc.type = "triangle"; osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.2);
    gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(); osc.stop(now + 0.2);
  } else if (type === "win") {
    osc.type = "square";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(600, now + 0.1);
    osc.frequency.setValueAtTime(1000, now + 0.2);
    gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.start(); osc.stop(now + 0.6);
  } else if (type === "alert") {
    osc.type = "sawtooth"; osc.frequency.setValueAtTime(150, now);
    gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(); osc.stop(now + 0.3);
  }
};

/* --- HAPTIC ENGINE --- */
const vibrate = (pattern) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
};

export default function App() {
  // State Management
  const [step, setStep] = useState("setup");
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("UMUM");
  const [rolesCfg, setRolesCfg] = useState({ under: 1, white: 1 });
  const [gameData, setGameData] = useState([]);
  const [turn, setTurn] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isTimerRun, setIsTimerRun] = useState(false);
  const [winner, setWinner] = useState(null);
  const [eliminated, setEliminated] = useState(null);
  const [whiteGuess, setWhiteGuess] = useState("");
  const [leaderboard, setLeaderboard] = useState({});
  const [showLB, setShowLB] = useState(false);

  // Load Leaderboard
  useEffect(() => {
    try {
      const saved = localStorage.getItem("undercover_pro_lb");
      if (saved) setLeaderboard(JSON.parse(saved));
    } catch(e) {}
  }, []);

  // Timer Logic
  useEffect(() => {
    let int;
    if (isTimerRun && timer > 0) int = setInterval(() => setTimer(t => t - 1), 1000);
    else if (timer === 0) { setIsTimerRun(false); vibrate([500, 200, 500]); playSound("alert"); }
    return () => clearInterval(int);
  }, [isTimerRun, timer]);

  // Actions
  const addPlayer = () => {
    if (name.trim()) {
      setPlayers([...players, { id: Date.now(), name: name.trim(), score: leaderboard[name.trim()] || 0 }]);
      setName(""); playSound("click");
    }
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
    vibrate(50);
  };

  const startGame = () => {
    if (players.length < (rolesCfg.under + rolesCfg.white + 1)) {
      alert("Pemain kurang!"); return;
    }
    playSound("win");
    const words = CATEGORIES[category][Math.floor(Math.random() * CATEGORIES[category].length)];
    
    let pool = [];
    for(let i=0; i<rolesCfg.under; i++) pool.push({r:"Undercover", w:words.und});
    for(let i=0; i<rolesCfg.white; i++) pool.push({r:"Mr. White", w:null});
    while(pool.length < players.length) pool.push({r:"Civilian", w:words.civ});
    
    pool.sort(() => Math.random() - 0.5);
    
    setGameData(players.map((p, i) => ({ ...p, role: pool[i].r, word: pool[i].w, dead: false })));
    setTurn(0); setIsFlipped(false); setStep("distribute");
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playSound("flip");
    if (!isFlipped && gameData[turn].role !== "Civilian") vibrate(300); // Impostor gets haptic hint
  };

  const nextTurn = () => {
    setIsFlipped(false);
    if (turn < gameData.length - 1) {
      setTurn(t => t + 1);
    } else {
      setStep("voting");
      setTimer(60);
      setIsTimerRun(true);
    }
    playSound("click");
  };

  const eliminate = (id) => {
    vibrate([100, 50, 100]); playSound("alert");
    const updated = gameData.map(p => p.id === id ? { ...p, dead: true } : p);
    setGameData(updated);
    const target = updated.find(p => p.id === id);
    setEliminated(target);
  };

  const confirmElimination = () => {
    const role = eliminated.role;
    setEliminated(null);
    if (role === "Mr. White") setStep("white_guess");
    else checkWin(gameData);
  };

  const checkWin = (data) => {
    const alive = data.filter(p => !p.dead);
    const impostors = alive.filter(p => p.role !== "Civilian");
    
    if (impostors.length === 0) finishGame("Civilian");
    else if (alive.length <= 2) finishGame("Impostor");
  };

  const finishGame = (winRole) => {
    setWinner(winRole);
    setStep("end");
    playSound("win");
    
    // Update Leaderboard
    const newLB = { ...leaderboard };
    gameData.forEach(p => {
      const isWin = (winRole === "Civilian" && p.role === "Civilian") ||
                    (winRole === "Impostor" && p.role !== "Civilian") ||
                    (winRole === "Mr. White" && p.role === "Mr. White");
      if (isWin) newLB[p.name] = (newLB[p.name] || 0) + 1;
    });
    setLeaderboard(newLB);
    localStorage.setItem("undercover_pro_lb", JSON.stringify(newLB));
  };

  // UI COMPONENTS
  return (
    <div className="app-container">
      <div className="particles"></div>
      
      {/* HEADER */}
      <div className="header">
        <h1>UNDERCOVER <span>PRO</span></h1>
        {step === "setup" && <button className="icon-btn" onClick={() => setShowLB(!showLB)}>🏆</button>}
      </div>

      {/* SETUP PHASE */}
      {step === "setup" && (
        <div className="card glass-panel slide-up">
          {showLB ? (
            <div className="lb-panel">
              <h3>🏆 HALL OF FAME</h3>
              {Object.entries(leaderboard).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,s]) => (
                <div key={n} className="lb-row"><span>{n}</span><b>{s} Win</b></div>
              ))}
              <button className="btn secondary" onClick={() => setShowLB(false)}>Kembali</button>
            </div>
          ) : (
            <>
              <div className="input-group">
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Masukkan Nama..." />
                <button onClick={addPlayer}>TAMBAH</button>
              </div>
              
              <div className="chips-container">
                {players.map(p => (
                  <div key={p.id} className="chip" onClick={() => removePlayer(p.id)}>
                    {p.name} <span className="x-mark">×</span>
                  </div>
                ))}
              </div>

              <div className="settings-grid">
                <div className="setting-item">
                  <label>Topik</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)}>
                    {Object.keys(CATEGORIES).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="setting-item">
                  <label>😈 Undercover</label>
                  <div className="stepper">
                    <button onClick={()=>setRolesCfg(c=>({...c, under:Math.max(0,c.under-1)}))}>-</button>
                    <span>{rolesCfg.under}</span>
                    <button onClick={()=>setRolesCfg(c=>({...c, under:c.under+1}))}>+</button>
                  </div>
                </div>
                <div className="setting-item">
                  <label>👻 Mr. White</label>
                  <div className="stepper">
                    <button onClick={()=>setRolesCfg(c=>({...c, white:Math.max(0,c.white-1)}))}>-</button>
                    <span>{rolesCfg.white}</span>
                    <button onClick={()=>setRolesCfg(c=>({...c, white:c.white+1}))}>+</button>
                  </div>
                </div>
              </div>

              {players.length >= 3 && <button className="btn glow" onClick={startGame}>MULAI MISI</button>}
            </>
          )}
        </div>
      )}

      {/* DISTRIBUTE PHASE */}
      {step === "distribute" && (
        <div className="card glass-panel fade-in">
          <div className="distribute-header">
            <p>Giliran Agen</p>
            <h2>{gameData[turn].name}</h2>
          </div>
          
          <div className={`flip-card ${isFlipped ? "flipped" : ""}`} onClick={handleFlip}>
            <div className="flip-inner">
              <div className="flip-front">
                <span className="lock-icon">🔒</span>
                <p>TAP UNTUK BUKA</p>
              </div>
              <div className="flip-back">
                {gameData[turn].role === "Mr. White" ? (
                  <div className="role-reveal white">
                    <span className="role-icon">👻</span>
                    <h3>KAMU MR. WHITE</h3>
                    <p>Kamu tidak punya kata. Berbaurlah!</p>
                  </div>
                ) : (
                  <div className="role-reveal">
                    <p>Kata Rahasia:</p>
                    <h1>{gameData[turn].word}</h1>
                    <span className="mini-role">{gameData[turn].role}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isFlipped && <button className="btn" onClick={nextTurn}>SELESAI BACA</button>}
        </div>
      )}

      {/* VOTING PHASE */}
      {step === "voting" && (
        <div className="card glass-panel">
          <div className={`timer-box ${timer < 10 ? "danger" : ""}`}>
            {timer}s
          </div>
          <h3>SIAPA PENGKHIANAT?</h3>
          <div className="vote-list">
            {gameData.map(p => (
              <button key={p.id} disabled={p.dead} className={`vote-item ${p.dead ? "dead" : ""}`} onClick={() => eliminate(p.id)}>
                <span className="avatar">{p.name[0]}</span>
                <span className="name">{p.name}</span>
                {p.dead && <span className="skull">💀</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ELIMINATION REVEAL */}
      {eliminated && (
        <div className="overlay">
          <div className="modal zoom-in">
            <h2>TERELIMINASI</h2>
            <div className="elim-avatar">{eliminated.name[0]}</div>
            <h1>{eliminated.name}</h1>
            <div className="badge">{eliminated.role}</div>
            {eliminated.role !== "Mr. White" && <p>Kata: <b>{eliminated.word}</b></p>}
            <button className="btn" onClick={confirmElimination}>
              {eliminated.role === "Mr. White" ? "MR. WHITE MENEBAK!" : "LANJUTKAN"}
            </button>
          </div>
        </div>
      )}

      {/* MR WHITE GUESS */}
      {step === "white_guess" && (
        <div className="card glass-panel">
          <h2>👻 TEBAKAN TERAKHIR</h2>
          <p>Mr. White, tebak kata Civilian untuk mencuri kemenangan!</p>
          <input className="big-input" value={whiteGuess} onChange={e=>setWhiteGuess(e.target.value)} placeholder="Tebak kata..." />
          <button className="btn glow" onClick={() => {
            const civWord = gameData.find(p => p.role === "Civilian").word;
            if (whiteGuess.toLowerCase() === civWord.toLowerCase()) finishGame("Mr. White");
            else { alert("SALAH!"); setStep("voting"); checkWin(gameData); }
          }}>TEMBAK!</button>
        </div>
      )}

      {/* END GAME */}
      {step === "end" && (
        <div className="card glass-panel winner-scene">
          <h1>GAME OVER</h1>
          <div className="winner-badge">
            <span className="trophy">🏆</span>
            <h2>{winner} MENANG</h2>
          </div>
          <button className="btn glow" onClick={() => setStep("setup")}>MAIN LAGI</button>
        </div>
      )}
    </div>
  );
}
