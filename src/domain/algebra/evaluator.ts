import {
  AggregateSpec,
  AlgebraProgramResult,
  ASTNode,
  DivisionBreakdown,
  ProgramStepResult,
  ProjectionItem,
} from './ast';
import { formatAstToLatex } from './latexFormatter';
import { parseAlgebraProgram } from './parser';
import {
  AttributeSchema,
  CellValue,
  DatabaseState,
  RelationInstance,
  RowHighlightKind,
  TupleRow,
} from '../types';

function canonicalTupleKey(row: TupleRow, cols: string[]): string {
  return JSON.stringify(cols.map((c) => row[c] ?? null));
}

function deduplicateRelation(rel: RelationInstance): RelationInstance {
  const cols = rel.schema.attributes.map((a) => a.name);
  const seen = new Set<string>();
  const rows: TupleRow[] = [];

  for (const row of rel.rows) {
    const key = canonicalTupleKey(row, cols);
    if (!seen.has(key)) {
      seen.add(key);
      rows.push({ ...row });
    }
  }
  return {
    schema: rel.schema,
    rows,
  };
}

function resolveAttrReference(
  attrNames: string[],
  ref: string,
): { matchedName: string } {
  const exact = attrNames.find((a) => a === ref);
  if (exact) return { matchedName: exact };

  const ciExact = attrNames.find((a) => a.toLowerCase() === ref.toLowerCase());
  if (ciExact) return { matchedName: ciExact };

  // Check if ref is unqualified and matches suffix ".ref" uniquely
  const suffixMatches = attrNames.filter((a) => {
    const dot = a.lastIndexOf('.');
    if (dot === -1) return false;
    return a.slice(dot + 1).toLowerCase() === ref.toLowerCase();
  });

  if (suffixMatches.length === 1) {
    return { matchedName: suffixMatches[0] };
  }
  if (suffixMatches.length > 1) {
    throw new Error(
      `Thuộc tính "${ref}" bị nhập nhằng giữa (${suffixMatches.join(', ')}). Hãy viết rõ tên bảng phía trước (ví dụ ${suffixMatches[0]}).`,
    );
  }

  throw new Error(`Không tìm thấy thuộc tính "${ref}" trong quan hệ (${attrNames.join(', ')}).`);
}

function evaluateScalarExpr(row: TupleRow, attrNames: string[], exprRaw: string): CellValue {
  const trimmed = exprRaw.trim();
  if (/^null$/i.test(trimmed)) return null;
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  // Binary arithmetic: a * b, a + b, a - b, a / b
  const arith = trimmed.match(/^(.+?)\s*([+\-*/])\s*(.+)$/);
  if (arith) {
    const lv = evaluateScalarExpr(row, attrNames, arith[1]);
    const rv = evaluateScalarExpr(row, attrNames, arith[3]);
    if (lv === null || rv === null) return null;
    if (typeof lv !== 'number' || typeof rv !== 'number') {
      throw new Error(`Phép toán "${arith[2]}" chỉ áp dụng cho giá trị số.`);
    }
    switch (arith[2]) {
      case '+':
        return lv + rv;
      case '-':
        return lv - rv;
      case '*':
        return lv * rv;
      case '/':
        return rv === 0 ? null : lv / rv;
    }
  }

  const { matchedName } = resolveAttrReference(attrNames, trimmed);
  return row[matchedName] ?? null;
}

function evaluatePredicate(row: TupleRow, attrNames: string[], rawCond: string): boolean {
  const cond = rawCond.trim();
  if (!cond) return true;

  // Strip wrapping balanced parens if the entire expression is wrapped
  if (cond.startsWith('(') && cond.endsWith(')')) {
    let depth = 0;
    let wrapsAll = true;
    let quote: '"' | "'" | null = null;
    for (let i = 0; i < cond.length - 1; i += 1) {
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
      if (ch === ')') depth -= 1;
      if (depth === 0) {
        wrapsAll = false;
        break;
      }
    }
    if (wrapsAll) {
      return evaluatePredicate(row, attrNames, cond.slice(1, -1));
    }
  }

  // OR
  const orParts = splitLogical(cond, ['∨', 'or']);
  if (orParts.length > 1) {
    return orParts.some((p) => evaluatePredicate(row, attrNames, p));
  }

  // AND
  const andParts = splitLogical(cond, ['∧', '^', 'and']);
  if (andParts.length > 1) {
    return andParts.every((p) => evaluatePredicate(row, attrNames, p));
  }

  // NOT
  if (cond.startsWith('¬') || /^not\b/i.test(cond)) {
    const inner = cond.startsWith('¬') ? cond.slice(1) : cond.slice(3);
    return !evaluatePredicate(row, attrNames, inner);
  }

  // IS NULL / IS NOT NULL
  const nullMatch = cond.match(/^([A-Za-z_][A-Za-z0-9_.]*)\s+is\s+(not\s+)?null$/i);
  if (nullMatch) {
    const { matchedName } = resolveAttrReference(attrNames, nullMatch[1]);
    const isNull = row[matchedName] === null;
    return nullMatch[2] ? !isNull : isNull;
  }

  // Comparison
  const cmpMatch = cond.match(/^(.+?)\s*(!=|<>|≠|<=|≤|>=|≥|=|<|>)\s*(.+)$/);
  if (!cmpMatch) {
    throw new Error(`Điều kiện lọc không hợp lệ: "${cond}".`);
  }

  const [, leftRaw, op, rightRaw] = cmpMatch;
  const lv = evaluateScalarExpr(row, attrNames, leftRaw);
  const rv = evaluateScalarExpr(row, attrNames, rightRaw);

  if (lv === null || rv === null) {
    if (op === '!=' || op === '<>' || op === '≠') return lv !== rv;
    return false;
  }

  switch (op) {
    case '=':
      return lv === rv;
    case '!=':
    case '<>':
    case '≠':
      return lv !== rv;
    case '<':
      return lv < rv;
    case '<=':
    case '≤':
      return lv <= rv;
    case '>':
      return lv > rv;
    case '>=':
    case '≥':
      return lv >= rv;
    default:
      return false;
  }
}

function splitLogical(expr: string, ops: string[]): string[] {
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
      let matched = '';
      for (const op of ops) {
        if (/^[a-z]+$/i.test(op)) {
          const prev = i > 0 ? expr[i - 1] : ' ';
          const m = expr.slice(i).match(new RegExp(`^\\b${op}\\b`, 'i'));
          if (m && !/[A-Za-z0-9_.]/.test(prev)) {
            matched = m[0];
            break;
          }
        } else if (expr.startsWith(op, i)) {
          matched = op;
          break;
        }
      }
      if (matched) {
        parts.push(buf.trim());
        buf = '';
        i += matched.length;
        continue;
      }
    }
    buf += ch;
    i += 1;
  }

  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

function checkUnionCompatibility(left: RelationInstance, right: RelationInstance, opName: string): void {
  const lAttrs = left.schema.attributes;
  const rAttrs = right.schema.attributes;
  if (lAttrs.length !== rAttrs.length) {
    throw new Error(
      `Hai quan hệ không khả hợp cho phép ${opName}: ${left.schema.name} có ${lAttrs.length} cột, còn ${right.schema.name} có ${rAttrs.length} cột (cần cùng bậc n).`,
    );
  }
  for (let i = 0; i < lAttrs.length; i += 1) {
    const ld = lAttrs[i].domain;
    const rd = rAttrs[i].domain;
    const numericPair =
      (ld === 'integer' || ld === 'float') && (rd === 'integer' || rd === 'float');
    if (ld !== rd && !numericPair) {
      throw new Error(
        `Hai quan hệ không khả hợp ở cột thứ ${i + 1}: Dom(${lAttrs[i].name})=${ld} khác Dom(${rAttrs[i].name})=${rd}.`,
      );
    }
  }
}

function combineSchemasWithPrefix(
  left: RelationInstance,
  right: RelationInstance,
  newName: string,
): { attributes: AttributeSchema[]; leftKeyMap: Record<string, string>; rightKeyMap: Record<string, string> } {
  const lNames = left.schema.attributes.map((a) => a.name);
  const rNames = right.schema.attributes.map((a) => a.name);
  const sharedLower = new Set(
    lNames
      .filter((ln) => rNames.some((rn) => rn.toLowerCase() === ln.toLowerCase()))
      .map((n) => n.toLowerCase()),
  );

  const leftKeyMap: Record<string, string> = {};
  const rightKeyMap: Record<string, string> = {};
  const attributes: AttributeSchema[] = [];

  for (const attr of left.schema.attributes) {
    const outName =
      sharedLower.has(attr.name.toLowerCase()) && !attr.name.includes('.')
        ? `${left.schema.name}.${attr.name}`
        : attr.name;
    leftKeyMap[attr.name] = outName;
    attributes.push({ ...attr, name: outName });
  }

  for (const attr of right.schema.attributes) {
    const outName =
      sharedLower.has(attr.name.toLowerCase()) && !attr.name.includes('.')
        ? `${right.schema.name}.${attr.name}`
        : attr.name;
    rightKeyMap[attr.name] = outName;
    attributes.push({ ...attr, name: outName });
  }

  void newName;
  return { attributes, leftKeyMap, rightKeyMap };
}

function computeAggregateValue(
  rows: TupleRow[],
  attrNames: string[],
  spec: AggregateSpec,
): CellValue {
  if (spec.fn === 'COUNT') {
    if (spec.arg === '*') return rows.length;
    return rows.reduce((acc, r) => {
      const val = evaluateScalarExpr(r, attrNames, spec.arg);
      return val !== null ? acc + 1 : acc;
    }, 0);
  }

  const nums = rows
    .map((r) => evaluateScalarExpr(r, attrNames, spec.arg))
    .filter((v): v is number => typeof v === 'number');

  if (nums.length === 0) return null;
  switch (spec.fn) {
    case 'SUM':
      return Math.round(nums.reduce((a, b) => a + b, 0) * 1000) / 1000;
    case 'AVG':
      return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 1000) / 1000;
    case 'MIN':
      return Math.min(...nums);
    case 'MAX':
      return Math.max(...nums);
  }
}

function evalNode(
  node: ASTNode,
  env: Record<string, RelationInstance>,
): RelationInstance {
  switch (node.kind) {
    case 'RelationRef': {
      const key = Object.keys(env).find((k) => k.toLowerCase() === node.name.toLowerCase());
      if (!key) {
        throw new Error(
          `Không tìm thấy quan hệ "${node.name}". Các quan hệ hiện có: ${Object.keys(env).join(', ')}.`,
        );
      }
      const res = deduplicateRelation(env[key]);
      node.intermediateResult = res;
      node.explanation = `Đọc quan hệ gốc ${key} (${res.rows.length} bộ).`;
      return res;
    }

    case 'Selection': {
      const childRel = evalNode(node.child, env);
      const attrNames = childRel.schema.attributes.map((a) => a.name);
      const matchedRows: TupleRow[] = [];
      const childHighlights: Record<number, RowHighlightKind> = {};

      childRel.rows.forEach((row, idx) => {
        if (evaluatePredicate(row, attrNames, node.condition)) {
          matchedRows.push({ ...row });
          childHighlights[idx] = 'matched';
        } else {
          childHighlights[idx] = 'excluded';
        }
      });

      const res: RelationInstance = {
        schema: { ...childRel.schema, name: `${childRel.schema.name}_sel` },
        rows: matchedRows,
      };
      node.intermediateResult = res;
      node.explanation = `Chọn σ: giữ lại ${matchedRows.length}/${childRel.rows.length} bộ thỏa điều kiện "${node.condition}".`;
      return res;
    }

    case 'Projection': {
      const childRel = evalNode(node.child, env);
      const childAttrNames = childRel.schema.attributes.map((a) => a.name);

      const resolvedCols: Array<{ item: ProjectionItem; outName: string; isPlainAttr: boolean }> =
        node.items.map((item) => {
          if (item.alias) {
            return { item, outName: item.alias, isPlainAttr: false };
          }
          const { matchedName } = resolveAttrReference(childAttrNames, item.expr);
          const dotIdx = matchedName.lastIndexOf('.');
          const shortName = dotIdx !== -1 ? matchedName.slice(dotIdx + 1) : matchedName;
          return { item, outName: shortName, isPlainAttr: true };
        });

      // If two projected columns map to identical shortName, preserve their qualified names
      const nameCounts = new Map<string, number>();
      resolvedCols.forEach((rc) => {
        nameCounts.set(rc.outName.toLowerCase(), (nameCounts.get(rc.outName.toLowerCase()) ?? 0) + 1);
      });

      const outAttributes: AttributeSchema[] = resolvedCols.map((rc) => {
        let finalName = rc.outName;
        if (rc.isPlainAttr) {
          const { matchedName } = resolveAttrReference(childAttrNames, rc.item.expr);
          if ((nameCounts.get(rc.outName.toLowerCase()) ?? 0) > 1) {
            finalName = matchedName;
          }
          const origAttr = childRel.schema.attributes.find((a) => a.name === matchedName);
          return { ...(origAttr ?? { domain: 'string' }), name: finalName };
        }
        return { name: finalName, domain: 'float' };
      });

      const projectedRows: TupleRow[] = childRel.rows.map((row) => {
        const outRow: TupleRow = {};
        resolvedCols.forEach((rc, i) => {
          const outName = outAttributes[i].name;
          outRow[outName] = rc.isPlainAttr
            ? row[resolveAttrReference(childAttrNames, rc.item.expr).matchedName]
            : evaluateScalarExpr(row, childAttrNames, rc.item.expr);
        });
        return outRow;
      });

      const deduped = deduplicateRelation({
        schema: {
          name: `${childRel.schema.name}_proj`,
          attributes: outAttributes,
          primaryKey: outAttributes.map((a) => a.name),
        },
        rows: projectedRows,
      });

      const droppedDupes = projectedRows.length - deduped.rows.length;
      node.intermediateResult = deduped;
      node.explanation = `Chiếu π: giữ ${outAttributes.length} cột (${outAttributes.map((a) => a.name).join(', ')}) — trả về ${deduped.rows.length} bộ${droppedDupes > 0 ? ` (đã khử ${droppedDupes} bộ trùng lặp theo quy tắc tập hợp)` : ''}.`;
      return deduped;
    }

    case 'Rename': {
      const childRel = evalNode(node.child, env);
      const oldAttrs = childRel.schema.attributes;
      if (node.newAttributes && node.newAttributes.length !== oldAttrs.length) {
        throw new Error(
          `Phép đổi tên ρ truyền ${node.newAttributes.length} tên cột (${node.newAttributes.join(', ')}), nhưng quan hệ đầu vào có ${oldAttrs.length} cột.`,
        );
      }

      const newAttributes = oldAttrs.map((a, idx) => ({
        ...a,
        name: node.newAttributes ? node.newAttributes[idx] : a.name,
      }));

      const newRows = childRel.rows.map((r) => {
        const out: TupleRow = {};
        oldAttrs.forEach((oldA, idx) => {
          out[newAttributes[idx].name] = r[oldA.name];
        });
        return out;
      });

      const res: RelationInstance = {
        schema: {
          name: node.newRelationName ?? childRel.schema.name,
          attributes: newAttributes,
          primaryKey: newAttributes.map((a) => a.name),
        },
        rows: newRows,
      };
      node.intermediateResult = res;
      node.explanation = `Đổi tên ρ thành ${res.schema.name}(${newAttributes.map((a) => a.name).join(', ')}).`;
      return res;
    }

    case 'Group': {
      const childRel = evalNode(node.child, env);
      const attrNames = childRel.schema.attributes.map((a) => a.name);
      const resolvedGroupCols = node.groupBy.map((g) => resolveAttrReference(attrNames, g).matchedName);

      const groups = new Map<string, TupleRow[]>();
      if (resolvedGroupCols.length === 0) {
        groups.set('ALL', childRel.rows);
      } else {
        for (const row of childRel.rows) {
          const gKey = canonicalTupleKey(row, resolvedGroupCols);
          const list = groups.get(gKey) ?? [];
          list.push(row);
          groups.set(gKey, list);
        }
      }

      const aggColNames = node.aggregates.map(
        (agg) => agg.alias ?? `${agg.fn}(${agg.arg})`,
      );
      const outAttributes: AttributeSchema[] = [
        ...resolvedGroupCols.map((gc) => {
          const found = childRel.schema.attributes.find((a) => a.name === gc);
          return found ? { ...found } : { name: gc, domain: 'string' as const };
        }),
        ...aggColNames.map((cn) => ({ name: cn, domain: 'float' as const })),
      ];

      const outRows: TupleRow[] = [];
      for (const groupRows of groups.values()) {
        const row: TupleRow = {};
        resolvedGroupCols.forEach((gc) => {
          row[gc] = groupRows[0][gc];
        });
        node.aggregates.forEach((agg, idx) => {
          row[aggColNames[idx]] = computeAggregateValue(groupRows, attrNames, agg);
        });
        outRows.push(row);
      }

      const res: RelationInstance = {
        schema: {
          name: `${childRel.schema.name}_grp`,
          attributes: outAttributes,
          primaryKey: resolvedGroupCols.length > 0 ? resolvedGroupCols : aggColNames,
        },
        rows: outRows,
      };
      node.intermediateResult = res;
      node.explanation =
        resolvedGroupCols.length > 0
          ? `Gom nhóm theo (${resolvedGroupCols.join(', ')}) tạo ${outRows.length} nhóm và tính (${aggColNames.join(', ')}).`
          : `Tính hàm kết hợp toàn bảng (${aggColNames.join(', ')}) trên ${childRel.rows.length} bộ.`;
      return res;
    }

    case 'Binary': {
      const leftRel = evalNode(node.left, env);
      const rightRel = evalNode(node.right, env);
      const lCols = leftRel.schema.attributes.map((a) => a.name);
      const rCols = rightRel.schema.attributes.map((a) => a.name);

      if (node.op === 'UNION' || node.op === 'INTERSECT' || node.op === 'DIFF') {
        const opVi = node.op === 'UNION' ? 'Hợp' : node.op === 'INTERSECT' ? 'Giao' : 'Trừ';
        checkUnionCompatibility(leftRel, rightRel, opVi);

        const rightMappedRows = rightRel.rows.map((rr) => {
          const out: TupleRow = {};
          lCols.forEach((lc, i) => {
            out[lc] = rr[rCols[i]];
          });
          return out;
        });

        const rightSet = new Set(rightMappedRows.map((r) => canonicalTupleKey(r, lCols)));
        const leftSet = new Set(leftRel.rows.map((r) => canonicalTupleKey(r, lCols)));

        let resRows: TupleRow[] = [];
        if (node.op === 'UNION') {
          resRows = [...leftRel.rows, ...rightMappedRows];
        } else if (node.op === 'INTERSECT') {
          resRows = leftRel.rows.filter((r) => rightSet.has(canonicalTupleKey(r, lCols)));
        } else {
          resRows = leftRel.rows.filter((r) => !rightSet.has(canonicalTupleKey(r, lCols)));
          void leftSet;
        }

        const res = deduplicateRelation({
          schema: {
            ...leftRel.schema,
            name: `${leftRel.schema.name}_${node.op.toLowerCase()}_${rightRel.schema.name}`,
          },
          rows: resRows,
        });
        node.intermediateResult = res;
        node.explanation = `Phép ${opVi}: hai quan hệ khả hợp bậc ${lCols.length}, kết quả có ${res.rows.length} bộ (giữ tên cột của ${leftRel.schema.name}).`;
        return res;
      }

      if (node.op === 'CARTESIAN') {
        const { attributes, leftKeyMap, rightKeyMap } = combineSchemasWithPrefix(
          leftRel,
          rightRel,
          `${leftRel.schema.name}_x_${rightRel.schema.name}`,
        );
        const rows: TupleRow[] = [];
        for (const lr of leftRel.rows) {
          for (const rr of rightRel.rows) {
            const combined: TupleRow = {};
            lCols.forEach((c) => {
              combined[leftKeyMap[c]] = lr[c];
            });
            rCols.forEach((c) => {
              combined[rightKeyMap[c]] = rr[c];
            });
            rows.push(combined);
          }
        }
        const res = deduplicateRelation({
          schema: {
            name: `${leftRel.schema.name}_x_${rightRel.schema.name}`,
            attributes,
            primaryKey: attributes.map((a) => a.name),
          },
          rows,
        });
        node.intermediateResult = res;
        node.explanation = `Tích Đề-các (×): ghép ${leftRel.rows.length} × ${rightRel.rows.length} = ${res.rows.length} bộ.`;
        return res;
      }

      if (node.op === 'NATURAL_JOIN' || (!node.condition && (node.op === 'LEFT_OUTER_JOIN' || node.op === 'RIGHT_OUTER_JOIN' || node.op === 'FULL_OUTER_JOIN'))) {
        // Natural join / natural outer join on shared attributes
        const sharedCols = lCols.filter((lc) =>
          rCols.some((rc) => rc.toLowerCase() === lc.toLowerCase()),
        );
        if (sharedCols.length === 0 && node.op === 'NATURAL_JOIN') {
          throw new Error(
            `Phép nối tự nhiên giữa ${leftRel.schema.name} và ${rightRel.schema.name} không tìm thấy thuộc tính cùng tên nào! Hãy kiểm tra lại tên cột hoặc dùng phép nối có điều kiện ⨝_{...}.`,
          );
        }

        const rColByShared = sharedCols.map((sc) =>
          rCols.find((rc) => rc.toLowerCase() === sc.toLowerCase())!,
        );
        const rOnlyAttrs = rightRel.schema.attributes.filter(
          (ra) => !rColByShared.includes(ra.name),
        );
        const outAttrs: AttributeSchema[] = [...leftRel.schema.attributes, ...rOnlyAttrs];

        const matchedLeftIdx = new Set<number>();
        const matchedRightIdx = new Set<number>();
        const outRows: TupleRow[] = [];

        leftRel.rows.forEach((lr, li) => {
          rightRel.rows.forEach((rr, ri) => {
            const matches = sharedCols.every((sc, idx) => {
              const lv = lr[sc];
              const rv = rr[rColByShared[idx]];
              return lv !== null && rv !== null && lv === rv;
            });
            if (matches) {
              matchedLeftIdx.add(li);
              matchedRightIdx.add(ri);
              const combined: TupleRow = { ...lr };
              rOnlyAttrs.forEach((ra) => {
                combined[ra.name] = rr[ra.name];
              });
              outRows.push(combined);
            }
          });
        });

        if (node.op === 'LEFT_OUTER_JOIN' || node.op === 'FULL_OUTER_JOIN') {
          leftRel.rows.forEach((lr, li) => {
            if (!matchedLeftIdx.has(li)) {
              const row: TupleRow = { ...lr };
              rOnlyAttrs.forEach((ra) => {
                row[ra.name] = null;
              });
              outRows.push(row);
            }
          });
        }

        if (node.op === 'RIGHT_OUTER_JOIN' || node.op === 'FULL_OUTER_JOIN') {
          rightRel.rows.forEach((rr, ri) => {
            if (!matchedRightIdx.has(ri)) {
              const row: TupleRow = {};
              leftRel.schema.attributes.forEach((la) => {
                const sharedIdx = sharedCols.indexOf(la.name);
                row[la.name] = sharedIdx !== -1 ? rr[rColByShared[sharedIdx]] : null;
              });
              rOnlyAttrs.forEach((ra) => {
                row[ra.name] = rr[ra.name];
              });
              outRows.push(row);
            }
          });
        }

        const res = deduplicateRelation({
          schema: {
            name: `${leftRel.schema.name}_join_${rightRel.schema.name}`,
            attributes: outAttrs,
            primaryKey: outAttrs.map((a) => a.name),
          },
          rows: outRows,
        });
        node.intermediateResult = res;
        node.explanation = `Nối trên thuộc tính chung (${sharedCols.join(', ')}): thu được ${res.rows.length} bộ.`;
        return res;
      }

      if (
        node.op === 'THETA_JOIN' ||
        node.op === 'LEFT_OUTER_JOIN' ||
        node.op === 'RIGHT_OUTER_JOIN' ||
        node.op === 'FULL_OUTER_JOIN'
      ) {
        const cond = node.condition ?? '';
        const { attributes, leftKeyMap, rightKeyMap } = combineSchemasWithPrefix(
          leftRel,
          rightRel,
          `${leftRel.schema.name}_join_${rightRel.schema.name}`,
        );
        const allAttrNames = attributes.map((a) => a.name);
        const matchedLeftIdx = new Set<number>();
        const matchedRightIdx = new Set<number>();
        const outRows: TupleRow[] = [];

        leftRel.rows.forEach((lr, li) => {
          rightRel.rows.forEach((rr, ri) => {
            const combined: TupleRow = {};
            lCols.forEach((c) => {
              combined[leftKeyMap[c]] = lr[c];
            });
            rCols.forEach((c) => {
              combined[rightKeyMap[c]] = rr[c];
            });
            if (evaluatePredicate(combined, allAttrNames, cond)) {
              matchedLeftIdx.add(li);
              matchedRightIdx.add(ri);
              outRows.push(combined);
            }
          });
        });

        if (node.op === 'LEFT_OUTER_JOIN' || node.op === 'FULL_OUTER_JOIN') {
          leftRel.rows.forEach((lr, li) => {
            if (!matchedLeftIdx.has(li)) {
              const row: TupleRow = {};
              lCols.forEach((c) => {
                row[leftKeyMap[c]] = lr[c];
              });
              rCols.forEach((c) => {
                row[rightKeyMap[c]] = null;
              });
              outRows.push(row);
            }
          });
        }

        if (node.op === 'RIGHT_OUTER_JOIN' || node.op === 'FULL_OUTER_JOIN') {
          rightRel.rows.forEach((rr, ri) => {
            if (!matchedRightIdx.has(ri)) {
              const row: TupleRow = {};
              lCols.forEach((c) => {
                row[leftKeyMap[c]] = null;
              });
              rCols.forEach((c) => {
                row[rightKeyMap[c]] = rr[c];
              });
              outRows.push(row);
            }
          });
        }

        const res = deduplicateRelation({
          schema: {
            name: `${leftRel.schema.name}_join_${rightRel.schema.name}`,
            attributes,
            primaryKey: attributes.map((a) => a.name),
          },
          rows: outRows,
        });
        node.intermediateResult = res;
        node.explanation = `Phép nối với điều kiện "${cond}": thu được ${res.rows.length} bộ.`;
        return res;
      }

      if (node.op === 'DIVISION') {
        // Verify X (attrs of S) subset of Z (attrs of R), case-insensitive
        const xColsInR: string[] = [];
        for (const rc of rCols) {
          const foundInR = lCols.find((lc) => lc.toLowerCase() === rc.toLowerCase());
          if (!foundInR) {
            throw new Error(
              `Phép chia R ÷ S yêu cầu mọi thuộc tính của S (${rCols.join(', ')}) phải có mặt trong R (${lCols.join(', ')}). Thiếu cột "${rc}".`,
            );
          }
          xColsInR.push(foundInR);
        }

        const yAttrs = leftRel.schema.attributes.filter(
          (la) => !xColsInR.some((xc) => xc.toLowerCase() === la.name.toLowerCase()),
        );
        if (yAttrs.length === 0) {
          throw new Error('Phép chia không thể thực hiện vì tập thuộc tính kết quả Y = Z − X bị rỗng.');
        }

        const yCols = yAttrs.map((a) => a.name);

        // Step 2: T1 = π_Y(R)
        const T1 = deduplicateRelation({
          schema: { name: 'T1', attributes: yAttrs, primaryKey: yCols },
          rows: leftRel.rows.map((lr) => {
            const row: TupleRow = {};
            yCols.forEach((yc) => {
              row[yc] = lr[yc];
            });
            return row;
          }),
        });

        // Step 3: S × T1 (projected onto Z = X ∪ Y)
        const stAttrs = [
          ...xColsInR.map((xc) => leftRel.schema.attributes.find((a) => a.name === xc)!),
          ...yAttrs,
        ];
        const cartesianST1Rows: TupleRow[] = [];
        for (const sr of rightRel.rows) {
          for (const t1r of T1.rows) {
            const row: TupleRow = {};
            xColsInR.forEach((xc, i) => {
              row[xc] = sr[rCols[i]];
            });
            yCols.forEach((yc) => {
              row[yc] = t1r[yc];
            });
            cartesianST1Rows.push(row);
          }
        }
        const cartesianST1 = deduplicateRelation({
          schema: {
            name: 'S×T1',
            attributes: stAttrs,
            primaryKey: stAttrs.map((a) => a.name),
          },
          rows: cartesianST1Rows,
        });

        // Missing pairs = (S × T1) - R
        const zColsOrdered = stAttrs.map((a) => a.name);
        const rSet = new Set(leftRel.rows.map((lr) => canonicalTupleKey(lr, zColsOrdered)));
        const missingRows = cartesianST1.rows.filter(
          (stRow) => !rSet.has(canonicalTupleKey(stRow, zColsOrdered)),
        );
        const missingPairs = deduplicateRelation({
          schema: {
            name: '(S×T1)−R',
            attributes: stAttrs,
            primaryKey: stAttrs.map((a) => a.name),
          },
          rows: missingRows,
        });

        // T2 = π_Y((S × T1) - R)
        const T2 = deduplicateRelation({
          schema: { name: 'T2', attributes: yAttrs, primaryKey: yCols },
          rows: missingPairs.rows.map((mr) => {
            const row: TupleRow = {};
            yCols.forEach((yc) => {
              row[yc] = mr[yc];
            });
            return row;
          }),
        });

        // Step 4: T = T1 - T2
        const t2Set = new Set(T2.rows.map((r) => canonicalTupleKey(r, yCols)));
        const finalRows = T1.rows.filter((r) => !t2Set.has(canonicalTupleKey(r, yCols)));
        const finalT = deduplicateRelation({
          schema: {
            name: `${leftRel.schema.name}÷${rightRel.schema.name}`,
            attributes: yAttrs,
            primaryKey: yCols,
          },
          rows: finalRows,
        });

        const breakdown: DivisionBreakdown = {
          attributesY: yCols,
          T1,
          cartesianST1,
          missingPairs,
          T2,
          finalT,
        };
        node.divisionBreakdown = breakdown;
        node.intermediateResult = finalT;
        node.explanation = `Phép chia R ÷ S (4 bước): T₁ có ${T1.rows.length} ứng viên → T₂ loại ${T2.rows.length} ứng viên thiếu → còn ${finalT.rows.length} kết quả thỏa TẤT CẢ ${rightRel.rows.length} bộ của ${rightRel.schema.name}.`;
        return finalT;
      }

      throw new Error(`Chưa hỗ trợ phép toán nhị phân: ${node.op}`);
    }
  }
}

export function formatProgramToLatex(rawProgram: string): string {
  try {
    const stmts = parseAlgebraProgram(rawProgram);
    return stmts
      .map((s) => {
        const rhsTex = formatAstToLatex(s.ast);
        if (s.assignedTo && !s.inlineRenameCols) {
          return `\\text{${s.assignedTo.replace(/_/g, '\\_')}} \\leftarrow ${rhsTex}`;
        }
        return rhsTex;
      })
      .join(' \\\\[0.4em] ');
  } catch {
    return '';
  }
}

export function evaluateAlgebraProgram(
  db: DatabaseState,
  rawProgram: string,
): AlgebraProgramResult {
  try {
    const parsedStmts = parseAlgebraProgram(rawProgram);
    const env: Record<string, RelationInstance> = { ...db.relations };
    const steps: ProgramStepResult[] = [];

    for (const stmt of parsedStmts) {
      const result = evalNode(stmt.ast, env);
      const namedResult: RelationInstance = stmt.assignedTo
        ? {
            schema: { ...result.schema, name: stmt.assignedTo },
            rows: result.rows,
          }
        : result;

      if (stmt.assignedTo) {
        env[stmt.assignedTo] = namedResult;
      }

      const rhsTex = formatAstToLatex(stmt.ast);
      const stmtLatex =
        stmt.assignedTo && !stmt.inlineRenameCols
          ? `\\text{${stmt.assignedTo.replace(/_/g, '\\_')}} \\leftarrow ${rhsTex}`
          : rhsTex;

      steps.push({
        lineNumber: stmt.lineNumber,
        rawStatement: stmt.rawStatement,
        assignedTo: stmt.assignedTo,
        latex: stmtLatex,
        ast: stmt.ast,
        result: namedResult,
      });
    }

    const finalStep = steps[steps.length - 1];
    return {
      steps,
      finalResult: finalStep?.result,
      finalLatex: steps.map((s) => s.latex).join(' \\\\[0.4em] '),
    };
  } catch (err) {
    return {
      steps: [],
      finalLatex: '',
      error: err instanceof Error ? err.message : 'Lỗi không xác định khi thực thi biểu thức.',
    };
  }
}

export interface CompareRelationResult {
  isEqual: boolean;
  reason?: string;
}

function normalizeCellForCompare(val: CellValue): string {
  if (val === null) return 'NULL';
  if (typeof val === 'number') return String(Math.round(val * 1000) / 1000);
  return String(val);
}

export function compareRelations(
  actual: RelationInstance,
  expected: RelationInstance,
  options: { checkColumnNames?: boolean } = {},
): CompareRelationResult {
  const aCols = actual.schema.attributes.map((a) => a.name);
  const eCols = expected.schema.attributes.map((a) => a.name);

  if (aCols.length !== eCols.length) {
    return {
      isEqual: false,
      reason: `Số cột kết quả chưa đúng: Bạn thu được ${aCols.length} cột (${aCols.join(', ')}), đáp án cần ${eCols.length} cột (${eCols.join(', ')}).`,
    };
  }

  if (options.checkColumnNames) {
    const aNorm = aCols.map((c) => c.toLowerCase());
    const eNorm = eCols.map((c) => c.toLowerCase());
    if (JSON.stringify(aNorm) !== JSON.stringify(eNorm)) {
      return {
        isEqual: false,
        reason: `Tên cột chưa đúng yêu cầu đổi tên: Bạn đang có (${aCols.join(', ')}), đáp án cần (${eCols.join(', ')}).`,
      };
    }
  }

  if (actual.rows.length !== expected.rows.length) {
    return {
      isEqual: false,
      reason: `Số bộ (dòng) kết quả chưa đúng: Bạn thu được ${actual.rows.length} bộ, đáp án có ${expected.rows.length} bộ.`,
    };
  }

  // Canonicalize each tuple positionally by matching column names if possible, or by position
  const canMatchByName = eCols.every((ec) =>
    aCols.some((ac) => ac.toLowerCase() === ec.toLowerCase()),
  );

  const serializeRows = (rows: TupleRow[], colsOrder: string[]): string[] =>
    rows
      .map((r) =>
        JSON.stringify(
          colsOrder.map((c) => {
            const actualKey = Object.keys(r).find((k) => k.toLowerCase() === c.toLowerCase());
            return normalizeCellForCompare(actualKey ? r[actualKey] : null);
          }),
        ),
      )
      .sort();

  const aSerialized = canMatchByName
    ? serializeRows(actual.rows, eCols)
    : serializeRows(actual.rows, aCols);
  const eSerialized = serializeRows(expected.rows, eCols);

  if (JSON.stringify(aSerialized) !== JSON.stringify(eSerialized)) {
    return {
      isEqual: false,
      reason: 'Các bộ dữ liệu trong kết quả chưa trùng khớp với đáp án mục tiêu. Hãy kiểm tra lại điều kiện lọc hoặc phép nối.',
    };
  }

  return { isEqual: true };
}
