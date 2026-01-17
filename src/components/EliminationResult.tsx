import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Skull, Shield, Eye, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { Player } from '../App';
import { playSound } from '../App';

interface EliminationResultProps {
  player: Player;
  onConfirm: () => void;
}

export function EliminationResult({ player, onConfirm }: EliminationResultProps) {
  const getRoleIcon = () => {
    switch (player.role) {
      case 'civilian':
        return <Shield className="w-16 h-16 text-blue-400" />;
      case 'undercover':
        return <Eye className="w-16 h-16 text-orange-400" />;
      case 'mrwhite':
        return <AlertCircle className="w-16 h-16 text-white" />;
      default:
        return null;
    }
  };

  const getRoleName = () => {
    switch (player.role) {
      case 'civilian':
        return 'CIVILIAN';
      case 'undercover':
        return 'UNDERCOVER';
      case 'mrwhite':
        return 'MR. WHITE';
      default:
        return '';
    }
  };

  const getRoleColor = () => {
    switch (player.role) {
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

  const handleConfirm = () => {
    playSound('click');
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-full max-w-md"
      >
        {/* Skull Icon */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-block bg-destructive/20 neon-border p-8 rounded-3xl">
            <Skull className="w-20 h-20 text-destructive" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl sm:text-5xl text-destructive text-center mb-8"
          style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em', textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
        >
          STATUS: TERMINATED
        </motion.h2>

        {/* Player Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={`bg-gradient-to-br ${getRoleColor()} border-0 p-8 shadow-2xl mb-6`}>
            <div className="text-center">
              {/* Icon */}
              <div className="mb-6">{getRoleIcon()}</div>

              {/* Name */}
              <h3 className="text-4xl text-white mb-4" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                {player.name}
              </h3>

              {/* Role Badge */}
              <Badge
                className="bg-white/20 text-white border-white/30 border mb-6 px-6 py-2 text-lg"
                style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
              >
                {getRoleName()}
              </Badge>

              {/* Word */}
              {player.word ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-xs mb-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.2em' }}>
                    KATA RAHASIA
                  </div>
                  <div className="text-3xl text-white" style={{ fontFamily: 'Orbitron' }}>
                    {player.word}
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-xs mb-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.2em' }}>
                    KATA RAHASIA
                  </div>
                  <div className="text-3xl text-white glitch" data-text="???" style={{ fontFamily: 'Orbitron' }}>
                    ???
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Continue Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Button
            onClick={handleConfirm}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-7 text-lg pulse-glow"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em', fontWeight: 700 }}
          >
            LANJUTKAN
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
