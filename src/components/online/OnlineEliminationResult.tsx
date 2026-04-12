import React from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skull, Shield, Eye, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { OnlinePlayer } from '../../firebase/gameService';
import { playSound } from '../../App';

interface OnlineEliminationResultProps {
  player: OnlinePlayer;
  isHost: boolean;
  onConfirm: () => void;
}

export function OnlineEliminationResult({ player, isHost, onConfirm }: OnlineEliminationResultProps) {
  const getRoleGradient = () => {
    switch (player.role) {
      case 'civilian': return 'from-blue-600 to-cyan-600';
      case 'undercover': return 'from-orange-600 to-red-600';
      case 'mrwhite': return 'from-gray-800 to-black';
      default: return 'from-primary to-secondary';
    }
  };

  const getRoleIcon = () => {
    switch (player.role) {
      case 'civilian': return <Shield className="w-14 h-14 text-blue-400" />;
      case 'undercover': return <Eye className="w-14 h-14 text-orange-400" />;
      case 'mrwhite': return <AlertCircle className="w-14 h-14 text-white" />;
    }
  };

  const getRoleName = () => {
    switch (player.role) {
      case 'civilian': return 'CIVILIAN';
      case 'undercover': return 'UNDERCOVER';
      case 'mrwhite': return 'MR. WHITE';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }} className="w-full max-w-md">

        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }} className="text-center mb-6">
          <div className="inline-block bg-destructive/20 neon-border p-7 rounded-3xl">
            <Skull className="w-16 h-16 text-destructive" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl text-destructive text-center mb-6"
          style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em', textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
          STATUS: TERMINATED
        </motion.h2>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={`bg-gradient-to-br ${getRoleGradient()} border-0 p-7 shadow-2xl mb-5`}>
            <div className="text-center">
              <div className="mb-4">{getRoleIcon()}</div>
              <h3 className="text-3xl text-white mb-3" style={{ fontFamily: 'Orbitron' }}>{player.name}</h3>
              <Badge className="bg-white/20 text-white border-white/30 border px-5 py-1.5"
                style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                {getRoleName()}
              </Badge>
              {player.word && (
                <div className="mt-3 bg-white/10 rounded-lg p-2 text-white/80 text-sm" style={{ fontFamily: 'Orbitron' }}>
                  Kata: {player.word}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {isHost ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button onClick={() => { playSound('click'); onConfirm(); }}
              className="w-full bg-primary hover:bg-primary/90 py-6 text-lg pulse-glow"
              style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}>
              LANJUTKAN
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground text-sm py-4" style={{ fontFamily: 'Rajdhani' }}>
            Menunggu host melanjutkan...
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
