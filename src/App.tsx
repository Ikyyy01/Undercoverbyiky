import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { GameSetup } from './components/GameSetup';
import { CardDistribution } from './components/CardDistribution';
import { GamePlay } from './components/GamePlay';
import { EliminationResult } from './components/EliminationResult';
import { WhiteGuess } from './components/WhiteGuess';
import { GameResults } from './components/GameResults';
import { Leaderboard } from './components/Leaderboard';
import { ThemeSelector } from './components/ThemeSelector';
import { ThemeProvider, useTheme, THEMES } from './context/ThemeContext';

export type GamePhase = 'landing' | 'setup' | 'distribution' | 'gameplay' | 'elimination' | 'whiteguess' | 'results';

export interface Player {
  id: number;
  name: string;
  role: 'civilian' | 'undercover' | 'mrwhite';
  word: string | null;
  dead: boolean;
  seen: boolean;
}

export interface GameConfig {
  playerNames: string[];
  undercoverCount: number;
  mrWhiteCount: number;
}

export interface LeaderboardEntry {
  name: string;
  wins: number;
  games: number;
}

// DEFAULT WORD DATABASE (cyber theme)
const DEFAULT_WORDS: [string, string][] = [
  ["Pantai", "Pulau"], ["Gunung", "Bukit"], ["Sekolah", "Kampus"], ["Gitar", "Bass"],
  ["Sendok", "Garpu"], ["Sepatu", "Sandal"], ["Nasi Goreng", "Mie Goreng"], ["Pizza", "Burger"],
  ["Susu", "Yoghurt"], ["Sate", "Gulai"], ["Polisi", "Satpam"], ["Presiden", "Raja"],
  ["Laptop", "Komputer"], ["Instagram", "TikTok"], ["Emas", "Perak"],
  ["Matahari", "Bulan"], ["Singa", "Macan"], ["Kucing", "Anjing"],
  ["Sepak Bola", "Futsal"], ["Basket", "Voli"], ["Renang", "Menyelam"],
  ["Mobil", "Motor"], ["Pesawat", "Helikopter"], ["Kereta", "Bus"],
  ["Hotel", "Apartemen"], ["Rumah", "Kost"], ["Dokter", "Perawat"],
  ["Guru", "Dosen"], ["Pilot", "Masinis"], ["Tentara", "Polisi"],
  ["Kopi", "Teh"], ["Gula", "Garam"], ["Apel", "Jeruk"],
  ["Mangga", "Nanas"], ["Durian", "Nangka"], ["Semangka", "Melon"],
  ["Buku", "Komik"], ["Novel", "Majalah"], ["Pulpen", "Pensil"],
  ["Meja", "Kursi"], ["Kasur", "Sofa"], ["Pintu", "Jendela"],
  ["Jam Tangan", "Gelang"], ["Cincin", "Kalung"], ["Topi", "Helm"],
  ["Facebook", "Twitter"], ["Whatsapp", "Telegram"], ["Youtube", "Netflix"],
  ["Windows", "Mac OS"], ["Android", "iOS"], ["Google", "Yahoo"],
  ["Batman", "Superman"], ["Naruto", "Sasuke"], ["Goku", "Vegeta"],
  ["Doraemon", "Nobita"], ["Spongebob", "Patrick"], ["Tom", "Jerry"],
  ["Jakarta", "Bandung"], ["Bali", "Lombok"], ["Jepang", "Korea"],
  ["Air", "Api"], ["Tanah", "Udara"], ["Kayu", "Batu"],
  ["Uang", "Kartu Kredit"], ["Dompet", "Tas"], ["Kunci", "Gembok"],
  ["Gunting", "Pisau"], ["Kertas", "Plastik"], ["Botol", "Gelas"],
];

// AUDIO ENGINE
export const playSound = (type: 'click' | 'scan' | 'glitch' | 'win') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(); osc.stop(now + 0.1);
  } else if (type === 'scan') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(1000, now + 0.5);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    osc.start(); osc.stop(now + 0.5);
  } else if (type === 'glitch') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(50, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.1);
    osc.frequency.linearRampToValueAtTime(50, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(); osc.stop(now + 0.3);
  } else if (type === 'win') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
    osc.start(); osc.stop(now + 1);
  }
};

export const vibrate = (pattern: number | number[]) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
};

// ── Inner App (needs ThemeContext) ────────────────────────────────────────
function AppInner() {
  const { theme } = useTheme();

  const [gamePhase, setGamePhase] = useState<GamePhase>('landing');
  const [players, setPlayers] = useState<Player[]>([]);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
  const [winner, setWinner] = useState<'civilian' | 'undercover' | 'mrwhite' | null>(null);
  const [civilianWord, setCivilianWord] = useState<string>('');
  const [lastGameConfig, setLastGameConfig] = useState<GameConfig | null>(null);
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry>>({});
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('undercover_leaderboard');
      if (saved) setLeaderboard(JSON.parse(saved));
    } catch {}
  }, []);

  const saveLeaderboard = (newLb: Record<string, LeaderboardEntry>) => {
    setLeaderboard(newLb);
    try { localStorage.setItem('undercover_leaderboard', JSON.stringify(newLb)); } catch {}
  };

  const startNewGame = () => {
    setGamePhase('setup');
    setPlayers([]);
    setEliminatedPlayer(null);
    setWinner(null);
    setCivilianWord('');
  };

  const quickRematch = () => {
    if (lastGameConfig) handleSetupComplete(lastGameConfig);
  };

  const handleSetupComplete = (config: GameConfig) => {
    setLastGameConfig(config);

    // Choose word pair based on current theme
    const wordPool = theme.wordPairs ?? DEFAULT_WORDS;
    const randomPair = wordPool[Math.floor(Math.random() * wordPool.length)];
    const isFlip = Math.random() > 0.5;
    const civWord = isFlip ? randomPair[0] : randomPair[1];
    const undWord = isFlip ? randomPair[1] : randomPair[0];
    setCivilianWord(civWord);

    const pool: { r: 'civilian' | 'undercover' | 'mrwhite'; w: string | null }[] = [];
    for (let i = 0; i < config.undercoverCount; i++) pool.push({ r: 'undercover', w: undWord });
    for (let i = 0; i < config.mrWhiteCount; i++) pool.push({ r: 'mrwhite', w: null });
    while (pool.length < config.playerNames.length) pool.push({ r: 'civilian', w: civWord });
    pool.sort(() => Math.random() - 0.5);

    const newPlayers: Player[] = config.playerNames.map((name, i) => ({
      id: Date.now() + i,
      name,
      role: pool[i].r,
      word: pool[i].w,
      dead: false,
      seen: false,
    }));

    setPlayers(newPlayers);
    setGamePhase('distribution');
    playSound('win');
  };

  const handlePlayerSeen = (playerId: number) => {
    const updated = players.map((p) => (p.id === playerId ? { ...p, seen: true } : p));
    setPlayers(updated);
    if (updated.every((p) => p.seen)) setTimeout(() => setGamePhase('gameplay'), 500);
  };

  const handleEliminate = (playerId: number) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    const updated = players.map((p) => (p.id === playerId ? { ...p, dead: true } : p));
    setPlayers(updated);
    setEliminatedPlayer(player);
    setGamePhase('elimination');
    playSound('glitch');
    vibrate(300);
  };

  const handleConfirmElimination = () => {
    if (!eliminatedPlayer) return;
    if (eliminatedPlayer.role === 'mrwhite') { setGamePhase('whiteguess'); return; }
    checkWin(players);
  };

  const handleWhiteGuess = (guess: string) => {
    if (guess.toLowerCase().trim() === civilianWord.toLowerCase().trim()) {
      setWinner('mrwhite');
      updateLeaderboard('mrwhite');
      setGamePhase('results');
      playSound('win');
    } else {
      checkWin(players);
    }
  };

  const checkWin = (currentPlayers: Player[]) => {
    const alive = currentPlayers.filter((p) => !p.dead);
    const impostors = alive.filter((p) => p.role !== 'civilian');
    if (impostors.length === 0) {
      setWinner('civilian'); updateLeaderboard('civilian'); setGamePhase('results'); playSound('win');
    } else if (alive.length <= 2) {
      setWinner('undercover'); updateLeaderboard('undercover'); setGamePhase('results'); playSound('win');
    } else {
      setEliminatedPlayer(null); setGamePhase('gameplay');
    }
  };

  const updateLeaderboard = (winningRole: 'civilian' | 'undercover' | 'mrwhite') => {
    const newLb = { ...leaderboard };
    players.forEach((player) => {
      const isWinner =
        (winningRole === 'civilian' && player.role === 'civilian') ||
        (winningRole === 'undercover' && player.role === 'undercover') ||
        (winningRole === 'mrwhite' && player.role === 'mrwhite');
      if (!newLb[player.name]) newLb[player.name] = { name: player.name, wins: 0, games: 0 };
      newLb[player.name].games += 1;
      if (isWinner) newLb[player.name].wins += 1;
    });
    saveLeaderboard(newLb);
  };

  return (
    <div className="min-h-screen cyber-bg" style={{ background: theme.background }}>
      {/* Scanlines */}
      <div className="scanlines" />

      {/* Dynamic grid with theme color */}
      <div
        className="cyber-grid"
        style={{
          backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
        }}
      />

      {/* Particles */}
      <div className="particles" />

      {/* Theme selector - fixed top right */}
      <div
        className="fixed top-3 right-3 z-50"
        style={{ top: 'env(safe-area-inset-top, 12px)' }}
      >
        <ThemeSelector />
      </div>

      {/* Pages */}
      {gamePhase === 'landing' && (
        <LandingPage onStart={startNewGame} onShowLeaderboard={() => setShowLeaderboard(true)} />
      )}
      {gamePhase === 'setup' && (
        <GameSetup onComplete={handleSetupComplete} onBack={() => setGamePhase('landing')} savedNames={lastGameConfig?.playerNames} />
      )}
      {gamePhase === 'distribution' && (
        <CardDistribution players={players} onPlayerSeen={handlePlayerSeen} />
      )}
      {gamePhase === 'gameplay' && (
        <GamePlay players={players} onEliminate={handleEliminate} />
      )}
      {gamePhase === 'elimination' && eliminatedPlayer && (
        <EliminationResult player={eliminatedPlayer} onConfirm={handleConfirmElimination} />
      )}
      {gamePhase === 'whiteguess' && (
        <WhiteGuess onGuess={handleWhiteGuess} />
      )}
      {gamePhase === 'results' && (
        <GameResults winner={winner} players={players} onPlayAgain={startNewGame} onQuickRematch={quickRematch} />
      )}
      {showLeaderboard && (
        <Leaderboard leaderboard={leaderboard} onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}

// ── Root Export ───────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
