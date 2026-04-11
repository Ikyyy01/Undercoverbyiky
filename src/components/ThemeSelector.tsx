import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';
import { playSound } from '../App';

export function ThemeSelector() {
  const { theme, themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const themeList = Object.values(THEMES);

  useLayoutEffect(() => {
    if (open && buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
  }, [open]);

  // Hitung posisi dropdown: selalu mepet kanan tombol, tidak keluar layar
  const DROPDOWN_WIDTH = 220;
  const dropdownLeft = rect
    ? Math.min(
        rect.right - DROPDOWN_WIDTH,          // rata kanan dengan tombol
        window.innerWidth - DROPDOWN_WIDTH - 8 // jangan melebihi kanan layar
      )
    : 0;
  const dropdownTop = rect ? rect.bottom + 8 : 0;
  // Pastikan tidak keluar kiri layar
  const safeLeft = Math.max(8, dropdownLeft);

  return (
    <>
      {/* ── Tombol trigger ── */}
      <button
        ref={buttonRef}
        onClick={() => { setOpen(v => !v); playSound('click'); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 8,
          border: `1px solid ${theme.border}`,
          background: `${theme.card}cc`,
          color: theme.primary,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${theme.glowColor}`,
          fontFamily: 'Orbitron',
          letterSpacing: '0.05em',
          fontSize: 11,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <Palette style={{ width: 13, height: 13, flexShrink: 0 }} />
        <span>{theme.emoji} {theme.name}</span>
        <ChevronDown
          style={{
            width: 11, height: 11, flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {/* ── Dropdown via portal ke body ── */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                onClick={() => setOpen(false)}
              />

              {/* Panel */}
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                style={{
                  position: 'fixed',
                  top: dropdownTop,
                  left: safeLeft,
                  width: DROPDOWN_WIDTH,
                  zIndex: 9999,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: `${theme.card}f5`,
                  border: `1px solid ${theme.border}`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${theme.border}`,
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '10px 16px',
                  borderBottom: `1px solid ${theme.border}`,
                  background: `${theme.muted}90`,
                }}>
                  <span style={{
                    color: theme.primary, fontFamily: 'Orbitron',
                    fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
                  }}>
                    ✦ Pilih Tema
                  </span>
                </div>

                {/* Theme list */}
                {themeList.map((t) => {
                  const isActive = t.id === themeId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id as ThemeId); playSound('click'); setOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 14px', textAlign: 'left', cursor: 'pointer',
                        transition: 'background 0.15s',
                        background: isActive ? `${t.primary}18` : 'transparent',
                        borderLeft: isActive ? `3px solid ${t.primary}` : '3px solid transparent',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.background = `${t.primary}12`;
                      }}
                      onMouseLeave={e => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                        background: `${t.primary}20`, border: `1px solid ${t.primary}40`,
                        boxShadow: isActive ? `0 0 10px ${t.primary}60` : 'none',
                      }}>
                        {t.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          color: isActive ? t.primary : '#f8fafc',
                          fontFamily: 'Orbitron', fontSize: 11, fontWeight: 600,
                          letterSpacing: '0.05em', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {t.name}
                        </div>
                        <div style={{
                          color: '#94a3b8', fontFamily: 'Rajdhani', fontSize: 11, marginTop: 1,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {t.description}
                        </div>
                      </div>
                      {isActive && (
                        <Check style={{ width: 13, height: 13, color: t.primary, flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}

                {/* Footer */}
                <div style={{
                  padding: '7px 16px',
                  borderTop: `1px solid ${theme.border}`,
                  background: `${theme.muted}40`,
                  textAlign: 'center',
                }}>
                  <span style={{ color: '#64748b', fontFamily: 'Rajdhani', fontSize: 11 }}>
                    Kata akan berubah sesuai tema
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
