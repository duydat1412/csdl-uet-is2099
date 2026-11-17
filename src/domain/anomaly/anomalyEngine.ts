import { cloneDatabase } from '../datasets/uetDatasets';
import { CellValue, DatabaseState, RelationInstance, RowHighlightKind, TupleRow } from '../types';

export type FlatAction =
  | { kind: 'update-single-row'; rowIndex: number; column: string; newValue: CellValue }
  | { kind: 'delete-row'; rowIndex: number }
  | { kind: 'insert-partial'; values: TupleRow };

export interface DependencyRule {
  determinant: string;
  dependents: string[];
}

export type AnomalyKind = 'NONE' | 'UPDATE_ANOMALY' | 'DELETION_ANOMALY' | 'INSERTION_ANOMALY';

export interface FlatSimulationResult {
  updatedRelation: RelationInstance;
  anomalyType: AnomalyKind;
  message: string;
  affectedRows: number[];
  affectedColumns: string[];
}

export type OnDeletePolicy = 'REJECT' | 'CASCADE' | 'SET_NULL';

export type UpdateStatus =
  | 'ok'
  | 'DOMAIN_VIOLATION'
  | 'ENTITY_INTEGRITY_VIOLATION'
  | 'KEY_VIOLATION'
  | 'REFERENTIAL_VIOLATION'
  | 'SYNTAX_ERROR';

export interface RelationalUpdateResult {
  status: UpdateStatus;
  nextDb: DatabaseState;
  message: string;
  affectedTable: string;
  affectedRowCount: number;
}

function cloneRelation(rel: RelationInstance): RelationInstance {
  return {
    schema: {
      ...rel.schema,
      attributes: rel.schema.attributes.map((a) => ({ ...a })),
      primaryKey: [...rel.schema.primaryKey],
      foreignKeys: rel.schema.foreignKeys?.map((fk) => ({
        columns: [...fk.columns],
        refTable: fk.refTable,
        refColumns: [...fk.refColumns],
      })),
    },
    rows: rel.rows.map((r) => ({ ...r })),
    rowHighlights: rel.rowHighlights ? { ...rel.rowHighlights } : undefined,
  };
}

export function simulateFlatTableAction(
  relation: RelationInstance,
  action: FlatAction,
  rule: DependencyRule,
): FlatSimulationResult {
  const next = cloneRelation(relation);
  const highlights: Record<number, RowHighlightKind> = {};

  if (action.kind === 'update-single-row') {
    const targetRow = next.rows[action.rowIndex];
    if (!targetRow) {
      return {
        updatedRelation: next,
        anomalyType: 'NONE',
        message: 'Không tìm thấy dòng cần cập nhật.',
        affectedRows: [],
        affectedColumns: [],
      };
    }

    targetRow[action.column] = action.newValue;
    const detVal = targetRow[rule.determinant];

    // Check if rows sharing the same determinant now disagree on any dependent column
    const conflictIndices: number[] = [];
    const seenValues = new Set<string>();
    next.rows.forEach((row, idx) => {
      if (row[rule.determinant] === detVal) {
        conflictIndices.push(idx);
        seenValues.add(String(row[action.column]));
      }
    });

    if (conflictIndices.length > 1 && seenValues.size > 1) {
      conflictIndices.forEach((i) => {
        highlights[i] = 'conflict';
      });
      next.rowHighlights = highlights;
      return {
        updatedRelation: next,
        anomalyType: 'UPDATE_ANOMALY',
        message: `Dị thường sửa đổi (Update Anomaly): Có ${conflictIndices.length} dòng cùng mang ${rule.determinant} = "${detVal}" nhưng cột ${action.column} lại chứa các giá trị mâu thuẫn (${Array.from(seenValues).join(' vs ')}). Vì gộp bảng nên sửa thiếu 1 dòng sẽ làm dữ liệu bất nhất.`,
        affectedRows: conflictIndices,
        affectedColumns: [rule.determinant, action.column],
      };
    }

    highlights[action.rowIndex] = 'matched';
    next.rowHighlights = highlights;
    return {
      updatedRelation: next,
      anomalyType: 'NONE',
      message: 'Đã cập nhật giá trị thành công (chưa phát sinh mâu thuẫn).',
      affectedRows: [action.rowIndex],
      affectedColumns: [action.column],
    };
  }

  if (action.kind === 'delete-row') {
    const deleted = next.rows[action.rowIndex];
    if (!deleted) {
      return {
        updatedRelation: next,
        anomalyType: 'NONE',
        message: 'Không tìm thấy dòng cần xóa.',
        affectedRows: [],
        affectedColumns: [],
      };
    }

    const lostDetValue = deleted[rule.determinant];
    next.rows.splice(action.rowIndex, 1);

    const stillExists = next.rows.some((r) => r[rule.determinant] === lostDetValue);
    if (!stillExists) {
      const lostDetails = rule.dependents.map((d) => `${d}="${deleted[d]}"`).join(', ');
      return {
        updatedRelation: next,
        anomalyType: 'DELETION_ANOMALY',
        message: `Dị thường xóa (Deletion Anomaly): Khi xóa bản ghi cuối cùng gắn với ${rule.determinant} = "${lostDetValue}", thông tin về (${lostDetails}) cũng bị xóa sạch khỏi CSDL dù thực thể đó đáng lẽ vẫn tồn tại!`,
        affectedRows: [],
        affectedColumns: [rule.determinant, ...rule.dependents],
      };
    }

    return {
      updatedRelation: next,
      anomalyType: 'NONE',
      message: `Đã xóa dòng. Thông tin về ${rule.determinant} = "${lostDetValue}" vẫn còn ở các dòng khác.`,
      affectedRows: [],
      affectedColumns: [],
    };
  }

  // insert-partial
  const missingPk = relation.schema.primaryKey.filter((pk) => {
    const val = action.values[pk];
    return val === null || val === undefined || val === '';
  });

  if (missingPk.length > 0) {
    return {
      updatedRelation: next,
      anomalyType: 'INSERTION_ANOMALY',
      message: `Dị thường chèn (Insertion Anomaly): Không thể lưu thông tin mới cho (${rule.determinant} = "${action.values[rule.determinant]}") vì khóa chính (${missingPk.join(', ')}) không được phép rỗng (null)!`,
      affectedRows: [],
      affectedColumns: missingPk,
    };
  }

  next.rows.push(action.values);
  highlights[next.rows.length - 1] = 'new';
  next.rowHighlights = highlights;
  return {
    updatedRelation: next,
    anomalyType: 'NONE',
    message: 'Đã thêm dòng mới thành công.',
    affectedRows: [next.rows.length - 1],
    affectedColumns: [],
  };
}

/* ============================================================================
 * Relational Update Command Engine: INSERT, DELETE, MODIFY (C3_2.pdf pp. 6–13)
 * ========================================================================== */

function normalizeQuotesAndOps(raw: string): string {
  return raw
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u2212/g, '-')
    .trim();
}

function splitTopLevelArgs(input: string, delimiter: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuote: '"' | "'" | null = null;
  let depth = 0;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (inQuote) {
      current += ch;
      if (ch === inQuote) inQuote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      current += ch;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === delimiter && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim() !== '') {
    parts.push(current.trim());
  }
  return parts;
}

function parseLiteral(raw: string): CellValue {
  const s = raw.trim();
  if (/^null$/i.test(s) || s === 'ϕ' || s === '∅') return null;
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    return Number(s);
  }
  return s;
}

function evaluateRowCondition(row: TupleRow, condStr: string): boolean {
  const trimmed = condStr.trim();
  if (/^all$/i.test(trimmed)) return true;

  // Handle OR (∨ / or)
  const orParts = splitByLogicalOp(trimmed, ['or', '∨']);
  if (orParts.length > 1) {
    return orParts.some((p) => evaluateRowCondition(row, p));
  }

  // Handle AND (∧ / ^ / and)
  const andParts = splitByLogicalOp(trimmed, ['and', '∧', '^']);
  if (andParts.length > 1) {
    return andParts.every((p) => evaluateRowCondition(row, p));
  }

  const unparen =
    trimmed.startsWith('(') && trimmed.endsWith(')')
      ? trimmed.slice(1, -1).trim()
      : trimmed;

  const cmpMatch = unparen.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(=|!=|<>|≠|<=|≤|>=|≥|<|>)\s*(.+)$/);
  if (!cmpMatch) {
    throw new Error(`Không hiểu điều kiện lọc: "${condStr}"`);
  }

  const [, col, op, rhsRaw] = cmpMatch;
  const leftVal = resolveColumnCaseInsensitive(row, col);
  const rightVal = parseLiteral(rhsRaw);

  if (leftVal === null || rightVal === null) {
    if (op === '!=' || op === '<>' || op === '≠') return leftVal !== rightVal;
    if (op === '=') return leftVal === rightVal;
    return false;
  }

  switch (op) {
    case '=':
      return leftVal === rightVal;
    case '!=':
    case '<>':
    case '≠':
      return leftVal !== rightVal;
    case '<':
      return Number(leftVal) < Number(rightVal);
    case '<=':
    case '≤':
      return Number(leftVal) <= Number(rightVal);
    case '>':
      return Number(leftVal) > Number(rightVal);
    case '>=':
    case '≥':
      return Number(leftVal) >= Number(rightVal);
    default:
      return false;
  }
}

function splitByLogicalOp(expr: string, ops: string[]): string[] {
  const results: string[] = [];
  let buf = '';
  let depth = 0;
  let quote: '"' | "'" | null = null;
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
      i += 1;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') depth = Math.max(0, depth - 1);

    if (depth === 0) {
      let matchedOp: string | null = null;
      for (const op of ops) {
        if (/^[a-z]+$/i.test(op)) {
          const slice = expr.slice(i);
          const re = new RegExp(`^\\b${op}\\b`, 'i');
          const m = slice.match(re);
          const prevChar = i > 0 ? expr[i - 1] : ' ';
          if (m && !/[A-Za-z0-9_]/.test(prevChar)) {
            matchedOp = m[0];
            break;
          }
        } else if (expr.startsWith(op, i)) {
          matchedOp = op;
          break;
        }
      }
      if (matchedOp) {
        results.push(buf.trim());
        buf = '';
        i += matchedOp.length;
        continue;
      }
    }

    buf += ch;
    i += 1;
  }
  if (buf.trim()) results.push(buf.trim());
  return results;
}

function resolveColumnCaseInsensitive(row: TupleRow, colName: string): CellValue {
  if (colName in row) return row[colName];
  const key = Object.keys(row).find((k) => k.toLowerCase() === colName.toLowerCase());
  if (!key) throw new Error(`Thuộc tính "${colName}" không tồn tại trong quan hệ.`);
  return row[key];
}

function resolveAttrName(rel: RelationInstance, colName: string): string {
  const exact = rel.schema.attributes.find((a) => a.name.toLowerCase() === colName.toLowerCase());
  if (!exact) throw new Error(`Thuộc tính "${colName}" không tồn tại trong bảng ${rel.schema.name}.`);
  return exact.name;
}

function validateRowAgainstSchema(
  db: DatabaseState,
  rel: RelationInstance,
  row: TupleRow,
  skipRowIndex?: number,
): { status: UpdateStatus; message: string } | null {
  // 1. Entity Integrity (PK not null)
  for (const pkCol of rel.schema.primaryKey) {
    if (row[pkCol] === null || row[pkCol] === undefined) {
      return {
        status: 'ENTITY_INTEGRITY_VIOLATION',
        message: `Vi phạm Ràng buộc toàn vẹn thực thể: Thuộc tính khóa chính "${pkCol}" của bảng ${rel.schema.name} không được nhận giá trị null!`,
      };
    }
  }

  // 2. Domain constraints
  for (const attr of rel.schema.attributes) {
    const val = row[attr.name];
    if (val === null) {
      if (attr.nullable === false) {
        return {
          status: 'DOMAIN_VIOLATION',
          message: `Vi phạm Ràng buộc miền: Thuộc tính "${attr.name}" không được phép null.`,
        };
      }
      continue;
    }
    if (attr.domain === 'integer' || attr.domain === 'float') {
      if (typeof val !== 'number' || (attr.domain === 'integer' && !Number.isInteger(val))) {
        return {
          status: 'DOMAIN_VIOLATION',
          message: `Vi phạm Ràng buộc miền: Giá trị "${val}" không đúng kiểu ${attr.domain} của cột "${attr.name}".`,
        };
      }
      if (attr.min !== undefined && val < attr.min) {
        return {
          status: 'DOMAIN_VIOLATION',
          message: `Vi phạm Ràng buộc miền: Giá trị ${attr.name} = ${val} nhỏ hơn cận dưới ${attr.min}.`,
        };
      }
      if (attr.max !== undefined && val > attr.max) {
        return {
          status: 'DOMAIN_VIOLATION',
          message: `Vi phạm Ràng buộc miền: Giá trị ${attr.name} = ${val} vượt quá miền [${attr.min ?? '-∞'} .. ${attr.max}].`,
        };
      }
    } else if (attr.domain === 'string' && typeof val !== 'string') {
      return {
        status: 'DOMAIN_VIOLATION',
        message: `Vi phạm Ràng buộc miền: Cột "${attr.name}" yêu cầu kiểu chuỗi (string), nhận được "${val}".`,
      };
    }
  }

  // 3. Key uniqueness
  const pkKey = JSON.stringify(rel.schema.primaryKey.map((c) => row[c]));
  const hasDuplicate = rel.rows.some(
    (existing, idx) =>
      idx !== skipRowIndex &&
      JSON.stringify(rel.schema.primaryKey.map((c) => existing[c])) === pkKey,
  );
  if (hasDuplicate) {
    return {
      status: 'KEY_VIOLATION',
      message: `Vi phạm Ràng buộc khóa: Giá trị khóa chính (${rel.schema.primaryKey.join(', ')}) = ${pkKey} đã tồn tại trong bảng ${rel.schema.name}!`,
    };
  }

  // 4. Outgoing Foreign Keys
  for (const fk of rel.schema.foreignKeys ?? []) {
    const fkVals = fk.columns.map((c) => row[c]);
    if (fkVals.every((v) => v === null)) continue;
    const refTable = db.relations[fk.refTable];
    if (!refTable) continue;
    const fkKey = JSON.stringify(fkVals);
    const existsInParent = refTable.rows.some(
      (parentRow) => JSON.stringify(fk.refColumns.map((rc) => parentRow[rc])) === fkKey,
    );
    if (!existsInParent) {
      return {
        status: 'REFERENTIAL_VIOLATION',
        message: `Vi phạm Ràng buộc tham chiếu (FK): Giá trị (${fk.columns.join(', ')}) = ${fkKey} không tồn tại trong bảng tham chiếu ${fk.refTable}(${fk.refColumns.join(', ')}).`,
      };
    }
  }

  return null;
}

function evaluateValueExpression(row: TupleRow, exprStr: string): CellValue {
  const trimmed = exprStr.trim();
  const arithMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/);
  if (arithMatch) {
    const [, col, op, numStr] = arithMatch;
    const baseVal = resolveColumnCaseInsensitive(row, col);
    if (typeof baseVal !== 'number') {
      throw new Error(`Không thể thực hiện phép toán số học trên cột "${col}".`);
    }
    const operand = Number(numStr);
    switch (op) {
      case '+':
        return Math.round((baseVal + operand) * 100) / 100;
      case '-':
        return Math.round((baseVal - operand) * 100) / 100;
      case '*':
        return Math.round(baseVal * operand * 100) / 100;
      case '/':
        return operand === 0 ? null : Math.round((baseVal / operand) * 100) / 100;
    }
  }
  return parseLiteral(trimmed);
}

export function executeRelationalUpdate(
  db: DatabaseState,
  rawCommand: string,
  onDeletePolicy: OnDeletePolicy = 'REJECT',
): RelationalUpdateResult {
  const cmd = normalizeQuotesAndOps(rawCommand);
  const nextDb = cloneDatabase(db);

  const match = cmd.match(/^(INSERT|DELETE|MODIFY)\s*\(([\s\S]*)\)\s*;?$/i);
  if (!match) {
    return {
      status: 'SYNTAX_ERROR',
      nextDb,
      message: 'Cú pháp hợp lệ theo slide UET: INSERT(R; v1, v2...), DELETE(R; điều_kiện), hoặc MODIFY(R; điều_kiện; cột=giá_trị).',
      affectedTable: '',
      affectedRowCount: 0,
    };
  }

  const verb = match[1].toUpperCase();
  const args = splitTopLevelArgs(match[2], ';');
  if (args.length < 2) {
    return {
      status: 'SYNTAX_ERROR',
      nextDb,
      message: `Lệnh ${verb} thiếu tham số ngăn cách bởi dấu chấm phẩy (;).`,
      affectedTable: '',
      affectedRowCount: 0,
    };
  }

  const tableNameRaw = args[0].trim();
  const tableKey = Object.keys(nextDb.relations).find(
    (k) => k.toLowerCase() === tableNameRaw.toLowerCase(),
  );
  if (!tableKey) {
    return {
      status: 'SYNTAX_ERROR',
      nextDb,
      message: `Không tìm thấy quan hệ "${tableNameRaw}" trong CSDL hiện tại.`,
      affectedTable: tableNameRaw,
      affectedRowCount: 0,
    };
  }

  const rel = nextDb.relations[tableKey];

  try {
    if (verb === 'INSERT') {
      const valueArgs = splitTopLevelArgs(args[1], ',');
      if (valueArgs.length !== rel.schema.attributes.length) {
        return {
          status: 'SYNTAX_ERROR',
          nextDb,
          message: `Bảng ${tableKey} có ${rel.schema.attributes.length} thuộc tính (${rel.schema.attributes.map((a) => a.name).join(', ')}), nhưng bạn truyền ${valueArgs.length} giá trị.`,
          affectedTable: tableKey,
          affectedRowCount: 0,
        };
      }

      const newRow: TupleRow = {};
      rel.schema.attributes.forEach((attr, idx) => {
        newRow[attr.name] = parseLiteral(valueArgs[idx]);
      });

      const violation = validateRowAgainstSchema(nextDb, rel, newRow);
      if (violation) {
        return {
          status: violation.status,
          nextDb: cloneDatabase(db),
          message: violation.message,
          affectedTable: tableKey,
          affectedRowCount: 0,
        };
      }

      rel.rows.push(newRow);
      rel.rowHighlights = { [rel.rows.length - 1]: 'new' };
      return {
        status: 'ok',
        nextDb,
        message: `INSERT thành công 1 bộ mới vào ${tableKey}. Mọi ràng buộc miền, khóa và tham chiếu đều thỏa mãn.`,
        affectedTable: tableKey,
        affectedRowCount: 1,
      };
    }

    if (verb === 'DELETE') {
      const condStr = args[1];
      const matchedIndices: number[] = [];
      rel.rows.forEach((row, idx) => {
        if (evaluateRowCondition(row, condStr)) matchedIndices.push(idx);
      });

      if (matchedIndices.length === 0) {
        return {
          status: 'ok',
          nextDb,
          message: `Không có bộ nào trong ${tableKey} thỏa điều kiện "${condStr}".`,
          affectedTable: tableKey,
          affectedRowCount: 0,
        };
      }

      // Check incoming FK references from all tables in db
      const deletedRows = matchedIndices.map((idx) => rel.rows[idx]);
      for (const [childName, childRel] of Object.entries(nextDb.relations)) {
        for (const fk of childRel.schema.foreignKeys ?? []) {
          if (fk.refTable !== tableKey) continue;
          const referencingChildIndices: number[] = [];
          childRel.rows.forEach((cRow, cIdx) => {
            const cFkKey = JSON.stringify(fk.columns.map((c) => cRow[c]));
            const hitsDeleted = deletedRows.some(
              (dRow) => JSON.stringify(fk.refColumns.map((rc) => dRow[rc])) === cFkKey,
            );
            if (hitsDeleted) referencingChildIndices.push(cIdx);
          });

          if (referencingChildIndices.length > 0) {
            if (onDeletePolicy === 'REJECT') {
              return {
                status: 'REFERENTIAL_VIOLATION',
                nextDb: cloneDatabase(db),
                message: `Vi phạm Ràng buộc tham chiếu: Không thể xóa bộ trong ${tableKey} vì đang có ${referencingChildIndices.length} bộ ở bảng ${childName} tham chiếu tới! (Chính sách: Loại bỏ phép xóa).`,
                affectedTable: tableKey,
                affectedRowCount: 0,
              };
            }
            if (onDeletePolicy === 'CASCADE') {
              childRel.rows = childRel.rows.filter(
                (_, idx) => !referencingChildIndices.includes(idx),
              );
            } else if (onDeletePolicy === 'SET_NULL') {
              const violatesPk = fk.columns.some((c) => childRel.schema.primaryKey.includes(c));
              if (violatesPk) {
                return {
                  status: 'ENTITY_INTEGRITY_VIOLATION',
                  nextDb: cloneDatabase(db),
                  message: `Không thể đặt null cho khóa ngoại (${fk.columns.join(', ')}) ở bảng ${childName} vì cột này đồng thời thuộc Khóa chính!`,
                  affectedTable: childName,
                  affectedRowCount: 0,
                };
              }
              referencingChildIndices.forEach((idx) => {
                fk.columns.forEach((c) => {
                  childRel.rows[idx][c] = null;
                });
              });
            }
          }
        }
      }

      rel.rows = rel.rows.filter((_, idx) => !matchedIndices.includes(idx));
      return {
        status: 'ok',
        nextDb,
        message: `DELETE thành công ${matchedIndices.length} bộ khỏi ${tableKey} (Chính sách tham chiếu: ${onDeletePolicy}).`,
        affectedTable: tableKey,
        affectedRowCount: matchedIndices.length,
      };
    }

    // MODIFY(R; f; col1=val1, ...)
    if (args.length < 3) {
      return {
        status: 'SYNTAX_ERROR',
        nextDb: cloneDatabase(db),
        message: 'Lệnh MODIFY cần đủ 3 phần: MODIFY(QuanHệ; ĐiềuKiện; ThuộcTính=GiáTrịMới).',
        affectedTable: tableKey,
        affectedRowCount: 0,
      };
    }

    const condStr = args[1];
    const assignStrs = splitTopLevelArgs(args[2], ',');
    const assignments = assignStrs.map((item) => {
      const eqIdx = item.indexOf('=');
      if (eqIdx === -1) throw new Error(`Phép gán không hợp lệ: "${item}"`);
      const colRaw = item.slice(0, eqIdx).trim();
      const exprRaw = item.slice(eqIdx + 1).trim();
      return { col: resolveAttrName(rel, colRaw), exprRaw };
    });

    const updatedIndices: number[] = [];
    const highlights: Record<number, RowHighlightKind> = {};

    for (let idx = 0; idx < rel.rows.length; idx += 1) {
      const row = rel.rows[idx];
      if (!evaluateRowCondition(row, condStr)) continue;

      const candidateRow: TupleRow = { ...row };
      for (const a of assignments) {
        candidateRow[a.col] = evaluateValueExpression(row, a.exprRaw);
      }

      const violation = validateRowAgainstSchema(nextDb, rel, candidateRow, idx);
      if (violation) {
        return {
          status: violation.status,
          nextDb: cloneDatabase(db),
          message: violation.message,
          affectedTable: tableKey,
          affectedRowCount: 0,
        };
      }

      rel.rows[idx] = candidateRow;
      updatedIndices.push(idx);
      highlights[idx] = 'matched';
    }

    rel.rowHighlights = highlights;
    return {
      status: 'ok',
      nextDb,
      message: `MODIFY thành công ${updatedIndices.length} bộ trong ${tableKey}.`,
      affectedTable: tableKey,
      affectedRowCount: updatedIndices.length,
    };
  } catch (err) {
    return {
      status: 'SYNTAX_ERROR',
      nextDb: cloneDatabase(db),
      message: err instanceof Error ? err.message : 'Lỗi cú pháp lệnh cập nhật.',
      affectedTable: tableKey,
      affectedRowCount: 0,
    };
  }
}
