import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { UET_DATASETS } from '../../domain/datasets/uetDatasets';
import { compareSqlResults, evaluateSqlQuery } from '../../domain/sql/sqlEngine';
import { SQLChallenge } from '../../domain/types';
import { RelationTableView } from './RelationTableView';

export interface SQLWorkbenchProps {
  datasetId?: string;
  title: string;
  caption?: string;
  initialSql?: string;
  savedSql?: string;
  challenge?: SQLChallenge;
  onSaveSql?: (sql: string) => void;
  onSolved?: () => void;
}

const SQL_SNIPPETS: Array<{ label: string; insert: string }> = [
  { label: 'SELECT DISTINCT', insert: 'SELECT DISTINCT ' },
  { label: 'FROM', insert: '\nFROM ' },
  { label: 'JOIN ... ON', insert: '\nJOIN  ON ' },
  { label: 'LEFT JOIN', insert: '\nLEFT JOIN  ON ' },
  { label: 'WHERE', insert: '\nWHERE ' },
  { label: 'GROUP BY', insert: '\nGROUP BY ' },
  { label: 'HAVING', insert: '\nHAVING ' },
  { label: 'ORDER BY', insert: '\nORDER BY ' },
  { label: 'NOT EXISTS', insert: 'NOT EXISTS (\n  SELECT * FROM \n  WHERE \n)' },
  { label: 'COUNT(*)', insert: 'COUNT(*)' },
];

export const SQLWorkbench: React.FC<SQLWorkbenchProps> = ({
  datasetId = 'CONGTY_EX',
  title,
  caption,
  initialSql,
  savedSql,
  challenge,
  onSaveSql,
  onSolved,
}) => {
  const activeDatasetId = challenge?.datasetId ?? datasetId;
  const db = UET_DATASETS[activeDatasetId] ?? UET_DATASETS.CONGTY_EX;
  const relationNames = Object.keys(db.relations);

  const defaultQuery =
    savedSql ??
    challenge?.starterSql ??
    initialSql ??
    `SELECT *\nFROM ${relationNames[0] ?? 'NHANVIEN'}`;

  const [sql, setSql] = useState(defaultQuery);
  const [activeSourceRel, setActiveSourceRel] = useState(relationNames[0] ?? '');
  const [sourceOpen, setSourceOpen] = useState(true);
  const [runOutcome, setRunOutcome] = useState<ReturnType<typeof evaluateSqlQuery> | null>(
    null,
  );
  const [gradeMessage, setGradeMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const rels = Object.keys(db.relations);
    setActiveSourceRel(rels[0] ?? '');
    const init =
      savedSql ??
      challenge?.starterSql ??
      initialSql ??
      `SELECT *\nFROM ${rels[0] ?? 'NHANVIEN'}`;
    setSql(init);
    setRunOutcome(evaluateSqlQuery(db, init));
    setGradeMessage(null);
  }, [activeDatasetId, challenge, initialSql, savedSql, db]);

  const insertSnippet = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      const next = sql + snippet;
      setSql(next);
      onSaveSql?.(next);
      return;
    }
    const start = el.selectionStart ?? sql.length;
    const end = el.selectionEnd ?? sql.length;
    const next = sql.slice(0, start) + snippet + sql.slice(end);
    setSql(next);
    onSaveSql?.(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleRun = () => {
    onSaveSql?.(sql);
    const res = evaluateSqlQuery(db, sql);
    setRunOutcome(res);

    if (res.error) {
      setGradeMessage({ ok: false, text: res.error });
      return;
    }

    if (challenge && res.result) {
      const expected = evaluateSqlQuery(db, challenge.solutionSql);
      if (expected.result) {
        if (res.kind === 'ddl') {
          const pkMatch =
            JSON.stringify(res.result.schema.primaryKey.map((x) => x.toUpperCase()).sort()) ===
            JSON.stringify(expected.result.schema.primaryKey.map((x) => x.toUpperCase()).sort());
          if (pkMatch && res.result.schema.attributes.length >= expected.result.schema.attributes.length) {
            setGradeMessage({
              ok: true,
              text: `${res.ddlSummary ?? 'Lược đồ DDL hợp lệ!'} Đã mở khóa bước tiếp theo.`,
            });
            onSolved?.();
          } else {
            setGradeMessage({
              ok: false,
              text: 'Lược đồ DDL chưa khớp đủ cột hoặc khóa chính/khóa ngoại theo yêu cầu.',
            });
          }
          return;
        }

        const cmp = compareSqlResults(res.result, expected.result, {
          checkOrder: challenge.checkOrder,
        });
        if (cmp.isEqual) {
          setGradeMessage({
            ok: true,
            text: `Chính xác! Câu SQL trả về đúng ${res.result.rows.length} dòng chuẩn đáp án UET.`,
          });
          onSolved?.();
        } else {
          setGradeMessage({ ok: false, text: cmp.reason ?? 'Kết quả chưa khớp.' });
        }
      }
    } else {
      setGradeMessage(null);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Dataset Browser */}
      <div className="rounded-2xl ios-frosted-panel overflow-hidden">
        <div
          className="px-3.5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}
        >
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold flex items-start gap-1.5 leading-snug">
              <Code2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
              <span className="break-words">{title || db.title}</span>
            </div>
            {caption && (
              <div className="text-[11px] leading-snug mt-0.5 break-words" style={{ color: 'var(--text-muted)' }}>
                {caption}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSourceOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer shrink-0"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <span>{sourceOpen ? 'Ẩn bảng nguồn' : 'Xem bảng nguồn'}</span>
            {sourceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="px-3.5 py-2 flex flex-wrap gap-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          {relationNames.map((rName) => {
            const active = rName === activeSourceRel;
            return (
              <div
                key={rName}
                className="inline-flex items-center rounded-lg border overflow-hidden"
                style={{ borderColor: active ? 'var(--accent-border)' : 'var(--border-subtle)' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveSourceRel(rName);
                    setSourceOpen(true);
                  }}
                  className="font-mono text-xs font-semibold px-2.5 py-1 cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {rName}
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet(rName)}
                  title={`Chèn tên bảng ${rName}`}
                  className="px-1.5 py-1 text-[11px] font-bold border-l cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>

        {sourceOpen && db.relations[activeSourceRel] && (
          <div className="p-3">
            <RelationTableView
              relation={db.relations[activeSourceRel]}
              compact
              onColumnClick={(col) => insertSnippet(col)}
            />
          </div>
        )}
      </div>

      {/* SQL Query Editor */}
      <div className="rounded-2xl ios-frosted-panel p-3.5 space-y-3">
        <div className="flex flex-wrap gap-1">
          {SQL_SNIPPETS.map((sn) => (
            <button
              key={sn.label}
              type="button"
              onClick={() => insertSnippet(sn.insert)}
              className="font-mono text-[11px] font-semibold px-2 py-1 rounded-lg border cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {sn.label}
            </button>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          rows={5}
          value={sql}
          onChange={(e) => {
            setSql(e.target.value);
            onSaveSql?.(e.target.value);
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleRun();
            }
          }}
          placeholder="Nhập câu truy vấn SQL (SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ...)"
          aria-label="Trình soạn thảo SQL thực chiến"
          className="w-full rounded-xl p-3 font-mono text-xs sm:text-sm border resize-y"
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderColor: 'var(--border-strong)',
            color: 'var(--text-primary)',
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Hỗ trợ <code className="px-1 rounded border border-[var(--border-subtle)]">LEFT JOIN</code>,{' '}
            <code className="px-1 rounded border border-[var(--border-subtle)]">GROUP BY / HAVING</code>,{' '}
            <code className="px-1 rounded border border-[var(--border-subtle)]">NOT EXISTS</code>, và{' '}
            <code className="px-1 rounded border border-[var(--border-subtle)]">CREATE TABLE</code>.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const reset = challenge?.starterSql ?? initialSql ?? '';
                setSql(reset);
                setGradeMessage(null);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục</span>
            </button>

            <button
              type="button"
              onClick={handleRun}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{challenge ? 'Chạy & Chấm SQL' : 'Chạy truy vấn SQL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {(gradeMessage || runOutcome?.error || runOutcome?.ddlSummary) && (
        <div
          className="rounded-xl p-3.5 border text-xs sm:text-sm flex items-start gap-2"
          style={{
            backgroundColor: runOutcome?.error || gradeMessage?.ok === false
              ? 'var(--error-bg)'
              : 'var(--success-bg)',
            borderColor: runOutcome?.error || gradeMessage?.ok === false
              ? 'var(--error-border)'
              : 'var(--success-border)',
            color: runOutcome?.error || gradeMessage?.ok === false
              ? 'var(--error-text)'
              : 'var(--success-text)',
          }}
        >
          {runOutcome?.error || gradeMessage?.ok === false ? (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <div>{runOutcome?.error ?? gradeMessage?.text ?? runOutcome?.ddlSummary}</div>
        </div>
      )}

      {/* Output Table */}
      {runOutcome && !runOutcome.error && runOutcome.result && (
        <RelationTableView relation={runOutcome.result} compact />
      )}
    </div>
  );
};
