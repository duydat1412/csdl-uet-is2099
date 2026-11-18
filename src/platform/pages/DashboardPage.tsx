import React, { useMemo } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  RotateCcw,
  Target,
} from 'lucide-react';
import { useProgress } from '../../store/progressStore';
import {
  buildHeatmapDays,
  getLocalIsoDate,
  useHub,
} from '../store/hubStore';
import { CourseManifest } from '../types';
import { IosGlassSurface, ReadingGlassPanel } from '../ui/GlassPrimitives';

export interface DashboardPageProps {
  courses: CourseManifest[];
  activeCourse: CourseManifest;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  courses,
  activeCourse,
}) => {
  const { state: hubState, navigate, selectCourse, setDailyGoalTarget, resetHubStats } =
    useHub();
  const { state: progressState, isLessonCompleted, isStepCompleted } = useProgress();

  const todayIso = getLocalIsoDate();
  const todayCount = hubState.dailyActivityByDate[todayIso] ?? 0;
  const goalPct = Math.min(
    100,
    Math.round((todayCount / Math.max(1, hubState.dailyGoalTarget)) * 100),
  );

  const heatmapDays = useMemo(
    () => buildHeatmapDays(hubState.dailyActivityByDate, 56),
    [hubState.dailyActivityByDate],
  );

  const totalActions56d = heatmapDays.reduce((acc, d) => acc + d.count, 0);
  const activeDays56d = heatmapDays.filter((d) => d.count > 0).length;

  const courseLessons = activeCourse.modules.flatMap((m) => m.lessons);
  const completedLessonsCount = courseLessons.filter((l) =>
    isLessonCompleted(l.id),
  ).length;
  const overallCoursePct =
    courseLessons.length > 0
      ? Math.round((completedLessonsCount / courseLessons.length) * 100)
      : 0;

  const currentLessonObj =
    courseLessons.find((l) => l.id === progressState.currentLessonId) ??
    courseLessons[0] ??
    null;

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-20">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
            Trung tâm Thống kê Cá nhân · Study Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
            Nhịp độ Học tập &amp; Độ vững Kiến thức
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Đặt lại thống kê Study Streak và Lịch nhiệt về 0?')) {
              resetHubStats();
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại Streak</span>
        </button>
      </div>

      {/* Top 3 KPI Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Study Streak Card */}
        <IosGlassSurface className="p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Study Streak Toàn Hub
            </span>
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}
            >
              <Flame className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-bold">
              {hubState.streak.currentStreak}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              ngày liên tiếp
            </span>
          </div>

          <div className="text-xs flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
            <span>Kỷ lục cao nhất: {hubState.streak.longestStreak} ngày</span>
            <span>{activeDays56d} ngày có học (8 tuần)</span>
          </div>
        </IosGlassSurface>

        {/* 2. Daily Goal Progress */}
        <IosGlassSurface className="p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Mục tiêu Hôm nay ({todayCount}/{hubState.dailyGoalTarget} bước)
            </span>
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-primary)' }}
            >
              <Target className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-3xl font-bold">{goalPct}%</span>
              <span className="text-xs" style={{ color: goalPct >= 100 ? 'var(--success-text)' : 'var(--text-muted)' }}>
                {goalPct >= 100 ? 'Đã đạt mục tiêu ngày!' : 'Hoàn thành thêm bước để giữ nhịp'}
              </span>
            </div>
            <div
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--bg-subtle)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${goalPct}%`,
                  backgroundColor: goalPct >= 100 ? 'var(--success-text)' : 'var(--accent-primary)',
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Đặt mục tiêu/ngày:</span>
            <div className="flex gap-1">
              {[3, 5, 10].map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setDailyGoalTarget(target)}
                  className="font-mono px-2 py-0.5 rounded-lg border cursor-pointer"
                  style={{
                    backgroundColor:
                      hubState.dailyGoalTarget === target
                        ? 'var(--accent-primary)'
                        : 'var(--bg-surface)',
                    color:
                      hubState.dailyGoalTarget === target ? '#FFFFFF' : 'var(--text-secondary)',
                    borderColor:
                      hubState.dailyGoalTarget === target
                        ? 'var(--accent-primary)'
                        : 'var(--border-subtle)',
                  }}
                >
                  {target}
                </button>
              ))}
            </div>
          </div>
        </IosGlassSurface>

        {/* 3. Continue Learning Shortcut */}
        <IosGlassSurface className="p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Tiếp tục Bài đang học
            </span>
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-primary)' }}>
              {activeCourse.code}
            </span>
          </div>

          <div>
            {currentLessonObj ? (
              <>
                <div className="text-sm font-bold leading-snug">
                  <span className="font-mono mr-1.5" style={{ color: 'var(--accent-primary)' }}>
                    {currentLessonObj.orderLabel}
                  </span>
                  {currentLessonObj.title}
                </div>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {currentLessonObj.slideRange} · Hoàn thành {completedLessonsCount}/{courseLessons.length} bài ({overallCoursePct}%)
                </p>
              </>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Môn học mẫu chưa có bài học chi tiết.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(currentLessonObj ? 'learn' : 'home')}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{currentLessonObj ? 'Học tiếp ngay' : 'Xem kho môn học'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </IosGlassSurface>
      </div>

      {/* 56-Day Study Activity Heatmap */}
      <ReadingGlassPanel className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-sm sm:text-base font-bold">
              Lịch nhiệt Hoạt động 8 Tuần Gần nhất (56 ngày)
            </h2>
          </div>
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            Tổng cộng {totalActions56d} bước học &amp; bài thi
          </span>
        </div>

        <div className="grid grid-cols-14 sm:grid-cols-28 gap-1.5">
          {heatmapDays.map((day) => {
            const level =
              day.count === 0 ? 0 : day.count <= 2 ? 1 : day.count <= 5 ? 2 : 3;
            const bgByLevel = [
              'var(--bg-subtle)',
              'rgba(0, 122, 255, 0.25)',
              'rgba(0, 122, 255, 0.58)',
              'var(--accent-primary)',
            ];
            return (
              <div
                key={day.dateIso}
                title={`${day.dateIso}: ${day.count} hoạt động`}
                className="aspect-square rounded-md border transition-transform hover:scale-110"
                style={{
                  backgroundColor: bgByLevel[level],
                  borderColor:
                    day.dateIso === todayIso
                      ? 'var(--accent-primary)'
                      : 'var(--border-subtle)',
                }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <span>Ít</span>
          {[0, 1, 2, 3].map((lv) => (
            <span
              key={lv}
              className="w-3 h-3 rounded-sm border inline-block"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: [
                  'var(--bg-subtle)',
                  'rgba(0, 122, 255, 0.25)',
                  'rgba(0, 122, 255, 0.58)',
                  'var(--accent-primary)',
                ][lv],
              }}
            />
          ))}
          <span>Nhiều</span>
        </div>
      </ReadingGlassPanel>

      {/* Course Chapter Mastery + Exam History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Per-Chapter Mastery Bars */}
        <ReadingGlassPanel className="lg:col-span-7 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-bold">
              Tiến độ từng Chặng — {activeCourse.shortTitle}
            </h2>
            <div className="flex flex-wrap gap-1">
              {courses
                .filter((c) => c.modules.length > 0)
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCourse(c.id)}
                    className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer"
                    style={{
                      backgroundColor:
                        c.id === activeCourse.id ? 'var(--accent-soft)' : 'var(--bg-surface)',
                      color:
                        c.id === activeCourse.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      borderColor:
                        c.id === activeCourse.id ? 'var(--accent-border)' : 'var(--border-subtle)',
                    }}
                  >
                    {c.code}
                  </button>
                ))}
            </div>
          </div>

          <div className="space-y-3">
            {activeCourse.modules.map((mod) => {
              const modSteps = mod.lessons.flatMap((l) => l.steps);
              const doneSteps = modSteps.filter((s) => isStepCompleted(s.id)).length;
              const pct =
                modSteps.length > 0 ? Math.round((doneSteps / modSteps.length) * 100) : 0;

              return (
                <div key={mod.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold">
                      <span className="font-mono mr-1.5" style={{ color: 'var(--accent-primary)' }}>
                        Chặng {mod.order}
                      </span>
                      {mod.title}
                    </span>
                    <span className="font-mono text-xs font-bold">
                      {doneSteps}/{modSteps.length} bước ({pct}%)
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-subtle)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          pct === 100 ? 'var(--success-text)' : 'var(--accent-primary)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ReadingGlassPanel>

        {/* Exam Arena History */}
        <ReadingGlassPanel className="lg:col-span-5 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <Award className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span>Lịch sử Luyện đề (Exam Arena)</span>
            </h2>
            <button
              type="button"
              onClick={() => navigate('exams')}
              className="text-xs font-semibold underline cursor-pointer"
              style={{ color: 'var(--accent-primary)' }}
            >
              Thi thử ngay →
            </button>
          </div>

          {hubState.examAttempts.length === 0 ? (
            <div
              className="rounded-2xl p-5 border text-center space-y-2"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <ClipboardCheck className="w-6 h-6 mx-auto opacity-55" />
              <div className="text-xs sm:text-sm font-semibold">
                Bạn chưa lưu lượt làm đề nào
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Vào phân khu <strong>Luyện đề</strong>, làm phần Trắc nghiệm / Tự chấm Tự luận rồi nhấn <em>Nộp bài &amp; Lưu kết quả</em>.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {hubState.examAttempts.slice(0, 6).map((attempt) => {
                const totalEarned = attempt.mcqScore + attempt.selfWrittenPoints;
                const totalMax = attempt.mcqTotal + attempt.writtenTotal;
                return (
                  <div
                    key={attempt.id}
                    className="p-3 rounded-xl border flex items-center justify-between gap-2 text-xs"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--success-text)' }} />
                        <span>{attempt.paperId}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        TN: {attempt.mcqScore}/{attempt.mcqTotal}đ · TL: {attempt.selfWrittenPoints}/
                        {attempt.writtenTotal}đ
                      </div>
                    </div>
                    <span
                      className="font-mono font-bold px-2.5 py-1 rounded-lg"
                      style={{
                        backgroundColor: 'var(--accent-soft)',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      {totalEarned.toFixed(1)} / {totalMax.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </ReadingGlassPanel>
      </div>
    </div>
  );
};
