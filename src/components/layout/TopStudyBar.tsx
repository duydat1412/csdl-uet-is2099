import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Lock,
  Monitor,
  Moon,
  RotateCcw,
  Sun,
  Unlock,
} from 'lucide-react';
import { LessonSpec, ModuleSpec } from '../../domain/types';
import { ThemeMode, useProgress } from '../../store/progressStore';

export interface TopStudyBarProps {
  modules: ModuleSpec[];
  currentModule: ModuleSpec;
  currentLesson: LessonSpec;
  prevLesson: LessonSpec | null;
  nextLesson: LessonSpec | null;
  onOpenReference: () => void;
  onJumpToStep: (stepIndex: number) => void;
  embedded?: boolean;
  courseLabel?: string;
}

export const TopStudyBar: React.FC<TopStudyBarProps> = ({
  modules,
  currentModule,
  currentLesson,
  prevLesson,
  nextLesson,
  onOpenReference,
  onJumpToStep,
  embedded = false,
  courseLabel = 'UET · IS2099',
}) => {
  const {
    state,
    selectLesson,
    getActiveStepIndex,
    getUnlockedStepIndex,
    isLessonCompleted,
    setTheme,
    toggleFreeNavigationMode,
    resetProgress,
  } = useProgress();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => isLessonCompleted(l.id)).length,
    0,
  );

  const activeStepIdx = getActiveStepIndex(currentLesson.id);
  const unlockedIdx = state.freeNavigationMode
    ? currentLesson.steps.length - 1
    : getUnlockedStepIndex(currentLesson.id);

  useEffect(() => {
    if (!switcherOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSwitcherOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [switcherOpen]);

  const themeOptions: Array<{ mode: ThemeMode; label: string; Icon: React.FC<{ className?: string }> }> = [
    { mode: 'light', label: 'Giao diện Sáng', Icon: Sun },
    { mode: 'dark', label: 'Giao diện Tối', Icon: Moon },
    { mode: 'system', label: 'Theo hệ thống', Icon: Monitor },
  ];

  return (
    <div
      className={`${embedded ? 'relative z-30 ios-frosted-panel' : 'sticky top-0 z-40'} h-12 w-full select-none border-b px-3 sm:px-4 flex items-center justify-between gap-2`}
      style={
        embedded
          ? { borderColor: 'var(--border-subtle)' }
          : {
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }
      }
    >
      {/* Left: Course tag + Lesson Switcher */}
      <div className="relative flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1" ref={popoverRef}>
        {!embedded && (
          <span
            className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase shrink-0"
            style={{
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--accent-border)',
            }}
          >
            {courseLabel}
          </span>
        )}

        <button
          type="button"
          onClick={() => setSwitcherOpen((o) => !o)}
          aria-expanded={switcherOpen}
          aria-haspopup="dialog"
          className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors min-w-0 max-w-full sm:max-w-[380px] md:max-w-[440px] cursor-pointer"
          style={{
            backgroundColor: switcherOpen ? 'var(--bg-subtle)' : 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span
            className="font-mono text-xs font-semibold shrink-0"
            style={{ color: 'var(--accent-primary)' }}
          >
            {currentLesson.orderLabel}
          </span>
          <span className="truncate">{currentLesson.title}</span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
        </button>

        {switcherOpen && (
          <div
            role="dialog"
            aria-label="Danh sách bài học Nhập môn Cơ sở dữ liệu"
            className="absolute left-0 top-11 w-[calc(100vw-1.5rem)] sm:w-[540px] max-h-[80vh] overflow-y-auto rounded-xl p-4 z-50"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Lộ trình {courseLabel} · {modules.length} Chặng · {totalLessons} Bài
                </div>
                <div className="text-sm font-semibold mt-0.5">
                  Đã hoàn thành {completedCount}/{totalLessons} bài học
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleFreeNavigationMode}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: state.freeNavigationMode ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                    color: state.freeNavigationMode ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: `1px solid ${state.freeNavigationMode ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                  }}
                  title="Bật để xem tự do mọi bước không cần mở khóa tuần tự"
                >
                  {state.freeNavigationMode ? (
                    <Unlock className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                  <span>{state.freeNavigationMode ? 'Ôn thi tự do: Bật' : 'Học dẫn dắt'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Đặt lại tiến độ học tập về ban đầu?')) {
                      resetProgress();
                      setSwitcherOpen(false);
                    }
                  }}
                  className="p-1.5 rounded-md transition-colors cursor-pointer"
                  style={{
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  title="Đặt lại tiến độ"
                  aria-label="Đặt lại tiến độ"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {modules.map((mod) => (
                <div key={mod.id}>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--accent-primary)' }}>
                      Chặng {mod.order}: {mod.title}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {mod.sourceFile}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {mod.lessons.map((lesson) => {
                      const isCurrent = lesson.id === currentLesson.id;
                      const isDone = isLessonCompleted(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => {
                            selectLesson(lesson.id);
                            setSwitcherOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-lg flex items-start justify-between gap-2 transition-colors cursor-pointer"
                          style={{
                            backgroundColor: isCurrent ? 'var(--accent-soft)' : 'transparent',
                            border: isCurrent
                              ? '1px solid var(--accent-border)'
                              : '1px solid transparent',
                          }}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            {isDone ? (
                              <CheckCircle2
                                className="w-4 h-4 mt-0.5 shrink-0"
                                style={{ color: 'var(--success-text)' }}
                              />
                            ) : (
                              <Circle
                                className="w-4 h-4 mt-0.5 shrink-0 opacity-45"
                                style={{ color: isCurrent ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-medium leading-snug">
                                <span className="font-mono font-semibold mr-1.5" style={{ color: 'var(--accent-primary)' }}>
                                  {lesson.orderLabel}
                                </span>
                                {lesson.title}
                              </div>
                              <div className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                {lesson.slideRange} · ~{lesson.estimatedMinutes} phút
                              </div>
                            </div>
                          </div>
                          {isCurrent && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                              style={{
                                backgroundColor: 'var(--accent-primary)',
                                color: '#FFFFFF',
                              }}
                            >
                              Đang học
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center: Micro-step progress dots */}
      <nav
        aria-label="Tiến độ các bước trong bài học"
        className="hidden lg:flex items-center gap-1.5 px-2"
      >
        <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--text-muted)' }}>
          Chặng {currentModule.order} · Bước {Math.min(activeStepIdx + 1, currentLesson.steps.length)}/{currentLesson.steps.length}
        </span>
        {currentLesson.steps.map((step, idx) => {
          const isUnlocked = idx <= unlockedIdx;
          const isActive = idx === activeStepIdx;
          return (
            <button
              key={step.id}
              type="button"
              disabled={!isUnlocked}
              onClick={() => onJumpToStep(idx)}
              title={`${idx + 1}. ${step.phaseLabel}: ${step.title}`}
              aria-label={`Bước ${idx + 1}: ${step.title}`}
              className="h-2 rounded-full transition-all cursor-pointer disabled:cursor-not-allowed"
              style={{
                width: isActive ? '24px' : '10px',
                backgroundColor: isActive
                  ? 'var(--accent-primary)'
                  : isUnlocked
                    ? 'var(--border-strong)'
                    : 'var(--border-subtle)',
                opacity: isUnlocked ? 1 : 0.45,
              }}
            />
          );
        })}
      </nav>

      {/* Right: Prev/Next + Reference Sheet + Theme Switcher */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="hidden md:flex items-center gap-1 mr-1">
          <button
            type="button"
            disabled={!prevLesson}
            onClick={() => prevLesson && selectLesson(prevLesson.id)}
            title={prevLesson ? `Bài trước: ${prevLesson.title}` : 'Đây là bài đầu tiên'}
            aria-label="Bài học trước"
            className="p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={!nextLesson}
            onClick={() => nextLesson && selectLesson(nextLesson.id)}
            title={nextLesson ? `Bài tiếp: ${nextLesson.title}` : 'Đây là bài cuối cùng'}
            aria-label="Bài học tiếp theo"
            className="p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenReference}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
          <span className="hidden sm:inline">Sổ tay Ký hiệu</span>
        </button>

        {!embedded && (
          <div
            role="group"
            aria-label="Chế độ giao diện Sáng Tối"
            className="inline-flex items-center rounded-md p-0.5"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {themeOptions.map(({ mode, label, Icon }) => {
              const active = state.theme === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  title={label}
                  aria-label={label}
                  aria-pressed={active}
                  className="p-1 rounded transition-colors cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--bg-surface)' : 'transparent',
                    color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
