import { ASTNode } from './ast';

function escapeLatexIdent(text: string): string {
  const safe = text.replace(/_/g, '\\_');
  return `\\text{${safe}}`;
}

function formatConditionToLatex(cond: string): string {
  let out = cond.trim();
  // Format string literals carefully first
  const strings: string[] = [];
  out = out.replace(/"([^"]*)"|'([^']*)'/g, (_m, g1: string | undefined, g2: string | undefined) => {
    const val = g1 ?? g2 ?? '';
    const token = `__STR_${strings.length}__`;
    strings.push(`\\text{“${val}”}`);
    return token;
  });

  out = out
    .replace(/!=/g, '\\neq ')
    .replace(/<>/g, '\\neq ')
    .replace(/≠/g, '\\neq ')
    .replace(/<=/g, '\\leq ')
    .replace(/≤/g, '\\leq ')
    .replace(/>=/g, '\\geq ')
    .replace(/≥/g, '\\geq ')
    .replace(/\band\b/gi, '\\land ')
    .replace(/∧|\^/g, '\\land ')
    .replace(/\bor\b/gi, '\\lor ')
    .replace(/∨/g, '\\lor ')
    .replace(/\bnot\b/gi, '\\neg ')
    .replace(/¬/g, '\\neg ')
    .replace(/\b([A-Za-z_][A-Za-z0-9_.]*)\b/g, (word) => {
      if (word.startsWith('__STR_') || word === 'land' || word === 'lor' || word === 'neg' || word === 'neq' || word === 'leq' || word === 'geq') {
        return word;
      }
      if (/^(is|null)$/i.test(word)) return `\\text{ ${word.toLowerCase()} }`;
      return escapeLatexIdent(word);
    });

  strings.forEach((s, idx) => {
    out = out.replace(`__STR_${idx}__`, s);
  });

  return out;
}

function formatProjectionItemLatex(expr: string, alias?: string): string {
  const formattedExpr = expr
    .replace(/\*/g, '\\cdot ')
    .replace(/\b([A-Za-z_][A-Za-z0-9_.]*)\b/g, (w) => escapeLatexIdent(w));
  if (alias) {
    return `${formattedExpr} \\to ${escapeLatexIdent(alias)}`;
  }
  return formattedExpr;
}

export function formatAstToLatex(node: ASTNode): string {
  switch (node.kind) {
    case 'RelationRef':
      return escapeLatexIdent(node.name);
    case 'Selection':
      return `\\sigma_{${formatConditionToLatex(node.condition)}}\\left(${formatAstToLatex(node.child)}\\right)`;
    case 'Projection': {
      const cols = node.items.map((it) => formatProjectionItemLatex(it.expr, it.alias)).join(', ');
      return `\\pi_{${cols}}\\left(${formatAstToLatex(node.child)}\\right)`;
    }
    case 'Rename': {
      const parts: string[] = [];
      if (node.newRelationName) parts.push(escapeLatexIdent(node.newRelationName));
      if (node.newAttributes) {
        parts.push(`(${node.newAttributes.map((a) => escapeLatexIdent(a)).join(', ')})`);
      }
      return `\\rho_{${parts.join('')}}\\left(${formatAstToLatex(node.child)}\\right)`;
    }
    case 'Group': {
      const grp = node.groupBy.map((g) => escapeLatexIdent(g)).join(', ');
      const aggs = node.aggregates
        .map((a) => {
          const argTex =
            a.arg === '*'
              ? '*'
              : a.arg
                  .replace(/\*/g, '\\cdot ')
                  .replace(/\b([A-Za-z_][A-Za-z0-9_.]*)\b/g, (w) => escapeLatexIdent(w));
          const base = `\\text{${a.fn}}(${argTex})`;
          return a.alias ? `${base} \\to ${escapeLatexIdent(a.alias)}` : base;
        })
        .join(', ');
      return `\\GF{${grp}}{${aggs}}\\left(${formatAstToLatex(node.child)}\\right)`;
    }
    case 'Binary': {
      const leftTex = formatAstToLatex(node.left);
      const rightTex = formatAstToLatex(node.right);
      const condTex = node.condition ? `_{${formatConditionToLatex(node.condition)}}` : '';
      switch (node.op) {
        case 'UNION':
          return `${leftTex} \\cup ${rightTex}`;
        case 'INTERSECT':
          return `${leftTex} \\cap ${rightTex}`;
        case 'DIFF':
          return `${leftTex} - ${rightTex}`;
        case 'CARTESIAN':
          return `${leftTex} \\times ${rightTex}`;
        case 'NATURAL_JOIN':
          return `${leftTex} \\bowtie ${rightTex}`;
        case 'THETA_JOIN':
          return `${leftTex} \\bowtie${condTex} ${rightTex}`;
        case 'LEFT_OUTER_JOIN':
          return `${leftTex} \\lojoin${condTex} ${rightTex}`;
        case 'RIGHT_OUTER_JOIN':
          return `${leftTex} \\rojoin${condTex} ${rightTex}`;
        case 'FULL_OUTER_JOIN':
          return `${leftTex} \\fojoin${condTex} ${rightTex}`;
        case 'DIVISION':
          return `${leftTex} \\div ${rightTex}`;
      }
    }
  }
}
