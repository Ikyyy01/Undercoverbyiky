// App.tsx
import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { PlayerCard } from './components/PlayerCard';
import { playSound } from './App';

export type Role = 'undercover' | 'civilian';

interface Player {
  id: number;
  role: Role;
  isRevealed: boolean;
  isEliminated: boolean;
}

export function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  
  // Start game
  const handleStart = () => {
    playSound('click');
    setShowLanding(false);
    const newPlayers: Player[] = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      role: i === 0 ? 'undercover' : 'civilian', // 1 undercover, sisanya civilian
      isRevealed: false,
      isEliminated: false,
    }));
    setPlayers(newPlayers);
  };

  // Show leaderboard (sementara dummy)
  const handleShowLeaderboard = () => {
    playSound('click');
    alert('Leaderboard belum dibuat!');
  };

  // Reveal semua kartu (semua biru)
  const revealCards = () => {
    setPlayers(players.map(p => ({ ...p, isRevealed: true })));
  };

  // Eliminate player
  const eliminatePlayer = (id: number) => {
    setPlayers(players.map(p => p.id === id ? { ...p, isEliminated: true } : p));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {showLanding ? (
        <LandingPage onStart={handleStart} onShowLeaderboard={handleShowLeaderboard} />
      ) : (
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold neon-text mb-5">UNDERCOVER GAME</h1>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            {players.map(player => (
              <PlayerCard
                key={player.id}
                role={player.role}
                isRevealed={player.isRevealed}
                isEliminated={player.isEliminated}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={revealCards}
            >
              Buka Kartu Semua
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              onClick={() => eliminatePlayer(players[0].id)}
            >
              Eliminasi Pemain 1
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// components/LandingPage.tsx
import React from 'react';
import { Button } from './ui/button';
import { Users, Eye, Zap, Trophy, Sparkles, Target, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { playSound } from '../App';

interface LandingPageProps {
  onStart: () => void;
  onShowLeaderboard: () => void;
}

export function LandingPage({ onStart, onShowLeaderboard }: LandingPageProps) {
  const handleStart = () => {
    playSound('click');
    onStart();
  };

  const handleLeaderboard = () => {
    playSound('click');
    onShowLeaderboard();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
          className="mb-4 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-secondary/10 blur-2xl rounded-full" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
            
            <div className="relative neon-border bg-gradient-to-br from-card to-muted p-3 sm:p-4 md:p-5 rounded-xl rainbow-glow">
              <Eye className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-primary floating" strokeWidth={1.5} />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 pointer-events-none">
              <Shield className="absolute -top-1.5 left-1/2 -ml-2 w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
            </motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 pointer-events-none">
              <Target className="absolute -bottom-1.5 left-1/2 -ml-2 w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl neon-text mb-2 text-center" style={{ fontFamily: 'Orbitron', fontWeight: 900, letterSpacing: '0.05em' }}>
            UNDERCOVER
          </h1>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, type: 'spring', stiffness: 200 }} className="flex flex-col sm:flex-row gap-2.5 justify-center items-center">
          <Button onClick={handleStart} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base rounded-lg pulse-glow group w-full sm:w-auto">
            <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
            MULAI MISI
          </Button>
          <Button onClick={handleLeaderboard} variant="outline" className="neon-border bg-card/50 hover:bg-card/70 text-primary px-5 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm rounded-lg backdrop-blur-sm group w-full sm:w-auto">
            <Trophy className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            LEADERBOARD
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// components/PlayerCard.tsx
import React from 'react';

interface PlayerCardProps {
  role: 'undercover' | 'civilian';
  isRevealed: boolean;
  isEliminated: boolean;
}

export function PlayerCard({ role, isRevealed, isEliminated }: PlayerCardProps) {
  const cardColor = isRevealed ? 'bg-blue-400' : 'bg-card';
  return (
    <div className={`p-4 rounded-lg text-center ${cardColor} text-white transition-all`}>
      {isEliminated ? (
        <p className="font-bold text-sm">{role.toUpperCase()}</p>
      ) : isRevealed ? (
        <p className="font-bold text-sm">ROLE</p>
      ) : (
        <p className="font-bold text-sm">?</p>
      )}
    </div>
  );
}

