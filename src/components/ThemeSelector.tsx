import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';
import { playSound } from '../App';

export function ThemeSelector() {
  const { theme, themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const themeList = Object.values(THEMES);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(!open); playSound('click'); }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm"
        style={{
          borderColor: theme.border,
          background: `${theme.card}cc`,
          color: theme.primary,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${theme.glowColor}`,
          fontFamily: 'Orbitron',
          letterSpacing: '0.05em',
          fontSize: '11px',
        }}
      >
        <Palette style={{ width: 14, height: 14 }} />
        <span className="hidden sm:inline">{theme.emoji} {theme.name}</span>
        <span className="sm:hidden">{theme.emoji}</span>
        <ChevronDown
          style={{
            width: 12, height: 12,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 rounded-xl overflow-hidden"
              style={{
                background: `${theme.card}f0`,
                border: `1px solid ${theme.border}`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${theme.border}`,
                minWidth: 220,
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 border-b"
                style={{
                  borderColor: theme.border,
                  background: `${theme.muted}80`,
                }}
              >
                <div
                  className="text-xs uppercase tracking-widest"
                  style={{ color: theme.primary, fontFamily: 'Orbitron', letterSpacing: '0.15em' }}
                >
                  ✦ Pilih Tema
                </div>
              </div>

              {/* Theme options */}
              {themeList.map((t) => {
                const isActive = t.id === themeId;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id as ThemeId);
                      playSound('click');
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
                    style={{
                      background: isActive ? `${t.primary}18` : 'transparent',
                      borderLeft: isActive ? `3px solid ${t.primary}` : '3px solid transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = `${t.primary}0f`;
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {/* Theme color dot */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{
                        background: `${t.primary}20`,
                        border: `1px solid ${t.primary}40`,
                        boxShadow: isActive ? `0 0 10px ${t.primary}60` : 'none',
                      }}
                    >
                      {t.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs font-medium"
                        style={{
                          color: isActive ? t.primary : '#f8fafc',
                          fontFamily: 'Orbitron',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        className="text-xs truncate mt-0.5"
                        style={{ color: '#94a3b8', fontFamily: 'Rajdhani' }}
                      >
                        {t.description}
                      </div>
                    </div>

                    {isActive && (
                      <Check style={{ width: 14, height: 14, color: t.primary, flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}

              {/* Footer note */}
              <div
                className="px-4 py-2 border-t text-center"
                style={{ borderColor: theme.border, background: `${theme.muted}40` }}
              >
                <span
                  className="text-xs"
                  style={{ color: '#64748b', fontFamily: 'Rajdhani' }}
                >
                  Kata akan berubah sesuai tema
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
