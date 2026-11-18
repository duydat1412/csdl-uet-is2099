import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { RichText } from '../../components/common/RichText';
import { useHub } from '../store/hubStore';
import { CourseManifest, ExamPaperSpec } from '../types';
import { IosGlassSurface, ReadingGlassPanel } from '../ui/GlassPrimitives';

export interface ExamArenaPageProps {
  course: CourseManifest;
  onGoLearn: () => void;
}

export const ExamArenaPage: React.FC<ExamArenaPageProps> = ({ course, onGoLearn }) => {
  const { recordExamAttempt } = useHub();
  const papers: ExamPaperSpec[] = course.exams;

  const [selectedPaperId, setSelectedPaperId] = useState<string>(papers[0]?.id ?? '');
  const activePaper = useMemo(
    () => papers.find((p) => p.id === selectedPaperId) ?? papers[0] ?? null,
    [papers, selectedPaperId],
  );

  const [secondsLeft, setSecondsLeft] = useState<number>(
    (activePaper?.durationMinutes ?? 90) * 60,
  );
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState<boolean>(false);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [writtenDrafts, setWrittenDrafts] = useState<Record<string, string>>({});
  const [earnedSubpartIds, setEarnedSubpartIds] = useState<Record<string, boolean>>({});
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    setSelectedPaperId(papers[0]?.id ?? '');
  }, [course.id, papers]);

  useEffect(() => {
    if (!activePaper) return;
    setSecondsLeft(activePaper.durationMinutes * 60);
    setTimerRunning(false);
    setMcqAnswers({});
    setMcqSubmitted(false);
    setRevealedSolutions({});
    setWrittenDrafts({});
    setEarnedSubpartIds({});
    setSavedNotice(false);
  }, [activePaper?.id]);

  useEffect(() => {
    if (!timerRunning || secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, secondsLeft]);

  if (!activePaper) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <IosGlassSurface className="p-8 text-center space-y-3">
          <ClipboardCheck className="w-8 h-8 mx-auto" style={{ color: 'var(--accent-primary)' }} />
          <h1 className="text-xl font-bold">Môn học {course.code} chưa có đề thi mẫu</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Bạn có thể bổ sung mảng `exams` trong manifest của môn học này hoặc quay lại học phần `IS2099` để luyện bộ Đề thi thử Cuối kỳ đầy đủ.
          </p>
          <button
            type="button"
            onClick={onGoLearn}
            className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
          >
            Chuyển sang Bài học
          </button>
        </IosGlassSurface>
      </div>
    );
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const mcqTotal = activePaper.mcqQuestions.reduce((acc, q) => acc + q.points, 0);
  const mcqScore = activePaper.mcqQuestions.reduce(
    (acc, q) => acc + (mcqAnswers[q.id] === q.correctOptionId ? q.points : 0),
    0,
  );

  const writtenTotal = activePaper.writtenProblems.reduce((acc, p) => acc + p.totalPoints, 0);
  const selfWrittenPoints = activePaper.writtenProblems.reduce(
    (acc, p) =>
      acc +
      p.subparts.reduce(
        (subAcc, sp) => subAcc + (earnedSubpartIds[sp.id] ? sp.points : 0),
        0,
      ),
    0,
  );

  const handleSaveExamResult = () => {
    setMcqSubmitted(true);
    setTimerRunning(false);
    recordExamAttempt({
      courseId: course.id,
      paperId: activePaper.id,
      mcqScore,
      mcqTotal,
      selfWrittenPoints,
      writtenTotal,
    });
    setSavedNotice(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-8 space-y-6 pb-20">
      {/* Exam Header + Paper Switcher + Timer */}
      <ReadingGlassPanel className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2">
              <span
                className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--accent-border)',
                }}
              >
                PHÒNG LUYỆN ĐỀ · BETA
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                {course.code}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {activePaper.title}
            </h1>
            <p className="text-xs sm:text-sm max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              {activePaper.description}
            </p>
          </div>

          {/* Countdown Timer Control */}
          <div
            className="rounded-2xl p-3 border flex items-center gap-3 shrink-0"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <Clock className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <span className="font-mono text-lg font-bold tabular-nums">
              {mm}:{ss}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTimerRunning((r) => !r)}
                className="p-1.5 rounded-lg border cursor-pointer"
                style={{ borderColor: 'var(--border-subtle)' }}
                aria-label={timerRunning ? 'Tạm dừng đồng hồ' : 'Bắt đầu bấm giờ'}
              >
                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setSecondsLeft(activePaper.durationMinutes * 60);
                }}
                className="p-1.5 rounded-lg border cursor-pointer"
                style={{ borderColor: 'var(--border-subtle)' }}
                aria-label="Đặt lại đồng hồ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Paper Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {papers.map((paper) => {
            const active = paper.id === activePaper.id;
            return (
              <button
                key={paper.id}
                type="button"
                onClick={() => setSelectedPaperId(paper.id)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors"
                style={{
                  backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: active ? '#FFFFFF' : 'var(--text-primary)',
                  borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                }}
              >
                <span className="font-mono mr-1.5">{paper.code}</span>
                <span>({paper.durationMinutes}p)</span>
              </button>
            );
          })}
        </div>
      </ReadingGlassPanel>

      {/* PART I: AUTO-GRADED LATEX MCQ */}
      <ReadingGlassPanel className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-base sm:text-lg font-bold">
              Phần I. Trắc nghiệm Chuyên sâu ({mcqTotal.toFixed(1)} điểm)
            </h2>
          </div>

          {mcqSubmitted && (
            <span
              className="font-mono text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
            >
              Điểm Trắc nghiệm: {mcqScore.toFixed(1)} / {mcqTotal.toFixed(1)}
            </span>
          )}
        </div>

        <div className="space-y-4">
          {activePaper.mcqQuestions.map((q, qIdx) => {
            const chosen = mcqAnswers[q.id];
            const isCorrect = chosen === q.correctOptionId;
            return (
              <div
                key={q.id}
                className="rounded-2xl p-4 border space-y-3"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>
                    Câu {qIdx + 1} · {q.points} điểm
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                  >
                    {q.topicTag}
                  </span>
                </div>

                <div className="text-sm font-semibold">
                  <RichText content={q.prompt} />
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const selected = chosen === opt.id;
                    const optIsRight = opt.id === q.correctOptionId;

                    let bg = 'var(--bg-canvas)';
                    let border = 'var(--border-subtle)';
                    if (mcqSubmitted && optIsRight) {
                      bg = 'var(--success-bg)';
                      border = 'var(--success-border)';
                    } else if (mcqSubmitted && selected && !optIsRight) {
                      bg = 'var(--error-bg)';
                      border = 'var(--error-border)';
                    } else if (selected) {
                      bg = 'var(--accent-soft)';
                      border = 'var(--accent-border)';
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setMcqAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                        }
                        className="w-full text-left px-3.5 py-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors"
                        style={{ backgroundColor: bg, borderColor: border }}
                      >
                        <span
                          className="font-mono text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            backgroundColor: selected
                              ? 'var(--accent-primary)'
                              : 'var(--bg-subtle)',
                            color: selected ? '#FFFFFF' : 'var(--text-secondary)',
                          }}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <div className="flex-1 min-w-0 text-sm">
                          <RichText content={opt.label} />
                        </div>
                        {mcqSubmitted && optIsRight && (
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--success-text)' }} />
                        )}
                        {mcqSubmitted && selected && !optIsRight && (
                          <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--error-text)' }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {mcqSubmitted && (
                  <div
                    className="p-3 rounded-xl text-xs sm:text-sm border"
                    style={{
                      backgroundColor: isCorrect ? 'var(--success-bg)' : 'var(--info-bg)',
                      borderColor: isCorrect ? 'var(--success-border)' : 'var(--info-border)',
                      color: isCorrect ? 'var(--success-text)' : 'var(--info-text)',
                    }}
                  >
                    <RichText
                      content={
                        q.options.find((o) => o.id === q.correctOptionId)?.explanation ?? ''
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ReadingGlassPanel>

      {/* PART II: LATEX WRITTEN EXAM SHEET + STEP-BY-STEP SOLUTIONS */}
      <ReadingGlassPanel className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-base sm:text-lg font-bold">
              Phần II. Tự luận Tổng hợp Chuẩn Đề In LaTeX ({writtenTotal.toFixed(1)} điểm)
            </h2>
          </div>

          <span
            className="font-mono text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            Tự chấm Tự luận: {selfWrittenPoints.toFixed(2)} / {writtenTotal.toFixed(2)}
          </span>
        </div>

        <div className="space-y-5">
          {activePaper.writtenProblems.map((prob) => (
            <section
              key={prob.id}
              className="rounded-2xl p-4 sm:p-5 border space-y-4"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold">
                  {prob.title}{' '}
                  <span className="font-mono text-xs ml-1" style={{ color: 'var(--accent-primary)' }}>
                    ({prob.totalPoints} điểm)
                  </span>
                </h3>
                <span
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                >
                  {prob.topicTag}
                </span>
              </div>

              <div
                className="p-3.5 rounded-xl border text-sm"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
              >
                <RichText content={prob.contextMarkdownLatex} />
              </div>

              <div className="space-y-4">
                {prob.subparts.map((sp) => {
                  const shown = Boolean(revealedSolutions[sp.id]);
                  const earned = Boolean(earnedSubpartIds[sp.id]);
                  return (
                    <div
                      key={sp.id}
                      className="rounded-xl p-3.5 border space-y-3"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="text-sm font-semibold flex-1 min-w-0">
                          <span className="font-mono font-bold mr-1.5" style={{ color: 'var(--accent-primary)' }}>
                            {sp.label} ({sp.points}đ):
                          </span>
                          <RichText content={sp.prompt} />
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedSolutions((prev) => ({
                                ...prev,
                                [sp.id]: !prev[sp.id],
                              }))
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer"
                            style={{
                              backgroundColor: shown ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                              color: shown ? 'var(--accent-primary)' : 'var(--text-primary)',
                              borderColor: shown ? 'var(--accent-border)' : 'var(--border-subtle)',
                            }}
                          >
                            {shown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{shown ? 'Ẩn lời giải' : 'Xem lời giải LaTeX'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setEarnedSubpartIds((prev) => ({
                                ...prev,
                                [sp.id]: !prev[sp.id],
                              }))
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer"
                            style={{
                              backgroundColor: earned ? 'var(--success-bg)' : 'var(--bg-surface)',
                              color: earned ? 'var(--success-text)' : 'var(--text-secondary)',
                              borderColor: earned ? 'var(--success-border)' : 'var(--border-subtle)',
                            }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{earned ? `Đã cộng +${sp.points}đ` : `Tự chấm +${sp.points}đ`}</span>
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={writtenDrafts[sp.id] ?? ''}
                        onChange={(e) =>
                          setWrittenDrafts((prev) => ({ ...prev, [sp.id]: e.target.value }))
                        }
                        placeholder="Nháp lời giải hoặc ghi chú câu trả lời của bạn tại đây..."
                        className="w-full rounded-xl p-2.5 font-mono text-xs border resize-y"
                        style={{
                          backgroundColor: 'var(--bg-canvas)',
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--text-primary)',
                        }}
                      />

                      {shown && (
                        <div
                          className="p-3.5 rounded-xl border space-y-2"
                          style={{
                            backgroundColor: 'var(--success-bg)',
                            borderColor: 'var(--success-border)',
                          }}
                        >
                          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--success-text)' }}>
                            Đáp án chi tiết theo thang điểm UET:
                          </div>
                          <RichText content={sp.solutionMarkdownLatex} />
                          <div className="text-xs pt-1 border-t" style={{ borderColor: 'var(--success-border)', color: 'var(--success-text)' }}>
                            <strong>Biểu điểm chấm:</strong> {sp.gradingNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </ReadingGlassPanel>

      {/* Final Submit & Save Attempt to Dashboard */}
      <IosGlassSurface className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
          <div>
            <div className="text-sm font-bold">
              Tổng điểm hiện tại: {(mcqScore + selfWrittenPoints).toFixed(2)} /{' '}
              {(mcqTotal + writtenTotal).toFixed(2)} điểm
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Nộp bài sẽ chấm toàn bộ Phần I Trắc nghiệm, cộng 1 điểm Study Streak hôm nay và lưu kết quả vào Dashboard.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveExamResult}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer shrink-0"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
        >
          <Sparkles className="w-4 h-4" />
          <span>{savedNotice ? 'Đã lưu điểm vào Dashboard' : 'Nộp bài & Lưu kết quả'}</span>
        </button>
      </IosGlassSurface>
    </div>
  );
};
