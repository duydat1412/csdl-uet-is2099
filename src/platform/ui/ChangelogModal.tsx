import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  ClipboardCheck,
  Compass,
  Flame,
  FlaskConical,
  GraduationCap,
  Home,
  LayoutDashboard,
  Monitor,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { APP_VERSION, CHANGELOG_ENTRIES } from '../version';
import { RichText } from '../../components/common/RichText';

export interface ChangelogModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgb(7 12 23 / 0.48)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nhật ký cập nhật phiên bản STUDYHUB"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[82vh] overflow-y-auto rounded-3xl ios-frosted-strong p-5 sm:p-6 space-y-5"
      >
        <div
          className="flex items-start justify-between gap-3 pb-3 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1.5"
              style={{
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-border)',
              }}
            >
              STUDYHUB · {APP_VERSION}
            </div>
            <h2 className="text-lg font-bold tracking-tight">Nhật ký Cập nhật (Change Logs)</h2>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
              Lịch sử phát triển và nâng cấp nền tảng học tập đa môn
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng nhật ký cập nhật"
            className="p-2 rounded-full border cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {CHANGELOG_ENTRIES.map((entry) => (
            <div
              key={entry.version}
              className="rounded-2xl p-4 border space-y-2.5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        entry.tag === 'beta' ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                      color: entry.tag === 'beta' ? '#FFFFFF' : 'var(--text-primary)',
                    }}
                  >
                    {entry.version}
                  </span>
                  <span className="text-sm font-bold">{entry.headline}</span>
                </div>
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {entry.date}
                </span>
              </div>

              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                {entry.highlights.map((item, i) => (
                  <li key={i}>
                    <RichText content={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export interface CommandPaletteAction {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  actions: CommandPaletteAction[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, actions }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.subtitle && a.subtitle.toLowerCase().includes(q)),
      )
    : actions.slice(0, 14);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4"
      style={{ backgroundColor: 'rgb(7 12 23 / 0.45)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tìm kiếm nhanh STUDYHUB"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl ios-frosted-strong overflow-hidden"
      >
        <div
          className="flex items-center gap-2.5 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm nhanh bài học, công thức, phòng Lab, đề thi cuối kỳ, Change Logs..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <kbd
            className="font-mono text-[11px] px-1.5 py-0.5 rounded border"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
          >
            ESC
          </kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
              Không tìm thấy mục phù hợp với "{query}".
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.onSelect();
                  onClose();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer hover:bg-[var(--accent-soft)]"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {item.subtitle}
                    </div>
                  )}
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const FloatingGlassDockIcons = {
  Home,
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  ClipboardCheck,
  GraduationCap,
  Flame,
  Search,
  Sun,
  Moon,
  Monitor,
  Compass,
};

export type FloatingNavItemMotion = typeof motion.span;
