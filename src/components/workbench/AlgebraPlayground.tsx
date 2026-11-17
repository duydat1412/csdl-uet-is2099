import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Play,
  RotateCcw,
  Sigma,
  Split,
  Table2,
} from 'lucide-react';
import { ASTNode, DivisionBreakdown } from '../../domain/algebra/ast';
import {
  compareRelations,
  evaluateAlgebraProgram,
  formatProgramToLatex,
} from '../../domain/algebra/evaluator';
import { UET_DATASETS } from '../../domain/datasets/uetDatasets';
import { AlgebraChallenge } from '../../domain/types';
import { MathFormula } from '../common/MathFormula';
import { RelationTableView } from './RelationTableView';

export interface AlgebraPlaygroundProps {
  datasetId?: string;
  title: string;
  caption?: string;
  initialExpression?: string;
  savedExpression?: string;
  challenge?: AlgebraChallenge;
  onSaveExpression?: (expr: string) => void;
  onSolved?: () => void;
}

interface OperatorButtonSpec {
  symbol: string;
  insertText: string;
  cursorOffset?: number;
  tooltip: string;
}

const UET_OPERATORS: OperatorButtonSpec[] = [
  { symbol: 'σ', insertText: 'σ_{}()', cursorOffset: 3, tooltip: 'Phép chọn σ_{điều_kiện}(R)' },
  { symbol: 'π', insertText: 'π_{}()', cursorOffset: 3, tooltip: 'Phép chiếu π_{cột1, cột2}(R)' },
  { symbol: 'ρ', insertText: 'ρ_{}()', cursorOffset: 3, tooltip: 'Phép đổi tên ρ_{S(B1, B2)}(R)' },
  { symbol: '←', insertText: ' ← ', tooltip: 'Phép gán biến trung gian T1 ← biểu_thức' },
  { symbol: '∪', insertText: ' ∪ ', tooltip: 'Phép hợp khả hợp R ∪ S' },
  { symbol: '∩', insertText: ' ∩ ', tooltip: 'Phép giao khả hợp R ∩ S' },
  { symbol: '−', insertText: ' - ', tooltip: 'Phép trừ khả hợp R − S' },
  { symbol: '×', insertText: ' × ', tooltip: 'Tích Đề-các R × S' },
  { symbol: '*', insertText: ' * ', tooltip: 'Nối tự nhiên R * S (giữ 1 cột chung)' },
  { symbol: '⨝', insertText: ' ⨝_{} ', cursorOffset: 4, tooltip: 'Nối có điều kiện R ⨝_{F} S' },
  { symbol: '⟕', insertText: ' ⟕_{} ', cursorOffset: 4, tooltip: 'Nối ngoài trái R ⟕_{F} S' },
  { symbol: '⟖', insertText: ' ⟖_{} ', cursorOffset: 4, tooltip: 'Nối ngoài phải R ⟖_{F} S' },
  { symbol: '⟗', insertText: ' ⟗_{} ', cursorOffset: 4, tooltip: 'Nối ngoài đầy đủ R ⟗_{F} S' },
  { symbol: '÷', insertText: ' ÷ ', tooltip: 'Phép chia R ÷ S ("với mọi / tất cả")' },
  { symbol: 'ℱ', insertText: '_{}ℱ_{}()', cursorOffset: 2, tooltip: 'Gom nhóm _{nhóm}ℱ_{HÀM(cột)}(R)' },
  { symbol: '∧', insertText: ' ∧ ', tooltip: 'Phép hội logic (AND)' },
  { symbol: '∨', insertText: ' ∨ ', tooltip: 'Phép tuyển logic (OR)' },
  { symbol: '≠', insertText: ' ≠ ', tooltip: 'Khác (!=)' },
  { symbol: '≤', insertText: ' ≤ ', tooltip: 'Nhỏ hơn hoặc bằng (<=)' },
  { symbol: '≥', insertText: ' ≥ ', tooltip: 'Lớn hơn hoặc bằng (>=)' },
];

function collectPostOrderNodes(node: ASTNode, out: ASTNode[] = []): ASTNode[] {
  if (node.kind === 'Selection' || node.kind === 'Projection' || node.kind === 'Rename' || node.kind === 'Group') {
    collectPostOrderNodes(node.child, out);
  } else if (node.kind === 'Binary') {
    collectPostOrderNodes(node.left, out);
    collectPostOrderNodes(node.right, out);
  }
  out.push(node);
  return out;
}

function findFirstDivisionBreakdown(nodes: ASTNode[]): DivisionBreakdown | undefined {
  for (const n of nodes) {
    if (n.divisionBreakdown) return n.divisionBreakdown;
  }
  return undefined;
}

export const AlgebraPlayground: React.FC<AlgebraPlaygroundProps> = ({
  datasetId = 'CONGTY_PHG',
  title,
  caption,
  initialExpression,
  savedExpression,
  challenge,
  onSaveExpression,
  onSolved,
}) => {
  const activeDatasetId = challenge?.datasetId ?? datasetId;
  const db = UET_DATASETS[activeDatasetId] ?? UET_DATASETS.CONGTY_PHG;
  const relationNames = Object.keys(db.relations);

  const defaultQuery =
    savedExpression ??
    challenge?.starterExpression ??
    initialExpression ??
    relationNames[0] ??
    '';

  const [query, setQuery] = useState<string>(defaultQuery);
  const [sourcePreviewOpen, setSourcePreviewOpen] = useState<boolean>(true);
  const [activeSourceRel, setActiveSourceRel] = useState<string>(relationNames[0] ?? '');
  const [outputTab, setOutputTab] = useState<'result' | 'ast' | 'division'>('result');
  const [selectedAstNodeId, setSelectedAstNodeId] = useState<string | null>(null);
  const [gradeMessage, setGradeMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const nextNames = Object.keys(db.relations);
    setActiveSourceRel(nextNames[0] ?? '');
    const startExpr =
      savedExpression ??
      challenge?.starterExpression ??
      initialExpression ??
      nextNames[0] ??
      '';
    setQuery(startExpr);
    setGradeMessage(null);
    setSelectedAstNodeId(null);
    setOutputTab('result');
  }, [activeDatasetId, challenge, initialExpression, savedExpression, db.relations]);

  const liveLatex = useMemo(() => formatProgramToLatex(query), [query]);

  const evalResult = useMemo(() => {
    if (!query.trim()) return null;
    return evaluateAlgebraProgram(db, query);
  }, [db, query]);

  const allAstNodes = useMemo(() => {
    if (!evalResult || evalResult.error) return [];
    const list: ASTNode[] = [];
    for (const step of evalResult.steps) {
      collectPostOrderNodes(step.ast, list);
    }
    return list;
  }, [evalResult]);

  const divisionBreakdown = useMemo(
    () => findFirstDivisionBreakdown(allAstNodes),
    [allAstNodes],
  );

  const insertSnippet = (snippet: string, cursorOffset?: number) => {
    const el = textareaRef.current;
    if (!el) {
      const next = query + snippet;
      setQuery(next);
      onSaveExpression?.(next);
      return;
    }
    const start = el.selectionStart ?? query.length;
    const end = el.selectionEnd ?? query.length;
    const next = query.slice(0, start) + snippet + query.slice(end);
    setQuery(next);
    onSaveExpression?.(next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + (cursorOffset ?? snippet.length);
      el.setSelectionRange(pos, pos);
    });
  };

  const handleRunAndGrade = () => {
    onSaveExpression?.(query);
    if (!query.trim()) return;

    const currentRun = evaluateAlgebraProgram(db, query);
    if (currentRun.error || !currentRun.finalResult) {
      setGradeMessage({
        ok: false,
        text: currentRun.error ?? 'Biểu thức chưa trả về kết quả hợp lệ.',
      });
      return;
    }

    if (challenge) {
      const expectedRun = evaluateAlgebraProgram(db, challenge.solutionExpression);
      if (expectedRun.finalResult) {
        const cmp = compareRelations(currentRun.finalResult, expectedRun.finalResult, {
          checkColumnNames: challenge.checkColumnNames,
        });
        if (cmp.isEqual) {
          setGradeMessage({
            ok: true,
            text: `Chính xác! Kết quả khớp hoàn toàn (${currentRun.finalResult.rows.length} bộ). Đã mở khóa bước kế tiếp.`,
          });
          onSolved?.();
        } else {
          setGradeMessage({
            ok: false,
            text: cmp.reason ?? 'Kết quả chưa khớp với đáp án chuẩn.',
          });
        }
      }
    } else {
      setGradeMessage(null);
    }
  };

  const inspectedNode =
    allAstNodes.find((n) => n.id === selectedAstNodeId) ??
    allAstNodes[allAstNodes.length - 1] ??
    null;

  return (
    <div className="space-y-3.5">
      {/* 1. Source Dataset Inspector */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div
          className="px-3.5 py-2 border-b flex items-center justify-between gap-2"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="min-w-0">
            <div className="text-xs font-bold truncate">{title || db.title}</div>
            {caption && (
              <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                {caption}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSourcePreviewOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded cursor-pointer shrink-0"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span>{sourcePreviewOpen ? 'Thu gọn bảng nguồn' : 'Xem bảng nguồn'}</span>
            {sourcePreviewOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Relation Schema Pills (Click to view / Double-click or + to insert) */}
        <div className="px-3.5 py-2 flex flex-wrap items-center gap-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          {relationNames.map((rName) => {
            const active = rName === activeSourceRel;
            return (
              <div key={rName} className="inline-flex items-center rounded-lg border overflow-hidden" style={{ borderColor: active ? 'var(--accent-border)' : 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSourceRel(rName);
                    setSourcePreviewOpen(true);
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
                  title={`Chèn tên bảng ${rName} vào biểu thức`}
                  className="px-1.5 py-1 text-[11px] font-bold border-l cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-muted)',
                  }}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>

        {sourcePreviewOpen && db.relations[activeSourceRel] && (
          <div className="p-3">
            <RelationTableView
              relation={db.relations[activeSourceRel]}
              compact
              onColumnClick={(colName) => insertSnippet(colName)}
            />
          </div>
        )}
      </div>

      {/* 2. Relational Algebra Editor + Symbol Toolbar + Live KaTeX Preview */}
      <div
        className="rounded-xl p-3.5 border space-y-3"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Operator Toolbar */}
        <div className="flex flex-wrap gap-1">
          {UET_OPERATORS.map((op) => (
            <button
              key={op.symbol}
              type="button"
              title={op.tooltip}
              onClick={() => insertSnippet(op.insertText, op.cursorOffset)}
              className="font-mono text-xs sm:text-sm font-semibold min-w-[30px] h-7 px-2 rounded border transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              {op.symbol}
            </button>
          ))}
        </div>

        {/* Multi-line Expression Input */}
        <textarea
          ref={textareaRef}
          rows={3}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSaveExpression?.(e.target.value);
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleRunAndGrade();
            }
          }}
          placeholder="Nhập biểu thức Đại số quan hệ (ví dụ: π_{HONV, TENNV}(σ_{PHG=4}(NHANVIEN)) hoặc gán nhiều dòng T1 ← ...)"
          aria-label="Trình soạn thảo Đại số quan hệ"
          className="w-full rounded-lg p-2.5 font-mono text-xs sm:text-sm border resize-y"
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderColor: 'var(--border-strong)',
            color: 'var(--text-primary)',
          }}
        />

        {/* Live PDF-grade KaTeX Formula Preview */}
        <div
          className="rounded-lg px-3 py-2 border overflow-x-auto"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
            <Sigma className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
            <span>Xem trước công thức chuẩn slide UET (LaTeX trực tiếp):</span>
          </div>
          {liveLatex ? (
            <div className="py-0.5 text-sm">
              <MathFormula tex={liveLatex} />
            </div>
          ) : (
            <div className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
              Gõ biểu thức ở trên để xem ký hiệu toán học hiển thị tức thì...
            </div>
          )}
        </div>

        {/* Run & Reset Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Mẹo: Gõ trực tiếp <code className="px-1 rounded border border-[var(--border-subtle)]">sigma</code>,{' '}
            <code className="px-1 rounded border border-[var(--border-subtle)]">pi</code>,{' '}
            <code className="px-1 rounded border border-[var(--border-subtle)]">rho</code>,{' '}
            <code className="px-1 rounded border border-[var(--border-subtle)]">&lt;-</code>,{' '}
            <code className="px-1 rounded border border-[var(--border-subtle)]">join</code>,{' '}
            <code className="px-1 rounded border border-[var(--border-subtle)]">div</code> hoặc nhấn{' '}
            <kbd className="px-1 rounded border border-[var(--border-subtle)]">Ctrl + Enter</kbd>.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const resetExpr = challenge?.starterExpression ?? initialExpression ?? '';
                setQuery(resetExpr);
                setGradeMessage(null);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa nháp</span>
            </button>

            <button
              type="button"
              onClick={handleRunAndGrade}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: '#FFFFFF',
              }}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{challenge ? 'Thực thi & Chấm kết quả' : 'Thực thi biểu thức'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auto-grader / Syntax Feedback */}
      {(gradeMessage || evalResult?.error) && (
        <div
          className="rounded-xl p-3.5 border text-xs sm:text-sm flex items-start gap-2.5"
          style={{
            backgroundColor:
              gradeMessage?.ok && !evalResult?.error ? 'var(--success-bg)' : 'var(--error-bg)',
            borderColor:
              gradeMessage?.ok && !evalResult?.error
                ? 'var(--success-border)'
                : 'var(--error-border)',
            color:
              gradeMessage?.ok && !evalResult?.error ? 'var(--success-text)' : 'var(--error-text)',
          }}
        >
          {gradeMessage?.ok && !evalResult?.error ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <div>{evalResult?.error ?? gradeMessage?.text}</div>
        </div>
      )}

      {/* 3. Execution Output Tabs: Final Table | AST Step-by-Step | 4-Step Division */}
      {evalResult && !evalResult.error && evalResult.finalResult && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div
            className="px-3 pt-2 border-b flex flex-wrap gap-1.5"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setOutputTab('result')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 cursor-pointer"
              style={{
                borderColor: outputTab === 'result' ? 'var(--accent-primary)' : 'transparent',
                color: outputTab === 'result' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Kết quả cuối ({evalResult.finalResult.rows.length} bộ)</span>
            </button>

            <button
              type="button"
              onClick={() => setOutputTab('ast')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 cursor-pointer"
              style={{
                borderColor: outputTab === 'ast' ? 'var(--accent-primary)' : 'transparent',
                color: outputTab === 'ast' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Cây thực thi từng bước ({allAstNodes.length})</span>
            </button>

            {divisionBreakdown && (
              <button
                type="button"
                onClick={() => setOutputTab('division')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 cursor-pointer"
                style={{
                  borderColor: outputTab === 'division' ? 'var(--accent-primary)' : 'transparent',
                  color: outputTab === 'division' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Giải phẫu Phép chia 4 bước (T1, T2)</span>
              </button>
            )}
          </div>

          <div className="p-3.5">
            {outputTab === 'result' && (
              <RelationTableView relation={evalResult.finalResult} compact />
            )}

            {outputTab === 'ast' && (
              <div className="space-y-3">
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Nhấn vào bất kỳ bước con nào bên dưới để kiểm tra bảng trung gian tại nút đó:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {allAstNodes.map((node, i) => {
                    const active = inspectedNode?.id === node.id;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedAstNodeId(node.id)}
                        className="px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 cursor-pointer"
                        style={{
                          backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                          borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        }}
                      >
                        <span className="font-mono font-bold text-[11px]" style={{ color: 'var(--accent-primary)' }}>
                          #{i + 1}
                        </span>
                        <MathFormula tex={node.latex} />
                        <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          ({node.intermediateResult?.rows.length ?? 0})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {inspectedNode?.intermediateResult && (
                  <div className="space-y-2 pt-1">
                    {inspectedNode.explanation && (
                      <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {inspectedNode.explanation}
                      </div>
                    )}
                    <RelationTableView relation={inspectedNode.intermediateResult} compact />
                  </div>
                )}
              </div>
            )}

            {outputTab === 'division' && divisionBreakdown && (
              <div className="space-y-4">
                <div
                  className="p-3 rounded-lg border text-xs space-y-1"
                  style={{ backgroundColor: 'var(--info-bg)', borderColor: 'var(--info-border)', color: 'var(--info-text)' }}
                >
                  <div className="font-bold">
                    Chứng minh 4 bước phép chia chuẩn C3_2.pdf (tr. 81–84) trên thuộc tính giữ lại{' '}
                    {divisionBreakdown.attributesY.join(', ')}:
                  </div>
                  <MathFormula
                    tex="T_1 \leftarrow \pi_Y(R) \;;\; T_2 \leftarrow \pi_Y((S \times T_1) - R) \;;\; T \leftarrow T_1 - T_2"
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-bold">
                      Bước 1: Ứng viên ban đầu <MathFormula tex="T_1 \leftarrow \pi_Y(R)" />
                    </div>
                    <RelationTableView relation={divisionBreakdown.T1} compact showSchemaFormula={false} />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold">
                      Bước 2: Các cặp bị thiếu <MathFormula tex="(S \times T_1) - R" />
                    </div>
                    <RelationTableView
                      relation={divisionBreakdown.missingPairs}
                      compact
                      showSchemaFormula={false}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold">
                      Bước 3: Phần tử bị loại <MathFormula tex="T_2 \leftarrow \pi_Y((S \times T_1) - R)" />
                    </div>
                    <RelationTableView relation={divisionBreakdown.T2} compact showSchemaFormula={false} />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold">
                      Bước 4: Kết quả cuối <MathFormula tex="T \leftarrow T_1 - T_2" />
                    </div>
                    <RelationTableView
                      relation={divisionBreakdown.finalT}
                      compact
                      showSchemaFormula={false}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
