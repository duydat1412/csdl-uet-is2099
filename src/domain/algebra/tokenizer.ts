export type TokenKind =
  | 'IDENT'
  | 'OP_SIGMA'
  | 'OP_PI'
  | 'OP_RHO'
  | 'OP_GROUP'
  | 'OP_UNION'
  | 'OP_INTERSECT'
  | 'OP_DIFF'
  | 'OP_CARTESIAN'
  | 'OP_NJOIN'
  | 'OP_LJOIN'
  | 'OP_RJOIN'
  | 'OP_FJOIN'
  | 'OP_DIV'
  | 'SUBSCRIPT'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'EOF';

export interface Token {
  kind: TokenKind;
  value: string;
  pos: number;
}

export function normalizeAlgebraInput(raw: string): string {
  return raw
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u2212/g, '-')
    .replace(/\u2227/g, '∧')
    .replace(/\u2228/g, '∨')
    .replace(/\u00ac/g, '¬');
}

const KEYWORD_MAP: Record<string, TokenKind> = {
  sigma: 'OP_SIGMA',
  select: 'OP_SIGMA',
  pi: 'OP_PI',
  project: 'OP_PI',
  rho: 'OP_RHO',
  rename: 'OP_RHO',
  gamma: 'OP_GROUP',
  group: 'OP_GROUP',
  union: 'OP_UNION',
  intersect: 'OP_INTERSECT',
  intersec: 'OP_INTERSECT',
  diff: 'OP_DIFF',
  cross: 'OP_CARTESIAN',
  njoin: 'OP_NJOIN',
  join: 'OP_NJOIN',
  ljoin: 'OP_LJOIN',
  rjoin: 'OP_RJOIN',
  fjoin: 'OP_FJOIN',
  div: 'OP_DIV',
};

function readBalanced(input: string, start: number, openChar: string, closeChar: string): { content: string; nextPos: number } {
  let depth = 0;
  let i = start;
  let quote: '"' | "'" | null = null;
  let content = '';

  while (i < input.length) {
    const ch = input[i];
    if (quote) {
      content += ch;
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      content += ch;
      i += 1;
      continue;
    }
    if (ch === openChar) {
      if (depth > 0) content += ch;
      depth += 1;
      i += 1;
      continue;
    }
    if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return { content: content.trim(), nextPos: i + 1 };
      }
      content += ch;
      i += 1;
      continue;
    }
    content += ch;
    i += 1;
  }
  throw new Error(`Thiếu dấu đóng "${closeChar}" cho phần mở ở vị trí ${start + 1}.`);
}

export function tokenizeAlgebraExpr(rawInput: string): Token[] {
  const input = normalizeAlgebraInput(rawInput);
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    // Subscript _{...} or [...]
    if (ch === '_' && input[i + 1] === '{') {
      const { content, nextPos } = readBalanced(input, i + 1, '{', '}');
      tokens.push({ kind: 'SUBSCRIPT', value: content, pos: i });
      i = nextPos;
      continue;
    }
    if (ch === '[') {
      const { content, nextPos } = readBalanced(input, i, '[', ']');
      tokens.push({ kind: 'SUBSCRIPT', value: content, pos: i });
      i = nextPos;
      continue;
    }

    if (ch === '(') {
      tokens.push({ kind: 'LPAREN', value: '(', pos: i });
      i += 1;
      continue;
    }
    if (ch === ')') {
      tokens.push({ kind: 'RPAREN', value: ')', pos: i });
      i += 1;
      continue;
    }
    if (ch === ',') {
      tokens.push({ kind: 'COMMA', value: ',', pos: i });
      i += 1;
      continue;
    }

    // Single-character math operators
    switch (ch) {
      case 'σ':
        tokens.push({ kind: 'OP_SIGMA', value: ch, pos: i });
        i += 1;
        continue;
      case 'π':
        tokens.push({ kind: 'OP_PI', value: ch, pos: i });
        i += 1;
        continue;
      case 'ρ':
        tokens.push({ kind: 'OP_RHO', value: ch, pos: i });
        i += 1;
        continue;
      case 'ℱ':
      case 'γ':
        tokens.push({ kind: 'OP_GROUP', value: ch, pos: i });
        i += 1;
        continue;
      case '∪':
        tokens.push({ kind: 'OP_UNION', value: ch, pos: i });
        i += 1;
        continue;
      case '∩':
        tokens.push({ kind: 'OP_INTERSECT', value: ch, pos: i });
        i += 1;
        continue;
      case '-':
        tokens.push({ kind: 'OP_DIFF', value: ch, pos: i });
        i += 1;
        continue;
      case '×':
        tokens.push({ kind: 'OP_CARTESIAN', value: ch, pos: i });
        i += 1;
        continue;
      case '*':
      case '⨝':
        tokens.push({ kind: 'OP_NJOIN', value: ch, pos: i });
        i += 1;
        continue;
      case '⟕':
        tokens.push({ kind: 'OP_LJOIN', value: ch, pos: i });
        i += 1;
        continue;
      case '⟖':
        tokens.push({ kind: 'OP_RJOIN', value: ch, pos: i });
        i += 1;
        continue;
      case '⟗':
        tokens.push({ kind: 'OP_FJOIN', value: ch, pos: i });
        i += 1;
        continue;
      case '÷':
        tokens.push({ kind: 'OP_DIV', value: ch, pos: i });
        i += 1;
        continue;
    }

    // Identifiers or ASCII keywords (and allow F_{...} as shortcut for ℱ_{...})
    if (/[A-Za-z_]/.test(ch)) {
      let end = i + 1;
      while (end < input.length && /[A-Za-z0-9_.]/.test(input[end])) {
        end += 1;
      }
      const word = input.slice(i, end);
      const lower = word.toLowerCase();

      if (word === 'F' && (input[end] === '_' || input[end] === '[')) {
        tokens.push({ kind: 'OP_GROUP', value: 'ℱ', pos: i });
        i = end;
        continue;
      }

      if (lower in KEYWORD_MAP) {
        tokens.push({ kind: KEYWORD_MAP[lower], value: word, pos: i });
      } else {
        tokens.push({ kind: 'IDENT', value: word, pos: i });
      }
      i = end;
      continue;
    }

    throw new Error(`Ký tự không hợp lệ "${ch}" tại vị trí ${i + 1}.`);
  }

  tokens.push({ kind: 'EOF', value: '', pos: input.length });
  return tokens;
}
