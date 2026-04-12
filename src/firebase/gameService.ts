// ─────────────────────────────────────────────
//  FIREBASE GAME SERVICE
//  Semua operasi baca/tulis ke Realtime Database
// ─────────────────────────────────────────────
import { db } from './config';
import {
  ref,
  set,
  get,
  update,
  onValue,
  off,
  remove,
} from 'firebase/database';
import type { Player, GameConfig } from '../App';
import { THEMES } from '../context/ThemeContext';
import type { ThemeId } from '../context/ThemeContext';

// ── Types ──────────────────────────────────────
export type OnlineGamePhase =
  | 'lobby'
  | 'waiting'       // main lagi — nunggu min 3 pemain
  | 'distribution'
  | 'gameplay'
  | 'elimination'
  | 'whiteguess'
  | 'results';

export interface OnlineRoom {
  roomCode: string;
  hostId: string;
  phase: OnlineGamePhase;
  themeId: ThemeId;
  players: Record<string, OnlinePlayer>;
  civilianWord: string;
  eliminatedPlayerId: string | null;
  winner: 'civilian' | 'undercover' | 'mrwhite' | null;
  whiteGuess: string | null;
  votes: Record<string, string>;
  createdAt: number;
}

export interface OnlinePlayer {
  id: string;
  name: string;
  role: 'civilian' | 'undercover' | 'mrwhite';
  word: string | null;
  dead: boolean;
  seen: boolean;
  deviceId: string;
}

// ── Helpers ──────────────────────────────────
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function getDeviceId(): string {
  let id = sessionStorage.getItem('undercover_device_id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('undercover_device_id', id);
  }
  return id;
}

// ── Room Operations ───────────────────────────

export async function createRoom(hostName: string, themeId: ThemeId): Promise<string> {
  let roomCode = generateRoomCode();
  for (let i = 0; i < 5; i++) {
    const snap = await get(ref(db, `rooms/${roomCode}`));
    if (!snap.exists()) break;
    roomCode = generateRoomCode();
  }

  const deviceId = getDeviceId();
  const hostPlayer: OnlinePlayer = {
    id: deviceId, name: hostName.trim().toUpperCase(),
    role: 'civilian', word: null, dead: false, seen: false, deviceId,
  };

  const room: OnlineRoom = {
    roomCode, hostId: deviceId, phase: 'lobby', themeId,
    players: { [deviceId]: hostPlayer },
    civilianWord: '', eliminatedPlayerId: null, winner: null,
    whiteGuess: null, votes: {}, createdAt: Date.now(),
  };

  await set(ref(db, `rooms/${roomCode}`), room);
  return roomCode;
}

export async function joinRoom(roomCode: string, playerName: string): Promise<{ success: boolean; error?: string }> {
  const code = roomCode.trim().toUpperCase();
  const snap = await get(ref(db, `rooms/${code}`));
  if (!snap.exists()) return { success: false, error: 'Room tidak ditemukan!' };

  const room = snap.val() as OnlineRoom;
  if (room.phase !== 'lobby') return { success: false, error: 'Game sudah dimulai!' };

  const players = room.players ?? {};
  if (Object.keys(players).length >= 12) return { success: false, error: 'Room sudah penuh (max 12 pemain)!' };

  const nameTaken = Object.values(players).some(p => p.name === playerName.trim().toUpperCase());
  if (nameTaken) return { success: false, error: 'Nama sudah dipakai!' };

  const deviceId = getDeviceId();
  const newPlayer: OnlinePlayer = {
    id: deviceId, name: playerName.trim().toUpperCase(),
    role: 'civilian', word: null, dead: false, seen: false, deviceId,
  };

  await update(ref(db, `rooms/${code}/players`), { [deviceId]: newPlayer });
  return { success: true };
}

export async function startGame(
  roomCode: string, undercoverCount: number, mrWhiteCount: number, themeId: ThemeId
): Promise<void> {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  if (!snap.exists()) return;

  const room = snap.val() as OnlineRoom;
  const playerList = Object.values(room.players ?? {});
  const n = playerList.length;

  const wordPool = THEMES[themeId].wordPairs ?? DEFAULT_WORDS;
  const pair = wordPool[Math.floor(Math.random() * wordPool.length)];
  const isFlip = Math.random() > 0.5;
  const civWord = isFlip ? pair[0] : pair[1];
  const undWord = isFlip ? pair[1] : pair[0];

  type RoleEntry = { role: 'civilian' | 'undercover' | 'mrwhite'; word: string | null };
  const pool: RoleEntry[] = [];
  for (let i = 0; i < undercoverCount; i++) pool.push({ role: 'undercover', word: undWord });
  for (let i = 0; i < mrWhiteCount; i++) pool.push({ role: 'mrwhite', word: null });
  while (pool.length < n) pool.push({ role: 'civilian', word: civWord });
  pool.sort(() => Math.random() - 0.5);

  const updatedPlayers: Record<string, OnlinePlayer> = {};
  playerList.forEach((p, i) => {
    updatedPlayers[p.deviceId] = { ...p, role: pool[i].role, word: pool[i].word, dead: false, seen: false };
  });

  await update(ref(db, `rooms/${roomCode}`), {
    phase: 'distribution', civilianWord: civWord, themeId,
    players: updatedPlayers, eliminatedPlayerId: null,
    winner: null, whiteGuess: null, votes: {},
  });
}

export async function markSeen(roomCode: string, deviceId: string): Promise<void> {
  await update(ref(db, `rooms/${roomCode}/players/${deviceId}`), { seen: true });
  const snap = await get(ref(db, `rooms/${roomCode}/players`));
  const players = Object.values(snap.val() ?? {}) as OnlinePlayer[];
  if (players.every(p => p.seen)) {
    await update(ref(db, `rooms/${roomCode}`), { phase: 'gameplay' });
  }
}

// ── Voting ────────────────────────────────────

export async function castVote(roomCode: string, voterDeviceId: string, targetDeviceId: string): Promise<void> {
  await update(ref(db, `rooms/${roomCode}/votes`), { [voterDeviceId]: targetDeviceId });
}

export async function cancelVote(roomCode: string, voterDeviceId: string): Promise<void> {
  await remove(ref(db, `rooms/${roomCode}/votes/${voterDeviceId}`));
}

export async function executeVoteElimination(roomCode: string): Promise<void> {
  const snap = await get(ref(db, `rooms/${roomCode}`));
  if (!snap.exists()) return;

  const room = snap.val() as OnlineRoom;
  const votes = room.votes ?? {};
  const players = Object.values(room.players ?? {}) as OnlinePlayer[];
  const alivePlayers = players.filter(p => !p.dead);

  const voteCounts: Record<string, number> = {};
  for (const targetId of Object.values(votes)) {
    if (alivePlayers.find(p => p.deviceId === targetId)) {
      voteCounts[targetId] = (voteCounts[targetId] ?? 0) + 1;
    }
  }

  if (Object.keys(voteCounts).length === 0) return;

  const topId = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0][0];
  await update(ref(db, `rooms/${roomCode}/players/${topId}`), { dead: true });
  await update(ref(db, `rooms/${roomCode}`), {
    phase: 'elimination', eliminatedPlayerId: topId, votes: {},
  });
}

export async function confirmElimination(
  roomCode: string, eliminatedPlayer: OnlinePlayer, civilianWord: string
): Promise<void> {
  if (eliminatedPlayer.role === 'mrwhite') {
    await update(ref(db, `rooms/${roomCode}`), { phase: 'whiteguess' });
    return;
  }
  await checkAndSetWinner(roomCode, civilianWord);
}

export async function submitWhiteGuess(roomCode: string, guess: string, civilianWord: string): Promise<void> {
  const correct = guess.trim().toLowerCase() === civilianWord.trim().toLowerCase();
  if (correct) {
    await update(ref(db, `rooms/${roomCode}`), { winner: 'mrwhite', phase: 'results', whiteGuess: guess });
  } else {
    await update(ref(db, `rooms/${roomCode}`), { whiteGuess: guess });
    await checkAndSetWinner(roomCode, civilianWord);
  }
}

async function checkAndSetWinner(roomCode: string, _civilianWord: string): Promise<void> {
  const snap = await get(ref(db, `rooms/${roomCode}/players`));
  const players = Object.values(snap.val() ?? {}) as OnlinePlayer[];
  const alive = players.filter(p => !p.dead);
  const impostors = alive.filter(p => p.role !== 'civilian');

  if (impostors.length === 0) {
    await update(ref(db, `rooms/${roomCode}`), { winner: 'civilian', phase: 'results' });
  } else if (alive.length <= 2) {
    await update(ref(db, `rooms/${roomCode}`), { winner: 'undercover', phase: 'results' });
  } else {
    await update(ref(db, `rooms/${roomCode}`), { phase: 'gameplay', eliminatedPlayerId: null });
  }
}

/**
 * Reset room ke fase 'waiting'.
 * Semua pemain di-reset stat-nya tapi tetap di room.
 * Kalau pemain sudah >= 3, host bisa langsung start lagi.
 * Kalau < 3, tampilkan layar tunggu sampai ada yang join.
 */
export async function resetRoom(roomCode: string, themeId: ThemeId): Promise<void> {
  const snap = await get(ref(db, `rooms/${roomCode}/players`));
  const players = Object.values(snap.val() ?? {}) as OnlinePlayer[];

  const resetPlayers: Record<string, OnlinePlayer> = {};
  players.forEach(p => {
    resetPlayers[p.deviceId] = { ...p, role: 'civilian', word: null, dead: false, seen: false };
  });

  await update(ref(db, `rooms/${roomCode}`), {
    phase: 'waiting',   // ← bukan 'lobby', biar ga bentrok dengan join flow
    themeId,
    players: resetPlayers,
    civilianWord: '',
    eliminatedPlayerId: null,
    winner: null,
    whiteGuess: null,
    votes: {},
  });
}

export async function deleteRoom(roomCode: string): Promise<void> {
  await remove(ref(db, `rooms/${roomCode}`));
}

export async function leaveRoom(roomCode: string, deviceId: string): Promise<void> {
  await remove(ref(db, `rooms/${roomCode}/players/${deviceId}`));
}

export function subscribeRoom(roomCode: string, callback: (room: OnlineRoom | null) => void) {
  const r = ref(db, `rooms/${roomCode}`);
  onValue(r, snap => { callback(snap.exists() ? (snap.val() as OnlineRoom) : null); });
  return () => off(r);
}

export async function eliminatePlayer(roomCode: string, targetDeviceId: string): Promise<void> {
  await update(ref(db, `rooms/${roomCode}/players/${targetDeviceId}`), { dead: true });
  await update(ref(db, `rooms/${roomCode}`), { phase: 'elimination', eliminatedPlayerId: targetDeviceId });
}

const DEFAULT_WORDS: [string, string][] = [
  ["Pantai", "Pulau"], ["Gunung", "Bukit"], ["Laptop", "Komputer"],
  ["Kopi", "Teh"], ["Kucing", "Anjing"], ["Mobil", "Motor"],
  ["Sepatu", "Sandal"], ["Pizza", "Burger"], ["Nasi Goreng", "Mie Goreng"],
  ["Jakarta", "Bandung"], ["Bali", "Lombok"], ["Jepang", "Korea"],
];
