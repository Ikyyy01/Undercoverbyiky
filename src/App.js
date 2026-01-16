import React, { useState, useEffect } from "react";
import "./App.css";

/* --- 1. DATABASE KATA RAKSASA (SAMPEL BESAR) --- */
const RAW_WORDS = [
  ["Pantai", "Pulau"], ["Gunung", "Bukit"], ["Sekolah", "Kampus"], ["Gitar", "Bass"],
  ["Sendok", "Garpu"], ["Sepatu", "Sandal"], ["Nasi Goreng", "Mie Goreng"], ["Pizza", "Burger"],
  ["Susu", "Yoghurt"], ["Sate", "Gulai"], ["Korupsi", "Mencuri"], ["Polisi", "Satpam"],
  ["Presiden", "Raja"], ["Alien", "Hantu"], ["Laptop", "Komputer"], ["Instagram", "TikTok"],
  ["Emas", "Perak"], ["Matahari", "Bulan"], ["Singa", "Macan"], ["Kucing", "Anjing"],
  ["Sepak Bola", "Futsal"], ["Basket", "Voli"], ["Renang", "Menyelam"], ["Mobil", "Motor"],
  ["Pesawat", "Helikopter"], ["Kereta", "Bus"], ["Hotel", "Apartemen"], ["Rumah", "Kost"],
  ["Dokter", "Perawat"], ["Guru", "Dosen"], ["Pilot", "Masinis"], ["Tentara", "Polisi"],
  ["Kopi", "Teh"], ["Gula", "Garam"], ["Merica", "Ketumbar"], ["Bawang Merah", "Bawang Putih"],
  ["Apel", "Jeruk"], ["Mangga", "Nanas"], ["Durian", "Nangka"], ["Semangka", "Melon"],
  ["Buku", "Komik"], ["Novel", "Majalah"], ["Pulpen", "Pensil"], ["Spidol", "Krayon"],
  ["Meja", "Kursi"], ["Kasur", "Sofa"], ["Pintu", "Jendela"], ["Lantai", "Dinding"],
  ["Jam Tangan", "Gelang"], ["Cincin", "Kalung"], ["Topi", "Helm"], ["Jaket", "Sweater"],
  ["Hujan", "Salju"], ["Petir", "Guntur"], ["Angin", "Badai"], ["Panas", "Dingin"],
  ["Surga", "Neraka"], ["Malaikat", "Iblis"], ["Cinta", "Sayang"], ["Benci", "Dendam"],
  ["Senyum", "Tawa"], ["Tangis", "Sedih"], ["Marah", "Kesal"], ["Takut", "Cemas"],
  ["Jalan", "Lari"], ["Duduk", "Berdiri"], ["Tidur", "Bangun"], ["Makan", "Minum"],
  ["Facebook", "Twitter"], ["Whatsapp", "Telegram"], ["Youtube", "Netflix"], ["Spotify", "Joox"],
  ["Windows", "Mac OS"], ["Android", "iOS"], ["Google", "Yahoo"], ["Chrome", "Firefox"],
  ["Batman", "Superman"], ["Iron Man", "Captain America"], ["Naruto", "Sasuke"], ["Goku", "Vegeta"],
  ["Doraemon", "Nobita"], ["Spongebob", "Patrick"], ["Tom", "Jerry"], ["Mickey", "Donald"],
  ["Jakarta", "Bandung"], ["Bali", "Lombok"], ["Jepang", "Korea"], ["Amerika", "Inggris"],
  ["China", "Jepang"], ["Eropa", "Asia"], ["Bumi", "Mars"], ["Bintang", "Planet"],
  ["Air", "Api"], ["Tanah", "Udara"], ["Kayu", "Batu"], ["Besi", "Baja"],
  ["Uang", "Kartu Kredit"], ["Dompet", "Tas"], ["Kunci", "Gembok"], ["Paku", "Palu"],
  ["Gunting", "Pisau"], ["Obeng", "Tang"], ["Kertas", "Plastik"], ["Botol", "Gelas"]
];

/* --- AUDIO ENGINE --- */
const playSound = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);

  const now = ctx.currentTime;
  if (type === "click") {
    osc.type = "sine"; osc.frequency.setValueAtTime(600, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(); osc.stop(now + 0.1);
  } else if (type === "scan") {
    osc.type = "sawtooth"; 
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(1000, now + 0.5);
    gain.gain.setValueAtTime(0.05, now); 
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    osc.start(); osc.stop(now + 0.5);
  } else if (type === "glitch") {
    osc.type = "square";
    osc.frequency.setValueAtTime(50, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.1);
    osc.frequency.linearRampToValueAtTime(50, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(); osc.stop(now + 0.3);
  } else if (type === "win") {
    osc.type = "triangle"; osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
    osc.start(); osc.stop(now + 1);
  }
};

const vibrate = (pattern) => { if (navigator.vibrate) navigator.vibrate(pattern); };

export default function App() {
  const [step, setStep] = useState("setup");
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [rolesCfg, setRolesCfg] = useState({ under: 1, white: 1 });
  
  const [gameData, setGameData] = useState([]);
  const [viewingPlayer, setViewingPlayer] = useState(null); 
  const [isRevealing, setIsRevealing] = useState(false);
  const [seenCount, setSeenCount] = useState(0); 
  
  const [timer, setTimer] = useState(60);
  const [isTimerRun, setIsTimerRun] = useState(false);
  
  const [eliminated, setEliminated] = useState(null);
  const [winner, setWinner] = useState(null);
  const [whiteGuess, setWhiteGuess] = useState("");

  // Load Leaderboard (Supaya tidak error di Vercel jika kosong)
  const [leaderboard, setLeaderboard] = useState({});
  useEffect(() => {
    try {
      const saved = localStorage.getItem("undercover_stats");
      if (saved) setLeaderboard(JSON.parse(saved));
    } catch(e) {}
  }, []);

  // Timer Logic
  useEffect(() => {
    let int;
    if (isTimerRun && timer > 0) int = setInterval(() => setTimer(t => t - 1), 1000);
    else if (timer === 0) { setIsTimerRun(false); vibrate([500,500]); }
    return () => clearInterval(int);
  }, [isTimerRun, timer]);

  const addPlayer = () => {
    if (name.trim()) {
      setPlayers([...players, { id: Date.now(), name: name.trim() }]);
      setName(""); playSound("click");
    }
  };

  const removePlayer = (id) => setPlayers(players.filter(p => p.id !== id));

  const startGame = () => {
    if (players.length < (rolesCfg.under + rolesCfg.white + 1)) return alert("Pemain kurang!");
    
    const randomPair = RAW_WORDS[Math.floor(Math.random() * RAW_WORDS.length)];
    const isFlip = Math.random() > 0.5;
    const civWord = isFlip ? randomPair[0] : randomPair[1];
    const undWord = isFlip ? randomPair[1] : randomPair[0];

    let pool = [];
    for(let i=0; i<rolesCfg.under; i++) pool.push({r:"Undercover", w:undWord});
    for(let i=0; i<rolesCfg.white; i++) pool.push({r:"Mr. White", w:null});
    while(pool.length < players.length) pool.push({r:"Civilian", w:civWord});
    
    pool.sort(() => Math.random() - 0.5);
    
    setGameData(players.map((p, i) => ({ 
      ...p, role: pool[i].r, word: pool[i].w, dead: false, seen: false 
    })));
    setSeenCount(0);
    setStep("distribute");
    playSound("win");
  };

  // --- LOGIC DISTRIBUSI KARTU (GRID SYSTEM) ---
  const openCard = (player) => {
    setViewingPlayer(player);
    setIsRevealing(false); 
    playSound("click");
  };

  const scanIdentity = () => {
    setIsRevealing(true);
    if (viewingPlayer.role === "Mr. White") {
      playSound("glitch");
      vibrate([50, 50, 50, 50, 200]); 
    } else {
      playSound("scan");
      vibrate(100);
    }
  };

  const closeCard = () => {
    const updated = gameData.map(p => p.id === viewingPlayer.id ? { ...p, seen: true } : p);
    setGameData(updated);
    setSeenCount(c => c + 1);
    setViewingPlayer(null);
    
    if (seenCount + 1 === gameData.length) {
      setTimeout(() => {
        setStep("voting");
        setTimer(60);
        setIsTimerRun(true);
      }, 500);
    }
  };

  const eliminate = (id) => {
    const updated = gameData.map(p => p.id === id ? { ...p, dead: true } : p);
    setGameData(updated);
    setEliminated(updated.find(p => p.id === id));
    playSound("glitch");
    vibrate(300);
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
    if (impostors.length === 0) finish("Civilian");
    else if (alive.length <= 2) finish("Impostor");
  };

  const finish = (winRole) => {
    setWinner(winRole);
    setStep("end");
    playSound("win");
    const newLB = { ...leaderboard };
    gameData.forEach(p => {
      const isWin = (winRole === "Civilian" && p.role === "Civilian") ||
                    (winRole === "Impostor" && p.role !== "Civilian") ||
                    (winRole === "Mr. White" && p.role === "Mr. White");
      if (isWin) newLB[p.name] = (newLB[p.name] || 0) + 1;
    });
    setLeaderboard(newLB);
    localStorage.setItem("undercover_stats", JSON.stringify(newLB));
  };

  return (
    <div className="app-container">
      <div className="scanlines"></div>
      
      {/* HEADER SIMPEL */}
      {step !== "distribute" && step !== "voting" && (
        <div className="header">
          <h1>UNDERCOVER</h1>
        </div>
      )}

      {/* 1. SETUP */}
      {step === "setup" && (
        <div className="card glass-panel slide-up">
          <div className="input-group">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama Agen..." />
            <button className="btn-icon" onClick={addPlayer}>+</button>
          </div>

          <div className="chips-container">
            {players.map(p => (
              <div key={p.id} className="chip" onClick={() => removePlayer(p.id)}>
                {p.name} <span className="x-mark">×</span>
              </div>
            ))}
          </div>

          <div className="settings-box">
            <div className="row">
              <label>😈 Undercover</label>
              <div className="counter">
                <button onClick={()=>setRolesCfg(c=>({...c, under:Math.max(0,c.under-1)}))}>-</button>
                <span>{rolesCfg.under}</span>
                <button onClick={()=>setRolesCfg(c=>({...c, under:c.under+1}))}>+</button>
              </div>
            </div>
            <div className="row">
              <label>👻 Mr. White</label>
              <div className="counter">
                <button onClick={()=>setRolesCfg(c=>({...c, white:Math.max(0,c.white-1)}))}>-</button>
                <span>{rolesCfg.white}</span>
                <button onClick={()=>setRolesCfg(c=>({...c, white:c.white+1}))}>+</button>
              </div>
            </div>
          </div>

          {players.length >= 3 && <button className="btn glow" onClick={startGame}>MULAI MISI</button>}
        </div>
      )}

      {/* 2. DISTRIBUTE (GRID MENU - PILIH KARTU SENDIRI) */}
      {step === "distribute" && !viewingPlayer && (
        <div className="card glass-panel fade-in">
          <h2 className="text-center" style={{color:'var(--accent)'}}>IDENTIFIKASI DIRI</h2>
          <p className="text-center sub">Pilih nama anda untuk mengambil data rahasia</p>
          <div className="card-grid">
            {gameData.map(p => (
              <button key={p.id} disabled={p.seen} className={`card-item ${p.seen ? 'seen' : ''}`} onClick={() => openCard(p)}>
                {p.seen ? "🔒 DATA DIAMBIL" : p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2.5 REVEAL CARD (ANIMASI SCANNING) */}
      {step === "distribute" && viewingPlayer && (
        <div className="overlay">
          <div className="scanner-container">
            {!isRevealing ? (
              <div className="scanner-idle" onClick={scanIdentity}>
                 <div className="fingerprint"></div>
                 <p>SENTUH UNTUK SCAN IDENTITAS</p>
                 <h2>{viewingPlayer.name}</h2>
              </div>
            ) : (
              <div className={`scanner-result ${viewingPlayer.role === 'Mr. White' ? 'glitch-border' : ''}`}>
                
                {viewingPlayer.role === "Mr. White" ? (
                  <div className="result-content white-mode">
                    <h1 className="glitch-text" data-text="MR. WHITE">MR. WHITE</h1>
                    <p>ANDA TIDAK MEMILIKI KATA RAHASIA</p>
                    <small>Berbaurlah, jangan sampai ketahuan.</small>
                  </div>
                ) : (
                  <div className="result-content">
                    <p className="label">KATA KUNCI ANDA:</p>
                    <h1 className="secret-word">{viewingPlayer.word}</h1>
                    <div className="warning-box">
                      ⚠️ Jangan ucapkan kata ini secara langsung.
                    </div>
                  </div>
                )}
                
                <button className="btn small" onClick={closeCard}>TUTUP AKSES</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. VOTING */}
      {step === "voting" && (
        <div className="card glass-panel">
          <div className={`timer-box ${timer < 10 ? 'danger' : ''}`}>{timer}</div>
          <h2 className="text-center">ELIMINASI AGEN</h2>
          <div className="vote-list">
            {gameData.map(p => (
              <button key={p.id} disabled={p.dead} className={`vote-item ${p.dead ? 'dead' : ''}`} onClick={() => eliminate(p.id)}>
                <div className="avt">{p.name[0]}</div>
                <span>{p.name}</span>
                {/* FIX: Emoji harus dalam tanda kutip string */}
                {p.dead && "💀"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. RESULT ELIMINATION */}
      {eliminated && (
        <div className="overlay">
          <div className="modal zoom-in">
            <h2 className="danger-text">STATUS: TERMINATED</h2>
            <h1>{eliminated.name}</h1>
            <div className="reveal-badge">{eliminated.role}</div>
            {eliminated.role !== "Mr. White" && <p>Kata: <b>{eliminated.word}</b></p>}
            <button className="btn" onClick={confirmElimination}>LANJUTKAN</button>
          </div>
        </div>
      )}

      {/* 5. MR WHITE GUESS */}
      {step === "white_guess" && (
        <div className="card glass-panel">
          <h2 className="glitch-text">INTERUPSI!</h2>
          <p>Mr. White mencoba menebak kata kunci!</p>
          <input className="big-input" value={whiteGuess} onChange={e=>setWhiteGuess(e.target.value)} placeholder="Tebak kata..." />
          <button className="btn glow" onClick={() => {
            const civWord = gameData.find(p => p.role === "Civilian").word;
            if (whiteGuess.toLowerCase() === civWord.toLowerCase()) finish("Mr. White");
            else { alert("TEBAKAN SALAH!"); setStep("voting"); checkWin(gameData); }
          }}>HACK SYSTEM</button>
        </div>
      )}

      {/* 6. END GAME */}
      {step === "end" && (
        <div className="card glass-panel center">
          <h1>MISI SELESAI</h1>
          <h2 className="winner-title">{winner} MENANG</h2>
          <button className="btn glow" onClick={() => setStep("setup")}>RESET MISI</button>
        </div>
      )}
    </div>
  );
}
