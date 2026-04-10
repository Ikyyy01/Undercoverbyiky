import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Vote, Skull, Shield, Eye, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Player } from '../App';
import { playSound, vibrate } from '../App';
import { useTheme } from '../context/ThemeContext';

interface GamePlayProps {
  players: Player[];
  onEliminate: (playerId: number) => void;
}

export function GamePlay({ players, onEliminate }: GamePlayProps) {
  const { theme } = useTheme();
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const alivePlayers = players.filter((p) => !p.dead);
  const deadPlayers = players.filter((p) => p.dead);

  const handleTap = (playerId: number) => {
    // On mobile: first tap = confirm, second tap = eliminate
    if (confirmId === playerId) {
      playSound('click');
      vibrate(100);
      onEliminate(playerId);
      setConfirmId(null);
    } else {
      playSound('click');
      setConfirmId(playerId);
    }
  };

  return (
    <div className="min-h-screen relative z-10 overflow-hidden">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4 sm:mb-6 pt-12">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl neon-text mb-1 sm:mb-2"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.08em' }}
          >
            FASE ELIMINASI
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm" style={{ fontFamily: 'Rajdhani', letterSpacing: '0.05em' }}>
            Diskusi, deduksi, dan vote penyusup
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-2 mb-4 sm:mb-6"
        >
          {[
            { icon: Users, label: 'HIDUP', value: alivePlayers.length, color: theme.primary },
            { icon: Skull, label: 'MATI', value: deadPlayers.length, color: '#ef4444' },
            { icon: Shield, label: 'CIVIL', value: alivePlayers.filter((p) => p.role === 'civilian').length, color: '#60a5fa' },
            { icon: Eye, label: 'SPY', value: alivePlayers.filter((p) => p.role !== 'civilian').length, color: theme.secondary },
          ].map((stat, i) => (
            <Card key={i} className="neon-border bg-card/30 backdrop-blur-md p-2 sm:p-3 text-center">
              <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
              <div className="text-xl sm:text-2xl mb-0.5 font-bold" style={{ color: stat.color, fontFamily: 'Orbitron' }}>
                {stat.value}
              </div>
              <div className="text-muted-foreground text-[9px] sm:text-xs" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Vote section label */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <h3
            className="text-base sm:text-lg neon-text mb-3 text-center"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
          >
            TAP UNTUK VOTE
          </h3>

          <div className="space-y-2 sm:space-y-3 mb-6">
            <AnimatePresence>
              {alivePlayers.map((player, index) => {
                const isConfirm = confirmId === player.id;
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleTap(player.id)}
                    className="neon-border backdrop-blur-md rounded-xl cursor-pointer transition-all overflow-hidden"
                    style={{
                      background: isConfirm ? `${theme.primary}20` : `${theme.card}80`,
                      borderColor: isConfirm ? theme.primary : theme.border,
                      boxShadow: isConfirm ? `0 0 20px ${theme.glowColor}` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3 p-3 sm:p-4">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-base sm:text-lg"
                        style={{
                          background: isConfirm ? theme.primary : `${theme.primary}30`,
                          color: isConfirm ? '#020617' : theme.primary,
                          fontFamily: 'Orbitron',
                          transition: 'all 0.2s',
                          boxShadow: isConfirm ? `0 0 12px ${theme.glowColor}` : 'none',
                        }}
                      >
                        {player.name.charAt(0)}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className="text-sm sm:text-base truncate"
                          style={{
                            color: isConfirm ? theme.primary : '#f8fafc',
                            fontFamily: 'Orbitron',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {player.name}
                        </h4>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Rajdhani' }}>
                          {isConfirm ? '⚠️ Tap lagi untuk konfirmasi eliminasi' : 'Tap untuk vote'}
                        </p>
                      </div>

                      {/* Vote icon */}
                      <div
                        className="flex-shrink-0"
                        style={{
                          color: isConfirm ? '#ef4444' : theme.primary,
                          opacity: isConfirm ? 1 : 0.3,
                          transition: 'all 0.2s',
                        }}
                      >
                        {isConfirm ? <Skull className="w-5 h-5" /> : <Vote className="w-5 h-5" />}
                      </div>
                    </div>

                    {/* Confirm bar */}
                    {isConfirm && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="h-0.5 origin-left"
                        style={{ background: `linear-gradient(to right, ${theme.primary}, #ef4444)` }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Dead players */}
        {deadPlayers.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3
              className="text-base sm:text-lg mb-3 flex items-center gap-2 justify-center"
              style={{ fontFamily: 'Orbitron', letterSpacing: '0.08em', color: '#ef4444', textShadow: '0 0 10px rgba(239,68,68,0.5)' }}
            >
              <Skull className="w-5 h-5" />
              TERELIMINASI
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {deadPlayers.map((player) => (
                <Card key={player.id} className="border-destructive/30 bg-card/30 backdrop-blur-md p-3 sm:p-4 opacity-70">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm text-muted-foreground line-through truncate" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                      {player.name}
                    </h4>
                    <Skull className="w-4 h-4 text-destructive flex-shrink-0 ml-1" />
                  </div>
                  <Badge
                    className={`${
                      player.role === 'civilian' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                      player.role === 'undercover' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                      'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    } border w-full justify-center py-1 text-[9px] sm:text-xs`}
                    style={{ fontFamily: 'Orbitron', letterSpacing: '0.08em' }}
                  >
                    {player.role === 'civilian' && <><Shield className="w-3 h-3 mr-1" /> CIVILIAN</>}
                    {player.role === 'undercover' && <><Eye className="w-3 h-3 mr-1" /> UNDERCOVER</>}
                    {player.role === 'mrwhite' && <><AlertCircle className="w-3 h-3 mr-1" /> MR. WHITE</>}
                  </Badge>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
