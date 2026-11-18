import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Code2,
  ExternalLink,
  GraduationCap,
  History,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { MathFormula } from '../../components/common/MathFormula';
import { useProgress } from '../../store/progressStore';
import { useHub } from '../store/hubStore';
import { CourseManifest } from '../types';
import { APP_REPOSITORY_URL, APP_VERSION } from '../version';
import { ReadingGlassPanel } from '../ui/GlassPrimitives';

export interface HomePageProps {
  courses: CourseManifest[];
  activeCourse: CourseManifest;
  isDark: boolean;
  onOpenChangelog: () => void;
  onOpenCommandPalette: () => void;
}

const SHOWCASE_MODES = [
  {
    id: 'algebra',
    label: 'Đại số Quan hệ',
    tex: '\\pi_{\\text{MANV},\\text{TENNV}}\\Big((\\pi_{\\text{MANV},\\text{MADA}}(\\text{NV\\_DEAN}) \\div \\text{DA\\_NC}) * \\text{NHANVIEN}\\Big)',
    note: 'Tự động khử trùng lặp tập hợp và giải phẫu Phép chia 4 bước T1, S × T1, T2, T1 − T2.',
  },
  {
    id: 'fd',
    label: 'Chuẩn hóa BCNF',
    tex: '\\{\\text{GiaoVien}\\}^+ = \\{\\text{GiaoVien},\\; \\text{MonHoc}\\} \\implies R_1(\\underline{\\text{GV}}, \\text{MH}),\\; R_2(\\underline{\\text{MaSV}}, \\underline{\\text{GV}})',
    note: 'Tách lược đồ bảo toàn thông tin (R1 ∩ R2 → R1) từ tập phụ thuộc hàm F.',
  },
  {
    id: 'sql',
    label: 'SQL Cuối kỳ',
    tex: '\\text{WHERE NOT EXISTS }(\\sigma_{\\text{MADV}=5}(\\text{DEAN}) \\;\\land\\; \\neg\\exists\\,\\text{NV\\_DEAN})',
    note: 'Biểu diễn lượng từ phổ dụng ∀ ("tất cả đề án") bằng truy vấn lồng tương quan 2 tầng.',
  },
] as const;

export const HomePage: React.FC<HomePageProps> = ({
  courses,
  activeCourse,
  isDark,
  onOpenChangelog,
  onOpenCommandPalette,
}) => {
  const { navigate, selectCourse } = useHub();
  const { state: progressState, setTheme } = useProgress();
  const [showcaseMode, setShowcaseMode] =
    useState<(typeof SHOWCASE_MODES)[number]['id']>('algebra');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!themeMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setThemeMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [themeMenuOpen]);

  const activeShowcase =
    SHOWCASE_MODES.find((m) => m.id === showcaseMode) ?? SHOWCASE_MODES[0];

  const handleLaunchCourse = (
    courseId: string,
    target: 'learn' | 'labs' | 'exams',
  ) => {
    selectCourse(courseId);
    navigate(target);
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between">
      <div className="w-full mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 pt-4 pb-24 space-y-16 sm:space-y-20">
        {/* Flat Background-Blended Navigation Row (Unity-inspired editorial header) */}
        <header className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-7 min-w-0">
            <div className="inline-flex items-center gap-2 shrink-0 select-none">
              <GraduationCap className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              <span className="font-bold text-sm tracking-tight">STUDYHUB</span>
            </div>

            <nav
              aria-label="Giới thiệu và danh mục trang chủ"
              className="hidden lg:flex items-center gap-5 xl:gap-6 whitespace-nowrap text-[13px] font-medium"
            >
              <button
                type="button"
                onClick={() =>
                  document.getElementById('methodology')?.scrollIntoView?.({ behavior: 'smooth' })
                }
                className="bg-transparent border-0 p-0 cursor-pointer transition-colors hover:text-[var(--text-primary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Phương pháp
              </button>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('course-catalog')?.scrollIntoView?.({ behavior: 'smooth' })
                }
                className="bg-transparent border-0 p-0 cursor-pointer transition-colors hover:text-[var(--text-primary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Học phần
              </button>
              <button
                type="button"
                onClick={() => navigate('labs')}
                className="bg-transparent border-0 p-0 cursor-pointer transition-colors hover:text-[var(--text-primary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Phòng Lab
              </button>
              <button
                type="button"
                onClick={() => navigate('exams')}
                className="bg-transparent border-0 p-0 cursor-pointer transition-colors hover:text-[var(--text-primary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Luyện đề
              </button>
              <button
                type="button"
                onClick={() => navigate('dashboard')}
                className="bg-transparent border-0 p-0 cursor-pointer transition-colors hover:text-[var(--text-primary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Dashboard
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                document.getElementById('course-catalog')?.scrollIntoView?.({ behavior: 'smooth' })
              }
              className="hidden xl:inline-flex items-center whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-90"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
                color: 'var(--text-primary)',
              }}
            >
              Xem học phần
            </button>

            <button
              type="button"
              onClick={() => handleLaunchCourse(activeCourse.id, 'learn')}
              className="inline-flex items-center whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer transition-transform active:scale-95"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: '#FFFFFF',
              }}
            >
              Bắt đầu học
            </button>

            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label="Tìm kiếm nhanh (Ctrl+K)"
              className="p-2 rounded-full bg-transparent border-0 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              className="p-2 rounded-full bg-transparent border-0 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Quiet Announcement Banner Strip (Release Version & Change Logs) */}
        <div
          className="!mt-4 w-full rounded-2xl px-5 py-3.5 flex items-center justify-between sm:justify-start gap-3.5"
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.045)' : 'rgba(15, 23, 42, 0.04)',
          }}
        >
          <span className="text-xs sm:text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Phiên bản hiện tại: <strong style={{ color: 'var(--text-primary)' }}>STUDYHUB · {APP_VERSION}</strong> — Không gian tự học &amp; ôn thi đại học chuẩn Toán học LaTeX đã sẵn sàng.
          </span>
          <button
            type="button"
            onClick={onOpenChangelog}
            aria-label="Mở nhật ký phiên bản"
            title="Xem nhật ký cập nhật"
            className="w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0 cursor-pointer transition-transform hover:scale-105"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* =====================================================================
         * 1. SERENE EDITORIAL HERO SECTION
         * =================================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center pt-2 sm:pt-6">
          <div className="lg:col-span-6 space-y-5">
            <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Nền tảng Học thuật Mở · ĐH Công nghệ, ĐHQGHN
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight leading-[1.16]"
              style={{ color: 'var(--text-primary)' }}
            >
              Hiểu sâu bản chất từng công thức, thực hành trực tiếp trên trình duyệt.
            </motion.h1>

            <p
              className="text-sm sm:text-base leading-relaxed max-w-xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              STUDYHUB biên soạn kiến thức đại học theo mạch tư duy từ trực giác
              đến định nghĩa hình thức, kết hợp bài giải mẫu tự luận LaTeX,
              phòng thí nghiệm mô phỏng dữ liệu và bộ đề ôn tập cuối kỳ cho từng môn học.
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2">
              <button
                type="button"
                onClick={() => handleLaunchCourse(activeCourse.id, 'learn')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold cursor-pointer transition-transform active:scale-95"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#FFFFFF',
                }}
              >
                <span>Tham gia học ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  document.getElementById('methodology')?.scrollIntoView?.({ behavior: 'smooth' })
                }
                className="bg-transparent border-0 p-0 text-sm font-medium cursor-pointer hover:underline"
                style={{ color: 'var(--text-secondary)' }}
              >
                Tìm hiểu cấu trúc nền tảng ↓
              </button>
            </div>
          </div>

          {/* Single Calm Mathematical Preview Panel */}
          <div className="lg:col-span-6">
            <ReadingGlassPanel className="p-6 sm:p-8 space-y-5">
              <div
                className="flex flex-wrap items-center gap-6 border-b pb-3 text-xs font-medium"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {SHOWCASE_MODES.map((m) => {
                  const active = showcaseMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setShowcaseMode(m.id)}
                      className="bg-transparent border-0 pb-3 -mb-[13px] cursor-pointer transition-colors"
                      style={{
                        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                        borderBottom: active
                          ? '2px solid var(--accent-primary)'
                          : '2px solid transparent',
                      }}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              <motion.div
                key={activeShowcase.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                <MathFormula tex={activeShowcase.tex} displayMode />
                <p className="text-xs leading-relaxed pt-2" style={{ color: 'var(--text-secondary)' }}>
                  {activeShowcase.note}
                </p>
              </motion.div>
            </ReadingGlassPanel>
          </div>
        </section>

        {/* =====================================================================
         * 2. ARCHITECTURAL 3-COLUMN OVERVIEW (Borderless Canvas Typography)
         * =================================================================== */}
        <section
          id="methodology"
          className="pt-12 border-t space-y-8 scroll-mt-8"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Thiết kế tối ưu cho việc tự học và ôn thi học kỳ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Giáo trình &amp; Bài giải mẫu LaTeX
              </h3>
              <p className="text-xs sm:text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Trình bày từng bước biến đổi công thức, chỉ rõ các bẫy mất điểm
                thường gặp trong đề thi tự luận và trắc nghiệm cuối kỳ.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Phòng thí nghiệm chạy trực tiếp
              </h3>
              <p className="text-xs sm:text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Thực thi tức thì biểu thức Đại số quan hệ, tìm bao đóng phụ thuộc hàm,
                kiểm tra dạng chuẩn <code>BCNF</code> và truy vấn <code>SQL</code> mà không cần cài máy chủ.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Cấu trúc Đa môn đồng nhất
              </h3>
              <p className="text-xs sm:text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Tách biệt tầng hiển thị dùng chung và nội dung từng môn học qua khuôn mẫu{' '}
                <code className="font-mono">TEMPLATE-101</code>, giúp mở rộng sang các học phần tiếp theo gọn nhẹ.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================================
         * 3. QUIET, RESTRAINED MULTI-COURSE DIRECTORY
         * =================================================================== */}
        <section
          id="course-catalog"
          className="pt-12 border-t space-y-6 scroll-mt-8"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Danh mục Học phần
            </h2>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              Chọn học phần để mở không gian bài giảng, phòng lab và đề ôn tập tương ứng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courses.map((course) => {
              const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
              const statusLabel =
                course.status === 'active'
                  ? 'Đang mở'
                  : course.status === 'template-sample'
                    ? 'Khung mẫu'
                    : 'Sắp ra mắt';
              return (
                <div
                  key={course.id}
                  className="rounded-2xl border p-6 flex flex-col justify-between gap-5 transition-colors"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                        {course.code} · {course.faculty}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>{statusLabel}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {course.summary}
                    </p>

                    {course.modules.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        <span>{course.modules.length} Chặng</span>
                        <span>·</span>
                        <span>{totalLessons} Bài học</span>
                        <span>·</span>
                        <span>{course.labs.length} Phòng Lab</span>
                        <span>·</span>
                        <span>{course.exams.length} Đề mẫu</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    {course.modules.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleLaunchCourse(course.id, 'learn')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline cursor-pointer w-fit bg-transparent border-0 p-0"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <span>Tham gia học phần</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Đang biên soạn theo khung mẫu <code className="font-mono">TEMPLATE-101</code>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* =====================================================================
       * 4. FULL-BLEED EDITORIAL FOOTER (Unity-style 3-tier Sitemap & Utilities)
       * =================================================================== */}
      <footer
        className="w-full border-t"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: isDark ? 'rgba(8, 12, 21, 0.86)' : 'rgba(241, 245, 249, 0.82)',
        }}
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          {/* Tier 1: Language/Standards · Quick Icons · Pill Theme Selector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5">
              <div
                className="text-xs font-medium mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Ngôn ngữ &amp; Chuẩn ký hiệu
              </div>
              <div
                className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Tiếng Việt
                </span>
                <span>LaTeX · KaTeX</span>
                <span>Chuẩn UET · ĐHQGHN</span>
                <span>UTF-8 Academic</span>
              </div>
            </div>

            <div className="md:col-span-4">
              <div
                className="text-xs font-medium mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Liên kết
              </div>
              <div
                className="flex items-center gap-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                <a
                  href={APP_REPOSITORY_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Mã nguồn GitHub STUDYHUB"
                  title="GitHub Repository"
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={onOpenChangelog}
                  aria-label="Nhật ký cập nhật phiên bản"
                  title="Change Logs"
                  className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  aria-label="Tìm kiếm nhanh Ctrl+K"
                  title="Tìm kiếm (Ctrl+K)"
                  className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchCourse(activeCourse.id, 'learn')}
                  aria-label="Vào không gian học tập"
                  title="Tham gia học ngay"
                  className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="md:col-span-3">
              <div
                className="text-xs font-medium mb-2.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Giao diện
              </div>
              <div className="relative w-full md:max-w-[240px]" ref={themeMenuRef}>
                <button
                  id="footer-theme-select"
                  type="button"
                  aria-label="Chọn giao diện"
                  aria-expanded={themeMenuOpen}
                  onClick={() => setThemeMenuOpen((o) => !o)}
                  className="w-full rounded-full border px-4 py-2 text-xs font-medium flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  style={{
                    borderColor: 'var(--border-strong)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span>
                    {progressState.theme === 'light'
                      ? 'Sáng (Pearl Glass)'
                      : progressState.theme === 'dark'
                        ? 'Tối (Midnight Obsidian)'
                        : 'Theo hệ thống'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${themeMenuOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-muted)' }}
                  />
                </button>

                {themeMenuOpen && (
                  <div
                    role="listbox"
                    aria-label="Danh sách chế độ giao diện"
                    className="absolute left-0 right-0 bottom-full mb-1.5 rounded-2xl border p-1.5 space-y-0.5 z-30 shadow-lg"
                    style={{
                      backgroundColor: 'var(--bg-surface-solid)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    {[
                      { mode: 'light' as const, label: 'Sáng (Pearl Glass)' },
                      { mode: 'dark' as const, label: 'Tối (Midnight Obsidian)' },
                      { mode: 'system' as const, label: 'Theo hệ thống' },
                    ].map((opt) => {
                      const selected = progressState.theme === opt.mode;
                      return (
                        <button
                          key={opt.mode}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            setTheme(opt.mode);
                            setThemeMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                          style={{
                            backgroundColor: selected ? 'var(--accent-soft)' : 'transparent',
                            color: selected ? 'var(--accent-primary)' : 'var(--text-primary)',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hairline Separator */}
          <div className="my-9 border-t" style={{ borderColor: 'var(--border-subtle)' }} />

          {/* Tier 2: 5-Column Vertical Editorial Sitemap */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-8">
            {/* Column 1 */}
            <div>
              <div
                className="text-xs font-medium mb-3.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Không gian học tập
              </div>
              <ul className="space-y-2.5 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLaunchCourse(activeCourse.id, 'learn')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Tham gia học
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('dashboard')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Dashboard &amp; Streak
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('labs')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Phòng thí nghiệm (Labs)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('exams')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Luyện đề Cuối kỳ (Beta)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenCommandPalette}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Tìm kiếm toàn Hub
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <div
                className="text-xs font-medium mb-3.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Kệ môn học
              </div>
              <ul className="space-y-2.5 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLaunchCourse('is2099', 'learn')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    IS2099 · Cơ sở dữ liệu
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById('course-catalog')?.scrollIntoView?.({ behavior: 'smooth' })
                    }
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    MAT1052 · Xác suất Thống kê
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById('course-catalog')?.scrollIntoView?.({ behavior: 'smooth' })
                    }
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    INT2210 · CTDL &amp; Giải thuật
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLaunchCourse('course-template', 'learn')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    TEMPLATE-101 · Khung mẫu
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <div
                className="text-xs font-medium mb-3.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Phòng Lab Tương tác
              </div>
              <ul className="space-y-2.5 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('labs')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Đại số Quan hệ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('labs')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Phụ thuộc hàm &amp; BCNF
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('labs')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    SQL Thực chiến Cuối kỳ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('labs')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Sơ đồ ER / EER &amp; Ánh xạ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('labs')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Mô phỏng Dị thường Bảng
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <div
                className="text-xs font-medium mb-3.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Phím tắt &amp; Tra cứu
              </div>
              <ul className="space-y-2.5 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                <li>
                  <button
                    type="button"
                    onClick={onOpenCommandPalette}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Bảng lệnh nhanh (Ctrl + K)
                  </button>
                </li>
                <li className="opacity-85">Chuyển phân khu (Alt + 1..5)</li>
                <li className="opacity-85">Thực thi truy vấn (Ctrl + Enter)</li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('exams')}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Đề thi mẫu UET 90 phút
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5 */}
            <div>
              <div
                className="text-xs font-medium mb-3.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Phiên bản &amp; Dự án
              </div>
              <ul className="space-y-2.5 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                <li>
                  <button
                    type="button"
                    onClick={onOpenChangelog}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Xem Change Logs
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenChangelog}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Phiên bản {APP_VERSION}
                  </button>
                </li>
                <li>
                  <a
                    href={APP_REPOSITORY_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 opacity-85 hover:opacity-100 hover:underline transition-opacity"
                  >
                    <span>Mã nguồn GitHub</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </li>
                <li className="opacity-85">Khoa CNTT — ĐHQGHN</li>
                <li className="opacity-85">Giáo trình Elmasri &amp; Navathe</li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenChangelog}
                    className="opacity-85 hover:opacity-100 hover:underline transition-opacity cursor-pointer text-left"
                  >
                    Giấy phép MIT License
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Tier 3: Bottom Legal / Copyright Bar */}
          <div
            className="mt-12 pt-2 flex flex-wrap items-center justify-between gap-4 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>
              Copyright © 2026 STUDYHUB · {APP_VERSION} · Phát hành theo giấy phép MIT License.
            </span>
            <span>
              Biên soạn phục vụ học tập &amp; ôn thi học kỳ — ĐH Công nghệ, ĐHQGHN.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
