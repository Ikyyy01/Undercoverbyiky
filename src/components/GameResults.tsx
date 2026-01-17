import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, RotateCcw, Crown, Shield, Eye, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import type { Player } from '../App';
import { playSound } from '../App';

interface GameResultsProps {
  winner: 'civilian' | 'undercover' | 'mrwhite' | null;
  players: Player[];
  onPlayAgain: () => void;
  onQuickRematch: () => void;
}

export function GameResults({ winner, players, onPlayAgain, onQuickRematch }: GameResultsProps) {
  const getWinnerTitle = () => {
    switch (winner) {
      case 'civilian':
        return 'CIVILIAN MENANG!';
      case 'undercover':
        return 'UNDERCOVER MENANG!';
      case 'mrwhite':
        return 'MR. WHITE MENANG!';
      default:
        return 'MISI SELESAI';
    }
  };

  const getWinnerColor = () => {
    switch (winner) {
      case 'civilian':
        return 'from-blue-600 to-cyan-600';
      case 'undercover':
        return 'from-orange-600 to-red-600';
      case 'mrwhite':
        return 'from-gray-800 to-black';
      default:
        return 'from-primary to-secondary';
    }
  };

  const getWinnerIcon = () => {
    switch (winner) {
      case 'civilian':
        return <Shield className="w-20 h-20 text-white" strokeWidth={1.5} />;
      case 'undercover':
        return <Eye className="w-20 h-20 text-white" strokeWidth={1.5} />;
      case 'mrwhite':
        return <AlertCircle className="w-20 h-20 text-white" strokeWidth={1.5} />;
      default:
        return <Trophy className="w-20 h-20 text-white" strokeWidth={1.5} />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'civilian':
        return <Shield className="w-4 h-4" />;
      case 'undercover':
        return <Eye className="w-4 h-4" />;
      case 'mrwhite':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'civilian':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'undercover':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'mrwhite':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return '';
    }
  };

  const winners = players.filter((p) => p.role === winner && !p.dead);

  const handlePlayAgain = () => {
    playSound('click');
    onPlayAgain();
  };

  const handleQuickRematch = () => {
    playSound('click');
    onQuickRematch();
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        {/* Winner Announcement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className={`inline-block bg-gradient-to-br ${getWinnerColor()} p-12 rounded-3xl shadow-2xl relative rainbow-glow`}>
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-50"
                style={{
                  background: `linear-gradient(to bottom right, ${
                    winner === 'civilian'
                      ? 'rgb(37, 99, 235)'
                      : winner === 'undercover'
                      ? 'rgb(234, 88, 12)'
                      : 'rgb(31, 41, 55)'
                  }, transparent)`,
                }}
              />
              <div className="relative floating">{getWinnerIcon()}</div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl sm:text-7xl neon-text mb-4"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
          >
            {getWinnerTitle()}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="h-1 w-20 bg-primary" />
            <Trophy className="w-6 h-6 text-primary" />
            <div className="h-1 w-20 bg-primary" />
          </motion.div>
        </motion.div>

        {/* Winners Section */}
        {winners.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-12">
            <h3
              className="text-2xl neon-text mb-6 flex items-center gap-2 justify-center"
              style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
            >
              <Crown className="w-6 h-6" />
              PEMENANG
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {winners.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card
                    className={`bg-gradient-to-br ${getWinnerColor()} border-0 p-6 shadow-xl relative overflow-hidden rainbow-glow`}
                  >
                    {/* Crown decoration */}
                    <div className="absolute top-0 right-0 p-4">
                      <Crown className="w-10 h-10 text-white/20 floating" />
                    </div>

                    <h4 className="text-3xl text-white mb-3" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                      {player.name}
                    </h4>

                    <Badge
                      className="bg-white/20 text-white border-white/30 border mb-3"
                      style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
                    >
                      <span className="mr-2">{getRoleIcon(player.role)}</span>
                      {player.role === 'civilian' && 'CIVILIAN'}
                      {player.role === 'undercover' && 'UNDERCOVER'}
                      {player.role === 'mrwhite' && 'MR. WHITE'}
                    </Badge>

                    {player.word && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                        <div className="text-white/70 text-xs mb-1" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                          KATA
                        </div>
                        <div className="text-2xl text-white" style={{ fontFamily: 'Orbitron' }}>
                          {player.word}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Players Reveal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <h3
            className="text-2xl text-muted-foreground mb-6 text-center"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
          >
            SEMUA AGEN
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {players.map((player, index) => {
              const isWinner = player.role === winner && !player.dead;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 + index * 0.05 }}
                  whileHover={{ scale: isWinner ? 1.05 : 1.02 }}
                >
                  <Card
                    className={`${
                      isWinner ? 'neon-border bg-card/90 border-2 border-primary pulse-glow' : 'border-border/30 bg-card/30'
                    } backdrop-blur-md p-6 tech-corners`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4
                          className={`text-xl mb-2 ${!player.dead ? 'text-primary' : 'line-through opacity-60 text-muted-foreground'}`}
                          style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}
                        >
                          {player.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-xs neon-border"
                          style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
                        >
                          AGEN #{player.id}
                        </Badge>
                      </div>
                      {isWinner && <Trophy className="w-6 h-6 text-primary floating" />}
                    </div>

                    <Badge
                      className={`${getRoleBadgeColor(player.role)} border w-full justify-center py-2 mb-3`}
                      style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
                    >
                      <span className="mr-2">{getRoleIcon(player.role)}</span>
                      {player.role === 'civilian' && 'CIVILIAN'}
                      {player.role === 'undercover' && 'UNDERCOVER'}
                      {player.role === 'mrwhite' && 'MR. WHITE'}
                    </Badge>

                    {player.word && (
                      <div className="text-center text-sm" style={{ fontFamily: 'Rajdhani' }}>
                        <span className="text-muted-foreground">Kata: </span>
                        <span className="text-primary" style={{ fontFamily: 'Orbitron' }}>
                          {player.word}
                        </span>
                      </div>
                    )}

                    {player.dead && (
                      <div className="mt-3 text-center">
                        <Badge variant="destructive" className="text-xs" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                          TERELIMINASI
                        </Badge>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            onClick={handleQuickRematch}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-12 py-7 text-xl rounded-xl pulse-glow group"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.2em', fontWeight: 900 }}
          >
            <Zap className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" />
            MAIN LAGI (NAMA SAMA)
          </Button>

          <Button
            onClick={handlePlayAgain}
            variant="outline"
            className="neon-border bg-card/50 hover:bg-card/70 text-primary px-8 py-7 text-lg rounded-xl backdrop-blur-sm group"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em', fontWeight: 700 }}
          >
            <RotateCcw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            SETUP BARU
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
