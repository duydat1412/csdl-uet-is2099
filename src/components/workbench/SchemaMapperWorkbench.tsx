import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Link2,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { UET_ER_DIAGRAMS } from '../../domain/datasets/uetERDiagrams';
import {
  convertCardinalityConventions,
  evaluateSchemaMapping,
  formatMinMax,
  MinMaxPair,
  SchemaMappingResult,
  validateCardinalityAnswer,
} from '../../domain/er/erMappingEngine';
import {
  CardinalityToggleChallenge,
  EERConstraintChallenge,
  SchemaMapperChallenge,
  TargetTableSpec,
} from '../../domain/types';
import { MathFormula } from '../common/MathFormula';
import { RichText } from '../common/RichText';
import { ERDiagramCanvas } from './ERDiagramCanvas';

export interface SchemaMapperWorkbenchProps {
  diagramId?: string;
  title: string;
  caption?: string;
  challenge?:
    | CardinalityToggleChallenge
    | EERConstraintChallenge
    | SchemaMapperChallenge;
  onSolved?: () => void;
}

const MIN_MAX_OPTIONS: MinMaxPair[] = [
  [0, 1],
  [1, 1],
  [0, 'n'],
  [1, 'n'],
];

function formatTableSchemaLatex(table: TargetTableSpec): string {
  const safeName = table.name.replace(/_/g, '\\_');
  if (table.columns.length === 0) {
    return `\\mathbf{${safeName}}(\\dots)`;
  }
  const cols = table.columns.map((c) => {
    const safeCol = c.replace(/_/g, '\\_');
    return table.primaryKey.includes(c)
      ? `\\underline{\\text{${safeCol}}}`
      : `\\text{${safeCol}}`;
  });
  return `\\mathbf{${safeName}}(${cols.join(',\\; ')})`;
}

export const SchemaMapperWorkbench: React.FC<SchemaMapperWorkbenchProps> = ({
  diagramId = 'NV_PB_BASIC',
  title,
  caption,
  challenge,
  onSolved,
}) => {
  const activeDiagramId = challenge?.diagramId ?? diagramId;
  const diagram = UET_ER_DIAGRAMS[activeDiagramId] ?? UET_ER_DIAGRAMS.NV_PB_BASIC;

  // Cardinality challenge state
  const [leftPair, setLeftPair] = useState<MinMaxPair>([0, 1]);
  const [rightPair, setRightPair] = useState<MinMaxPair>([0, 'n']);
  const [cardFeedback, setCardFeedback] = useState<{
    isCorrect: boolean;
    isSwappedError: boolean;
    feedback: string;
  } | null>(null);

  // EER specialization challenge state
  const [disjointness, setDisjointness] = useState<'d' | 'o'>('d');
  const [completeness, setCompleteness] = useState<'total' | 'partial'>('partial');
  const [eerChecked, setEerChecked] = useState(false);

  // Schema Mapper challenge state
  const [userTables, setUserTables] = useState<TargetTableSpec[]>([]);
  const [newTableName, setNewTableName] = useState('');
  const [fkDraftByTable, setFkDraftByTable] = useState<
    Record<number, { col: string; refTable: string; refCol: string }>
  >({});
  const [mappingResult, setMappingResult] = useState<SchemaMappingResult | null>(null);

  useEffect(() => {
    setCardFeedback(null);
    setEerChecked(false);
    setMappingResult(null);

    if (challenge?.type === 'schema-mapper') {
      // Seed empty shells named after expected tables or first entity so user focuses on columns, PK, and FK
      setUserTables(
        challenge.expectedTables.map((t) => ({
          name: t.name,
          columns: [],
          primaryKey: [],
          foreignKeys: [],
        })),
      );
    } else {
      setUserTables([]);
    }
  }, [challenge, activeDiagramId]);

  /* ==========================================================================
   * SUB-MODE A: CARDINALITY TOGGLE CHALLENGE (C2_1.pdf pp. 25, 28)
   * ======================================================================== */
  if (challenge?.type === 'cardinality-toggle') {
    const converted = convertCardinalityConventions(leftPair, rightPair);

    const handleCheckCardinality = () => {
      const res = validateCardinalityAnswer(
        leftPair,
        rightPair,
        challenge.expectedLeftMinMax,
        challenge.expectedRightMinMax,
        challenge.leftEntityName,
        challenge.rightEntityName,
      );
      setCardFeedback(res);
      if (res.isCorrect) {
        onSolved?.();
      }
    };

    return (
      <div className="space-y-4">
        <ERDiagramCanvas diagram={diagram} />

        <div
          className="rounded-xl p-4 border space-y-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div>
            <h3 className="text-sm font-bold mb-1">
              Thiết lập ràng buộc (min, max) cho liên kết {challenge.relationshipName}
            </h3>
            <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              <RichText content={challenge.scenarioText} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Left Entity Selector */}
            <div
              className="p-3 rounded-xl border space-y-2"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="font-mono text-xs font-bold">
                Đầu thực thể: {challenge.leftEntityName}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MIN_MAX_OPTIONS.map((pair) => {
                  const active = leftPair[0] === pair[0] && leftPair[1] === pair[1];
                  return (
                    <button
                      key={`L-${pair[0]}-${pair[1]}`}
                      type="button"
                      onClick={() => setLeftPair(pair)}
                      className="font-mono text-xs font-bold px-2.5 py-1 rounded-md border cursor-pointer"
                      style={{
                        backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                        color: active ? '#FFFFFF' : 'var(--text-primary)',
                        borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      }}
                    >
                      {formatMinMax(pair)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Entity Selector */}
            <div
              className="p-3 rounded-xl border space-y-2"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="font-mono text-xs font-bold">
                Đầu thực thể: {challenge.rightEntityName}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MIN_MAX_OPTIONS.map((pair) => {
                  const active = rightPair[0] === pair[0] && rightPair[1] === pair[1];
                  return (
                    <button
                      key={`R-${pair[0]}-${pair[1]}`}
                      type="button"
                      onClick={() => setRightPair(pair)}
                      className="font-mono text-xs font-bold px-2.5 py-1 rounded-md border cursor-pointer"
                      style={{
                        backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                        color: active ? '#FFFFFF' : 'var(--text-primary)',
                        borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      }}
                    >
                      {formatMinMax(pair)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Translation Preview */}
          <div
            className="p-3 rounded-lg border font-mono text-xs flex flex-wrap items-center justify-between gap-2"
            style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
          >
            <span>
              UET (min, max):{' '}
              <strong>
                {challenge.leftEntityName} {formatMinMax(leftPair)} — {challenge.relationshipName} —{' '}
                {formatMinMax(rightPair)} {challenge.rightEntityName}
              </strong>
            </span>
            <span style={{ color: 'var(--accent-primary)' }}>
              ⇔ Tỉ số lực lượng: {challenge.leftEntityName} ({converted.leftRatioLabel}) : (
              {converted.rightRatioLabel}) {challenge.rightEntityName}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCheckCardinality}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
          >
            Kiểm tra ràng buộc (min, max)
          </button>

          {cardFeedback && (
            <div
              className="p-3 rounded-lg border text-xs sm:text-sm flex items-start gap-2"
              style={{
                backgroundColor: cardFeedback.isCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
                borderColor: cardFeedback.isCorrect
                  ? 'var(--success-border)'
                  : 'var(--error-border)',
                color: cardFeedback.isCorrect ? 'var(--success-text)' : 'var(--error-text)',
              }}
            >
              {cardFeedback.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <div>{cardFeedback.feedback}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ==========================================================================
   * SUB-MODE B: EER SPECIALIZATION VALIDATOR (C2_2.pdf)
   * ======================================================================== */
  if (challenge?.type === 'eer-validator') {
    const isCorrect =
      disjointness === challenge.expectedDisjointness &&
      completeness === challenge.expectedCompleteness;

    return (
      <div className="space-y-4">
        <ERDiagramCanvas
          diagram={diagram}
          overrideSpecialization={{ disjointness, completeness }}
        />

        <div
          className="rounded-xl p-4 border space-y-4"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            <RichText content={challenge.sampleCaseDescription} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className="p-3 rounded-xl border space-y-2"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="text-xs font-bold">1. Ràng buộc tách rời hay chồng lấn?</div>
              <div className="flex gap-2">
                {([
                  { id: 'd', label: '(d) Rời rạc (Disjoint)' },
                  { id: 'o', label: '(o) Chồng lấn (Overlap)' },
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDisjointness(opt.id)}
                    className="flex-1 px-2.5 py-1.5 rounded-md text-xs font-semibold border cursor-pointer"
                    style={{
                      backgroundColor:
                        disjointness === opt.id ? 'var(--accent-primary)' : 'var(--bg-surface)',
                      color: disjointness === opt.id ? '#FFFFFF' : 'var(--text-primary)',
                      borderColor:
                        disjointness === opt.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="p-3 rounded-xl border space-y-2"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="text-xs font-bold">2. Ràng buộc đầy đủ (nét nối từ lớp cha)?</div>
              <div className="flex gap-2">
                {([
                  { id: 'total', label: 'Toàn bộ (Nét đôi)' },
                  { id: 'partial', label: 'Bộ phận (Nét đơn)' },
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCompleteness(opt.id)}
                    className="flex-1 px-2.5 py-1.5 rounded-md text-xs font-semibold border cursor-pointer"
                    style={{
                      backgroundColor:
                        completeness === opt.id ? 'var(--accent-primary)' : 'var(--bg-surface)',
                      color: completeness === opt.id ? '#FFFFFF' : 'var(--text-primary)',
                      borderColor:
                        completeness === opt.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEerChecked(true);
              if (isCorrect) onSolved?.();
            }}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
          >
            Kiểm tra ràng buộc EER
          </button>

          {eerChecked && (
            <div
              className="p-3 rounded-lg border text-xs sm:text-sm"
              style={{
                backgroundColor: isCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
                borderColor: isCorrect ? 'var(--success-border)' : 'var(--error-border)',
                color: isCorrect ? 'var(--success-text)' : 'var(--error-text)',
              }}
            >
              {isCorrect ? (
                <RichText content={`**Chính xác!** ${challenge.explanation}`} />
              ) : (
                'Chưa khớp với quy tắc nghiệp vụ. Hãy kiểm tra xem 1 cá thể lớp cha có thể đồng thời thuộc 2 lớp con không (d hay o) và có cá thể lớp cha nào không thuộc lớp con nào không (nét đôi hay nét đơn).'
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ==========================================================================
   * SUB-MODE C: ER -> RELATIONAL SCHEMA MAPPER (C3_1.pdf pp. 26–40)
   * ======================================================================== */
  if (challenge?.type === 'schema-mapper') {
    const toggleColumn = (tIdx: number, col: string) => {
      setUserTables((prev) =>
        prev.map((t, i) => {
          if (i !== tIdx) return t;
          const exists = t.columns.includes(col);
          const nextCols = exists ? t.columns.filter((c) => c !== col) : [...t.columns, col];
          const nextPk = t.primaryKey.filter((k) => nextCols.includes(k));
          const nextFks = t.foreignKeys.filter((fk) => nextCols.includes(fk.columns[0]));
          return { ...t, columns: nextCols, primaryKey: nextPk, foreignKeys: nextFks };
        }),
      );
    };

    const togglePk = (tIdx: number, col: string) => {
      setUserTables((prev) =>
        prev.map((t, i) => {
          if (i !== tIdx) return t;
          const isPk = t.primaryKey.includes(col);
          return {
            ...t,
            primaryKey: isPk ? t.primaryKey.filter((k) => k !== col) : [...t.primaryKey, col],
          };
        }),
      );
    };

    const addForeignKey = (tIdx: number) => {
      const draft = fkDraftByTable[tIdx];
      if (!draft || !draft.col || !draft.refTable || !draft.refCol) return;
      setUserTables((prev) =>
        prev.map((t, i) =>
          i === tIdx
            ? {
                ...t,
                foreignKeys: [
                  ...t.foreignKeys,
                  { columns: [draft.col], refTable: draft.refTable, refColumns: [draft.refCol] },
                ],
              }
            : t,
        ),
      );
    };

    const removeForeignKey = (tIdx: number, fkIdx: number) => {
      setUserTables((prev) =>
        prev.map((t, i) =>
          i === tIdx ? { ...t, foreignKeys: t.foreignKeys.filter((_, j) => j !== fkIdx) } : t,
        ),
      );
    };

    const handleGradeMapping = () => {
      const res = evaluateSchemaMapping(userTables, challenge.expectedTables);
      setMappingResult(res);
      if (res.isCorrect) {
        onSolved?.();
      }
    };

    return (
      <div className="space-y-4">
        <ERDiagramCanvas diagram={diagram} />

        <div
          className="rounded-xl p-4 border space-y-4"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold">Bàn thiết kế Lược đồ Quan hệ từ sơ đồ ER</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Chọn các thuộc tính cho từng bảng, đánh dấu Khóa chính (gạch chân) và khai báo Khóa ngoại FK.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUserTables(
                  challenge.expectedTables.map((t) => ({
                    name: t.name,
                    columns: [],
                    primaryKey: [],
                    foreignKeys: [],
                  })),
                );
                setMappingResult(null);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Làm lại</span>
            </button>
          </div>

          <div className="space-y-3">
            {userTables.map((table, tIdx) => {
              const draft = fkDraftByTable[tIdx] ?? {
                col: table.columns[0] ?? '',
                refTable: userTables.find((_, idx) => idx !== tIdx)?.name ?? table.name,
                refCol: challenge.candidateColumns[0] ?? '',
              };

              return (
                <div
                  key={`${table.name}-${tIdx}`}
                  className="rounded-xl p-3.5 border space-y-3"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs sm:text-sm overflow-x-auto">
                      <MathFormula tex={formatTableSchemaLatex(table)} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setUserTables((prev) => prev.filter((_, i) => i !== tIdx))}
                      aria-label={`Xóa bảng ${table.name}`}
                      className="p-1 rounded cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Step 1: Toggle Columns */}
                  <div>
                    <div className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      1. Chọn thuộc tính thuộc bảng {table.name}:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {challenge.candidateColumns.map((col) => {
                        const selected = table.columns.includes(col);
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => toggleColumn(tIdx, col)}
                            className="font-mono text-xs px-2 py-1 rounded border transition-colors cursor-pointer"
                            style={{
                              backgroundColor: selected ? 'var(--accent-soft)' : 'var(--bg-surface)',
                              color: selected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                              borderColor: selected ? 'var(--accent-border)' : 'var(--border-subtle)',
                              fontWeight: selected ? 700 : 500,
                            }}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Toggle Primary Key */}
                  {table.columns.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                        2. Đánh dấu Khóa chính (PK — gạch chân liền):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {table.columns.map((col) => {
                          const isPk = table.primaryKey.includes(col);
                          return (
                            <button
                              key={`pk-${col}`}
                              type="button"
                              onClick={() => togglePk(tIdx, col)}
                              className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded border cursor-pointer"
                              style={{
                                backgroundColor: isPk ? 'var(--accent-primary)' : 'var(--bg-surface)',
                                color: isPk ? '#FFFFFF' : 'var(--text-primary)',
                                borderColor: isPk ? 'var(--accent-primary)' : 'var(--border-subtle)',
                              }}
                            >
                              <KeyRound className="w-3 h-3" />
                              <span style={{ textDecoration: isPk ? 'underline' : 'none' }}>{col}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Foreign Keys */}
                  {table.columns.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        3. Khai báo Khóa ngoại (FK) nếu có:
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <select
                          aria-label={`Cột FK bảng ${table.name}`}
                          value={draft.col}
                          onChange={(e) =>
                            setFkDraftByTable((prev) => ({
                              ...prev,
                              [tIdx]: { ...draft, col: e.target.value },
                            }))
                          }
                          className="font-mono px-2 py-1 rounded border"
                          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                        >
                          <option value="">-- Cột FK --</option>
                          {table.columns.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <span>→</span>
                        <select
                          aria-label={`Bảng đích tham chiếu từ ${table.name}`}
                          value={draft.refTable}
                          onChange={(e) =>
                            setFkDraftByTable((prev) => ({
                              ...prev,
                              [tIdx]: { ...draft, refTable: e.target.value },
                            }))
                          }
                          className="font-mono px-2 py-1 rounded border"
                          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                        >
                          <option value="">-- Bảng đích --</option>
                          {userTables.map((ut) => (
                            <option key={ut.name} value={ut.name}>
                              {ut.name}
                            </option>
                          ))}
                        </select>
                        <select
                          aria-label={`Cột PK bảng đích từ ${table.name}`}
                          value={draft.refCol}
                          onChange={(e) =>
                            setFkDraftByTable((prev) => ({
                              ...prev,
                              [tIdx]: { ...draft, refCol: e.target.value },
                            }))
                          }
                          className="font-mono px-2 py-1 rounded border"
                          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                        >
                          <option value="">-- Cột PK đích --</option>
                          {challenge.candidateColumns.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => addForeignKey(tIdx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded font-semibold cursor-pointer"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-strong)',
                          }}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Thêm FK</span>
                        </button>
                      </div>

                      {table.foreignKeys.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {table.foreignKeys.map((fk, fkIdx) => (
                            <span
                              key={fkIdx}
                              className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded border"
                              style={{
                                backgroundColor: 'var(--bg-surface)',
                                borderColor: 'var(--border-strong)',
                              }}
                            >
                              <Link2 className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
                              <span>
                                {fk.columns.join(',')} → {fk.refTable}({fk.refColumns.join(',')})
                              </span>
                              <button
                                type="button"
                                onClick={() => removeForeignKey(tIdx, fkIdx)}
                                className="opacity-70 hover:opacity-100 cursor-pointer"
                                aria-label="Xóa khóa ngoại"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Custom Table Row */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Thêm bảng mới (nếu tách N:M hoặc đa trị)..."
              className="flex-1 px-3 py-1.5 rounded-lg font-mono text-xs border"
              style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
            />
            <button
              type="button"
              onClick={() => {
                if (!newTableName.trim()) return;
                setUserTables((prev) => [
                  ...prev,
                  { name: newTableName.trim().toUpperCase(), columns: [], primaryKey: [], foreignKeys: [] },
                ]);
                setNewTableName('');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer"
              style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-strong)' }}
            >
              + Thêm bảng
            </button>
          </div>

          <button
            type="button"
            onClick={handleGradeMapping}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
          >
            Chấm điểm Lược đồ Quan hệ
          </button>

          {mappingResult && (
            <div
              className="p-3.5 rounded-xl border text-xs sm:text-sm space-y-1.5"
              style={{
                backgroundColor: mappingResult.isCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
                borderColor: mappingResult.isCorrect
                  ? 'var(--success-border)'
                  : 'var(--error-border)',
                color: mappingResult.isCorrect ? 'var(--success-text)' : 'var(--error-text)',
              }}
            >
              <div className="font-bold">
                {mappingResult.isCorrect
                  ? 'Hoàn hảo (100%)! Lược đồ quan hệ khớp chuẩn quy tắc ánh xạ UET.'
                  : `Đạt ${mappingResult.scorePercent}% — Cần chỉnh lại các chi tiết sau:`}
              </div>
              {mappingResult.diagnostics.length > 0 && (
                <ul className="list-disc pl-5 space-y-1">
                  {mappingResult.diagnostics.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* Default: Exploratory ER/EER Diagram Viewer */
  return (
    <div className="space-y-3">
      {caption && (
        <div
          className="rounded-xl p-3.5 border text-xs sm:text-sm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <div className="font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
            {title}
          </div>
          <RichText content={caption} />
        </div>
      )}
      <ERDiagramCanvas diagram={diagram} />
    </div>
  );
};
