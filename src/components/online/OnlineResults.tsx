import React from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Crown, Shield, Eye, AlertCircle, RotateCcw, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import type { OnlineRoom, OnlinePlayer } from '../../firebase/gameService';
import { playSound } from '../../App';
import { useTheme } from '../../context/ThemeContext';

interface OnlineResultsProps {
  room: OnlineRoom;
  isHost: boolean;
  deviceId: string;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export function OnlineResults({ room, isHost, deviceId, onPlayAgain, onLeave }: OnlineResultsProps) {
  const { theme } = useTheme();
  const players = Object.values(room.players ?? {}) as OnlinePlayer[];
  const winner = room.winner;

  const getWinnerTitle = () => {
    switch (winner) {
      case 'civilian': return 'CIVILIAN MENANG!';
      case 'undercover': return 'UNDERCOVER MENANG!';
      case 'mrwhite': return 'MR. WHITE MENANG!';
      default: return 'GAME SELESAI';
    }
  };

  const getWinnerGradient = () => {
    switch (winner) {
      case 'civilian': return 'from-blue-600 to-cyan-600';
      case 'undercover': return 'from-orange-600 to-red-600';
      case 'mrwhite': return 'from-gray-800 to-black';
      default: return 'from-primary to-secondary';
    }
  };

  const getWinnerIcon = () => {
    switch (winner) {
      case 'civilian': return <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />;
      case 'undercover': return <Eye className="w-16 h-16 text-white" strokeWidth={1.5} />;
      case 'mrwhite': return <AlertCircle className="w-16 h-16 text-white" strokeWidth={1.5} />;
      default: return <Trophy className="w-16 h-16 text-white" strokeWidth={1.5} />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'civilian': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'undercover': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'mrwhite': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return '';
    }
  };

  const winners = players.filter(p => p.role === winner && !p.dead);
  const me = players.find(p => p.deviceId === deviceId);
  const iWon = me?.role === winner && !me?.dead;

  return (
    <div className="min-h-screen p-4 relative z-10">
      <div className="max-w-2xl mx-auto pt-4">
        {/* Winner Banner */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8">
          <div className={`inline-block bg-gradient-to-br ${getWinnerGradient()} p-10 rounded-3xl shadow-2xl rainbow-glow mb-4`}>
            <div className="floating">{getWinnerIcon()}</div>
          </div>
          <h1 className="text-3xl sm:text-5xl neon-text mb-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.08em' }}>
            {getWinnerTitle()}
          </h1>
          {iWon && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mt-2"
              style={{ background: `${theme.primary}20`, border: `1px solid ${theme.primary}60` }}>
              <Crown className="w-4 h-4" style={{ color: theme.primary }} />
              <span className="text-sm" style={{ color: theme.primary, fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                KAMU MENANG!
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* All Players Reveal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mb-6">
          <h3 className="text-sm text-muted-foreground text-center mb-3"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
            SEMUA AGEN
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((p, i) => {
              const isWinner = p.role === winner && !p.dead;
              const isMe = p.deviceId === deviceId;
              return (
                <motion.div key={p.deviceId}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}>
                  <Card className={`p-4 ${isWinner ? 'neon-border border-primary pulse-glow' : 'border-border/30 bg-card/30'} backdrop-blur-md`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-base truncate ${p.dead ? 'line-through opacity-50 text-muted-foreground' : 'text-primary'}`}
                        style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                        {p.name}
                        {isMe && <span className="ml-1 text-[9px] opacity-60">(KAMU)</span>}
                      </h4>
                      {isWinner && <Crown className="w-4 h-4 flex-shrink-0 floating" style={{ color: theme.primary }} />}
                      {p.dead && <Trophy className="w-4 h-4 flex-shrink-0 text-destructive opacity-50" />}
                    </div>
                    <Badge className={`${getRoleBadge(p.role)} border text-[9px] w-full justify-center py-1`}
                      style={{ fontFamily: 'Orbitron' }}>
                      {p.role === 'civilian' && 'CIVILIAN'}
                      {p.role === 'undercover' && 'UNDERCOVER'}
                      {p.role === 'mrwhite' && 'MR. WHITE'}
                    </Badge>
                    {p.word && (
                      <p className="text-xs text-center mt-2" style={{ fontFamily: 'Rajdhani' }}>
                        <span className="text-muted-foreground">Kata: </span>
                        <span style={{ color: theme.primary, fontFamily: 'Orbitron' }}>{p.word}</span>
                      </p>
                    )}
                    {p.dead && (
                      <Badge variant="destructive" className="text-[9px] w-full justify-center mt-2"
                        style={{ fontFamily: 'Orbitron' }}>
                        TERELIMINASI
                      </Badge>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="space-y-3">
          {isHost ? (
            <Button onClick={() => { playSound('click'); onPlayAgain(); }}
              className="w-full py-6 bg-primary hover:bg-primary/90 pulse-glow"
              style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}>
              <RotateCcw className="w-4 h-4 mr-2" />
              MAIN LAGI (PEMAIN SAMA)
            </Button>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-3" style={{ fontFamily: 'Rajdhani' }}>
              Tunggu host untuk main lagi...
            </div>
          )}
          <Button onClick={() => { playSound('click'); onLeave(); }}
            variant="outline" className="w-full neon-border text-primary hover:bg-primary/10"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em', fontSize: 11 }}>
            <LogOut className="w-3.5 h-3.5 mr-2" />
            KELUAR
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
