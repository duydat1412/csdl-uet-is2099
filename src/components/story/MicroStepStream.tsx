import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Eye,
  FlaskConical,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { LessonSpec, MicroStepSpec, ModuleSpec } from '../../domain/types';
import { useProgress } from '../../store/progressStore';
import { MathFormula } from '../common/MathFormula';
import { RichText } from '../common/RichText';
import { ConceptCallout } from './ConceptCallout';
import { InlineQuizCheck } from './InlineQuizCheck';

export interface MicroStepStreamProps {
  module: ModuleSpec;
  lesson: LessonSpec;
  nextLesson: LessonSpec | null;
  stepRefs: React.MutableRefObject<Record<number, HTMLElement | null>>;
}

function extractHintsAndSolution(step: MicroStepSpec): {
  hints: string[];
  solutionSummary?: string;
  solutionLatex?: string;
} {
  const ch = step.challenge;
  if (!ch || ch.type === 'quiz') return { hints: [] };

  switch (ch.type) {
    case 'algebra':
      return {
        hints: ch.hints,
        solutionSummary: ch.solutionExpression,
      };
    case 'schema-mapper':
      return {
        hints: ch.hints,
        solutionSummary: ch.expectedTables
          .map(
            (t) =>
              `${t.name}(${t.columns
                .map((c) => (t.primaryKey.includes(c) ? `[PK] ${c}` : c))
                .join(', ')})`,
          )
          .join(' ; '),
      };
    case 'cardinality-toggle':
      return {
        hints: [ch.hint],
        solutionSummary: `${ch.leftEntityName} (${ch.expectedLeftMinMax[0]},${ch.expectedLeftMinMax[1]}) — ${ch.relationshipName} — (${ch.expectedRightMinMax[0]},${ch.expectedRightMinMax[1]}) ${ch.rightEntityName}`,
      };
    case 'eer-validator':
      return {
        hints: [ch.sampleCaseDescription],
        solutionSummary: `Chuyên biệt hóa (${ch.expectedDisjointness}) kết hợp tham gia ${
          ch.expectedCompleteness === 'total' ? 'Toàn bộ (nét đôi)' : 'Bộ phận (nét đơn)'
        }. ${ch.explanation}`,
      };
    case 'anomaly-sim':
      return {
        hints: [ch.goalDescription],
      };
  }
}

export const MicroStepStream: React.FC<MicroStepStreamProps> = ({
  module,
  lesson,
  nextLesson,
  stepRefs,
}) => {
  const {
    state,
    selectLesson,
    getActiveStepIndex,
    setActiveStepIndex,
    getUnlockedStepIndex,
    completeStep,
    isStepCompleted,
    isLessonCompleted,
    saveAnswer,
    getSavedAnswer,
  } = useProgress();

  const [revealedHintCountByStep, setRevealedHintCountByStep] = useState<Record<string, number>>({});
  const [showSolutionByStep, setShowSolutionByStep] = useState<Record<string, boolean>>({});

  const activeStepIdx = getActiveStepIndex(lesson.id);
  const unlockedIdx = state.freeNavigationMode
    ? lesson.steps.length - 1
    : getUnlockedStepIndex(lesson.id);

  const visibleSteps = lesson.steps.slice(0, unlockedIdx + 1);
  const lessonDone = isLessonCompleted(lesson.id);

  const phaseBadgeStyle = (phase: MicroStepSpec['phaseLabel']) => {
    switch (phase) {
      case 'Vấn đề':
        return { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'var(--warning-border)' };
      case 'Khám phá':
        return { bg: 'var(--info-bg)', text: 'var(--info-text)', border: 'var(--info-border)' };
      case 'Lý thuyết UET':
        return { bg: 'var(--accent-soft)', text: 'var(--accent-primary)', border: 'var(--accent-border)' };
      case 'Gỡ bẫy':
        return { bg: 'var(--error-bg)', text: 'var(--error-text)', border: 'var(--error-border)' };
      case 'Thực hành':
        return { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)' };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Lesson Header */}
      <header
        className="pb-5 border-b space-y-2"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          <span
            className="font-semibold px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-primary)',
            }}
          >
            Chặng {module.order} · {module.sourceFile}
          </span>
          <span>{lesson.slideRange}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />~{lesson.estimatedMinutes} phút
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
          <span className="font-mono mr-2" style={{ color: 'var(--accent-primary)' }}>
            {lesson.orderLabel}
          </span>
          {lesson.title}
        </h1>

        <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {lesson.subtitle}
        </p>
      </header>

      {/* Progressive Micro-Steps */}
      <div className="space-y-6">
        {visibleSteps.map((step, idx) => {
          const isFocused = idx === activeStepIdx;
          const stepDone = isStepCompleted(step.id);
          const badge = phaseBadgeStyle(step.phaseLabel);
          const { hints, solutionSummary, solutionLatex } = extractHintsAndSolution(step);
          const hintLevel = revealedHintCountByStep[step.id] ?? 0;
          const showSolution = Boolean(showSolutionByStep[step.id]);

          return (
            <article
              key={step.id}
              ref={(el) => {
                stepRefs.current[idx] = el;
              }}
              onClick={() => {
                if (activeStepIdx !== idx) {
                  setActiveStepIndex(lesson.id, idx);
                }
              }}
              className="animate-step-reveal rounded-2xl p-5 sm:p-6 border transition-all"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: isFocused ? 'var(--accent-primary)' : 'var(--border-subtle)',
                boxShadow: isFocused ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              }}
            >
              {/* Step Top Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Bước {idx + 1}/{lesson.steps.length}
                  </span>

                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.text,
                      borderColor: badge.border,
                    }}
                  >
                    {step.phaseLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {stepDone && (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                      style={{ color: 'var(--success-text)' }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã nắm vững
                    </span>
                  )}

                  {!isFocused && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStepIndex(lesson.id, idx);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded transition-colors cursor-pointer"
                      style={{
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      <Compass className="w-3 h-3" />
                      <span>Đồng bộ bàn thực hành</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Step Title */}
              <h2 className="text-base sm:text-lg font-bold mb-3 leading-snug">{step.title}</h2>

              {/* Main Vietnamese + LaTeX Narrative */}
              <div className="text-sm sm:text-[15px] leading-[1.72] space-y-3" style={{ color: 'var(--text-primary)' }}>
                <RichText content={step.narrative} />
              </div>

              {/* Callouts */}
              {step.callouts && step.callouts.length > 0 && (
                <div className="mt-4 space-y-3">
                  {step.callouts.map((c, cIdx) => (
                    <ConceptCallout key={`${step.id}-callout-${cIdx}`} callout={c} />
                  ))}
                </div>
              )}

              {/* Challenge / Progression Action */}
              {step.challenge?.type === 'quiz' && (
                <InlineQuizCheck
                  stepId={step.id}
                  quiz={step.challenge}
                  savedOptionId={getSavedAnswer(step.id)}
                  isCompleted={stepDone}
                  onSaveChoice={(optId) => saveAnswer(step.id, optId)}
                  onSolved={() => completeStep(lesson.id, step.id, idx, lesson.steps.length)}
                />
              )}

              {step.challenge && step.challenge.type !== 'quiz' && (
                <div
                  className="mt-4 rounded-xl p-4 border space-y-3"
                  style={{
                    backgroundColor: stepDone ? 'var(--success-bg)' : 'var(--accent-soft)',
                    borderColor: stepDone ? 'var(--success-border)' : 'var(--accent-border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <FlaskConical
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: stepDone ? 'var(--success-text)' : 'var(--accent-primary)' }}
                      />
                      <div>
                        <div
                          className="text-xs font-bold uppercase tracking-wide mb-1"
                          style={{ color: stepDone ? 'var(--success-text)' : 'var(--accent-primary)' }}
                        >
                          {stepDone
                            ? 'Thử thách trên Bàn thực hành đã hoàn thành'
                            : 'Thực hành trực tiếp ở khung bên phải'}
                        </div>
                        <div className="text-sm font-medium leading-relaxed">
                          <RichText content={step.challenge.prompt} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-tier Hints & Solution Reveal */}
                  {(hints.length > 0 || solutionSummary) && (
                    <div className="pt-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {hintLevel < hints.length && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRevealedHintCountByStep((prev) => ({
                                ...prev,
                                [step.id]: (prev[step.id] ?? 0) + 1,
                              }));
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer"
                            style={{
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-strong)',
                            }}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Xem gợi ý {hintLevel + 1}/{hints.length}</span>
                          </button>
                        )}

                        {solutionSummary && !showSolution && (hintLevel >= hints.length || stepDone) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSolutionByStep((prev) => ({ ...prev, [step.id]: true }));
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer"
                            style={{
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--accent-primary)',
                              border: '1px solid var(--accent-border)',
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem lời giải chuẩn</span>
                          </button>
                        )}
                      </div>

                      {hints.slice(0, hintLevel).map((h, hIdx) => (
                        <div
                          key={`${step.id}-hint-${hIdx}`}
                          className="p-2.5 rounded-lg text-xs sm:text-sm border"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-subtle)',
                          }}
                        >
                          <span className="font-bold mr-1.5" style={{ color: 'var(--accent-primary)' }}>
                            Gợi ý {hIdx + 1}:
                          </span>
                          <RichText content={h} />
                        </div>
                      ))}

                      {showSolution && solutionSummary && (
                        <div
                          className="p-3 rounded-lg text-xs sm:text-sm border space-y-1.5"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-strong)',
                          }}
                        >
                          <div className="font-bold text-xs uppercase tracking-wide" style={{ color: 'var(--accent-primary)' }}>
                            Lời giải tham khảo chuẩn UET:
                          </div>
                          {solutionLatex ? (
                            <MathFormula tex={solutionLatex} displayMode />
                          ) : (
                            <div className="font-mono text-xs sm:text-sm break-words">
                              {solutionSummary}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {stepDone && idx < lesson.steps.length - 1 && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStepIndex(lesson.id, idx + 1);
                          const nextEl = stepRefs.current[idx + 1];
                          if (nextEl && typeof nextEl.scrollIntoView === 'function') {
                            nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: '#FFFFFF',
                        }}
                      >
                        <span>Sang Bước {idx + 2} (đồng bộ bàn thực hành)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Narrative-only Step Unlock Button */}
              {!step.challenge && (
                <div className="mt-5 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {idx < lesson.steps.length - 1
                      ? 'Đọc kỹ và thử tương tác ở khung bên phải trước khi sang bước kế tiếp.'
                      : 'Bạn đã đi tới bước tổng kết của bài học này.'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      completeStep(lesson.id, step.id, idx, lesson.steps.length, true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0"
                    style={{
                      backgroundColor: stepDone ? 'var(--bg-subtle)' : 'var(--accent-primary)',
                      color: stepDone ? 'var(--text-primary)' : '#FFFFFF',
                      border: stepDone ? '1px solid var(--border-strong)' : 'none',
                    }}
                  >
                    <span>
                      {idx < lesson.steps.length - 1
                        ? stepDone
                          ? 'Xem bước tiếp theo'
                          : 'Tiếp tục bước tiếp theo'
                        : stepDone
                          ? 'Đã hoàn thành bài học'
                          : 'Đánh dấu hoàn thành bài'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Lesson Completion Banner -> Next Lesson */}
      {lessonDone && (
        <div
          className="animate-step-reveal rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--success-bg)',
            borderColor: 'var(--success-border)',
          }}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--success-text)' }} />
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--success-text)' }}>
                Hoàn thành {lesson.orderLabel}: {lesson.title}
              </div>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {nextLesson
                  ? `Sẵn sàng tiếp tục sang ${nextLesson.orderLabel}: ${nextLesson.title}`
                  : 'Chúc mừng bạn đã hoàn thành trọn vẹn lộ trình từ C1 đến hết Đại số Quan hệ (C3_2)!'}
              </p>
            </div>
          </div>

          {nextLesson && (
            <button
              type="button"
              onClick={() => selectLesson(nextLesson.id)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: '#FFFFFF',
              }}
            >
              <span>Sang {nextLesson.orderLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
