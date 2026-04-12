// ─────────────────────────────────────────────
//  OnlineGame — orkestrator semua fase online
// ─────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Play, LogOut, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  subscribeRoom, markSeen, eliminatePlayer, confirmElimination,
  submitWhiteGuess, resetRoom, deleteRoom, leaveRoom, startGame, getDeviceId,
} from '../../firebase/gameService';
import type { OnlineRoom, OnlinePlayer } from '../../firebase/gameService';
import { useTheme } from '../../context/ThemeContext';
import { playSound, vibrate } from '../../App';

import { OnlineDistribution } from './OnlineDistribution';
import { OnlineGamePlay } from './OnlineGamePlay';
import { OnlineEliminationResult } from './OnlineEliminationResult';
import { OnlineWhiteGuess } from './OnlineWhiteGuess';
import { OnlineResults } from './OnlineResults';

interface OnlineGameProps {
  roomCode: string;
  isHost: boolean;
  onLeave: () => void;
}

export function OnlineGame({ roomCode, isHost, onLeave }: OnlineGameProps) {
  const { theme, setTheme } = useTheme();
  const [room, setRoom] = useState<OnlineRoom | null>(null);
  const deviceId = getDeviceId();

  useEffect(() => {
    const unsub = subscribeRoom(roomCode, (r) => {
      if (!r) { onLeave(); return; }
      setRoom(r);
      setTheme(r.themeId);
      if (r.phase === 'elimination') { playSound('glitch'); vibrate(300); }
      if (r.phase === 'results') { playSound('win'); }
    });
    return unsub;
  }, [roomCode]);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <p className="text-primary animate-pulse" style={{ fontFamily: 'Orbitron', letterSpacing: '0.2em' }}>
          MENGHUBUNGKAN...
        </p>
      </div>
    );
  }

  const me = room.players?.[deviceId] as OnlinePlayer | undefined;
  const allPlayers = Object.values(room.players ?? {}) as OnlinePlayer[];
  const eliminated = room.eliminatedPlayerId
    ? (room.players?.[room.eliminatedPlayerId] as OnlinePlayer | undefined)
    : null;
  const votes = room.votes ?? {};
  const playerCount = allPlayers.length;
  const canStart = isHost && playerCount >= 3;

  // ── Handlers ──────────────────────────────────
  const handleSeen = () => markSeen(roomCode, deviceId);
  const handleEliminate = (targetId: string) => eliminatePlayer(roomCode, targetId);
  const handleConfirmElim = () => {
    if (!eliminated) return;
    confirmElimination(roomCode, eliminated, room.civilianWord);
  };
  const handleWhiteGuess = (guess: string) => submitWhiteGuess(roomCode, guess, room.civilianWord);
  const handleLeave = async () => {
    if (isHost) await deleteRoom(roomCode);
    else await leaveRoom(roomCode, deviceId);
    onLeave();
  };
  const handleReset = () => resetRoom(roomCode, room.themeId);

  // Host mulai ulang game dari fase waiting
  const handleStartAgain = () => {
    playSound('win');
    // 1 undercover default, sesuaikan kalau mau
    const undercoverCount = Math.max(1, Math.floor(playerCount / 4));
    startGame(roomCode, undercoverCount, 0, room.themeId);
  };

  // ── Phase: waiting (main lagi, nunggu pemain cukup) ───────────────────
  if (room.phase === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <Clock className="w-12 h-12 text-primary mx-auto mb-3 animate-pulse" />
            <h2 className="text-2xl neon-text mb-1" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
              MAIN LAGI?
            </h2>
            <p className="text-muted-foreground text-sm" style={{ fontFamily: 'Rajdhani' }}>
              {playerCount < 3
                ? `Butuh minimal 3 pemain (${3 - playerCount} lagi)`
                : `${playerCount} pemain siap — host bisa mulai!`}
            </p>
          </motion.div>

          <Card className="neon-border bg-card/95 backdrop-blur-md p-5 tech-corners mb-4">
            <h3 className="text-xs neon-text mb-3 flex items-center gap-2"
              style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
              <Users className="w-4 h-4" /> PEMAIN DI ROOM ({playerCount})
            </h3>
            <div className="space-y-2">
              {allPlayers.map(p => (
                <div key={p.deviceId} className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ background: `${theme.primary}10`, border: `1px solid ${theme.border}` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: `${theme.primary}30`, color: theme.primary, fontFamily: 'Orbitron' }}>
                    {p.name.charAt(0)}
                  </div>
                  <span className="text-sm flex-1 truncate" style={{ color: '#f8fafc', fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                    {p.name}
                  </span>
                  {p.deviceId === deviceId && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{ background: `${theme.primary}30`, color: theme.primary, fontFamily: 'Rajdhani' }}>
                      KAMU
                    </span>
                  )}
                </div>
              ))}
              {playerCount < 3 && (
                <p className="text-center text-xs text-muted-foreground py-2 animate-pulse" style={{ fontFamily: 'Rajdhani' }}>
                  Menunggu pemain bergabung...
                </p>
              )}
            </div>
          </Card>

          <div className="space-y-2">
            {isHost ? (
              <Button onClick={handleStartAgain} disabled={!canStart}
                className="w-full py-5 bg-primary hover:bg-primary/90 pulse-glow disabled:opacity-40"
                style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}>
                <Play className="w-4 h-4 mr-2" />
                {canStart ? 'MULAI GAME' : `TUNGGU PEMAIN (${playerCount}/3)`}
              </Button>
            ) : (
              <div className="text-center py-3">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs" style={{ fontFamily: 'Rajdhani', letterSpacing: '0.1em' }}>
                    {canStart ? 'Menunggu host memulai...' : `Menunggu pemain (${playerCount}/3)...`}
                  </span>
                </div>
              </div>
            )}
            <Button onClick={handleLeave} variant="outline"
              className="w-full neon-border text-destructive hover:bg-destructive/10 border-destructive/30"
              style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em', fontSize: 11 }}>
              <LogOut className="w-3.5 h-3.5 mr-2" />
              KELUAR ROOM
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: distribution ───────────────────────
  if (room.phase === 'distribution') {
    return <OnlineDistribution me={me ?? null} players={allPlayers} onSeen={handleSeen} />;
  }

  // ── Phase: gameplay ───────────────────────────
  if (room.phase === 'gameplay') {
    return (
      <OnlineGamePlay
        me={me ?? null} players={allPlayers}
        isHost={isHost} roomCode={roomCode}
        votes={votes} onEliminate={handleEliminate}
      />
    );
  }

  // ── Phase: elimination ────────────────────────
  if (room.phase === 'elimination' && eliminated) {
    return (
      <OnlineEliminationResult
        player={eliminated} isHost={isHost} onConfirm={handleConfirmElim}
      />
    );
  }

  // ── Phase: whiteguess ─────────────────────────
  if (room.phase === 'whiteguess') {
    const mrWhitePlayer = allPlayers.find(
      p => p.deviceId === deviceId && p.role === 'mrwhite' && p.dead
    );
    return <OnlineWhiteGuess isMrWhite={!!mrWhitePlayer} onGuess={handleWhiteGuess} />;
  }

  // ── Phase: results ────────────────────────────
  if (room.phase === 'results') {
    return (
      <OnlineResults
        room={room} isHost={isHost} deviceId={deviceId}
        onPlayAgain={handleReset} onLeave={handleLeave}
      />
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center relative z-10">
      <p className="text-primary animate-pulse" style={{ fontFamily: 'Orbitron' }}>LOADING...</p>
    </div>
  );
}
