import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Eye, EyeOff, Fingerprint, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Player } from '../App';
import { playSound, vibrate } from '../App';

interface CardDistributionProps {
  players: Player[];
  onPlayerSeen: (playerId: number) => void;
}

export function CardDistribution({ players, onPlayerSeen }: CardDistributionProps) {
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showWord, setShowWord] = useState(false);

  const seenCount = players.filter((p) => p.seen).length;

  const handleOpenCard = (player: Player) => {
    setViewingPlayer(player);
    setIsRevealing(false);
    setShowWord(false);
    playSound('click');
  };

  const handleScan = () => {
    setIsRevealing(true);
    // Samain semua sound jadi 'scan' biar Mr. White ga ketahuan
    playSound('scan');
    vibrate(100);
    setTimeout(() => setShowWord(true), 500);
  };

  const handleClose = () => {
    if (viewingPlayer) {
      onPlayerSeen(viewingPlayer.id);
      setViewingPlayer(null);
      setIsRevealing(false);
      setShowWord(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'civilian': return 'CIVILIAN';
      case 'undercover': return 'UNDERCOVER';
      case 'mrwhite': return 'MR. WHITE';
      default: return '';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'civilian': return 'from-blue-600 to-cyan-600';
      case 'undercover': return 'from-orange-600 to-red-600';
      case 'mrwhite': return 'from-gray-800 to-black';
      default: return 'from-primary to-secondary';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'civilian': return 'Anda tahu kata rahasianya. Temukan impostor!';
      case 'undercover': return 'Kata anda berbeda. Berusaha menyamar!';
      case 'mrwhite': return 'Anda tidak punya kata. Tebak dan bertahan!';
      default: return '';
    }
  };

  return (
    <>
      {/* Grid View */}
      {!viewingPlayer && (
        <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative z-10 overflow-hidden">
          <div className="w-full max-w-4xl px-2">
            {/* Progress */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <span className="text-muted-foreground text-xs sm:text-sm" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                  IDENTIFIKASI DIRI
                </span>
                <span className="text-primary text-xs sm:text-sm" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                  {seenCount} / {players.length}
                </span>
              </div>
              <div className="h-2 neon-border rounded-full overflow-hidden bg-card/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(seenCount / players.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-primary"
                  style={{ boxShadow: '0 0 10px rgba(14, 165, 233, 0.8)' }}
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6 sm:mb-8 px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl neon-text mb-2 sm:mb-3" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                PILIH NAMA ANDA
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Rajdhani', letterSpacing: '0.05em' }}>
                Untuk mengambil data rahasia
              </p>
            </motion.div>

            {/* Grid of Players */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <AnimatePresence>
                {players.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Button
                      disabled={player.seen}
                      onClick={() => handleOpenCard(player)}
                      className={`w-full h-20 sm:h-24 ${
                        player.seen
                          ? 'bg-card/30 border-border/30 text-muted-foreground cursor-not-allowed opacity-60'
                          : 'neon-border bg-card/50 hover:bg-card/70 text-primary pulse-glow'
                      } backdrop-blur-md flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all`}
                    >
                      {player.seen ? (
                        <>
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          <span className="text-[10px] sm:text-xs line-through truncate max-w-full px-1" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                            {player.name}
                          </span>
                          <span className="text-[8px] sm:text-[10px]" style={{ fontFamily: 'Rajdhani' }}>
                            DATA DIAMBIL
                          </span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          <span className="text-[10px] sm:text-xs md:text-sm truncate max-w-full px-1" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                            {player.name}
                          </span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Modal View */}
      <AnimatePresence>
        {viewingPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md">
              {/* Player Name */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl neon-text mb-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                  {viewingPlayer.name}
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base" style={{ fontFamily: 'Rajdhani' }}>
                  {!isRevealing ? 'Siap melihat identitas anda?' : 'Identitas Terungkap'}
                </p>
              </motion.div>

              {/* Card */}
              <AnimatePresence mode="wait">
                {!isRevealing ? (
                  <motion.div
                    key="hidden"
                    initial={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className="neon-border bg-card/50 backdrop-blur-md p-8 sm:p-12 cursor-pointer hover:bg-card/70 transition-all tech-corners pulse-glow"
                      onClick={handleScan}
                    >
                      <div className="text-center">
                        <div className="bg-primary/10 neon-border w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <EyeOff className="w-8 h-8 sm:w-10 sm:h-10 text-primary" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl sm:text-2xl neon-text mb-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                          SENTUH UNTUK SCAN
                        </h3>
                        <p className="text-muted-foreground text-xs sm:text-sm" style={{ fontFamily: 'Rajdhani' }}>
                          Pastikan hanya anda yang melihat
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="revealed"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`bg-gradient-to-br ${getRoleColor(viewingPlayer.role)} border-0 p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden`}>
                      {/* Scanning animation */}
                      {viewingPlayer.role === 'mrwhite' && !showWord && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white/20 border-t-white rounded-full"
                          />
                        </div>
                      )}

                      <AnimatePresence mode="wait">
                        {showWord && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                          >
                            <div className="bg-white/10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                              {viewingPlayer.role === 'mrwhite' ? (
                                <Fingerprint className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-pulse" />
                              ) : (
                                <Eye className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                              )}
                            </div>

                            {/* Show role name ONLY for Mr. White */}
                            {viewingPlayer.role === 'mrwhite' && (
                              <>
                                <h3
                                  className="text-2xl sm:text-3xl text-white mb-2 glitch"
                                  data-text="MR. WHITE"
                                  style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}
                                >
                                  MR. WHITE
                                </h3>

                                <p className="text-white/90 mb-6 text-xs sm:text-sm" style={{ fontFamily: 'Rajdhani' }}>
                                  {getRoleDescription(viewingPlayer.role)}
                                </p>
                              </>
                            )}

                            {viewingPlayer.word ? (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 mb-3"
                              >
                                <div className="text-white/70 text-[10px] sm:text-xs mb-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.2em' }}>
                                  KATA KUNCI ANDA
                                </div>
                                <div
                                  className="text-3xl sm:text-4xl md:text-5xl text-white break-words"
                                  style={{
                                    fontFamily: 'Orbitron',
                                    letterSpacing: '0.05em',
                                    textShadow: '0 0 20px rgba(255,255,255,0.5)',
                                  }}
                                >
                                  {viewingPlayer.word}
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-5 mb-3 border-2 border-white/30"
                              >
                                <div className="text-white/70 text-[10px] sm:text-xs mb-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.2em' }}>
                                  KATA KUNCI ANDA
                                </div>
                                <div
                                  className="text-4xl sm:text-5xl md:text-6xl text-white glitch"
                                  data-text="???"
                                  style={{ fontFamily: 'Orbitron' }}
                                >
                                  ???
                                </div>
                              </motion.div>
                            )}

                            <div
                              className={`${
                                viewingPlayer.word ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-destructive/20 border-destructive/50'
                              } border text-white p-2 sm:p-3 rounded-lg text-[10px] sm:text-xs`}
                              style={{ fontFamily: 'Rajdhani' }}
                            >
                              {viewingPlayer.word
                                ? '⚠️ Jangan sebutkan kata ini secara langsung!'
                                : '⚠️ Dengarkan dengan baik dan tebak kata rahasianya!'}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Close Button */}
              {isRevealing && showWord && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-4 sm:mt-6">
                  <Button
                    onClick={handleClose}
                    className="w-full bg-card text-primary hover:bg-card/80 py-5 sm:py-6 text-base sm:text-lg neon-border pulse-glow"
                    style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em', fontWeight: 700 }}
                  >
                    TUTUP AKSES
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
