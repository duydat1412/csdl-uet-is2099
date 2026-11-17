import {
  AggregateSpec,
  ASTNode,
  BinaryOpKind,
  ProjectionItem,
} from './ast';
import { formatAstToLatex } from './latexFormatter';
import { Token, TokenKind, tokenizeAlgebraExpr } from './tokenizer';

export interface ParsedStatement {
  lineNumber: number;
  rawStatement: string;
  assignedTo?: string;
  inlineRenameCols?: string[];
  ast: ASTNode;
}

function splitTopLevelCommas(raw: string): string[] {
  const items: string[] = [];
  let buf = '';
  let depth = 0;
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
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
      if (buf.trim()) items.push(buf.trim());
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) items.push(buf.trim());
  return items;
}

function parseProjectionItems(raw: string): ProjectionItem[] {
  return splitTopLevelCommas(raw).map((part) => {
    const arrowMatch = part.match(/^(.+?)\s*(?:->|→|\bas\b)\s*([A-Za-z_][A-Za-z0-9_]*)$/i);
    if (arrowMatch) {
      return { expr: arrowMatch[1].trim(), alias: arrowMatch[2].trim() };
    }
    return { expr: part.trim() };
  });
}

function parseRenameSpec(raw: string): { newRelationName?: string; newAttributes?: string[] } {
  const s = raw.trim();
  // Match S(A, B, C)
  const fullMatch = s.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\((.+)\)$/);
  if (fullMatch) {
    return {
      newRelationName: fullMatch[1].trim(),
      newAttributes: splitTopLevelCommas(fullMatch[2]),
    };
  }
  // Match (A, B, C)
  if (s.startsWith('(') && s.endsWith(')')) {
    return {
      newAttributes: splitTopLevelCommas(s.slice(1, -1)),
    };
  }
  // If contains comma without outer parens, treat as attribute list
  if (s.includes(',')) {
    return {
      newAttributes: splitTopLevelCommas(s),
    };
  }
  // Single identifier -> new relation name
  return { newRelationName: s };
}

function parseAggregatesList(raw: string): { inlineGroupBy: string[]; aggregates: AggregateSpec[] } {
  let inlineGroupBy: string[] = [];
  let aggSection = raw.trim();

  if (aggSection.includes(';')) {
    const [grpPart, rest] = aggSection.split(';');
    inlineGroupBy = grpPart.trim() ? splitTopLevelCommas(grpPart) : [];
    aggSection = rest.trim();
  }

  const aggregates: AggregateSpec[] = splitTopLevelCommas(aggSection).map((item) => {
    const aliasMatch = item.match(/^(.+?)\s*(?:->|→|\bas\b)\s*([A-Za-z_][A-Za-z0-9_]*)$/i);
    const core = aliasMatch ? aliasMatch[1].trim() : item.trim();
    const alias = aliasMatch ? aliasMatch[2].trim() : undefined;

    const fnMatch = core.match(/^(SUM|AVG|MIN|MAX|COUNT)\s*\((.+)\)$/i);
    if (!fnMatch) {
      throw new Error(`Hàm kết hợp không hợp lệ: "${item}". Hỗ trợ: SUM, AVG, MIN, MAX, COUNT.`);
    }
    return {
      fn: fnMatch[1].toUpperCase() as AggregateSpec['fn'],
      arg: fnMatch[2].trim(),
      alias,
    };
  });

  return { inlineGroupBy, aggregates };
}

class Parser {
  private tokens: Token[];
  private cursor = 0;
  private nodeCounter = 0;
  private rawInput: string;

  constructor(tokens: Token[], rawInput: string) {
    this.tokens = tokens;
    this.rawInput = rawInput;
  }

  private peek(offset = 0): Token {
    return this.tokens[Math.min(this.cursor + offset, this.tokens.length - 1)];
  }

  private consume(expected?: TokenKind): Token {
    const tok = this.peek();
    if (expected && tok.kind !== expected) {
      throw new Error(`Kỳ vọng "${expected}" nhưng gặp "${tok.value || tok.kind}" tại vị trí ${tok.pos + 1}.`);
    }
    this.cursor += 1;
    return tok;
  }

  private nextId(): string {
    this.nodeCounter += 1;
    return `node-${this.nodeCounter}`;
  }

  /** Reads `( ... )` raw substring when unary operator uses UET paren style σ(cond)(R) */
  private readParenRawArg(): string {
    const lp = this.consume('LPAREN');
    const startPos = lp.pos + 1;
    let depth = 1;
    while (this.peek().kind !== 'EOF') {
      const tok = this.consume();
      if (tok.kind === 'LPAREN') depth += 1;
      if (tok.kind === 'RPAREN') {
        depth -= 1;
        if (depth === 0) {
          return this.rawInput.slice(startPos, tok.pos).trim();
        }
      }
    }
    throw new Error('Thiếu dấu ngoặc đóng ")" cho tham số toán tử.');
  }

  private readSubscriptOrParenArg(): string {
    if (this.peek().kind === 'SUBSCRIPT') {
      return this.consume('SUBSCRIPT').value;
    }
    if (this.peek().kind === 'LPAREN') {
      // Check if followed by a second '(' after balancing the first -> UET style σ(cond)(R)
      let look = 1;
      let depth = 1;
      while (this.cursor + look < this.tokens.length && depth > 0) {
        const k = this.tokens[this.cursor + look].kind;
        if (k === 'LPAREN') depth += 1;
        else if (k === 'RPAREN') depth -= 1;
        look += 1;
      }
      if (this.peek(look).kind === 'LPAREN') {
        return this.readParenRawArg();
      }
    }
    throw new Error(`Thiếu phần chỉ số dưới _{...} hoặc (...) cho toán tử.`);
  }

  parseExpression(): ASTNode {
    return this.parseSetUnionDiff();
  }

  private parseSetUnionDiff(): ASTNode {
    let left = this.parseSetIntersect();
    while (this.peek().kind === 'OP_UNION' || this.peek().kind === 'OP_DIFF') {
      const tok = this.consume();
      const right = this.parseSetIntersect();
      const op: BinaryOpKind = tok.kind === 'OP_UNION' ? 'UNION' : 'DIFF';
      const node: ASTNode = {
        id: this.nextId(),
        kind: 'Binary',
        op,
        label: tok.kind === 'OP_UNION' ? 'Hợp (∪)' : 'Trừ (−)',
        latex: '',
        left,
        right,
      };
      node.latex = formatAstToLatex(node);
      left = node;
    }
    return left;
  }

  private parseSetIntersect(): ASTNode {
    let left = this.parseJoinAndDiv();
    while (this.peek().kind === 'OP_INTERSECT') {
      this.consume();
      const right = this.parseJoinAndDiv();
      const node: ASTNode = {
        id: this.nextId(),
        kind: 'Binary',
        op: 'INTERSECT',
        label: 'Giao (∩)',
        latex: '',
        left,
        right,
      };
      node.latex = formatAstToLatex(node);
      left = node;
    }
    return left;
  }

  private parseJoinAndDiv(): ASTNode {
    let left = this.parsePrimary();
    while (
      this.peek().kind === 'OP_CARTESIAN' ||
      this.peek().kind === 'OP_NJOIN' ||
      this.peek().kind === 'OP_LJOIN' ||
      this.peek().kind === 'OP_RJOIN' ||
      this.peek().kind === 'OP_FJOIN' ||
      this.peek().kind === 'OP_DIV'
    ) {
      const tok = this.consume();
      let condition: string | undefined;
      if (
        this.peek().kind === 'SUBSCRIPT' &&
        (tok.kind === 'OP_NJOIN' ||
          tok.kind === 'OP_LJOIN' ||
          tok.kind === 'OP_RJOIN' ||
          tok.kind === 'OP_FJOIN')
      ) {
        condition = this.consume('SUBSCRIPT').value;
      }

      const right = this.parsePrimary();
      let op: BinaryOpKind = 'CARTESIAN';
      let label = 'Tích Đề-các (×)';

      if (tok.kind === 'OP_NJOIN') {
        op = condition ? 'THETA_JOIN' : 'NATURAL_JOIN';
        label = condition ? `Nối Theta (⨝)` : 'Nối Tự nhiên (*)';
      } else if (tok.kind === 'OP_LJOIN') {
        op = 'LEFT_OUTER_JOIN';
        label = 'Nối Ngoài Trái';
      } else if (tok.kind === 'OP_RJOIN') {
        op = 'RIGHT_OUTER_JOIN';
        label = 'Nối Ngoài Phải';
      } else if (tok.kind === 'OP_FJOIN') {
        op = 'FULL_OUTER_JOIN';
        label = 'Nối Ngoài Đầy đủ';
      } else if (tok.kind === 'OP_DIV') {
        op = 'DIVISION';
        label = 'Phép Chia (÷)';
      }

      const node: ASTNode = {
        id: this.nextId(),
        kind: 'Binary',
        op,
        condition,
        label,
        latex: '',
        left,
        right,
      };
      node.latex = formatAstToLatex(node);
      left = node;
    }
    return left;
  }

  private isGroupingPrefix(): boolean {
    if (this.peek(0).kind === 'SUBSCRIPT' && this.peek(1).kind === 'OP_GROUP') {
      return true;
    }
    let offset = 0;
    if (this.peek(offset).kind !== 'IDENT') return false;
    offset += 1;
    while (this.peek(offset).kind === 'COMMA' && this.peek(offset + 1).kind === 'IDENT') {
      offset += 2;
    }
    return this.peek(offset).kind === 'OP_GROUP';
  }

  private parsePrimary(): ASTNode {
    const tok = this.peek();

    if (tok.kind === 'LPAREN') {
      this.consume('LPAREN');
      const inner = this.parseExpression();
      this.consume('RPAREN');
      return inner;
    }

    if (tok.kind === 'OP_SIGMA') {
      this.consume('OP_SIGMA');
      const condition = this.readSubscriptOrParenArg();
      this.consume('LPAREN');
      const child = this.parseExpression();
      this.consume('RPAREN');
      const node: ASTNode = {
        id: this.nextId(),
        kind: 'Selection',
        condition,
        label: 'Chọn (σ)',
        latex: '',
        child,
      };
      node.latex = formatAstToLatex(node);
      return node;
    }

    if (tok.kind === 'OP_PI') {
      this.consume('OP_PI');
      const rawCols = this.readSubscriptOrParenArg();
      const items = parseProjectionItems(rawCols);
      this.consume('LPAREN');
      const child = this.parseExpression();
      this.consume('RPAREN');
      const node: ASTNode = {
        id: this.nextId(),
        kind: 'Projection',
        items,
        label: 'Chiếu (π)',
        latex: '',
        child,
      };
      node.latex = formatAstToLatex(node);
      return node;
    }

    if (tok.kind === 'OP_RHO') {
      this.consume('OP_RHO');
      const rawSpec = this.readSubscriptOrParenArg();
      const spec = parseRenameSpec(rawSpec);
      this.consume('LPAREN');
      const child = this.parseExpression();
      this.consume('RPAREN');
      const node: ASTNode = {
        id: this.nextId(),
        kind: 'Rename',
        newRelationName: spec.newRelationName,
        newAttributes: spec.newAttributes,
        label: 'Đổi tên (ρ)',
        latex: '',
        child,
      };
      node.latex = formatAstToLatex(node);
      return node;
    }

    if (tok.kind === 'OP_GROUP' || this.isGroupingPrefix()) {
      const prefixCols: string[] = [];
      if (this.peek().kind === 'SUBSCRIPT') {
        const subRaw = this.consume('SUBSCRIPT').value;
        prefixCols.push(...splitTopLevelCommas(subRaw));
      } else {
        while (this.peek().kind === 'IDENT') {
          prefixCols.push(this.consume('IDENT').value);
          if (this.peek().kind === 'COMMA') this.consume('COMMA');
        }
      }
      this.consume('OP_GROUP');
      const aggRaw = this.readSubscriptOrParenArg();
      const { inlineGroupBy, aggregates } = parseAggregatesList(aggRaw);
      const groupBy = prefixCols.length > 0 ? prefixCols : inlineGroupBy;
      this.consume('LPAREN');
      const child = this.parseExpression();
      this.consume('RPAREN');
      const node: ASTNode = {
        id: this.nextId(),
        kind: 'Group',
        groupBy,
        aggregates,
        label: 'Gom nhóm (ℱ)',
        latex: '',
        child,
      };
      node.latex = formatAstToLatex(node);
      return node;
    }

    if (tok.kind === 'IDENT') {
      this.consume('IDENT');
      const node: ASTNode = {
        id: this.nextId(),
        kind: 'RelationRef',
        name: tok.value,
        label: tok.value,
        latex: '',
      };
      node.latex = formatAstToLatex(node);
      return node;
    }

    throw new Error(`Biểu thức không hợp lệ tại "${tok.value || 'cuối câu'}".`);
  }
}

export function parseAlgebraExpression(rawExpr: string): ASTNode {
  const tokens = tokenizeAlgebraExpr(rawExpr);
  const parser = new Parser(tokens, rawExpr);
  const ast = parser.parseExpression();
  if (tokens.length > 0) {
    // Ensure parser consumed all non-EOF tokens by checking via trailing tokens?
    // Let's add strict EOF check inside Parser instead!
  }
  return ast;
}

export function parseAlgebraExpressionStrict(rawExpr: string): ASTNode {
  const normalized = rawExpr.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\u2212/g, '-');
  const tokens = tokenizeAlgebraExpr(normalized);
  const parser = new Parser(tokens, normalized);
  const ast = parser.parseExpression();
  const nextTok = (parser as unknown as { peek: () => Token }).peek();
  if (nextTok.kind !== 'EOF') {
    throw new Error(`Thừa ký tự "${nextTok.value}" ở vị trí ${nextTok.pos + 1}.`);
  }
  return ast;
}

function splitProgramStatements(rawProgram: string): string[] {
  const lines = rawProgram
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('--'));

  const statements: string[] = [];
  let buf = '';
  let depth = 0;

  for (const line of lines) {
    for (const ch of line) {
      if (ch === '(' || ch === '{' || ch === '[') depth += 1;
      if (ch === ')' || ch === '}' || ch === ']') depth = Math.max(0, depth - 1);
    }
    buf = buf ? `${buf} ${line}` : line;
    if (depth === 0) {
      statements.push(buf);
      buf = '';
    }
  }
  if (buf) statements.push(buf);
  return statements;
}

export function parseAlgebraProgram(rawProgram: string): ParsedStatement[] {
  const rawStatements = splitProgramStatements(rawProgram);
  if (rawStatements.length === 0) {
    throw new Error('Vui lòng nhập biểu thức Đại số quan hệ.');
  }

  return rawStatements.map((rawStmt, idx) => {
    const assignMatch = rawStmt.match(
      /^([A-Za-z_][A-Za-z0-9_]*)(?:\s*\(([^)]+)\))?\s*(?:←|<-|:=|=)\s*([\s\S]+)$/,
    );

    if (assignMatch) {
      const assignedTo = assignMatch[1].trim();
      const renameColsRaw = assignMatch[2]?.trim();
      const exprPart = assignMatch[3].trim();
      let ast = parseAlgebraExpressionStrict(exprPart);

      if (renameColsRaw) {
        const cols = splitTopLevelCommas(renameColsRaw);
        ast = {
          id: `${ast.id}-assign-rename`,
          kind: 'Rename',
          newRelationName: assignedTo,
          newAttributes: cols,
          label: 'Đổi tên & Gán',
          latex: '',
          child: ast,
        };
        ast.latex = formatAstToLatex(ast);
      }

      return {
        lineNumber: idx + 1,
        rawStatement: rawStmt,
        assignedTo,
        inlineRenameCols: renameColsRaw ? splitTopLevelCommas(renameColsRaw) : undefined,
        ast,
      };
    }

    return {
      lineNumber: idx + 1,
      rawStatement: rawStmt,
      ast: parseAlgebraExpressionStrict(rawStmt),
    };
  });
}
