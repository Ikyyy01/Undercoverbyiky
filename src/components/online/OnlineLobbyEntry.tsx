import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wifi, Users, Plus, LogIn, ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { useTheme } from '../../context/ThemeContext';
import { createRoom, joinRoom, getDeviceId } from '../../firebase/gameService';
import { playSound } from '../../App';
import type { ThemeId } from '../../context/ThemeContext';

interface OnlineLobbyEntryProps {
  onRoomReady: (roomCode: string, isHost: boolean) => void;
  onBack: () => void;
  themeId: ThemeId;
}

export function OnlineLobbyEntry({ onRoomReady, onBack, themeId }: OnlineLobbyEntryProps) {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return setError('Masukkan nama dulu!');
    setLoading(true);
    setError('');
    try {
      const code = await createRoom(name, themeId);
      playSound('win');
      onRoomReady(code, true);
    } catch {
      setError('Gagal membuat room. Cek koneksi internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) return setError('Masukkan nama dulu!');
    if (!roomCode.trim()) return setError('Masukkan kode room!');
    setLoading(true);
    setError('');
    try {
      const result = await joinRoom(roomCode, name);
      if (!result.success) return setError(result.error ?? 'Gagal join.');
      playSound('win');
      onRoomReady(roomCode.trim().toUpperCase(), false);
    } catch {
      setError('Gagal join. Cek koneksi internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => { playSound('click'); mode === 'choose' ? onBack() : setMode('choose'); }}
            className="text-primary hover:bg-primary/10 text-xs">
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
          </Button>
          <h2 className="text-xl neon-text ml-4" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
            ONLINE MULTIPLAYER
          </h2>
        </motion.div>

        <Card className="neon-border bg-card/95 backdrop-blur-md p-6 tech-corners rainbow-glow">
          {mode === 'choose' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3"
                  style={{ background: `${theme.primary}20`, border: `1px solid ${theme.primary}40` }}>
                  <Wifi className="w-8 h-8" style={{ color: theme.primary }} />
                </div>
                <p className="text-muted-foreground text-sm" style={{ fontFamily: 'Rajdhani' }}>
                  Main bareng teman dari jarak jauh!<br />Tiap pemain pakai HP sendiri.
                </p>
              </div>

              <Button onClick={() => { playSound('click'); setMode('create'); }}
                className="w-full py-6 bg-primary hover:bg-primary/90 pulse-glow"
                style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                <Plus className="w-5 h-5 mr-2" />
                BUAT ROOM BARU
              </Button>

              <Button onClick={() => { playSound('click'); setMode('join'); }}
                variant="outline"
                className="w-full py-6 neon-border hover:bg-primary/10 text-primary"
                style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                <LogIn className="w-5 h-5 mr-2" />
                JOIN ROOM
              </Button>
            </motion.div>
          )}

          {(mode === 'create' || mode === 'join') && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="neon-text text-center text-lg" style={{ fontFamily: 'Orbitron' }}>
                {mode === 'create' ? 'BUAT ROOM' : 'JOIN ROOM'}
              </h3>

              {/* Nama */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                  NAMA KAMU
                </label>
                <Input
                  value={name}
                  onChange={e => { setName(e.target.value.toUpperCase()); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && (mode === 'create' ? handleCreate() : handleJoin())}
                  placeholder="NAMA AGEN..."
                  className="bg-input-background neon-border text-primary uppercase"
                  style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}
                />
              </div>

              {/* Kode room (join only) */}
              {mode === 'join' && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1" style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                    KODE ROOM
                  </label>
                  <Input
                    value={roomCode}
                    onChange={e => { setRoomCode(e.target.value.toUpperCase()); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    placeholder="XXXX"
                    maxLength={4}
                    className="bg-input-background neon-border text-primary uppercase text-center text-2xl tracking-[0.3em]"
                    style={{ fontFamily: 'Orbitron' }}
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-destructive text-xs text-center bg-destructive/10 border border-destructive/30 rounded-lg p-2"
                  style={{ fontFamily: 'Orbitron' }}>
                  {error}
                </motion.p>
              )}

              <Button
                onClick={mode === 'create' ? handleCreate : handleJoin}
                disabled={loading}
                className="w-full py-6 bg-primary hover:bg-primary/90 pulse-glow disabled:opacity-50"
                style={{ fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
                {loading ? 'MENGHUBUNGKAN...' : mode === 'create' ? 'BUAT ROOM' : 'JOIN ROOM'}
              </Button>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}
