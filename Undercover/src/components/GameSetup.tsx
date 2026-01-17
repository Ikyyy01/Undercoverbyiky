import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ArrowLeft, UserPlus, X, UserX, HelpCircle, Minus, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { GameConfig } from '../App';
import { playSound } from '../App';

interface GameSetupProps {
  onComplete: (config: GameConfig) => void;
  onBack: () => void;
  savedNames?: string[];
}

export function GameSetup({ onComplete, onBack, savedNames }: GameSetupProps) {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [undercoverCount, setUndercoverCount] = useState(1);
  const [mrWhiteCount, setMrWhiteCount] = useState(1);
  const [error, setError] = useState('');

  // Load saved names on mount
  useEffect(() => {
    if (savedNames && savedNames.length > 0) {
      setPlayerNames(savedNames);
    }
  }, [savedNames]);

  const civilianCount = playerNames.length - undercoverCount - mrWhiteCount;

  const addPlayer = () => {
    if (!currentName.trim()) return;
    
    if (playerNames.includes(currentName.trim())) {
      setError('Nama sudah ada!');
      return;
    }

    setPlayerNames([...playerNames, currentName.trim()]);
    setCurrentName('');
    setError('');
    playSound('click');
  };

  const removePlayer = (name: string) => {
    setPlayerNames(playerNames.filter((n) => n !== name));
    playSound('click');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (playerNames.length < 3) {
      setError('Minimal 3 pemain diperlukan');
      return;
    }
    if (undercoverCount < 1) {
      setError('Minimal 1 Undercover diperlukan');
      return;
    }
    if (civilianCount < 1) {
      setError('Minimal 1 Civilian diperlukan');
      return;
    }
    if (undercoverCount + mrWhiteCount >= playerNames.length) {
      setError('Terlalu banyak impostor!');
      return;
    }

    playSound('win');
    onComplete({
      playerNames,
      undercoverCount,
      mrWhiteCount,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="neon-border bg-card/95 backdrop-blur-md p-6 sm:p-8 tech-corners rainbow-glow">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => {
                playSound('click');
                onBack();
              }}
              className="mr-4 -ml-2 text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl neon-text" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                SETUP MISI
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Rematch Info */}
            {savedNames && savedNames.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 neon-border rounded-lg p-4 flex items-center gap-3"
              >
                <RefreshCw className="w-5 h-5 text-primary" />
                <p className="text-sm text-primary" style={{ fontFamily: 'Rajdhani' }}>
                  Nama pemain dari game sebelumnya dimuat otomatis!
                </p>
              </motion.div>
            )}

            {/* Add Player */}
            <div>
              <label className="block mb-2 text-sm text-muted-foreground flex items-center gap-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                <UserPlus className="w-4 h-4" />
                TAMBAH AGEN
              </label>
              <div className="flex gap-2">
                <Input
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlayer())}
                  placeholder="NAMA AGEN..."
                  className="bg-input-background neon-border text-primary uppercase"
                  style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}
                />
                <Button
                  type="button"
                  onClick={addPlayer}
                  className="bg-primary hover:bg-primary/80 px-4 pulse-glow"
                >
                  <UserPlus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Player Chips */}
            {playerNames.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm text-muted-foreground flex items-center gap-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                  <UserX className="w-4 h-4" />
                  DAFTAR AGEN ({playerNames.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {playerNames.map((name, i) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        className="neon-border bg-card/50 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-card/80 transition-colors group"
                        onClick={() => removePlayer(name)}
                      >
                        <span className="text-primary text-sm" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                          {name}
                        </span>
                        <X className="w-4 h-4 text-destructive group-hover:scale-125 transition-transform" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Role Configuration */}
            {playerNames.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="neon-border bg-muted/30 rounded-xl p-6 space-y-4 tech-corners"
              >
                <h3 className="text-lg neon-text mb-4 flex items-center gap-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                  <HelpCircle className="w-5 h-5" />
                  KONFIGURASI ROLE
                </h3>

                {/* Undercover Counter */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary/20 p-2 rounded-lg">
                      <UserX className="w-5 h-5 text-secondary" />
                    </div>
                    <label className="text-foreground" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                      UNDERCOVER
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUndercoverCount(Math.max(1, undercoverCount - 1));
                        playSound('click');
                      }}
                      className="w-10 h-10 p-0 neon-border hover:bg-primary/20"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center text-3xl text-primary" style={{ fontFamily: 'Orbitron' }}>
                      {undercoverCount}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUndercoverCount(Math.min(playerNames.length - 2, undercoverCount + 1));
                        playSound('click');
                      }}
                      className="w-10 h-10 p-0 neon-border hover:bg-primary/20"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Mr. White Counter */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted-foreground/20 p-2 rounded-lg">
                      <HelpCircle className="w-5 h-5 text-foreground" />
                    </div>
                    <label className="text-foreground" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                      MR. WHITE
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMrWhiteCount(Math.max(0, mrWhiteCount - 1));
                        playSound('click');
                      }}
                      className="w-10 h-10 p-0 neon-border hover:bg-primary/20"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center text-3xl text-primary" style={{ fontFamily: 'Orbitron' }}>
                      {mrWhiteCount}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMrWhiteCount(Math.min(playerNames.length - 2, mrWhiteCount + 1));
                        playSound('click');
                      }}
                      className="w-10 h-10 p-0 neon-border hover:bg-primary/20"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Role Summary */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                  <div className="text-center bg-blue-500/10 rounded-lg p-3 neon-border">
                    <div className="text-4xl text-blue-400 mb-1" style={{ fontFamily: 'Orbitron' }}>
                      {civilianCount}
                    </div>
                    <div className="text-xs text-muted-foreground" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                      CIVILIAN
                    </div>
                  </div>
                  <div className="text-center bg-orange-500/10 rounded-lg p-3 neon-border">
                    <div className="text-4xl text-orange-400 mb-1" style={{ fontFamily: 'Orbitron' }}>
                      {undercoverCount}
                    </div>
                    <div className="text-xs text-muted-foreground" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                      UNDERCOVER
                    </div>
                  </div>
                  <div className="text-center bg-gray-500/10 rounded-lg p-3 neon-border">
                    <div className="text-4xl text-foreground mb-1" style={{ fontFamily: 'Orbitron' }}>
                      {mrWhiteCount}
                    </div>
                    <div className="text-xs text-muted-foreground" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                      MR. WHITE
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg text-sm text-center"
                  style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            {playerNames.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  type="submit"
                  className="w-full py-7 text-lg bg-primary hover:bg-primary/90 pulse-glow"
                  style={{ fontFamily: 'Orbitron', letterSpacing: '0.2em', fontWeight: 900 }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  DISTRIBUSI KARTU
                </Button>
              </motion.div>
            )}
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
