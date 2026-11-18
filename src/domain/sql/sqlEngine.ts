import {
  AttributeSchema,
  CellValue,
  DatabaseState,
  DomainType,
  ForeignKeyConstraint,
  RelationInstance,
  TupleRow,
} from '../types';

export interface SqlExecutionResult {
  kind: 'select' | 'ddl';
  result?: RelationInstance;
  ddlSummary?: string;
  executionNotes?: string;
  error?: string;
}

interface TableRowScope {
  /** Map lowercase aliasOrTableName -> row values */
  tables: Record<string, TupleRow>;
  /** Ordered alias entries for unqualified lookup & SELECT * expansion */
  orderedAliases: Array<{ alias: string; cols: string[] }>;
}

function stripSqlComments(raw: string): string {
  return raw
    .replace(/--[^\r\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .trim()
    .replace(/;+$/g, '')
    .trim();
}

function splitTopLevelCommas(input: string): string[] {
  const parts: string[] = [];
  let buf = '';
  let depth = 0;
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      if (buf.trim()) parts.push(buf.trim());
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

function findTopLevelKeywords(
  sql: string,
  keywords: string[],
): Array<{ keyword: string; index: number; endIndex: number }> {
  const found: Array<{ keyword: string; index: number; endIndex: number }> = [];
  let depth = 0;
  let quote: '"' | "'" | null = null;
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];
    if (quote) {
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      i += 1;
      continue;
    }
    if (ch === '(') {
      depth += 1;
      i += 1;
      continue;
    }
    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      i += 1;
      continue;
    }

    if (depth === 0) {
      const prev = i === 0 ? ' ' : sql[i - 1];
      if (!/[A-Za-z0-9_.]/.test(prev)) {
        const slice = sql.slice(i);
        let matchedKw = '';
        let matchedLen = 0;
        for (const kw of keywords) {
          const pattern = kw.replace(/\s+/g, '\\s+');
          const re = new RegExp(`^(${pattern})(?![A-Za-z0-9_])`, 'i');
          const m = slice.match(re);
          if (m && m[0].length > matchedLen) {
            matchedKw = kw;
            matchedLen = m[0].length;
          }
        }
        if (matchedKw) {
          found.push({ keyword: matchedKw, index: i, endIndex: i + matchedLen });
          i += matchedLen;
          continue;
        }
      }
    }
    i += 1;
  }

  return found;
}

function resolveScopedColumn(
  scopes: TableRowScope[],
  rawRef: string,
): { value: CellValue; name: string } {
  const ref = rawRef.trim();
  const dotIdx = ref.indexOf('.');

  for (let sIdx = scopes.length - 1; sIdx >= 0; sIdx -= 1) {
    const scope = scopes[sIdx];
    if (dotIdx !== -1) {
      const tblPrefix = ref.slice(0, dotIdx).trim().toLowerCase();
      const colName = ref.slice(dotIdx + 1).trim();
      const tableRow = scope.tables[tblPrefix];
      if (tableRow) {
        const actualKey = Object.keys(tableRow).find(
          (k) => k.toLowerCase() === colName.toLowerCase(),
        );
        if (actualKey) {
          return { value: tableRow[actualKey], name: actualKey };
        }
        throw new Error(`Bảng/bí danh "${tblPrefix}" không có cột "${colName}".`);
      }
    } else {
      const matches: Array<{ alias: string; key: string; val: CellValue }> = [];
      for (const { alias } of scope.orderedAliases) {
        const tbl = scope.tables[alias.toLowerCase()];
        if (!tbl) continue;
        const foundKey = Object.keys(tbl).find(
          (k) => k.toLowerCase() === ref.toLowerCase(),
        );
        if (foundKey) {
          matches.push({ alias, key: foundKey, val: tbl[foundKey] });
        }
      }
      if (matches.length === 1) {
        return { value: matches[0].val, name: matches[0].key };
      }
      if (matches.length > 1) {
        throw new Error(
          `Thuộc tính "${ref}" bị nhập nhằng giữa các bảng (${matches.map((m) => m.alias).join(', ')}). Hãy ghi rõ ${matches[0].alias}.${matches[0].key}.`,
        );
      }
    }
  }

  throw new Error(`Không tìm thấy cột "${ref}" trong phạm vi truy vấn.`);
}

function unwrapOuterParens(expr: string): string {
  const s = expr.trim();
  if (!s.startsWith('(') || !s.endsWith(')')) return s;
  let depth = 0;
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < s.length - 1; i += 1) {
    const ch = s[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (depth === 0) return s;
  }
  return unwrapOuterParens(s.slice(1, -1));
}

function findRelationIgnoreCase(
  db: DatabaseState,
  tableName: string,
): RelationInstance {
  const exact = db.relations[tableName];
  if (exact) return exact;
  const key = Object.keys(db.relations).find(
    (k) => k.toLowerCase() === tableName.toLowerCase(),
  );
  if (!key) {
    throw new Error(
      `Không tìm thấy bảng "${tableName}" trong CSDL (${Object.keys(db.relations).join(', ')}).`,
    );
  }
  return db.relations[key];
}

function evaluateScalar(
  db: DatabaseState,
  scopes: TableRowScope[],
  rawExpr: string,
): CellValue {
  const s = unwrapOuterParens(rawExpr);
  if (/^null$/i.test(s)) return null;
  if (
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith('"') && s.endsWith('"'))
  ) {
    return s.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    return Number(s);
  }

  // Scalar subquery (SELECT ...)
  if (/^select\b/i.test(s)) {
    const sub = executeSelect(db, s, scopes);
    if (sub.rows.length === 0) return null;
    if (sub.rows.length > 1) {
      throw new Error('Truy vấn con vô hướng trả về nhiều hơn 1 dòng.');
    }
    const firstCol = sub.schema.attributes[0]?.name;
    return firstCol ? (sub.rows[0][firstCol] ?? null) : null;
  }

  // Binary arithmetic respecting parens and +/- before *//
  for (const ops of [['+', '-'], ['*', '/']]) {
    let depth = 0;
    let quote: '"' | "'" | null = null;
    for (let i = s.length - 1; i >= 0; i -= 1) {
      const ch = s[i];
      if (quote) {
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (ch === ')') depth += 1;
      if (ch === '(') depth = Math.max(0, depth - 1);
      if (depth === 0 && ops.includes(ch) && i > 0) {
        const leftStr = s.slice(0, i).trim();
        const rightStr = s.slice(i + 1).trim();
        if (!leftStr || !rightStr) continue;
        const lv = evaluateScalar(db, scopes, leftStr);
        const rv = evaluateScalar(db, scopes, rightStr);
        if (lv === null || rv === null) return null;
        if (typeof lv !== 'number' || typeof rv !== 'number') {
          throw new Error(`Phép toán "${ch}" chỉ áp dụng trên kiểu số.`);
        }
        if (ch === '+') return lv + rv;
        if (ch === '-') return lv - rv;
        if (ch === '*') return lv * rv;
        return rv === 0 ? null : lv / rv;
      }
    }
  }

  return resolveScopedColumn(scopes, s).value;
}

function splitTopLevelBoolean(expr: string, keyword: 'OR' | 'AND'): string[] {
  const parts: string[] = [];
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
      const prev = i === 0 ? ' ' : expr[i - 1];
      const slice = expr.slice(i);
      const re = new RegExp(`^\\b${keyword}\\b`, 'i');
      const m = slice.match(re);
      if (m && !/[A-Za-z0-9_.]/.test(prev)) {
        // Guard BETWEEN ... AND ... from being split as boolean AND
        if (keyword === 'AND' && /\bBETWEEN\b(?![^()]*\))/i.test(buf) && !/\bAND\b/i.test(buf.split(/\bBETWEEN\b/i).pop() ?? '')) {
          buf += m[0];
          i += m[0].length;
          continue;
        }
        parts.push(buf.trim());
        buf = '';
        i += m[0].length;
        continue;
      }
    }
    buf += ch;
    i += 1;
  }

  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

function compareCells(lv: CellValue, op: string, rv: CellValue): boolean {
  if (lv === null || rv === null) return false;
  switch (op) {
    case '=':
      return lv === rv;
    case '!=':
    case '<>':
      return lv !== rv;
    case '<':
      return lv < rv;
    case '<=':
      return lv <= rv;
    case '>':
      return lv > rv;
    case '>=':
      return lv >= rv;
    default:
      return false;
  }
}

function sqlLikeToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/%/g, '.*')
    .replace(/_/g, '.');
  return new RegExp(`^${escaped}$`, 'i');
}

function evaluateSqlCondition(
  db: DatabaseState,
  scopes: TableRowScope[],
  rawCond: string,
  groupRows?: TableRowScope[],
): boolean {
  const cond = unwrapOuterParens(rawCond);
  if (!cond) return true;

  const orParts = splitTopLevelBoolean(cond, 'OR');
  if (orParts.length > 1) {
    return orParts.some((p) => evaluateSqlCondition(db, scopes, p, groupRows));
  }

  const andParts = splitTopLevelBoolean(cond, 'AND');
  if (andParts.length > 1) {
    return andParts.every((p) => evaluateSqlCondition(db, scopes, p, groupRows));
  }

  // NOT (...)
  const notMatch = cond.match(/^NOT\s+([\s\S]+)$/i);
  if (notMatch) {
    return !evaluateSqlCondition(db, scopes, notMatch[1], groupRows);
  }

  // EXISTS (SELECT ...)
  const existsMatch = cond.match(/^EXISTS\s*\(([\s\S]+)\)$/i);
  if (existsMatch) {
    const sub = executeSelect(db, existsMatch[1], scopes);
    return sub.rows.length > 0;
  }

  // IS [NOT] NULL
  const nullMatch = cond.match(/^(.+?)\s+IS\s+(NOT\s+)?NULL$/i);
  if (nullMatch) {
    const val = groupRows
      ? evaluateGroupExpr(db, groupRows, nullMatch[1]).value
      : evaluateScalar(db, scopes, nullMatch[1]);
    return nullMatch[2] ? val !== null : val === null;
  }

  // [NOT] IN (...)
  const inMatch = cond.match(/^(.+?)\s+(NOT\s+)?IN\s*\(([\s\S]+)\)$/i);
  if (inMatch) {
    const leftVal = groupRows
      ? evaluateGroupExpr(db, groupRows, inMatch[1]).value
      : evaluateScalar(db, scopes, inMatch[1]);
    if (leftVal === null) return false;
    const inside = inMatch[3].trim();
    let listVals: CellValue[] = [];
    if (/^select\b/i.test(inside)) {
      const sub = executeSelect(db, inside, scopes);
      const col = sub.schema.attributes[0]?.name;
      listVals = col ? sub.rows.map((r) => r[col] ?? null) : [];
    } else {
      listVals = splitTopLevelCommas(inside).map((item) =>
        evaluateScalar(db, scopes, item),
      );
    }
    const contained = listVals.some((v) => v !== null && v === leftVal);
    return inMatch[2] ? !contained : contained;
  }

  // [NOT] LIKE
  const likeMatch = cond.match(/^(.+?)\s+(NOT\s+)?LIKE\s+(.+)$/i);
  if (likeMatch) {
    const lv = evaluateScalar(db, scopes, likeMatch[1]);
    const rv = evaluateScalar(db, scopes, likeMatch[3]);
    if (lv === null || rv === null) return false;
    const matched = sqlLikeToRegex(String(rv)).test(String(lv));
    return likeMatch[2] ? !matched : matched;
  }

  // [NOT] BETWEEN a AND b
  const btwMatch = cond.match(/^(.+?)\s+(NOT\s+)?BETWEEN\s+(.+?)\s+AND\s+(.+)$/i);
  if (btwMatch) {
    const val = evaluateScalar(db, scopes, btwMatch[1]);
    const low = evaluateScalar(db, scopes, btwMatch[3]);
    const high = evaluateScalar(db, scopes, btwMatch[4]);
    if (val === null || low === null || high === null) return false;
    const inside = val >= low && val <= high;
    return btwMatch[2] ? !inside : inside;
  }

  // Comparison with ALL / ANY (SELECT ...)
  const quantMatch = cond.match(/^(.+?)\s*(=|!=|<>|<=|>=|<|>)\s*(ALL|ANY|SOME)\s*\(([\s\S]+)\)$/i);
  if (quantMatch) {
    const lv = groupRows
      ? evaluateGroupExpr(db, groupRows, quantMatch[1]).value
      : evaluateScalar(db, scopes, quantMatch[1]);
    if (lv === null) return false;
    const op = quantMatch[2];
    const quant = quantMatch[3].toUpperCase();
    const sub = executeSelect(db, quantMatch[4], scopes);
    const firstCol = sub.schema.attributes[0]?.name;
    const rhsVals = firstCol ? sub.rows.map((r) => r[firstCol] ?? null) : [];
    if (quant === 'ALL') {
      return rhsVals.every((rv) => compareCells(lv, op, rv));
    }
    return rhsVals.some((rv) => compareCells(lv, op, rv));
  }

  // Standard binary comparison (outside parens)
  let depth = 0;
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < cond.length; i += 1) {
    const ch = cond[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (depth === 0) {
      const m = cond.slice(i).match(/^(!=|<>|<=|>=|=|<|>)/);
      if (m) {
        const leftStr = cond.slice(0, i).trim();
        const op = m[1];
        const rightStr = cond.slice(i + op.length).trim();
        const lv = groupRows
          ? evaluateGroupExpr(db, groupRows, leftStr).value
          : evaluateScalar(db, scopes, leftStr);
        const rv = groupRows
          ? evaluateGroupExpr(db, groupRows, rightStr).value
          : evaluateScalar(db, scopes, rightStr);
        return compareCells(lv, op, rv);
      }
    }
  }

  throw new Error(`Điều kiện SQL không hợp lệ tại: "${cond}".`);
}

function evaluateGroupExpr(
  db: DatabaseState,
  groupRows: TableRowScope[],
  rawExpr: string,
): { value: CellValue; defaultName: string } {
  const s = rawExpr.trim();
  const aggMatch = s.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\(([\s\S]+)\)$/i);
  if (!aggMatch) {
    const rep = groupRows[0];
    const val = evaluateScalar(db, [rep], s);
    const defaultName = s.includes('.') ? s.split('.').pop()! : s;
    return { value: val, defaultName };
  }

  const fn = aggMatch[1].toUpperCase();
  const innerRaw = aggMatch[2].trim();
  const isDistinct = /^DISTINCT\s+/i.test(innerRaw);
  const argExpr = isDistinct ? innerRaw.replace(/^DISTINCT\s+/i, '').trim() : innerRaw;

  if (fn === 'COUNT') {
    if (argExpr === '*') {
      return { value: groupRows.length, defaultName: 'COUNT(*)' };
    }
    const vals = groupRows
      .map((scope) => evaluateScalar(db, [scope], argExpr))
      .filter((v) => v !== null);
    if (isDistinct) {
      return {
        value: new Set(vals.map((v) => String(v))).size,
        defaultName: `COUNT(DISTINCT ${argExpr})`,
      };
    }
    return { value: vals.length, defaultName: `COUNT(${argExpr})` };
  }

  const vals = groupRows
    .map((scope) => evaluateScalar(db, [scope], argExpr))
    .filter((v): v is CellValue & {} => v !== null);

  if (vals.length === 0) {
    return { value: null, defaultName: `${fn}(${argExpr})` };
  }

  if (fn === 'MIN' || fn === 'MAX') {
    let best = vals[0];
    for (const v of vals) {
      if (fn === 'MIN' && v < best) best = v;
      if (fn === 'MAX' && v > best) best = v;
    }
    return { value: best, defaultName: `${fn}(${argExpr})` };
  }

  const nums = vals.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return { value: null, defaultName: `${fn}(${argExpr})` };
  const sum = nums.reduce((a, b) => a + b, 0);
  if (fn === 'SUM') {
    return { value: Math.round(sum * 1000) / 1000, defaultName: `SUM(${argExpr})` };
  }
  return {
    value: Math.round((sum / nums.length) * 1000) / 1000,
    defaultName: `AVG(${argExpr})`,
  };
}

function buildFromRows(
  db: DatabaseState,
  fromClause: string,
): { rows: TableRowScope[]; orderedAliases: Array<{ alias: string; cols: string[] }> } {
  // Split comma cross joins if no explicit JOIN keyword at top level
  const joinTokens = findTopLevelKeywords(fromClause, [
    'LEFT OUTER JOIN',
    'RIGHT OUTER JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'INNER JOIN',
    'CROSS JOIN',
    'JOIN',
  ]);

  const parseTableSpec = (spec: string): { rel: RelationInstance; alias: string } => {
    const clean = spec.trim();
    const parts = clean.split(/\s+/);
    const tblName = parts[0];
    const alias =
      parts.length >= 3 && parts[1].toUpperCase() === 'AS'
        ? parts[2]
        : parts.length >= 2
          ? parts[1]
          : tblName;
    const rel = findRelationIgnoreCase(db, tblName);
    return { rel, alias };
  };

  if (joinTokens.length === 0) {
    const commaParts = splitTopLevelCommas(fromClause);
    const specs = commaParts.map(parseTableSpec);
    const orderedAliases = specs.map((s) => ({
      alias: s.alias,
      cols: s.rel.schema.attributes.map((a) => a.name),
    }));

    let acc: TableRowScope[] = [{ tables: {}, orderedAliases }];
    for (const spec of specs) {
      const next: TableRowScope[] = [];
      for (const leftScope of acc) {
        for (const r of spec.rel.rows) {
          next.push({
            tables: {
              ...leftScope.tables,
              [spec.alias.toLowerCase()]: { ...r },
            },
            orderedAliases,
          });
        }
      }
      acc = next;
    }
    return { rows: acc, orderedAliases };
  }

  const firstSpec = parseTableSpec(fromClause.slice(0, joinTokens[0].index));
  let orderedAliases: Array<{ alias: string; cols: string[] }> = [
    {
      alias: firstSpec.alias,
      cols: firstSpec.rel.schema.attributes.map((a) => a.name),
    },
  ];
  let currentRows: TableRowScope[] = firstSpec.rel.rows.map((r) => ({
    tables: { [firstSpec.alias.toLowerCase()]: { ...r } },
    orderedAliases,
  }));

  for (let i = 0; i < joinTokens.length; i += 1) {
    const jt = joinTokens[i];
    const nextStart = jt.endIndex;
    const nextEnd = i + 1 < joinTokens.length ? joinTokens[i + 1].index : fromClause.length;
    const segment = fromClause.slice(nextStart, nextEnd).trim();

    const onSplit = findTopLevelKeywords(segment, ['ON']);
    const tablePart = onSplit.length > 0 ? segment.slice(0, onSplit[0].index) : segment;
    const onCond = onSplit.length > 0 ? segment.slice(onSplit[0].endIndex).trim() : '';

    const rightSpec = parseTableSpec(tablePart);
    const rightCols = rightSpec.rel.schema.attributes.map((a) => a.name);
    const nextOrdered = [
      ...orderedAliases,
      { alias: rightSpec.alias, cols: rightCols },
    ];

    const kwUpper = jt.keyword.toUpperCase();
    const isLeft = kwUpper.startsWith('LEFT');
    const isRight = kwUpper.startsWith('RIGHT');

    const nullRightRow: TupleRow = {};
    rightCols.forEach((c) => {
      nullRightRow[c] = null;
    });

    const joined: TableRowScope[] = [];

    if (isRight) {
      for (const rRow of rightSpec.rel.rows) {
        let matched = false;
        for (const lScope of currentRows) {
          const merged: TableRowScope = {
            tables: { ...lScope.tables, [rightSpec.alias.toLowerCase()]: { ...rRow } },
            orderedAliases: nextOrdered,
          };
          if (!onCond || evaluateSqlCondition(db, [merged], onCond)) {
            matched = true;
            joined.push(merged);
          }
        }
        if (!matched) {
          const nullTables: Record<string, TupleRow> = {};
          for (const oa of orderedAliases) {
            const nr: TupleRow = {};
            oa.cols.forEach((c) => {
              nr[c] = null;
            });
            nullTables[oa.alias.toLowerCase()] = nr;
          }
          joined.push({
            tables: { ...nullTables, [rightSpec.alias.toLowerCase()]: { ...rRow } },
            orderedAliases: nextOrdered,
          });
        }
      }
    } else {
      for (const lScope of currentRows) {
        let matched = false;
        for (const rRow of rightSpec.rel.rows) {
          const merged: TableRowScope = {
            tables: { ...lScope.tables, [rightSpec.alias.toLowerCase()]: { ...rRow } },
            orderedAliases: nextOrdered,
          };
          if (!onCond || evaluateSqlCondition(db, [merged], onCond)) {
            matched = true;
            joined.push(merged);
          }
        }
        if (isLeft && !matched) {
          joined.push({
            tables: { ...lScope.tables, [rightSpec.alias.toLowerCase()]: { ...nullRightRow } },
            orderedAliases: nextOrdered,
          });
        }
      }
    }

    orderedAliases = nextOrdered;
    currentRows = joined;
  }

  return { rows: currentRows, orderedAliases };
}

function executeSelect(
  db: DatabaseState,
  rawSql: string,
  outerScopes: TableRowScope[] = [],
): RelationInstance {
  const sql = stripSqlComments(rawSql);
  const topKws = findTopLevelKeywords(sql, [
    'SELECT',
    'FROM',
    'WHERE',
    'GROUP BY',
    'HAVING',
    'ORDER BY',
    'LIMIT',
  ]);

  const selectKw = topKws.find((k) => k.keyword.toUpperCase() === 'SELECT');
  const fromKw = topKws.find((k) => k.keyword.toUpperCase() === 'FROM');
  if (!selectKw || !fromKw) {
    throw new Error('Câu lệnh SQL phải chứa mệnh đề SELECT ... FROM ...');
  }

  const sliceAfter = (kwName: string): string => {
    const idx = topKws.findIndex((k) => k.keyword.toUpperCase() === kwName);
    if (idx === -1) return '';
    const start = topKws[idx].endIndex;
    const end = idx + 1 < topKws.length ? topKws[idx + 1].index : sql.length;
    return sql.slice(start, end).trim();
  };

  let selectClause = sliceAfter('SELECT');
  const fromClause = sliceAfter('FROM');
  const whereClause = sliceAfter('WHERE');
  const groupClause = sliceAfter('GROUP BY');
  const havingClause = sliceAfter('HAVING');
  const orderClause = sliceAfter('ORDER BY');
  const limitClause = sliceAfter('LIMIT');

  const isDistinct = /^DISTINCT\b/i.test(selectClause);
  if (isDistinct) {
    selectClause = selectClause.replace(/^DISTINCT\b/i, '').trim();
  }

  // 1. FROM + JOIN
  const { rows: fromRows, orderedAliases } = buildFromRows(db, fromClause);

  // 2. WHERE
  const filteredRows = whereClause
    ? fromRows.filter((r) => evaluateSqlCondition(db, [...outerScopes, r], whereClause))
    : fromRows;

  // 3. Parse SELECT items
  const selectRawItems = splitTopLevelCommas(selectClause);
  const hasAggregate = selectRawItems.some((item) =>
    /\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(item),
  );

  let outAttributes: AttributeSchema[] = [];
  let resultRows: TupleRow[] = [];

  if (groupClause || hasAggregate) {
    const groupCols = groupClause ? splitTopLevelCommas(groupClause) : [];
    const groups = new Map<string, TableRowScope[]>();

    for (const row of filteredRows) {
      const key =
        groupCols.length > 0
          ? JSON.stringify(groupCols.map((gc) => evaluateScalar(db, [row], gc)))
          : '__ALL__';
      const bucket = groups.get(key) ?? [];
      bucket.push(row);
      groups.set(key, bucket);
    }

    if (groups.size === 0 && !groupClause && hasAggregate) {
      groups.set('__ALL__', []);
    }

    const parsedSelect = selectRawItems.map((raw) => {
      const aliasMatch = raw.match(/^([\s\S]+?)\s+AS\s+([A-Za-z_][A-Za-z0-9_]*)$/i);
      return {
        expr: aliasMatch ? aliasMatch[1].trim() : raw.trim(),
        alias: aliasMatch ? aliasMatch[2].trim() : undefined,
      };
    });

    const keptGroups: TableRowScope[][] = [];
    for (const gRows of groups.values()) {
      if (havingClause && !evaluateSqlCondition(db, outerScopes, havingClause, gRows)) {
        continue;
      }
      keptGroups.push(gRows);
    }

    keptGroups.forEach((gRows, gIdx) => {
      const outRow: TupleRow = {};
      parsedSelect.forEach((item) => {
        const evalRes = evaluateGroupExpr(db, gRows, item.expr);
        const colName = item.alias ?? evalRes.defaultName;
        if (gIdx === 0) {
          outAttributes.push({
            name: colName,
            domain: typeof evalRes.value === 'number' ? 'float' : 'string',
          });
        }
        outRow[colName] = evalRes.value;
      });
      resultRows.push(outRow);
    });

    if (outAttributes.length === 0) {
      outAttributes = parsedSelect.map((p) => ({
        name: p.alias ?? (p.expr.includes('.') ? p.expr.split('.').pop()! : p.expr),
        domain: 'string',
      }));
    }
  } else {
    // Non-grouped row-by-row SELECT
    interface ExpandedSelect {
      expr: string;
      name: string;
    }
    const expanded: ExpandedSelect[] = [];

    for (const raw of selectRawItems) {
      if (raw.trim() === '*') {
        for (const oa of orderedAliases) {
          for (const c of oa.cols) {
            expanded.push({ expr: `${oa.alias}.${c}`, name: c });
          }
        }
        continue;
      }
      const tblStarMatch = raw.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\.\*$/);
      if (tblStarMatch) {
        const target = orderedAliases.find(
          (oa) => oa.alias.toLowerCase() === tblStarMatch[1].toLowerCase(),
        );
        if (!target) {
          throw new Error(`Không tìm thấy bảng/bí danh "${tblStarMatch[1]}".`);
        }
        for (const c of target.cols) {
          expanded.push({ expr: `${target.alias}.${c}`, name: c });
        }
        continue;
      }

      const aliasMatch = raw.match(/^([\s\S]+?)\s+AS\s+([A-Za-z_][A-Za-z0-9_]*)$/i);
      const expr = aliasMatch ? aliasMatch[1].trim() : raw.trim();
      const defaultColName = expr.includes('.') ? expr.split('.').pop()! : expr;
      expanded.push({ expr, name: aliasMatch ? aliasMatch[2].trim() : defaultColName });
    }

    // Disambiguate duplicate output column names cleanly if any
    const usedNames = new Map<string, number>();
    const finalItems = expanded.map((item) => {
      const cnt = usedNames.get(item.name.toLowerCase()) ?? 0;
      usedNames.set(item.name.toLowerCase(), cnt + 1);
      return {
        ...item,
        name: cnt > 0 ? `${item.name}_${cnt + 1}` : item.name,
      };
    });

    outAttributes = finalItems.map((fi) => ({ name: fi.name, domain: 'string' }));

    resultRows = filteredRows.map((row) => {
      const outRow: TupleRow = {};
      for (const item of finalItems) {
        outRow[item.name] = evaluateScalar(db, [...outerScopes, row], item.expr);
      }
      return outRow;
    });
  }

  // Infer numeric domain if rows have numbers
  outAttributes = outAttributes.map((attr) => {
    const sample = resultRows.find((r) => r[attr.name] !== null)?.[attr.name];
    const domain: DomainType = typeof sample === 'number' ? 'float' : 'string';
    return { ...attr, domain };
  });

  // 4. DISTINCT
  if (isDistinct) {
    const seen = new Set<string>();
    const deduped: TupleRow[] = [];
    const cols = outAttributes.map((a) => a.name);
    for (const r of resultRows) {
      const key = JSON.stringify(cols.map((c) => r[c] ?? null));
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(r);
      }
    }
    resultRows = deduped;
  }

  // 5. ORDER BY
  if (orderClause) {
    const sortSpecs = splitTopLevelCommas(orderClause).map((item) => {
      const m = item.trim().match(/^(.+?)\s+(ASC|DESC)$/i);
      return {
        col: (m ? m[1] : item).trim(),
        desc: m ? m[2].toUpperCase() === 'DESC' : false,
      };
    });
    resultRows = [...resultRows].sort((a, b) => {
      for (const spec of sortSpecs) {
        const key = Object.keys(a).find(
          (k) => k.toLowerCase() === (spec.col.split('.').pop() ?? spec.col).toLowerCase(),
        );
        const av = key ? a[key] : null;
        const bv = key ? b[key] : null;
        if (av === bv) continue;
        if (av === null) return spec.desc ? 1 : -1;
        if (bv === null) return spec.desc ? -1 : 1;
        const cmp = av < bv ? -1 : 1;
        return spec.desc ? -cmp : cmp;
      }
      return 0;
    });
  }

  // 6. LIMIT
  if (limitClause) {
    const n = Number(limitClause.trim());
    if (!Number.isNaN(n) && n >= 0) {
      resultRows = resultRows.slice(0, n);
    }
  }

  return {
    schema: {
      name: 'SQL_RESULT',
      attributes: outAttributes,
      primaryKey: [],
    },
    rows: resultRows,
  };
}

function parseCreateTableDdl(rawSql: string): SqlExecutionResult {
  const clean = stripSqlComments(rawSql);
  const match = clean.match(/^CREATE\s+TABLE\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]+)\)$/i);
  if (!match) {
    return {
      kind: 'ddl',
      error: 'Cú pháp CREATE TABLE chưa hợp lệ. Cần dạng: CREATE TABLE TenBang (cot1 KIEU, ..., PRIMARY KEY (...)).',
    };
  }

  const tableName = match[1];
  const entries = splitTopLevelCommas(match[2]);
  const attributes: AttributeSchema[] = [];
  const primaryKey: string[] = [];
  const foreignKeys: ForeignKeyConstraint[] = [];

  for (const entry of entries) {
    const pkMatch = entry.match(/^(?:CONSTRAINT\s+\w+\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i);
    if (pkMatch) {
      pkMatch[1]
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((c) => {
          if (!primaryKey.includes(c)) primaryKey.push(c);
        });
      continue;
    }

    const fkMatch = entry.match(
      /^(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]+)\)/i,
    );
    if (fkMatch) {
      foreignKeys.push({
        columns: fkMatch[1].split(',').map((s) => s.trim()),
        refTable: fkMatch[2].trim(),
        refColumns: fkMatch[3].split(',').map((s) => s.trim()),
      });
      continue;
    }

    if (/^(?:CONSTRAINT|CHECK|UNIQUE)\b/i.test(entry)) {
      continue;
    }

    const colMatch = entry.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z0-9_().,\s]+)/);
    if (colMatch) {
      const colName = colMatch[1].trim();
      const rest = colMatch[2].toUpperCase();
      const domain: DomainType = /\b(INT|INTEGER|SMALLINT)\b/.test(rest)
        ? 'integer'
        : /\b(FLOAT|REAL|NUMERIC|DECIMAL|DOUBLE)\b/.test(rest)
          ? 'float'
          : /\bDATE\b/.test(rest)
            ? 'date'
            : 'string';
      const nullable = !/\bNOT\s+NULL\b/.test(rest);
      attributes.push({ name: colName, domain, nullable });
      if (/\bPRIMARY\s+KEY\b/.test(rest) && !primaryKey.includes(colName)) {
        primaryKey.push(colName);
      }
    }
  }

  return {
    kind: 'ddl',
    ddlSummary: `Đã phân tích hợp lệ lược đồ DDL bảng ${tableName}: ${attributes.length} cột, PK(${primaryKey.join(', ') || 'chưa đặt'}), ${foreignKeys.length} khóa ngoại.`,
    result: {
      schema: {
        name: tableName,
        attributes,
        primaryKey,
        foreignKeys,
      },
      rows: [],
    },
  };
}

export function evaluateSqlQuery(db: DatabaseState, rawSql: string): SqlExecutionResult {
  const clean = stripSqlComments(rawSql);
  if (!clean) {
    return { kind: 'select', error: 'Hãy nhập câu lệnh SQL trước khi thực thi.' };
  }

  try {
    if (/^CREATE\s+TABLE\b/i.test(clean)) {
      return parseCreateTableDdl(clean);
    }
    const result = executeSelect(db, clean);
    return {
      kind: 'select',
      result,
    };
  } catch (err) {
    return {
      kind: 'select',
      error: err instanceof Error ? err.message : 'Lỗi cú pháp hoặc thực thi SQL.',
    };
  }
}

export function compareSqlResults(
  actual: RelationInstance,
  expected: RelationInstance,
  options: { checkOrder?: boolean } = {},
): { isEqual: boolean; reason?: string } {
  const aCols = actual.schema.attributes.map((a) => a.name);
  const eCols = expected.schema.attributes.map((a) => a.name);

  if (aCols.length !== eCols.length) {
    return {
      isEqual: false,
      reason: `Số cột kết quả chưa khớp: Bạn trả về ${aCols.length} cột (${aCols.join(', ')}), đáp án cần ${eCols.length} cột (${eCols.join(', ')}).`,
    };
  }

  if (actual.rows.length !== expected.rows.length) {
    return {
      isEqual: false,
      reason: `Số dòng chưa khớp: Bạn thu được ${actual.rows.length} dòng, đáp án cần ${expected.rows.length} dòng (kiểm tra lại DISTINCT hoặc điều kiện WHERE/JOIN).`,
    };
  }

  const normalizeVal = (v: CellValue): string => {
    if (v === null) return 'NULL';
    if (typeof v === 'number') return String(Math.round(v * 1000) / 1000);
    return String(v);
  };

  const toRows = (rel: RelationInstance): string[] => {
    const cols = rel.schema.attributes.map((a) => a.name);
    const list = rel.rows.map((r) =>
      JSON.stringify(cols.map((c) => normalizeVal(r[c] ?? null))),
    );
    return options.checkOrder ? list : list.sort();
  };

  const aRows = toRows(actual);
  const eRows = toRows(expected);
  if (JSON.stringify(aRows) !== JSON.stringify(eRows)) {
    return {
      isEqual: false,
      reason: 'Dữ liệu các dòng trả về chưa khớp hoàn toàn với đáp án chuẩn.',
    };
  }

  return { isEqual: true };
}
