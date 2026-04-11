import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'cyber' | 'football' | 'mobilelegend';

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  label: string;
  description: string;
  primary: string;
  secondary: string;
  background: string;
  card: string;
  muted: string;
  border: string;
  ring: string;
  accent: string;
  gridColor: string;
  particleColor1: string;
  particleColor2: string;
  glowColor: string;
  bgGradient: string;
  wordPairs: [string, string][] | null;
}

export const THEMES: Record<ThemeId, Theme> = {
  cyber: {
    id: 'cyber',
    name: 'CYBER',
    emoji: '🤖',
    label: 'Cyber Mode',
    description: 'Dunia digital futuristik',
    primary: '#0ea5e9',
    secondary: '#6366f1',
    background: '#020617',
    card: '#0f172a',
    muted: '#1e293b',
    border: 'rgba(56,189,248,0.2)',
    ring: 'rgba(14,165,233,0.5)',
    accent: '#6366f1',
    gridColor: 'rgba(14,165,233,0.03)',
    particleColor1: 'rgba(14,165,233,0.5)',
    particleColor2: 'rgba(99,102,241,0.3)',
    glowColor: 'rgba(14,165,233,0.4)',
    bgGradient: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
    wordPairs: null,
  },

  football: {
    id: 'football',
    name: 'FOOTBALL',
    emoji: '⚽',
    label: 'Sepak Bola',
    description: 'Dunia sepak bola internasional',
    primary: '#22c55e',
    secondary: '#eab308',
    background: '#0a1a0f',
    card: '#0f2518',
    muted: '#1a3a22',
    border: 'rgba(34,197,94,0.25)',
    ring: 'rgba(34,197,94,0.5)',
    accent: '#eab308',
    gridColor: 'rgba(34,197,94,0.04)',
    particleColor1: 'rgba(34,197,94,0.5)',
    particleColor2: 'rgba(234,179,8,0.3)',
    glowColor: 'rgba(34,197,94,0.4)',
    bgGradient: 'linear-gradient(135deg, #0a1a0f 0%, #0f2518 50%, #0a1a0f 100%)',
    wordPairs: [
      ["Striker", "Penyerang"], ["Offside", "Handball"], ["Kartu Merah", "Kartu Kuning"],
      ["Penalti", "Tendangan Bebas"], ["Kiper", "Defender"], ["Gol", "Assist"],
      ["Liga Champions", "Liga Europa"], ["Real Madrid", "Barcelona"], ["Messi", "Ronaldo"],
      ["Neymar", "Mbappe"], ["Haaland", "Vinicius"], ["Manchester City", "Arsenal"],
      ["Liverpool", "Chelsea"], ["Corner Kick", "Throw In"], ["Extra Time", "Adu Penalti"],
      ["Hat-trick", "Brace"], ["Wasit", "Linesman"], ["Tribun", "Bangku Cadangan"],
      ["Sepatu Bola", "Shin Guard"], ["Tendangan Voli", "Tendangan Salto"],
      ["Tim Nasional", "Klub"], ["Piala Dunia", "Piala Eropa"],
      ["Offside Trap", "High Press"], ["Tiki-Taka", "Long Ball"],
      ["Header", "First Touch"], ["Kapten", "Pemain Cadangan"],
      ["Pelatih", "Asisten Pelatih"], ["Garis Tengah", "Kotak Penalti"],
      ["Tiang Gawang", "Mistar Gawang"], ["Bola", "Rompi Latihan"],
      ["Fullback", "Wingback"], ["Center Back", "Sweeper"],
      ["Winger", "Inside Forward"], ["Playmaker", "Box-to-Box"],
      ["Counter Attack", "Build Up"], ["Possession", "Direct Play"],
      ["High Line", "Low Block"], ["Pressing", "Counter Press"],
      ["Through Pass", "Crossing"], ["Volley", "Half Volley"],
      ["Clean Sheet", "Conceded"], ["Save", "Clearance"],
      ["VAR", "Goal Line Technology"], ["Derby", "El Clasico"],
      ["Transfer", "Loan"], ["Free Agent", "Release Clause"],
    ],
  },

  mobilelegend: {
    id: 'mobilelegend',
    name: 'ML: BANG BANG',
    emoji: '⚔️',
    label: 'Mobile Legend',
    description: 'Pertempuran di Land of Dawn',
    primary: '#c084fc',
    secondary: '#f97316',
    background: '#0d0515',
    card: '#180a2a',
    muted: '#231040',
    border: 'rgba(192,132,252,0.25)',
    ring: 'rgba(192,132,252,0.5)',
    accent: '#f97316',
    gridColor: 'rgba(192,132,252,0.03)',
    particleColor1: 'rgba(192,132,252,0.5)',
    particleColor2: 'rgba(249,115,22,0.3)',
    glowColor: 'rgba(192,132,252,0.4)',
    bgGradient: 'linear-gradient(135deg, #0d0515 0%, #180a2a 50%, #0d0515 100%)',
    wordPairs: [
      ["Tank", "Fighter"], ["Mage", "Marksman"], ["Assassin", "Support"],
      ["Roam", "Jungler"], ["Turret", "Base"], ["Buff", "Lord"],
      ["Creep", "Minion"], ["Recall", "Respawn"], ["Emblem", "Spell"],
      ["Savage", "Maniac"], ["Wanwan", "Hanabi"], ["Gusion", "Lancelot"],
      ["Fanny", "Ling"], ["Tigreal", "Akai"], ["Kagura", "Lunox"],
      ["Chou", "Paquito"], ["Layla", "Lesley"], ["Angela", "Estes"],
      ["Diggie", "Nana"], ["Hayabusa", "Helcurt"], ["Lane", "Jungle"],
      ["Gank", "Push"], ["Backdoor", "Split Push"], ["Harass", "Poke"],
      ["Gold Lane", "Exp Lane"], ["Turtle", "Lord"], ["First Blood", "Ace"],
      ["Surrender", "Rematch"], ["Epic", "Legend"], ["Mythic", "Mythical Glory"],
      ["Blink", "Dash"], ["Escape", "Chase"], ["Invade", "Secure"],
      ["Vision", "Map Awareness"], ["Rotation", "Positioning"],
      ["Red Buff", "Blue Buff"], ["Retribution", "Execute"],
      ["Flicker", "Sprint"], ["Purify", "Aegis"],
      ["Attack Speed", "Critical Chance"], ["Lifesteal", "Spell Vamp"],
      ["Last Hit", "Deny"], ["Freeze Lane", "Clear Lane"],
      ["Pick Off", "Team Fight"], ["Frontline", "Backline"],
      ["Draft Pick", "Ban Phase"], ["Meta", "Off Meta"],
      ["Solo Rank", "Party Rank"], ["Win Rate", "KDA"],
      ["MVP", "Feeder"], ["AFK", "Toxic"],
      ["Skin Elite", "Skin Epic"], ["Skin Legend", "Skin Collector"],
      ["Battle Point", "Diamond"], ["Custom", "Classic"],
      ["Ranked", "Brawl"], ["Macro", "Micro"],
      ["Zone Control", "Map Control"], ["Bush", "Vision Trap"],
      ["Win Streak", "Lose Streak"], ["Grinding", "Boosting"],
      ["Pick Hero", "Lock Hero"], ["Swap Hero", "Adjust Role"],
      ["Classic Build", "Custom Build"], ["Top Global", "Local Rank"],
      ["Try Hard", "Casual"], ["One Trick", "All Rounder"],
    ],
  },
};

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES.cyber,
  themeId: 'cyber',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('undercover_theme');
      if (saved && saved in THEMES) return saved as ThemeId;
    } catch {}
    return 'cyber';
  });

  const theme = THEMES[themeId];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--card', theme.card);
    root.style.setProperty('--muted', theme.muted);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--ring', theme.ring);
    root.style.setProperty('--accent', theme.accent);
    document.body.style.background = theme.background;
    try { localStorage.setItem('undercover_theme', themeId); } catch {}
  }, [themeId, theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme: setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
