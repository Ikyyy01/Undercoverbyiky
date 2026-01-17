import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, X, Medal, Award, Crown, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { LeaderboardEntry } from '../App';
import { playSound } from '../App';

interface LeaderboardProps {
  leaderboard: Record<string, LeaderboardEntry>;
  onClose: () => void;
}

export function Leaderboard({ leaderboard, onClose }: LeaderboardProps) {
  const handleClose = () => {
    playSound('click');
    onClose();
  };

  // Sort by wins, then by win rate
  const sortedEntries = Object.values(leaderboard).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return (b.wins / b.games) - (a.wins / a.games);
  });

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-orange-600" />;
    return <Trophy className="w-5 h-5 text-muted-foreground" />;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-600 to-amber-600';
    if (index === 1) return 'from-gray-500 to-slate-600';
    if (index === 2) return 'from-orange-600 to-red-600';
    return 'from-card to-muted';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="neon-border bg-card/95 backdrop-blur-md tech-corners">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-3 rounded-xl neon-border">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl neon-text" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                  LEADERBOARD
                </h2>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Rajdhani' }}>
                  Top Players
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="rounded-full w-10 h-10 p-0 hover:bg-destructive/20 hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Leaderboard Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {sortedEntries.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground text-lg" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                  BELUM ADA DATA
                </p>
                <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: 'Rajdhani' }}>
                  Mainkan game untuk masuk leaderboard!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {sortedEntries.map((entry, index) => {
                    const winRate = ((entry.wins / entry.games) * 100).toFixed(1);
                    
                    return (
                      <motion.div
                        key={entry.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <Card 
                          className={`bg-gradient-to-r ${getRankColor(index)} border-0 p-4 ${
                            index < 3 ? 'rainbow-glow' : 'neon-border'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Rank & Medal */}
                            <div className="flex-shrink-0 text-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                index < 3 ? 'bg-white/10' : 'bg-primary/10'
                              } backdrop-blur-sm`}>
                                {getMedalIcon(index)}
                              </div>
                              <div className="text-xs text-white/70 mt-1" style={{ fontFamily: 'Orbitron' }}>
                                #{index + 1}
                              </div>
                            </div>

                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                              <h3 
                                className="text-xl text-white truncate" 
                                style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}
                              >
                                {entry.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  className="bg-white/20 text-white border-white/30 text-xs"
                                  style={{ fontFamily: 'Rajdhani' }}
                                >
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  {winRate}% Win Rate
                                </Badge>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 text-right">
                              <div>
                                <div className="text-2xl text-white" style={{ fontFamily: 'Orbitron' }}>
                                  {entry.wins}
                                </div>
                                <div className="text-xs text-white/70" style={{ fontFamily: 'Rajdhani' }}>
                                  Menang
                                </div>
                              </div>
                              <div className="border-l border-white/20 pl-4">
                                <div className="text-2xl text-white/70" style={{ fontFamily: 'Orbitron' }}>
                                  {entry.games}
                                </div>
                                <div className="text-xs text-white/50" style={{ fontFamily: 'Rajdhani' }}>
                                  Main
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <Button
              onClick={handleClose}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em', fontWeight: 700 }}
            >
              TUTUP
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
