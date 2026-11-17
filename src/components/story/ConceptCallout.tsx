import React from 'react';
import { AlertTriangle, BookMarked, FileText, Lightbulb } from 'lucide-react';
import { CalloutSpec } from '../../domain/types';
import { RichText } from '../common/RichText';

export interface ConceptCalloutProps {
  callout: CalloutSpec;
}

export const ConceptCallout: React.FC<ConceptCalloutProps> = ({ callout }) => {
  const styleMap: Record<
    CalloutSpec['kind'],
    {
      bg: string;
      border: string;
      titleColor: string;
      badgeLabel: string;
      Icon: React.FC<{ className?: string }>;
    }
  > = {
    definition: {
      bg: 'var(--info-bg)',
      border: 'var(--info-border)',
      titleColor: 'var(--info-text)',
      badgeLabel: 'Định nghĩa chuẩn UET',
      Icon: BookMarked,
    },
    pitfall: {
      bg: 'var(--warning-bg)',
      border: 'var(--warning-border)',
      titleColor: 'var(--warning-text)',
      badgeLabel: 'Bẫy hay nhầm khi thi',
      Icon: AlertTriangle,
    },
    example: {
      bg: 'var(--success-bg)',
      border: 'var(--success-border)',
      titleColor: 'var(--success-text)',
      badgeLabel: 'Ví dụ trực quan',
      Icon: Lightbulb,
    },
    'slide-ref': {
      bg: 'var(--bg-surface)',
      border: 'var(--border-strong)',
      titleColor: 'var(--text-primary)',
      badgeLabel: 'Đối chiếu Slide',
      Icon: FileText,
    },
  };

  const cfg = styleMap[callout.kind];
  const Icon = cfg.Icon;

  return (
    <aside
      className="rounded-xl p-4 my-3.5 border transition-colors"
      style={{
        backgroundColor: cfg.bg,
        borderColor: cfg.border,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2" style={{ color: cfg.titleColor }}>
          <Icon className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wide">{cfg.badgeLabel}</span>
          <span className="text-sm font-bold">— {callout.title}</span>
        </div>

        {callout.slideSource && (
          <span
            className="font-mono text-[11px] font-medium px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {callout.slideSource}
          </span>
        )}
      </div>

      <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        <RichText content={callout.body} />
      </div>
    </aside>
  );
};
