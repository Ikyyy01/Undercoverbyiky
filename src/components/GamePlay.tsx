import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Vote, Skull, Shield, Eye, AlertCircle, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Player } from '../App';
import { playSound, vibrate } from '../App';

interface GamePlayProps {
  players: Player[];
  onEliminate: (playerId: number) => void;
}

export function GamePlay({ players, onEliminate }: GamePlayProps) {
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const alivePlayers = players.filter((p) => !p.dead);
  const deadPlayers = players.filter((p) => p.dead);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
      vibrate([500, 500]);
      playSound('glitch');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const handleEliminate = (playerId: number) => {
    playSound('click');
    onEliminate(playerId);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Header with Timer */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          {/* Timer */}
          <div className="mb-6">
            <div
              className={`text-7xl sm:text-8xl ${timer < 10 ? 'text-destructive' : 'neon-text'} mb-2`}
              style={{
                fontFamily: 'Orbitron',
                textShadow: timer < 10 ? '0 0 20px rgba(239, 68, 68, 0.8)' : undefined,
              }}
            >
              {timer}
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Timer className="w-4 h-4" />
              <span style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em', fontSize: '0.9rem' }}>WAKTU DISKUSI</span>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl neon-text mb-3" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
            FASE ELIMINASI
          </h2>
          <p className="text-muted-foreground text-lg" style={{ fontFamily: 'Rajdhani', letterSpacing: '0.05em' }}>
            Diskusi, deduksi, dan vote penyusup
          </p>
        </motion.div>

        {/* Game Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Users, label: 'HIDUP', value: alivePlayers.length, color: 'text-primary' },
            { icon: Skull, label: 'MATI', value: deadPlayers.length, color: 'text-destructive' },
            {
              icon: Shield,
              label: 'CIVILIAN',
              value: alivePlayers.filter((p) => p.role === 'civilian').length,
              color: 'text-blue-400',
            },
            {
              icon: Eye,
              label: 'IMPOSTOR',
              value: alivePlayers.filter((p) => p.role !== 'civilian').length,
              color: 'text-orange-400',
            },
          ].map((stat, i) => (
            <Card key={i} className="neon-border bg-card/30 backdrop-blur-md p-4 text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className={`text-3xl ${stat.color} mb-1`} style={{ fontFamily: 'Orbitron' }}>
                {stat.value}
              </div>
              <div className="text-muted-foreground text-xs" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                {stat.label}
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Alive Players - Vote List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3
            className="text-2xl neon-text mb-4 text-center"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
          >
            VOTE UNTUK ELIMINASI
          </h3>

          <div className="space-y-3 mb-8">
            <AnimatePresence>
              {alivePlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="neon-border bg-card/50 backdrop-blur-md p-4 rounded-lg hover:bg-card/70 cursor-pointer transition-all tech-corners group"
                  onClick={() => handleEliminate(player.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-primary neon-border rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xl" style={{ fontFamily: 'Orbitron', fontWeight: 700 }}>
                        {player.name.charAt(0)}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      <h4 className="text-lg text-primary" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                        {player.name}
                      </h4>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Rajdhani' }}>
                        Klik untuk eliminasi
                      </p>
                    </div>

                    {/* Vote Icon */}
                    <Vote className="w-6 h-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Dead Players */}
        {deadPlayers.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3
              className="text-2xl text-destructive mb-4 flex items-center gap-2 justify-center"
              style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em', textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}
            >
              <Skull className="w-6 h-6" />
              AGEN TERELIMINASI
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deadPlayers.map((player) => (
                <Card key={player.id} className="border-destructive/30 bg-card/30 backdrop-blur-md p-6 opacity-70">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4
                        className="text-xl text-muted-foreground line-through mb-2"
                        style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}
                      >
                        {player.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-xs border-destructive/30 text-muted-foreground"
                        style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
                      >
                        TERELIMINASI
                      </Badge>
                    </div>
                    <Skull className="w-5 h-5 text-destructive" />
                  </div>

                  <Badge
                    className={`${
                      player.role === 'civilian'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : player.role === 'undercover'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    } border w-full justify-center py-2 mb-3`}
                    style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
                  >
                    <span className="mr-2">
                      {player.role === 'civilian' && <Shield className="w-4 h-4" />}
                      {player.role === 'undercover' && <Eye className="w-4 h-4" />}
                      {player.role === 'mrwhite' && <AlertCircle className="w-4 h-4" />}
                    </span>
                    {player.role === 'civilian' && 'CIVILIAN'}
                    {player.role === 'undercover' && 'UNDERCOVER'}
                    {player.role === 'mrwhite' && 'MR. WHITE'}
                  </Badge>

                  {player.word && (
                    <div className="text-center text-muted-foreground text-sm" style={{ fontFamily: 'Rajdhani' }}>
                      Kata: <span className="text-foreground" style={{ fontFamily: 'Orbitron' }}>{player.word}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
