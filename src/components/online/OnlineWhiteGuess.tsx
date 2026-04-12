import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { playSound } from '../../App';

interface OnlineWhiteGuessProps {
  isMrWhite: boolean;
  onGuess: (guess: string) => void;
}

export function OnlineWhiteGuess({ isMrWhite, onGuess }: OnlineWhiteGuessProps) {
  const [guess, setGuess] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || submitted) return;
    playSound('click');
    setSubmitted(true);
    onGuess(guess.trim());
  };

  if (!isMrWhite) {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm">
          <div className="inline-block bg-gradient-to-br from-gray-800 to-black neon-border p-8 rounded-3xl mb-6">
            <AlertCircle className="w-16 h-16 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl text-white mb-3" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
            INTERUPSI!
          </h2>
          <p className="text-muted-foreground" style={{ fontFamily: 'Rajdhani' }}>
            Mr. White sedang menebak kata rahasia...
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs" style={{ fontFamily: 'Rajdhani' }}>Menunggu hasil tebakan</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }} className="w-full max-w-md">

        <motion.div initial={{ y: -50, opacity: 0, rotate: -180 }} animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }} className="text-center mb-6">
          <div className="inline-block bg-gradient-to-br from-gray-800 to-black neon-border p-7 rounded-3xl">
            <AlertCircle className="w-16 h-16 text-white glitch" data-text="" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="text-center mb-6">
          <h2 className="text-3xl text-white mb-2 glitch" data-text="INTERUPSI!"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
            INTERUPSI!
          </h2>
          <p className="text-muted-foreground" style={{ fontFamily: 'Rajdhani' }}>
            Kamu adalah Mr. White! Tebak kata rahasia civilian.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="neon-border bg-card/90 backdrop-blur-md p-7 tech-corners">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-xs text-muted-foreground text-center"
                  style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                  TEBAK KATA KUNCI CIVILIAN
                </label>
                <Input
                  value={guess}
                  onChange={e => setGuess(e.target.value.toUpperCase())}
                  placeholder="MASUKKAN TEBAKAN..."
                  className="bg-input-background neon-border text-primary uppercase text-center text-2xl py-7"
                  style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}
                  disabled={submitted}
                  autoFocus
                />
              </div>

              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <Sparkles className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Rajdhani' }}>
                  Jika benar, Mr. White menang! Jika salah, game lanjut.
                </p>
              </div>

              <Button type="submit" disabled={!guess.trim() || submitted}
                className="w-full bg-primary hover:bg-primary/90 py-6 text-lg pulse-glow disabled:opacity-50"
                style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}>
                {submitted ? 'MENGIRIM...' : 'HACK SYSTEM'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
