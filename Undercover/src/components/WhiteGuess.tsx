import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { playSound } from '../App';

interface WhiteGuessProps {
  onGuess: (guess: string) => void;
}

export function WhiteGuess({ onGuess }: WhiteGuessProps) {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      playSound('click');
      onGuess(guess.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-full max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ y: -50, opacity: 0, rotate: -180 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-center mb-8"
        >
          <div className="inline-block bg-gradient-to-br from-gray-800 to-black neon-border p-8 rounded-3xl relative">
            <div className="absolute inset-0 blur-xl bg-white/10 rounded-3xl" />
            <AlertCircle className="w-20 h-20 text-white relative z-10 glitch" data-text="" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h2
            className="text-4xl sm:text-5xl text-white mb-3 glitch"
            data-text="INTERUPSI!"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
          >
            INTERUPSI!
          </h2>
          <p className="text-muted-foreground text-lg" style={{ fontFamily: 'Rajdhani' }}>
            Mr. White mencoba menebak kata rahasia!
          </p>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="neon-border bg-card/90 backdrop-blur-md p-8 tech-corners">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  className="block mb-3 text-sm text-muted-foreground text-center"
                  style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
                >
                  TEBAK KATA KUNCI CIVILIAN
                </label>
                <Input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value.toUpperCase())}
                  placeholder="MASUKKAN TEBAKAN..."
                  className="bg-input-background neon-border text-primary uppercase text-center text-2xl py-8"
                  style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}
                  autoFocus
                />
              </div>

              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Rajdhani' }}>
                  Jika tebakan benar, Mr. White menang!
                  <br />
                  Jika salah, permainan dilanjutkan.
                </p>
              </div>

              <Button
                type="submit"
                disabled={!guess.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-7 text-lg pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em', fontWeight: 700 }}
              >
                HACK SYSTEM
              </Button>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
