import React, { useState, useRef, useEffect } from 'react'
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

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const seenCount = players?.filter((p) => p.seen).length ?? 0

  const handleOpenCard = (player: Player) => {
    setViewingPlayer(player)
    setIsRevealing(false)
    setShowWord(false)
    playSound?.('click')
  }

  const handleScan = () => {
    setIsRevealing(true)
    playSound?.('scan')
    vibrate?.(100)

    timeoutRef.current = setTimeout(() => {
      setShowWord(true)
    }, 500)
  }

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (viewingPlayer) {
      onPlayerSeen(viewingPlayer.id)
    }

    setViewingPlayer(null)
    setIsRevealing(false)
    setShowWord(false)
  }

  // Cleanup jika component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* ================= GRID VIEW ================= */}
      {!viewingPlayer && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex justify-between mb-2 text-sm">
                <span>IDENTIFIKASI DIRI</span>
                <span>
                  {seenCount} / {players?.length ?? 0}
                </span>
              </div>

              <div className="h-2 rounded-full overflow-hidden bg-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      players?.length
                        ? (seenCount / players.length) * 100
                        : 0
                    }%`,
                  }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-blue-500"
                />
              </div>
            </motion.div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                PILIH NAMA ANDA
              </h2>
              <p className="text-gray-400">
                Untuk mengambil data rahasia
              </p>
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {players?.map((player, i) => (
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
                        ? 'opacity-50'
                        : ''
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
                        <span>{player.name}</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {viewingPlayer && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">
                  {viewingPlayer.name}
                </h2>
                <p className="text-gray-400">
                  {!isRevealing
                    ? 'Siap melihat identitas anda?'
                    : 'Identitas Terungkap'}
                </p>
              </div>

              {!isRevealing ? (
                <Card
                  onClick={handleScan}
                  className="p-10 text-center cursor-pointer"
                >
                  <EyeOff className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-xl mb-2">
                    SENTUH UNTUK SCAN
                  </h3>
                  <p className="text-sm text-gray-500">
                    Pastikan hanya anda yang melihat
                  </p>
                </Card>
              ) : (
                <Card className="p-8 text-center bg-blue-600 text-white">
                  {viewingPlayer.role === 'mrwhite' ? (
                    <Fingerprint className="w-10 h-10 mx-auto mb-4" />
                  ) : (
                    <Eye className="w-10 h-10 mx-auto mb-4" />
                  )}

                  {showWord && (
                    <>
                      <div className="text-xs mb-2">
                        KATA KUNCI ANDA
                      </div>

                      <div className="text-4xl mb-4">
                        {viewingPlayer.word ?? '???'}
                      </div>

                      <div className="text-xs bg-white/20 p-3 rounded">
                        {viewingPlayer.word
                          ? '⚠️ Jangan sebutkan kata ini secara langsung!'
                          : '⚠️ Dengarkan dan tebak kata rahasianya!'}
                      </div>
                    </>
                  )}
                </Card>
              )}

              {isRevealing && showWord && (
                <div className="mt-6">
                  <Button
                    onClick={handleClose}
                    className="w-full py-5 text-lg"
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
