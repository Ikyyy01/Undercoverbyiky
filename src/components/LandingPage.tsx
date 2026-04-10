import React from "react";
import { Button } from "./ui/button";
import { Users, Eye, Zap, Trophy, Sparkles, Target, Shield } from "lucide-react";
import { motion } from "motion/react";
import { playSound } from "../App";
import { useTheme } from "../context/ThemeContext";

interface LandingPageProps {
  onStart: () => void;
  onShowLeaderboard: () => void;
}

export function LandingPage({ onStart, onShowLeaderboard }: LandingPageProps) {
  const { theme } = useTheme();

  const handleStart = () => { playSound("click"); onStart(); };
  const handleLeaderboard = () => { playSound("click"); onShowLeaderboard(); };

  const features = [
    { icon: Users, title: "3-12 PEMAIN", desc: "Seru bersama teman", color: "text-primary", bgColor: "bg-primary/10" },
    { icon: Zap, title: "DEDUKSI SOSIAL", desc: "Bohong, tipu, bertahan", color: "text-secondary", bgColor: "bg-secondary/10" },
    { icon: Eye, title: "TEMUKAN SPY", desc: "Vote dengan bijak", color: "text-orange-400", bgColor: "bg-orange-400/10" },
  ];

  // Theme-specific decorative labels
  const themeLabels: Record<string, { tagline: string; sub: string }> = {
    cyber: { tagline: "UNDERCOVER", sub: "TEMUKAN PENYUSUP SEBELUM TERLAMBAT" },
    football: { tagline: "UNDERCOVER", sub: "SIAPA YANG BUKAN DARI TIM KITA?" },
    mobilelegend: { tagline: "UNDERCOVER", sub: "SIAPA SPY DI LAND OF DAWN?" },
  };
  const labels = themeLabels[theme.id] ?? themeLabels.cyber;

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 overflow-hidden">
      {/* Safe padding for theme selector */}
      <div className="w-full max-w-2xl mx-auto px-4 py-16 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            className="mb-6 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-3xl animate-pulse" style={{ background: `${theme.primary}30` }} />
              <div
                className="relative p-4 sm:p-5 rounded-2xl rainbow-glow neon-border"
                style={{ background: `linear-gradient(135deg, ${theme.card}, ${theme.muted})` }}
              >
                {/* Theme emoji big */}
                <div className="text-4xl sm:text-5xl floating">{theme.emoji}</div>
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse" style={{ background: theme.primary }} />
                <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full animate-pulse" style={{ background: theme.secondary, animationDelay: '0.5s' }} />
              </div>
              {/* Orbiting icons */}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 pointer-events-none">
                <Shield className="absolute -top-2 left-1/2 -ml-2 w-4 h-4" style={{ color: theme.primary }} />
              </motion.div>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-0 pointer-events-none">
                <Target className="absolute -bottom-2 left-1/2 -ml-2 w-4 h-4" style={{ color: theme.secondary }} />
              </motion.div>
            </div>
          </motion.div>

          {/* Theme badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-3"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs"
              style={{
                background: `${theme.primary}15`,
                border: `1px solid ${theme.primary}40`,
                color: theme.primary,
                fontFamily: 'Orbitron',
                letterSpacing: '0.1em',
              }}
            >
              <span>{theme.emoji}</span>
              <span>{theme.label.toUpperCase()}</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-2">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl neon-text mb-2"
              style={{ fontFamily: "Orbitron", fontWeight: 900, letterSpacing: "0.05em" }}
            >
              {labels.tagline}
            </h1>
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to right, transparent, ${theme.primary})`, boxShadow: `0 0 8px ${theme.primary}80` }} />
              <Sparkles className="w-3 h-3 animate-pulse" style={{ color: theme.primary }} />
              <div className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to left, transparent, ${theme.primary})`, boxShadow: `0 0 8px ${theme.primary}80` }} />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs sm:text-sm text-muted-foreground mb-6 tracking-wider px-4"
            style={{ fontFamily: "Rajdhani", fontWeight: 500 }}
          >
            {labels.sub}
          </motion.p>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-3 gap-2 sm:gap-3 mb-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="neon-border bg-card/30 backdrop-blur-sm p-2 sm:p-3 md:p-4 rounded-xl tech-corners hover:bg-card/50 transition-all"
              >
                <div className={`${feature.bgColor} w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2`}>
                  <feature.icon className={`w-4 h-4 ${feature.color}`} strokeWidth={1.5} />
                </div>
                <h3
                  className="text-foreground mb-0.5 text-[9px] sm:text-[10px] leading-tight"
                  style={{ fontFamily: "Orbitron", letterSpacing: "0.08em" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-muted-foreground text-[9px] sm:text-[10px] leading-tight hidden sm:block"
                  style={{ fontFamily: "Rajdhani" }}
                >
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4"
          >
            <Button
              onClick={handleStart}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-sm rounded-xl pulse-glow group w-full sm:w-auto"
              style={{ fontFamily: "Orbitron", letterSpacing: "0.15em", fontWeight: 900 }}
            >
              <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              MULAI MISI
            </Button>
            <Button
              onClick={handleLeaderboard}
              variant="outline"
              className="neon-border bg-card/50 hover:bg-card/70 text-primary px-6 py-4 text-xs rounded-xl backdrop-blur-sm group w-full sm:w-auto"
              style={{ fontFamily: "Orbitron", letterSpacing: "0.1em", fontWeight: 700 }}
            >
              <Trophy className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              LEADERBOARD
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-6 flex items-center justify-center gap-2"
          >
            <div className="h-px w-6 sm:w-8" style={{ background: `linear-gradient(to right, transparent, ${theme.border})` }} />
            <p className="text-muted-foreground text-[10px] sm:text-xs" style={{ fontFamily: "Rajdhani", letterSpacing: "0.2em" }}>
              BY IKY
            </p>
            <div className="h-px w-6 sm:w-8" style={{ background: `linear-gradient(to left, transparent, ${theme.border})` }} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
