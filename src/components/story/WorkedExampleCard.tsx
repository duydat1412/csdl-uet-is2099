import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileCheck2, Sparkles } from 'lucide-react';
import { WorkedExampleSpec } from '../../domain/types';
import { RichText } from '../common/RichText';

export interface WorkedExampleCardProps {
  example: WorkedExampleSpec;
  defaultOpen?: boolean;
}

export const WorkedExampleCard: React.FC<WorkedExampleCardProps> = ({
  example,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className="my-4 rounded-2xl border overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--bg-subtle)',
        borderColor: 'var(--border-strong)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left cursor-pointer"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileCheck2 className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} />
          <div className="min-w-0">
            <div
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--accent-primary)' }}
            >
              Bài giải mẫu chuẩn Tự luận
            </div>
            <div className="text-sm font-bold truncate">{example.title}</div>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {open && (
        <div className="p-4 space-y-3 text-sm leading-relaxed border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div
            className="p-3 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
              Đề bài:
            </div>
            <RichText content={example.problemStatement} />
          </div>

          <div className="space-y-2">
            {example.steps.map((s, idx) => (
              <div
                key={`${example.id}-step-${idx}`}
                className="p-3 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Bước {idx + 1}: {s.label}
                </div>
                <RichText content={s.markdownLatex} />
              </div>
            ))}
          </div>

          <div
            className="p-3 rounded-xl border"
            style={{
              backgroundColor: 'var(--success-bg)',
              borderColor: 'var(--success-border)',
              color: 'var(--success-text)',
            }}
          >
            <div className="text-xs font-bold uppercase tracking-wide mb-1">
              Kết luận trình bày bài thi:
            </div>
            <RichText content={example.conclusion} />
          </div>

          {example.examTip && (
            <div
              className="p-3 rounded-xl border flex items-start gap-2 text-xs sm:text-sm"
              style={{
                backgroundColor: 'var(--info-bg)',
                borderColor: 'var(--info-border)',
                color: 'var(--info-text)',
              }}
            >
              <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-bold mr-1">Mẹo chấm điểm:</span>
                <RichText content={example.examTip} />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
