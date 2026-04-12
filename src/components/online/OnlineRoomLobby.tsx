import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Users, Play, LogOut, Crown, Wifi } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useTheme } from '../../context/ThemeContext';
import {
  subscribeRoom, startGame, deleteRoom, leaveRoom, resetRoom,
  getDeviceId,
} from '../../firebase/gameService';
import type { OnlineRoom } from '../../firebase/gameService';
import { playSound } from '../../App';
import type { ThemeId } from '../../context/ThemeContext';

interface OnlineRoomLobbyProps {
  roomCode: string;
  isHost: boolean;
  themeId: ThemeId;
  onGameStarted: (room: OnlineRoom) => void;
  onLeave: () => void;
}

export function OnlineRoomLobby({ roomCode, isHost, themeId, onGameStarted, onLeave }: OnlineRoomLobbyProps) {
  const { theme } = useTheme();
  const [room, setRoom] = useState<OnlineRoom | null>(null);
  const [copied, setCopied] = useState(false);
  const [undercoverCount, setUndercoverCount] = useState(1);
  const [mrWhiteCount, setMrWhiteCount] = useState(0);
  const [starting, setStarting] = useState(false);
  const deviceId = getDeviceId();

  useEffect(() => {
    const unsub = subscribeRoom(roomCode, (r) => {
      if (!r) { onLeave(); return; }
      setRoom(r);
      // Kalau phase berubah dari lobby, berarti game dimulai
      if (r.phase !== 'lobby') onGameStarted(r);
    });
    return unsub;
  }, [roomCode]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    playSound('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    if (!room) return;
    const players = Object.values(room.players ?? {});
    const n = players.length;
    if (n < 3) return;
    if (undercoverCount + mrWhiteCount >= n) return;

    setStarting(true);
    playSound('win');
    await startGame(roomCode, undercoverCount, mrWhiteCount, themeId);
    setStarting(false);
  };

  const handleLeave = async () => {
    playSound('click');
    if (isHost) {
      await deleteRoom(roomCode);
    } else {
      await leaveRoom(roomCode, deviceId);
    }
    onLeave();
  };

  const players = room ? Object.values(room.players ?? {}) : [];
  const n = players.length;
  const civilianCount = n - undercoverCount - mrWhiteCount;
  const canStart = isHost && n >= 3 && civilianCount >= 1 && undercoverCount + mrWhiteCount < n;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-lg">
        {/* Room Code Banner */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <p className="text-muted-foreground text-xs mb-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}>
            KODE ROOM — BAGIKAN KE TEMAN
          </p>
          <button onClick={copyCode}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl neon-border transition-all hover:bg-primary/10"
            style={{ background: `${theme.card}cc` }}>
            <span className="text-5xl text-primary font-bold tracking-[0.3em]"
              style={{ fontFamily: 'Orbitron', textShadow: `0 0 20px ${theme.primary}` }}>
              {roomCode}
            </span>
            {copied
              ? <Check className="w-6 h-6 text-green-400" />
              : <Copy className="w-6 h-6 text-primary opacity-60" />}
          </button>
          <p className="text-muted-foreground text-[10px] mt-2" style={{ fontFamily: 'Rajdhani' }}>
            {copied ? '✓ Disalin!' : 'Tap untuk salin kode'}
          </p>
        </motion.div>

        <Card className="neon-border bg-card/95 backdrop-blur-md p-5 tech-corners">
          {/* Players List */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm neon-text flex items-center gap-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                <Users className="w-4 h-4" /> PEMAIN ({n}/12)
              </h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400" style={{ fontFamily: 'Rajdhani' }}>ONLINE</span>
              </div>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              <AnimatePresence>
                {players.map((p) => (
                  <motion.div key={p.deviceId}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2"
                    style={{ background: `${theme.primary}10`, border: `1px solid ${theme.border}` }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${theme.primary}30`, color: theme.primary, fontFamily: 'Orbitron' }}>
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-sm flex-1 truncate" style={{ color: '#f8fafc', fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                      {p.name}
                    </span>
                    {p.deviceId === room?.hostId && (
                      <Crown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.secondary }} />
                    )}
                    {p.deviceId === deviceId && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${theme.primary}30`, color: theme.primary, fontFamily: 'Rajdhani' }}>
                        KAMU
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {n < 3 && (
                <p className="text-center text-xs text-muted-foreground py-2" style={{ fontFamily: 'Rajdhani' }}>
                  Butuh minimal 3 pemain ({3 - n} lagi)
                </p>
              )}
            </div>
          </div>

          {/* Role Config — host only */}
          {isHost && n >= 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-5 rounded-xl p-4 space-y-3"
              style={{ background: `${theme.muted}60`, border: `1px solid ${theme.border}` }}>
              <p className="text-xs neon-text" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>KONFIGURASI ROLE</p>

              {/* Undercover */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>UNDERCOVER</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setUndercoverCount(Math.max(1, undercoverCount - 1))}
                    className="w-7 h-7 rounded-lg neon-border flex items-center justify-center text-primary hover:bg-primary/20">−</button>
                  <span className="w-6 text-center text-xl text-primary" style={{ fontFamily: 'Orbitron' }}>{undercoverCount}</span>
                  <button onClick={() => setUndercoverCount(Math.min(n - 2, undercoverCount + 1))}
                    className="w-7 h-7 rounded-lg neon-border flex items-center justify-center text-primary hover:bg-primary/20">+</button>
                </div>
              </div>

              {/* Mr. White */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>MR. WHITE</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMrWhiteCount(Math.max(0, mrWhiteCount - 1))}
                    className="w-7 h-7 rounded-lg neon-border flex items-center justify-center text-primary hover:bg-primary/20">−</button>
                  <span className="w-6 text-center text-xl text-primary" style={{ fontFamily: 'Orbitron' }}>{mrWhiteCount}</span>
                  <button onClick={() => setMrWhiteCount(Math.min(n - 2, mrWhiteCount + 1))}
                    className="w-7 h-7 rounded-lg neon-border flex items-center justify-center text-primary hover:bg-primary/20">+</button>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                {[
                  { label: 'CIVILIAN', val: Math.max(0, civilianCount), color: '#60a5fa' },
                  { label: 'UNDERCOVER', val: undercoverCount, color: '#fb923c' },
                  { label: 'MR. WHITE', val: mrWhiteCount, color: '#94a3b8' },
                ].map(s => (
                  <div key={s.label} className="text-center rounded-lg py-2"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}40` }}>
                    <div className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'Orbitron' }}>{s.val}</div>
                    <div className="text-[8px] text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="space-y-2">
            {isHost ? (
              <Button onClick={handleStart} disabled={!canStart || starting}
                className="w-full py-5 bg-primary hover:bg-primary/90 pulse-glow disabled:opacity-40"
                style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}>
                <Play className="w-4 h-4 mr-2" />
                {starting ? 'MEMULAI...' : 'MULAI GAME'}
              </Button>
            ) : (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs" style={{ fontFamily: 'Rajdhani', letterSpacing: '0.1em' }}>
                    Menunggu host memulai game...
                  </span>
                </div>
              </div>
            )}

            <Button onClick={handleLeave} variant="outline"
              className="w-full neon-border text-destructive hover:bg-destructive/10 border-destructive/30"
              style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em', fontSize: 11 }}>
              <LogOut className="w-3.5 h-3.5 mr-2" />
              {isHost ? 'TUTUP ROOM' : 'KELUAR ROOM'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
