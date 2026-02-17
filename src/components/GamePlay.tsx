import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Eye, EyeOff, Fingerprint, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Player } from '../App'
import { playSound, vibrate } from '../App'

interface CardDistributionProps {
  players: Player[]
  onPlayerSeen: (playerId: number) => void
}

export function CardDistribution({
  players,
  onPlayerSeen,
}: CardDistributionProps) {
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [showWord, setShowWord] = useState(false)

  const seenCount = players.filter((p) => p.seen).length

  const handleOpenCard = (player: Player) => {
    setViewingPlayer(player)
    setIsRevealing(false)
    setShowWord(false)
    playSound('click')
  }

  const handleScan = () => {
    setIsRevealing(true)
    playSound('scan')
    vibrate(100)
    setTimeout(() => setShowWord(true), 500)
  }

  const handleClose = () => {
    if (viewingPlayer) {
      onPlayerSeen(viewingPlayer.id)
      setViewingPlayer(null)
      setIsRevealing(false)
      setShowWord(false)
    }
  }

  return (
    <>
      {/* ================= GRID VIEW ================= */}
      {!viewingPlayer && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10 overflow-hidden">
          <div className="w-full max-w-4xl">
            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground text-sm">
                  IDENTIFIKASI DIRI
                </span>
                <span className="text-primary text-sm">
                  {seenCount} / {players.length}
                </span>
              </div>

              <div className="h-2 rounded-full overflow-hidden bg-card/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      players.length
                        ? (seenCount / players.length) * 100
                        : 0
                    }%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl neon-text mb-2">
                PILIH NAMA ANDA
              </h2>
              <p className="text-muted-foreground">
                Untuk mengambil data rahasia
              </p>
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                      className={`w-full h-24 flex flex-col items-center justify-center gap-2 ${
                        player.seen
                          ? 'bg-card/30 text-muted-foreground opacity-60'
                          : 'bg-card/50 hover:bg-card/70 text-primary'
                      }`}
                    >
                      {player.seen ? (
                        <>
                          <Lock className="w-5 h-5" />
                          <span className="text-xs line-through">
                            {player.name}
                          </span>
                          <span className="text-[10px]">
                            DATA DIAMBIL
                          </span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-5 h-5" />
                          <span className="text-sm">
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

      {/* ================= MODAL VIEW ================= */}
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
              <div className="text-center mb-6">
                <h2 className="text-3xl neon-text mb-2">
                  {viewingPlayer.name}
                </h2>
                <p className="text-muted-foreground">
                  {!isRevealing
                    ? 'Siap melihat identitas anda?'
                    : 'Identitas Terungkap'}
                </p>
              </div>

              {/* Card */}
              {!isRevealing ? (
                <Card
                  className="bg-card/50 p-10 cursor-pointer hover:bg-card/70 transition-all text-center"
                  onClick={handleScan}
                >
                  <div className="mb-4">
                    <EyeOff className="w-12 h-12 mx-auto text-primary" />
                  </div>
                  <h3 className="text-xl mb-2">
                    SENTUH UNTUK SCAN
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Pastikan hanya anda yang melihat
                  </p>
                </Card>
              ) : (
                <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 border-0 p-8 text-center">
                  <div className="mb-4">
                    {viewingPlayer.role === 'mrwhite' ? (
                      <Fingerprint className="w-10 h-10 mx-auto text-white" />
                    ) : (
                      <Eye className="w-10 h-10 mx-auto text-white" />
                    )}
                  </div>

                  {viewingPlayer.word ? (
                    <>
                      <div className="text-white/70 text-xs mb-2">
                        KATA KUNCI ANDA
                      </div>
                      <div className="text-4xl text-white mb-4">
                        {viewingPlayer.word}
                      </div>
                      <div className="bg-yellow-500/20 border border-yellow-500/50 text-white p-3 rounded text-xs">
                        ⚠️ Jangan sebutkan kata ini secara langsung!
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-white/70 text-xs mb-2">
                        KATA KUNCI ANDA
                      </div>
                      <div className="text-5xl text-white mb-4">
                        ???
                      </div>
                      <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded text-xs">
                        ⚠️ Dengarkan dan tebak kata rahasianya!
                      </div>
                    </>
                  )}
                </Card>
              )}

              {/* Close Button */}
              {isRevealing && (
                <div className="mt-6">
                  <Button
                    onClick={handleClose}
                    className="w-full bg-card text-primary hover:bg-card/80 py-6 text-lg"
                  >
                    TUTUP AKSES
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
