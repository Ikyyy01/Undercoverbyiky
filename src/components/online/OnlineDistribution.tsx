import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Eye, EyeOff, Lock, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { OnlinePlayer } from '../../firebase/gameService';
import { playSound, vibrate } from '../../App';

interface OnlineDistributionProps {
  me: OnlinePlayer | null;
  players: OnlinePlayer[];
  onSeen: () => void;
}

export function OnlineDistribution({ me, players, onSeen }: OnlineDistributionProps) {
  const [revealed, setRevealed] = useState(false);
  const [showWord, setShowWord] = useState(false);

  const seenCount = players.filter(p => p.seen).length;

  const handleScan = () => {
    playSound('scan');
    vibrate(100);
    setRevealed(true);
    setTimeout(() => setShowWord(true), 500);
  };

  const handleClose = () => {
    onSeen();
  };

  const getRoleGradient = (role: string) => {
    switch (role) {
      case 'mrwhite': return 'from-gray-800 to-black';
      // civilian & undercover sama-sama biru — biar undercover ga ketahuan
      default: return 'from-blue-600 to-cyan-600';
    }
  };

  // Sudah lihat kartu
  if (me?.seen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="neon-border bg-card/50 rounded-2xl p-8 mb-4">
            <Lock className="w-12 h-12 text-primary mx-auto mb-3" />
            <h2 className="text-xl neon-text mb-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
              KARTU TERSIMPAN
            </h2>
            <p className="text-muted-foreground text-sm" style={{ fontFamily: 'Rajdhani' }}>
              Tunggu pemain lain membuka kartunya...
            </p>
          </div>
          <div className="text-sm text-muted-foreground" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
            {seenCount} / {players.length} SIAP
          </div>
          {/* Progress bar */}
          <div className="h-2 neon-border rounded-full overflow-hidden bg-card/30 mt-3">
            <motion.div
              animate={{ width: `${(seenCount / players.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-primary"
              style={{ boxShadow: '0 0 10px rgba(14,165,233,0.8)' }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="text-center mb-4">
          <p className="text-muted-foreground text-xs mb-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
            {seenCount} / {players.length} PEMAIN SIAP
          </p>
          <div className="h-1.5 neon-border rounded-full overflow-hidden bg-card/30">
            <motion.div
              animate={{ width: `${(seenCount / players.length) * 100}%` }}
              className="h-full bg-primary"
              style={{ boxShadow: '0 0 10px rgba(14,165,233,0.8)' }}
            />
          </div>
        </div>

        {/* Nama pemain */}
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl neon-text text-center mb-6" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
          {me?.name ?? '???'}
        </motion.h2>

        {/* Card reveal */}
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div key="hidden" exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.3 }}>
              <Card className="neon-border bg-card/50 p-10 cursor-pointer hover:bg-card/70 tech-corners pulse-glow text-center"
                onClick={handleScan}>
                <EyeOff className="w-14 h-14 text-primary mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg neon-text mb-1" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                  SENTUH UNTUK SCAN
                </h3>
                <p className="text-muted-foreground text-xs" style={{ fontFamily: 'Rajdhani' }}>
                  Pastikan hanya kamu yang melihat
                </p>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="revealed" initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className={`bg-gradient-to-br ${getRoleGradient(me?.role ?? 'civilian')} border-0 p-7 shadow-2xl`}>
                <AnimatePresence>
                  {showWord && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                      {me?.role === 'mrwhite' ? (
                        <Fingerprint className="w-10 h-10 text-white mx-auto mb-3 animate-pulse" />
                      ) : (
                        <Eye className="w-10 h-10 text-white mx-auto mb-3" />
                      )}

                      {me?.role === 'mrwhite' && (
                        <p className="text-xl text-white font-bold mb-2" style={{ fontFamily: 'Orbitron' }}>MR. WHITE</p>
                      )}

                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-3">
                        <div className="text-white/70 text-[10px] mb-1" style={{ fontFamily: 'Orbitron', letterSpacing: '0.2em' }}>
                          KATA KUNCI
                        </div>
                        <div className="text-4xl text-white" style={{ fontFamily: 'Orbitron' }}>
                          {me?.word ?? '???'}
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-lg p-2 text-white/80 text-[10px]" style={{ fontFamily: 'Rajdhani' }}>
                        {me?.word
                          ? '⚠️ Jangan sebutkan kata ini langsung!'
                          : '⚠️ Dengarkan dan tebak kata rahasia!'}
                      </div>

                      <Button onClick={handleClose}
                        className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                        style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                        TUTUP AKSES
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
