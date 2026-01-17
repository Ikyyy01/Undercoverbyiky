import React from 'react';
import { Button } from './ui/button';
import { Users, Eye, Zap, Trophy, Sparkles, Target, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { playSound } from '../App';

interface LandingPageProps {
  onStart: () => void;
  onShowLeaderboard: () => void;
}

export function LandingPage({ onStart, onShowLeaderboard }: LandingPageProps) {
  const handleStart = () => {
    playSound('click');
    onStart();
  };

  const handleLeaderboard = () => {
    playSound('click');
    onShowLeaderboard();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
          className="mb-6 flex justify-center"
        >
          <div className="relative">
            {/* Outer glow rings */}
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-secondary/10 blur-2xl rounded-full" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
            
            {/* Icon container with multiple layers */}
            <div className="relative neon-border bg-gradient-to-br from-card to-muted p-6 sm:p-8 rounded-2xl sm:rounded-3xl rainbow-glow">
              <Eye className="w-16 h-16 sm:w-20 sm:h-20 text-primary floating" strokeWidth={1.5} />
              
              {/* Corner decorations */}
              <div className="absolute top-2 right-2 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse" />
              <div className="absolute bottom-2 left-2 w-2 h-2 sm:w-3 sm:h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Orbiting elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 pointer-events-none"
            >
              <Shield className="absolute -top-2 left-1/2 -ml-3 w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 pointer-events-none"
            >
              <Target className="absolute -bottom-2 left-1/2 -ml-3 w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title dengan glitch effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl neon-text mb-3 text-center" 
            style={{ 
              fontFamily: 'Orbitron', 
              fontWeight: 900, 
              fontStyle: 'normal',
              letterSpacing: '0.1em'
            }}
          >
            UNDERCOVER
          </h1>
          
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-0.5 sm:h-1 w-12 sm:w-20 bg-gradient-to-r from-transparent via-primary to-primary" style={{ boxShadow: '0 0 10px rgba(14, 165, 233, 0.8)' }} />
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-primary animate-pulse" />
            <div className="h-0.5 sm:h-1 w-12 sm:w-20 bg-gradient-to-l from-transparent via-primary to-primary" style={{ boxShadow: '0 0 10px rgba(14, 165, 233, 0.8)' }} />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 tracking-wider"
          style={{ fontFamily: 'Rajdhani', fontWeight: 500 }}
        >
          TEMUKAN PENYUSUP SEBELUM TERLAMBAT
        </motion.p>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8"
        >
          {[
            { icon: Users, title: '3-12 PEMAIN', desc: 'Seru dimainkan bersama', color: 'text-primary', bgColor: 'bg-primary/10' },
            { icon: Zap, title: 'DEDUKSI SOSIAL', desc: 'Bohong, tipu, bertahan', color: 'text-secondary', bgColor: 'bg-secondary/10' },
            { icon: Eye, title: 'TEMUKAN SPY', desc: 'Vote dengan bijak', color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="neon-border bg-card/30 backdrop-blur-sm p-4 sm:p-5 rounded-xl tech-corners hover:bg-card/50 transition-all cursor-pointer"
            >
              <div className={`${feature.bgColor} w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3`}>
                <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.color}`} strokeWidth={1.5} />
              </div>
              <h3 className="text-foreground mb-1 sm:mb-2 text-xs sm:text-sm" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm" style={{ fontFamily: 'Rajdhani' }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
        >
          <Button
            onClick={handleStart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg rounded-xl pulse-glow group w-full sm:w-auto"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em', fontWeight: 900 }}
          >
            <Sparkles className="w-5 h-5 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform" />
            MULAI MISI
          </Button>

          <Button
            onClick={handleLeaderboard}
            variant="outline"
            className="neon-border bg-card/50 hover:bg-card/70 text-primary px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-xl backdrop-blur-sm group w-full sm:w-auto"
            style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em', fontWeight: 700 }}
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform" />
            LEADERBOARD
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-8 sm:mt-10 flex items-center justify-center gap-3"
        >
          <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-muted-foreground/30" />
          <p className="text-muted-foreground text-xs sm:text-sm" style={{ fontFamily: 'Rajdhani', letterSpacing: '0.2em' }}>
            BY IKY
          </p>
          <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-muted-foreground/30" />
        </motion.div>
      </motion.div>
    </div>
  );
}
