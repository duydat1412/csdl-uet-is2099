import React from 'react';
import { KeyRound, Link2 } from 'lucide-react';
import { CellValue, RelationInstance, RowHighlightKind } from '../../domain/types';
import { MathFormula } from '../common/MathFormula';

export interface RelationTableViewProps {
  relation: RelationInstance;
  compact?: boolean;
  showSchemaFormula?: boolean;
  onColumnClick?: (colName: string) => void;
  onCellEdit?: (rowIndex: number, colName: string, nextValue: CellValue) => void;
  onRowDelete?: (rowIndex: number) => void;
}

function buildSchemaLatex(relation: RelationInstance): string {
  const { name, attributes, primaryKey } = relation.schema;
  const safeName = name.replace(/_/g, '\\_');
  const colsLatex = attributes.map((attr) => {
    const safeCol = attr.name.replace(/_/g, '\\_');
    if (primaryKey.some((pk) => pk.toLowerCase() === attr.name.toLowerCase())) {
      return `\\underline{\\text{${safeCol}}}`;
    }
    return `\\text{${safeCol}}`;
  });
  return `\\mathbf{${safeName}}(${colsLatex.join(',\\; ')})`;
}

function rowHighlightStyles(kind?: RowHighlightKind): React.CSSProperties {
  switch (kind) {
    case 'matched':
    case 'new':
      return {
        backgroundColor: 'var(--success-bg)',
        boxShadow: 'inset 3px 0 0 var(--success-border)',
      };
    case 'conflict':
      return {
        backgroundColor: 'var(--error-bg)',
        boxShadow: 'inset 3px 0 0 var(--error-border)',
      };
    case 'excluded':
    case 'null-dropped':
      return {
        backgroundColor: 'var(--warning-bg)',
        boxShadow: 'inset 3px 0 0 var(--warning-border)',
      };
    default:
      return {};
  }
}

export const RelationTableView: React.FC<RelationTableViewProps> = ({
  relation,
  compact = false,
  showSchemaFormula = true,
  onColumnClick,
  onCellEdit,
  onRowDelete,
}) => {
  const { schema, rows, rowHighlights } = relation;
  const pkSet = new Set(schema.primaryKey.map((k) => k.toLowerCase()));
  const fkMap = new Map<string, string>();
  for (const fk of schema.foreignKeys ?? []) {
    fk.columns.forEach((col, i) => {
      fkMap.set(col.toLowerCase(), `${fk.refTable}.${fk.refColumns[i] ?? fk.refColumns[0]}`);
    });
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {showSchemaFormula && (
        <div
          className="px-3.5 py-2 border-b flex flex-wrap items-center justify-between gap-2"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="text-xs sm:text-sm overflow-x-auto">
            <MathFormula tex={buildSchemaLatex(relation)} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded"
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {rows.length} bộ
            </span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr
              className="border-b"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {schema.attributes.map((attr) => {
                const isPk = pkSet.has(attr.name.toLowerCase());
                const fkRef = fkMap.get(attr.name.toLowerCase());
                return (
                  <th
                    key={attr.name}
                    scope="col"
                    onClick={onColumnClick ? () => onColumnClick(attr.name) : undefined}
                    title={
                      fkRef
                        ? `Khóa ngoại tham chiếu ${fkRef}`
                        : onColumnClick
                          ? `Nhấn để chèn cột ${attr.name}`
                          : attr.description
                    }
                    className={`${
                      compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'
                    } font-mono font-semibold whitespace-nowrap ${
                      onColumnClick ? 'cursor-pointer hover:opacity-80' : ''
                    }`}
                  >
                    <div className="inline-flex items-center gap-1">
                      <span
                        style={{
                          textDecoration: isPk ? 'underline' : 'none',
                          textUnderlineOffset: '3px',
                          textDecorationThickness: '2px',
                        }}
                      >
                        {attr.name}
                      </span>
                      {isPk && (
                        <KeyRound
                          className="w-3 h-3 shrink-0"
                          style={{ color: 'var(--accent-primary)' }}
                          aria-label="Khóa chính"
                        />
                      )}
                      {fkRef && (
                        <Link2
                          className="w-3 h-3 shrink-0"
                          style={{ color: 'var(--text-muted)' }}
                          aria-label={`Khóa ngoại tới ${fkRef}`}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
              {onRowDelete && (
                <th className="px-2 py-1.5 text-[11px] font-semibold text-right" style={{ color: 'var(--text-muted)' }}>
                  Thao tác
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={schema.attributes.length + (onRowDelete ? 1 : 0)}
                  className="px-4 py-6 text-center text-xs italic"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Quan hệ rỗng (0 bộ dữ liệu)
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => {
                const highlight = rowHighlights?.[rIdx];
                return (
                  <tr
                    key={rIdx}
                    className="border-b last:border-b-0 transition-colors"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      ...rowHighlightStyles(highlight),
                    }}
                  >
                    {schema.attributes.map((attr) => {
                      const val = row[attr.name] ?? null;
                      return (
                        <td
                          key={attr.name}
                          className={`${
                            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs sm:text-[13px]'
                          } whitespace-nowrap`}
                        >
                          {onCellEdit ? (
                            <input
                              type="text"
                              aria-label={`${attr.name} dòng ${rIdx + 1}`}
                              value={val === null ? '' : String(val)}
                              placeholder="null"
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw.trim() === '') {
                                  onCellEdit(rIdx, attr.name, null);
                                } else if (
                                  (attr.domain === 'integer' || attr.domain === 'float') &&
                                  !Number.isNaN(Number(raw))
                                ) {
                                  onCellEdit(rIdx, attr.name, Number(raw));
                                } else {
                                  onCellEdit(rIdx, attr.name, raw);
                                }
                              }}
                              className="w-full min-w-[72px] px-1.5 py-0.5 rounded text-xs font-mono border bg-transparent"
                              style={{ borderColor: 'var(--border-subtle)' }}
                            />
                          ) : val === null ? (
                            <span
                              className="font-mono italic text-[11px] px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: 'var(--bg-subtle)',
                                color: 'var(--text-muted)',
                              }}
                            >
                              null
                            </span>
                          ) : typeof val === 'number' ? (
                            <span className="font-mono">{val}</span>
                          ) : (
                            <span>{val}</span>
                          )}
                        </td>
                      );
                    })}

                    {onRowDelete && (
                      <td className="px-2 py-1.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onRowDelete(rIdx)}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer"
                          style={{
                            backgroundColor: 'var(--error-bg)',
                            color: 'var(--error-text)',
                            border: '1px solid var(--error-border)',
                          }}
                        >
                          Xóa bộ
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
