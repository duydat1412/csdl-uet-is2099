import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Code2,
  ExternalLink,
  Flame,
  GitBranch,
  History,
  Layers,
  Monitor,
  Moon,
  Search,
  Sigma,
  Sparkles,
  Sun,
} from 'lucide-react';
import { MathFormula } from '../../components/common/MathFormula';
import { ThemeMode, useProgress } from '../../store/progressStore';
import { useHub } from '../store/hubStore';
import { CourseManifest } from '../types';
import { APP_REPOSITORY_URL, APP_VERSION } from '../version';
import {
  IosGlassSurface,
  LiquidGlassPill,
  ReadingGlassPanel,
} from '../ui/GlassPrimitives';

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
    badge: 'C3_2 · Set Semantics',
    tex: '\\pi_{\\text{MANV},\\text{TENNV}}\\Big((\\pi_{\\text{MANV},\\text{MADA}}(\\text{NV\\_DEAN}) \\div \\text{DA\\_NC}) * \\text{NHANVIEN}\\Big)',
    note: 'Tự động khử trùng lặp tập hợp và giải phẫu Phép chia 4 bước T1, S × T1, T2, T1 − T2.',
  },
  {
    id: 'fd',
    label: 'Chuẩn hóa BCNF',
    badge: 'C4_1 · Armstrong X+',
    tex: '\\{\\text{GiaoVien}\\}^+ = \\{\\text{GiaoVien},\\; \\text{MonHoc}\\} \\implies R_1(\\underline{\\text{GV}}, \\text{MH}),\\; R_2(\\underline{\\text{MaSV}}, \\underline{\\text{GV}})',
    note: 'Tách lược đồ bảo toàn thông tin (R1 ∩ R2 → R1) từ tập phụ thuộc hàm F.',
  },
  {
    id: 'sql',
    label: 'SQL Cuối kỳ',
    badge: 'Correlated NOT EXISTS',
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
  const { state: hubState, navigate, selectCourse } = useHub();
  const { state: progressState, setTheme } = useProgress();
  const [showcaseMode, setShowcaseMode] =
    useState<(typeof SHOWCASE_MODES)[number]['id']>('algebra');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const activeShowcase =
    SHOWCASE_MODES.find((m) => m.id === showcaseMode) ?? SHOWCASE_MODES[0];

  const handleLaunchCourse = (
    courseId: string,
    target: 'learn' | 'labs' | 'exams',
  ) => {
    selectCourse(courseId);
    navigate(target);
  };

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
    <div className="w-full min-h-screen flex flex-col justify-between">
      <div className="w-full mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-20 space-y-12 sm:space-y-14">
      {/* Minimalist Top Strip: Version Badge + Subtle Search & Theme Controls (No Heavy Dock) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <LiquidGlassPill
            isDark={isDark}
            onClick={onOpenChangelog}
            ariaLabel={`Phiên bản hiện tại ${APP_VERSION} — Xem nhật ký cập nhật`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#10B981' }}
            />
            <span className="font-mono font-bold tracking-wide">
              STUDYHUB · {APP_VERSION}
            </span>
            <span
              className="text-[11px] opacity-75"
              style={{ color: isDark ? '#CBD5E1' : '#334155' }}
            >
              Multi-Course Glass
            </span>
          </LiquidGlassPill>

          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border"
            style={{
              backgroundColor: 'var(--glass-bg)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
            ĐH Công nghệ — ĐHQGHN
          </span>
        </div>

        <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Tìm kiếm nhanh (Ctrl+K)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="hidden sm:inline font-mono text-[10px] opacity-75">Ctrl K</kbd>
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

      {/* =====================================================================
       * 1. HERO SECTION (Editorial Invitation + Dynamic Interactive Bento Showcase)
       * =================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        <div className="lg:col-span-6 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight leading-[1.18]"
          >
            Không gian Học &amp; Ôn thi{' '}
            <span style={{ color: 'var(--accent-primary)' }}>
              Đa môn Tương tác
            </span>{' '}
            chuẩn Toán học LaTeX
          </motion.h1>

          <p
            className="text-sm sm:text-base leading-relaxed max-w-2xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            Thay vì đọc slide tĩnh rời rạc, <strong>STUDYHUB</strong> kết hợp
            giáo trình giảng giải bản chất từng dòng,{' '}
            <strong>Bài giải mẫu tự luận</strong>, phòng thí nghiệm mô phỏng
            thời gian thực và <strong>Phòng Luyện đề Cuối kỳ</strong> tách biệt
            cho từng học phần.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleLaunchCourse(activeCourse.id, 'learn')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-transform active:scale-95"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: '#FFFFFF',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span>Tham gia học ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                document.getElementById('course-catalog')?.scrollIntoView?.({ behavior: 'smooth' })
              }
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold ios-frosted-panel cursor-pointer transition-transform active:scale-95"
            >
              <Layers className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span>Xem kệ môn học</span>
            </button>
          </div>
        </div>

        {/* Right Kinetic Showcase Bento (antigravity.google-inspired live widgets) */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* Interactive Live Schema-to-Math Translator Card */}
          <IosGlassSurface className="p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sigma className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Biến đổi Công thức Trực tiếp
                </span>
              </div>

              <div
                className="inline-flex rounded-full p-0.5 border"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                {SHOWCASE_MODES.map((m) => {
                  const active = showcaseMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setShowcaseMode(m.id)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors"
                      style={{
                        backgroundColor: active ? 'var(--bg-surface-solid)' : 'transparent',
                        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        boxShadow: active ? 'var(--shadow-sm)' : 'none',
                      }}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.div
              key={activeShowcase.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span
                  className="font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {activeShowcase.badge}
                </span>
                <button
                  type="button"
                  onClick={() => handleLaunchCourse(activeCourse.id, 'learn')}
                  className="font-semibold underline cursor-pointer"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Tham gia học để thực hành →
                </button>
              </div>
              <MathFormula tex={activeShowcase.tex} displayMode />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {activeShowcase.note}
              </p>
            </motion.div>
          </IosGlassSurface>

          {/* Bottom 2 Kinetic Mini-Cards: Orbital Relational Graph + Live Streak Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <IosGlassSurface className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
                  Đồ thị Thực thể Tương tác
                </span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  Chạm nút để xem
                </span>
              </div>

              <svg viewBox="0 0 260 110" className="w-full h-24 overflow-visible" role="img" aria-label="Minh họa đồ thị liên kết động">
                <line x1="54" y1="55" x2="130" y2="30" stroke="var(--border-strong)" strokeWidth="1.5" />
                <line x1="130" y1="30" x2="206" y2="55" stroke="var(--border-strong)" strokeWidth="1.5" />
                <line x1="54" y1="55" x2="130" y2="85" stroke="var(--accent-border)" strokeWidth="1.5" strokeDasharray="4 3" />
                {[
                  { id: 'nv', label: 'NHANVIEN', x: 54, y: 55 },
                  { id: 'pb', label: 'PHONGBAN', x: 130, y: 30 },
                  { id: 'da', label: 'DEAN', x: 206, y: 55 },
                  { id: 'bcnf', label: 'BCNF', x: 130, y: 85 },
                ].map((node, i) => {
                  const isHov = hoveredNode === node.id;
                  return (
                    <motion.g
                      key={node.id}
                      animate={{
                        y: isHov ? -4 : [0, i % 2 === 0 ? -3 : 3, 0],
                        scale: isHov ? 1.07 : 1,
                      }}
                      transition={
                        isHov
                          ? { type: 'spring', stiffness: 380, damping: 20 }
                          : { repeat: Infinity, duration: 3.4 + i * 0.5, ease: 'easeInOut' }
                      }
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ cursor: 'pointer', transformOrigin: `${node.x}px ${node.y}px` }}
                    >
                      <rect
                        x={node.x - 36}
                        y={node.y - 13}
                        width={72}
                        height={26}
                        rx={13}
                        fill={isHov ? 'var(--accent-primary)' : 'var(--bg-surface-solid)'}
                        stroke="var(--accent-border)"
                        strokeWidth={1.5}
                      />
                      <text
                        x={node.x}
                        y={node.y + 4}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={700}
                        fontFamily="var(--font-mono)"
                        fill={isHov ? '#FFFFFF' : 'var(--text-primary)'}
                      >
                        {node.label}
                      </text>
                    </motion.g>
                  );
                })}
              </svg>
            </IosGlassSurface>

            <IosGlassSurface
              className="p-4 flex flex-col justify-between cursor-pointer"
              onClick={() => handleLaunchCourse(activeCourse.id, 'learn')}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4" style={{ color: 'var(--warning-text)' }} />
                  Study Streak Đa môn
                </span>
                <span
                  className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--warning-bg)',
                    color: 'var(--warning-text)',
                  }}
                >
                  {hubState.streak.currentStreak} ngày
                </span>
              </div>

              <div className="py-2">
                <div className="text-2xl font-bold font-mono">
                  Kỷ lục: {hubState.streak.longestStreak} ngày
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Học bất kỳ môn nào hoặc làm xong 1 đề trong Exam Arena đều tự động nối dài chuỗi Streak và tô sáng lịch nhiệt 56 ngày.
                </p>
              </div>

              <div className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--accent-primary)' }}>
                <span>Tham gia học để nối dài Streak</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </IosGlassSurface>
          </div>
        </div>
      </section>

      {/* =====================================================================
       * 2. PHƯƠNG PHÁP BIÊN SOẠN & GIẢNG DẠY CHUYÊN SÂU
       * =================================================================== */}
      <section className="space-y-5">
        <div className="max-w-2xl space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
            Phương pháp Biên soạn Chuyên sâu Ôn thi Cuối kỳ
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Mỗi bài giảng đi qua 5 tầng tư duy — Học hiểu tận gốc, Làm bài không sót bẫy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            {
              step: '01',
              title: 'Trực giác & Vấn đề',
              desc: 'Đặt bài toán thực tế khiến cách làm ngây thơ thất bại trước khi đưa khái niệm mới.',
            },
            {
              step: '02',
              title: 'Lý thuyết Chuẩn UET',
              desc: 'Giải nghĩa từng ký hiệu toán học LaTeX khớp slide bài giảng Khoa CNTT — ĐHQGHN.',
            },
            {
              step: '03',
              title: 'Bài giải Mẫu Tự luận',
              desc: 'Khung lời giải viết tay từng bước chuẩn thang điểm đề thi cuối kỳ (Worked Examples).',
            },
            {
              step: '04',
              title: 'Gỡ bẫy Mất điểm',
              desc: 'Bóc tách các lỗi kinh điển: ngược chiều (min, max), quên chiếu trước phép chia, SQL NULL.',
            },
            {
              step: '05',
              title: 'Lab & Exam Arena',
              desc: 'Chấm điểm tức thì qua 5 engine client-side và bộ đề thi thử 90 phút riêng biệt.',
            },
          ].map((item) => (
            <ReadingGlassPanel key={item.step} className="p-4 space-y-2">
              <div className="font-mono text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                TẦNG {item.step}
              </div>
              <div className="text-sm font-bold">{item.title}</div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.desc}
              </p>
            </ReadingGlassPanel>
          ))}
        </div>
      </section>

      {/* =====================================================================
       * 3. KỆ MÔN HỌC ĐA MÔN (MULTI-COURSE CATALOG + STARTER TEMPLATE)
       * =================================================================== */}
      <section id="course-catalog" className="space-y-5 scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
              Kho Học phần Đa Môn · Plug-and-Play Architecture
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Chọn Môn học để Khám phá — Hoặc Dùng Mẫu{' '}
              <code className="font-mono text-[0.88em] px-1.5 py-0.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-primary)]">
                _course-template
              </code>{' '}
              Mở rộng Nhanh
            </h2>
          </div>
          <span className="font-mono text-xs px-3 py-1 rounded-full ios-frosted-panel" style={{ color: 'var(--text-muted)' }}>
            src/courses/registry.ts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
            const isSelected = course.id === activeCourse.id;
            return (
              <IosGlassSurface
                key={course.id}
                className="p-5 flex flex-col justify-between gap-4"
                style={{
                  borderColor: isSelected ? 'var(--accent-border)' : 'var(--glass-border)',
                }}
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: course.accentHex }}
                      />
                      <span className="font-mono text-xs font-bold">{course.code}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        · {course.faculty}
                      </span>
                    </div>

                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          course.status === 'active'
                            ? 'var(--success-bg)'
                            : course.status === 'template-sample'
                              ? 'var(--accent-soft)'
                              : 'var(--bg-subtle)',
                        color:
                          course.status === 'active'
                            ? 'var(--success-text)'
                            : course.status === 'template-sample'
                              ? 'var(--accent-primary)'
                              : 'var(--text-muted)',
                      }}
                    >
                      {course.status === 'active'
                        ? 'Sẵn sàng Ôn thi Cuối kỳ'
                        : course.status === 'template-sample'
                          ? 'Mẫu mở rộng SDK'
                          : 'Dự kiến tiếp theo'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold leading-snug">{course.title}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {course.summary}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    <span>{course.modules.length} Chặng</span>
                    <span>·</span>
                    <span>{totalLessons} Bài học</span>
                    <span>·</span>
                    <span>{course.labs.length} Phòng Lab</span>
                    <span>·</span>
                    <span>{course.exams.length} Đề thi mẫu</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  {course.modules.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleLaunchCourse(course.id, 'learn')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-transform active:scale-95"
                        style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Tham gia học</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Mở đầy đủ Bài giảng, Phòng Lab, Dashboard &amp; Luyện đề
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Dùng mẫu <code className="font-mono font-semibold text-[var(--text-primary)]">TEMPLATE-101</code> để kích hoạt môn này ở bản tiếp theo.
                      </span>
                    </span>
                  )}
                </div>
              </IosGlassSurface>
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
              <label
                htmlFor="footer-theme-select"
                className="block text-xs font-medium mb-2.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Giao diện
              </label>
              <div className="relative w-full md:max-w-[240px]">
                <select
                  id="footer-theme-select"
                  aria-label="Chọn giao diện"
                  value={progressState.theme}
                  onChange={(e) => setTheme(e.target.value as ThemeMode)}
                  className="w-full appearance-none rounded-full border px-4 py-2 pr-9 text-xs font-medium cursor-pointer transition-colors"
                  style={{
                    borderColor: 'var(--border-strong)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                  }}
                >
                  <option
                    value="light"
                    style={{
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  >
                    Sáng (Pearl Glass)
                  </option>
                  <option
                    value="dark"
                    style={{
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  >
                    Tối (Midnight Obsidian)
                  </option>
                  <option
                    value="system"
                    style={{
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  >
                    Theo hệ thống
                  </option>
                </select>
                <ChevronDown
                  className="w-3.5 h-3.5 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
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
