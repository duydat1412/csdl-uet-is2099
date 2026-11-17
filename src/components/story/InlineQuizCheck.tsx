import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { QuizChallenge } from '../../domain/types';
import { RichText } from '../common/RichText';

export interface InlineQuizCheckProps {
  stepId: string;
  quiz: QuizChallenge;
  savedOptionId?: string;
  isCompleted: boolean;
  onSaveChoice: (optionId: string) => void;
  onSolved: () => void;
}

export const InlineQuizCheck: React.FC<InlineQuizCheckProps> = ({
  quiz,
  savedOptionId,
  isCompleted,
  onSaveChoice,
  onSolved,
}) => {
  const [selectedId, setSelectedId] = useState<string>(savedOptionId ?? '');
  const [submitted, setSubmitted] = useState<boolean>(Boolean(savedOptionId) || isCompleted);

  const chosenOption = quiz.options.find((o) => o.id === selectedId);
  const isCorrect = selectedId === quiz.correctOptionId;

  const handleSelect = (optId: string) => {
    setSelectedId(optId);
    setSubmitted(true);
    onSaveChoice(optId);
    if (optId === quiz.correctOptionId) {
      onSolved();
    }
  };

  return (
    <div
      className="mt-4 rounded-xl p-4 border"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-strong)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-start gap-2 mb-3">
        <HelpCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-primary)' }} />
        <div className="text-sm font-semibold leading-relaxed">
          <RichText content={quiz.prompt} />
        </div>
      </div>

      <div className="space-y-2" role="radiogroup" aria-label={quiz.prompt}>
        {quiz.options.map((opt, idx) => {
          const isSelected = selectedId === opt.id;
          const optIsAnswer = opt.id === quiz.correctOptionId;

          let border = 'var(--border-subtle)';
          let bg = 'var(--bg-canvas)';

          if (submitted && isSelected) {
            border = optIsAnswer ? 'var(--success-border)' : 'var(--error-border)';
            bg = optIsAnswer ? 'var(--success-bg)' : 'var(--error-bg)';
          } else if (isSelected) {
            border = 'var(--accent-border)';
            bg = 'var(--accent-soft)';
          }

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(opt.id)}
              className="w-full text-left px-3.5 py-2.5 rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer"
              style={{
                backgroundColor: bg,
                borderColor: border,
              }}
            >
              <span
                className="font-mono text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                }}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <div className="text-sm flex-1 min-w-0 leading-relaxed">
                <RichText content={opt.label} />
              </div>
              {submitted && isSelected && (
                optIsAnswer ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--success-text)' }} />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--error-text)' }} />
                )
              )}
            </button>
          );
        })}
      </div>

      {submitted && chosenOption && (
        <div
          className="mt-3 p-3 rounded-lg border text-xs sm:text-sm leading-relaxed"
          style={{
            backgroundColor: isCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
            borderColor: isCorrect ? 'var(--success-border)' : 'var(--error-border)',
            color: isCorrect ? 'var(--success-text)' : 'var(--error-text)',
          }}
        >
          <div className="font-bold mb-0.5">
            {isCorrect ? 'Chính xác! Bước tiếp theo đã được mở khóa.' : 'Chưa đúng — hãy xem giải thích bên dưới và thử lại:'}
          </div>
          <RichText content={chosenOption.explanation} />
        </div>
      )}
    </div>
  );
};
