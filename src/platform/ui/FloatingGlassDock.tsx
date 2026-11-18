import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Flame,
  FlaskConical,
  GraduationCap,
  Home,
  LayoutDashboard,
  Monitor,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { ThemeMode, useProgress } from '../../store/progressStore';
import { useHub } from '../store/hubStore';
import { CourseManifest, HubRouteId } from '../types';
import { APP_VERSION } from '../version';

export interface FloatingGlassDockProps {
  courses: CourseManifest[];
  activeCourse: CourseManifest;
  onOpenCommandPalette: () => void;
  onOpenChangelog: () => void;
}

const NAV_ITEMS: Array<{
  id: HubRouteId;
  label: string;
  shortLabel: string;
  Icon: React.FC<{ className?: string }>;
}> = [
  { id: 'home', label: 'Home', shortLabel: 'Home', Icon: Home },
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Stats', Icon: LayoutDashboard },
  { id: 'learn', label: 'Học tập', shortLabel: 'Học', Icon: BookOpen },
  { id: 'labs', label: 'Phòng Lab', shortLabel: 'Lab', Icon: FlaskConical },
  { id: 'exams', label: 'Luyện đề', shortLabel: 'Đề thi', Icon: ClipboardCheck },
];

export const FloatingGlassDock: React.FC<FloatingGlassDockProps> = ({
  courses,
  activeCourse,
  onOpenCommandPalette,
  onOpenChangelog,
}) => {
  const { state: hubState, navigate, selectCourse } = useHub();
  const { state: progressState, setTheme } = useProgress();
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);
  const courseMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!courseMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (courseMenuRef.current && !courseMenuRef.current.contains(e.target as Node)) {
        setCourseMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCourseMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [courseMenuOpen]);

  const themeOptions: Array<{
    mode: ThemeMode;
    label: string;
    Icon: React.FC<{ className?: string }>;
  }> = [
    { mode: 'light', label: 'Chế độ Sáng', Icon: Sun },
    { mode: 'dark', label: 'Chế độ Tối', Icon: Moon },
    { mode: 'system', label: 'Theo hệ thống', Icon: Monitor },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-2 sm:px-3 xl:px-4 pt-2 pb-1.5 select-none">
      <div className="mx-auto max-w-[1520px] rounded-2xl ios-frosted-strong px-2 sm:px-3 xl:px-4 py-1.5 flex items-center justify-between gap-1.5 lg:gap-2">
        {/* Left: STUDYHUB brand + Course Switcher */}
        <div className="flex items-center gap-1.5 lg:gap-2 min-w-0">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 p-1 lg:px-2 lg:py-1 rounded-xl hover:bg-[var(--accent-soft)] transition-colors cursor-pointer shrink-0"
          >
            <span
              className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), #38BDF8)',
                color: '#FFFFFF',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <GraduationCap className="w-4 h-4" />
            </span>
            <span className="hidden xl:inline font-bold text-sm tracking-tight">STUDYHUB</span>
          </button>

          <button
            type="button"
            onClick={onOpenChangelog}
            className="hidden xl:inline-flex items-center font-mono text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer shrink-0"
            style={{
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--accent-border)',
            }}
            title="Xem nhật ký cập nhật"
          >
            {APP_VERSION}
          </button>

          {/* Course Switcher Pill */}
          <div className="relative shrink-0" ref={courseMenuRef}>
            <button
              type="button"
              onClick={() => setCourseMenuOpen((o) => !o)}
              aria-expanded={courseMenuOpen}
              className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-semibold border cursor-pointer max-w-[140px] sm:max-w-[200px] md:max-w-[140px] xl:max-w-[220px]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: activeCourse.accentHex }}
              />
              <span className="font-mono font-bold shrink-0">{activeCourse.code}</span>
              <span className="hidden sm:inline md:hidden xl:inline truncate" style={{ color: 'var(--text-secondary)' }}>
                {activeCourse.shortTitle}
              </span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-65" />
            </button>

            {courseMenuOpen && (
              <div
                role="dialog"
                aria-label="Chọn môn học trong STUDYHUB"
                className="absolute left-0 top-10 w-[290px] sm:w-[340px] rounded-2xl ios-frosted-strong p-2.5 space-y-1 z-50"
              >
                <div
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Kho học phần STUDYHUB (Multi-Course)
                </div>
                {courses.map((c) => {
                  const selected = c.id === activeCourse.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        selectCourse(c.id);
                        setCourseMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl flex items-start justify-between gap-2 cursor-pointer transition-colors"
                      style={{
                        backgroundColor: selected ? 'var(--accent-soft)' : 'transparent',
                        border: selected
                          ? '1px solid var(--accent-border)'
                          : '1px solid transparent',
                      }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: c.accentHex }}
                          />
                          <span className="font-mono">{c.code}</span>
                          <span className="truncate">{c.shortTitle}</span>
                        </div>
                        <div className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {c.modules.length} chặng · {c.exams.length} đề thi mẫu
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            c.status === 'active' ? 'var(--success-bg)' : 'var(--bg-subtle)',
                          color:
                            c.status === 'active' ? 'var(--success-text)' : 'var(--text-muted)',
                        }}
                      >
                        {c.status === 'active' ? 'Đầy đủ' : 'Mẫu'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center: 5-Surface Floating iOS Segmented Dock (Desktop & Tablet 768px+) */}
        <nav
          aria-label="Điều hướng phân khu STUDYHUB"
          className="hidden md:flex shrink-0 items-center gap-0.5 lg:gap-1 p-1 rounded-full border"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          {NAV_ITEMS.map(({ id, label, shortLabel, Icon }) => {
            const active = hubState.activeRoute === id;
            return (
              <button
                key={id}
                type="button"
                aria-label={label}
                onClick={() => navigate(id)}
                className="relative px-1.5 lg:px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 lg:gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                style={{
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                {active && (
                  <motion.span
                    layoutId="hub-dock-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: 'var(--bg-surface-solid)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10 shrink-0" />
                <span className="relative z-10 lg:hidden">{shortLabel}</span>
                <span className="relative z-10 hidden lg:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Study Streak + Ctrl+K + Theme Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('dashboard')}
            title="Chuỗi Study Streak — mở Dashboard"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer"
            style={{
              backgroundColor: 'var(--warning-bg)',
              color: 'var(--warning-text)',
              borderColor: 'var(--warning-border)',
            }}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono">{hubState.streak.currentStreak}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Tìm kiếm nhanh (Ctrl+K)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="hidden xl:inline font-mono text-[10px] opacity-75">Ctrl K</kbd>
          </button>

          <div
            role="group"
            aria-label="Chế độ giao diện Sáng Tối"
            className="inline-flex items-center rounded-xl p-0.5 border"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {themeOptions.map(({ mode, label, Icon }) => {
              const active = progressState.theme === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  title={label}
                  aria-label={label}
                  aria-pressed={active}
                  className="p-1 rounded-lg transition-colors cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--bg-surface-solid)' : 'transparent',
                    color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compact Mobile Navigation Row (< 768px) */}
      <nav
        aria-label="Điều hướng nhanh trên di động"
        className="md:hidden mt-1.5 mx-auto max-w-[1520px] rounded-2xl ios-frosted-panel px-1.5 py-1 grid grid-cols-5 gap-1"
      >
        {NAV_ITEMS.map(({ id, shortLabel, Icon }) => {
          const active = hubState.activeRoute === id;
          return (
            <button
              key={`mob-${id}`}
              type="button"
              onClick={() => navigate(id)}
              className="py-1.5 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors"
              style={{
                backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
                color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
