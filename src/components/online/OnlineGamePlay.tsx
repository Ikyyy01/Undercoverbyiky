import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users, Vote, Skull, Shield, Eye, Check, Gavel } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { OnlinePlayer, OnlineRoom } from '../../firebase/gameService';
import { castVote, cancelVote, executeVoteElimination } from '../../firebase/gameService';
import { playSound, vibrate } from '../../App';
import { useTheme } from '../../context/ThemeContext';

interface OnlineGamePlayProps {
  me: OnlinePlayer | null;
  players: OnlinePlayer[];
  isHost: boolean;
  roomCode: string;
  votes: Record<string, string>; // votes[voterDeviceId] = targetDeviceId
  onEliminate: (targetDeviceId: string) => void;
}

export function OnlineGamePlay({ me, players, isHost, roomCode, votes }: OnlineGamePlayProps) {
  const { theme } = useTheme();

  const alivePlayers = players.filter(p => !p.dead);
  const deadPlayers = players.filter(p => p.dead);
  const myVote = me ? (votes?.[me.deviceId] ?? null) : null;

  // Hitung vote per target
  const voteCounts: Record<string, number> = {};
  for (const targetId of Object.values(votes ?? {})) {
    if (alivePlayers.find(p => p.deviceId === targetId)) {
      voteCounts[targetId] = (voteCounts[targetId] ?? 0) + 1;
    }
  }
  const totalVotes = Object.keys(votes ?? {}).length;
  const maxVotes = Math.max(0, ...Object.values(voteCounts));

  const handleVote = (targetId: string) => {
    if (!me || me.dead) return;
    playSound('click');
    vibrate(100);
    if (myVote === targetId) {
      // Batalkan vote
      cancelVote(roomCode, me.deviceId);
    } else {
      // Kirim / ganti vote
      castVote(roomCode, me.deviceId, targetId);
    }
  };

  const handleExecute = () => {
    if (!isHost) return;
    playSound('glitch');
    vibrate(300);
    executeVoteElimination(roomCode);
  };

  const aliveCount = alivePlayers.length;
  const majority = Math.floor(aliveCount / 2) + 1;
  const canExecute = isHost && maxVotes > 0;

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-2xl mx-auto px-3 py-4 pb-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4 pt-14">
          <h2 className="text-2xl sm:text-3xl neon-text mb-1" style={{ fontFamily: 'Orbitron', letterSpacing: '0.08em' }}>
            FASE VOTING
          </h2>
          <p className="text-muted-foreground text-xs" style={{ fontFamily: 'Rajdhani' }}>
            {me?.dead
              ? 'Kamu sudah tereliminasi — menonton saja'
              : 'Tap nama untuk vote · Tap lagi untuk batalkan'}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { icon: Users, label: 'HIDUP', value: alivePlayers.length, color: theme.primary },
            { icon: Skull, label: 'MATI', value: deadPlayers.length, color: '#ef4444' },
            { icon: Vote, label: 'VOTES', value: totalVotes, color: theme.secondary },
            { icon: Shield, label: 'MAYOR', value: majority, color: '#60a5fa' },
          ].map((s, i) => (
            <Card key={i} className="neon-border bg-card/30 p-2 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
              <div className="text-xl font-bold" style={{ color: s.color, fontFamily: 'Orbitron' }}>{s.value}</div>
              <div className="text-[9px] text-muted-foreground" style={{ fontFamily: 'Orbitron' }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* My role indicator */}
        {me && (
          <div className="mb-4 rounded-lg px-3 py-2 text-center"
            style={{ background: `${theme.primary}10`, border: `1px solid ${theme.border}` }}>
            <span className="text-xs text-muted-foreground" style={{ fontFamily: 'Rajdhani' }}>
              Kamu: <span style={{ color: theme.primary, fontFamily: 'Orbitron' }}>{me.name}</span>
              {me.word && <> · Kata: <span style={{ color: theme.primary }}>{me.word}</span></>}
              {!me.word && me.role === 'mrwhite' && <> · <span style={{ color: '#94a3b8' }}>MR. WHITE</span></>}
              {myVote && (
                <> · Vote: <span style={{ color: '#fb923c', fontFamily: 'Orbitron' }}>
                  {alivePlayers.find(p => p.deviceId === myVote)?.name ?? '?'}
                </span></>
              )}
            </span>
          </div>
        )}

        {/* Player list */}
        <h3 className="text-sm neon-text mb-3 text-center" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
          TAP UNTUK VOTE
        </h3>

        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {alivePlayers.map((player, i) => {
              const isMe = player.deviceId === me?.deviceId;
              const myVoteOnThis = myVote === player.deviceId;
              const voteCount = voteCounts[player.deviceId] ?? 0;
              const isLeading = voteCount > 0 && voteCount === maxVotes;
              const votePercent = aliveCount > 0 ? (voteCount / aliveCount) * 100 : 0;

              // Siapa aja yang vote ke player ini
              const voterNames = Object.entries(votes ?? {})
                .filter(([, tId]) => tId === player.deviceId)
                .map(([vId]) => players.find(p => p.deviceId === vId)?.name ?? '?');

              return (
                <motion.div key={player.deviceId}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.04 }}
                  onClick={() => !isMe && !me?.dead && handleVote(player.deviceId)}
                  className="neon-border backdrop-blur-md rounded-xl overflow-hidden"
                  style={{
                    background: myVoteOnThis ? `${theme.primary}20` : isMe ? `${theme.card}40` : `${theme.card}80`,
                    borderColor: isLeading ? '#ef4444' : myVoteOnThis ? theme.primary : theme.border,
                    cursor: !isMe && !me?.dead ? 'pointer' : 'default',
                    boxShadow: isLeading ? '0 0 16px rgba(239,68,68,0.4)' : myVoteOnThis ? `0 0 12px ${theme.glowColor}` : 'none',
                  }}>
                  <div className="flex items-center gap-3 p-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold relative"
                      style={{
                        background: myVoteOnThis ? theme.primary : `${theme.primary}30`,
                        color: myVoteOnThis ? '#020617' : theme.primary,
                        fontFamily: 'Orbitron', fontSize: 14,
                      }}>
                      {player.name.charAt(0)}
                      {myVoteOnThis && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-black" />
                        </div>
                      )}
                    </div>

                    {/* Name + voters */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm truncate" style={{ color: isLeading ? '#ef4444' : myVoteOnThis ? theme.primary : '#f8fafc', fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
                        {player.name}
                        {isMe && <span className="ml-2 text-[10px] opacity-60">(KAMU)</span>}
                      </h4>
                      {voterNames.length > 0 && (
                        <p className="text-[10px] text-muted-foreground truncate" style={{ fontFamily: 'Rajdhani' }}>
                          Divote: {voterNames.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Vote count badge */}
                    {voteCount > 0 && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Vote className="w-3.5 h-3.5" style={{ color: isLeading ? '#ef4444' : theme.secondary }} />
                        <span className="text-sm font-bold" style={{ color: isLeading ? '#ef4444' : theme.secondary, fontFamily: 'Orbitron' }}>
                          {voteCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Vote bar */}
                  {voteCount > 0 && (
                    <motion.div
                      initial={{ scaleX: 0 }} animate={{ scaleX: votePercent / 100 }}
                      className="h-1 origin-left"
                      style={{ background: isLeading ? '#ef4444' : theme.primary }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Tombol eksekusi — host only */}
        {isHost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Button
              onClick={handleExecute}
              disabled={!canExecute}
              className="w-full py-5 disabled:opacity-40"
              style={{
                fontFamily: 'Orbitron', letterSpacing: '0.1em',
                background: canExecute ? 'linear-gradient(135deg, #ef4444, #dc2626)' : undefined,
                boxShadow: canExecute ? '0 0 20px rgba(239,68,68,0.5)' : undefined,
              }}>
              <Gavel className="w-4 h-4 mr-2" />
              EKSEKUSI VOTE ({maxVotes > 0 ? `${maxVotes} vote terbanyak` : 'belum ada vote'})
            </Button>
            <p className="text-center text-[10px] text-muted-foreground mt-2" style={{ fontFamily: 'Rajdhani' }}>
              Hanya host yang bisa mengeksekusi hasil vote
            </p>
          </motion.div>
        )}

        {/* Dead players */}
        {deadPlayers.length > 0 && (
          <div>
            <h3 className="text-sm mb-2 flex items-center gap-2 justify-center"
              style={{ fontFamily: 'Orbitron', color: '#ef4444' }}>
              <Skull className="w-4 h-4" /> TERELIMINASI
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {deadPlayers.map(p => (
                <Card key={p.deviceId} className="border-destructive/30 bg-card/30 p-3 opacity-60">
                  <p className="text-sm text-muted-foreground line-through truncate" style={{ fontFamily: 'Orbitron' }}>{p.name}</p>
                  <Badge className={`mt-1 text-[9px] ${p.role === 'civilian' ? 'bg-blue-500/20 text-blue-300' : p.role === 'undercover' ? 'bg-orange-500/20 text-orange-300' : 'bg-gray-500/20 text-gray-300'}`}
                    style={{ fontFamily: 'Orbitron' }}>
                    {p.role === 'civilian' && 'CIVILIAN'}
                    {p.role === 'undercover' && 'UNDERCOVER'}
                    {p.role === 'mrwhite' && 'MR. WHITE'}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
