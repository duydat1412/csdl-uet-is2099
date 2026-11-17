import React from 'react';
import { MathFormula } from './MathFormula';

interface RichTextProps {
  content: string;
  className?: string;
}

type InlineSegment =
  | { kind: 'text'; value: string }
  | { kind: 'math'; value: string }
  | { kind: 'code'; value: string }
  | { kind: 'bold'; children: InlineSegment[] }
  | { kind: 'italic'; children: InlineSegment[] };

function findClosingCode(text: string, start: number): number {
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === '`') return i;
  }
  return -1;
}

function findClosingDollar(text: string, start: number): number {
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === '\\' && text[i + 1] === '$') {
      i += 1;
      continue;
    }
    if (text[i] === '$') {
      return i;
    }
    if (text[i] === '\n') {
      return -1;
    }
  }
  return -1;
}

function findClosingEmphasis(text: string, start: number, marker: '**' | '*'): number {
  let i = start;
  while (i < text.length) {
    if (text[i] === '\\' && i + 1 < text.length) {
      i += 2;
      continue;
    }
    if (text[i] === '`') {
      const endCode = findClosingCode(text, i + 1);
      if (endCode !== -1) {
        i = endCode + 1;
        continue;
      }
    }
    if (text[i] === '$' && text[i + 1] !== '$') {
      const endMath = findClosingDollar(text, i + 1);
      if (endMath !== -1) {
        i = endMath + 1;
        continue;
      }
    }
    if (marker === '**') {
      if (text[i] === '*' && text[i + 1] === '*') {
        return i;
      }
    } else {
      if (text[i] === '*' && text[i + 1] === '*') {
        // Skip nested bold pair inside italic
        const endBold = findClosingEmphasis(text, i + 2, '**');
        if (endBold !== -1) {
          i = endBold + 2;
          continue;
        }
      }
      if (text[i] === '*' && text[i + 1] !== '*' && text[i - 1] !== ' ') {
        return i;
      }
    }
    i += 1;
  }
  return -1;
}

/**
 * Single-pass recursive inline parser supporting nested bold/italic around `$...$` math and `` `...` `` code,
 * while never allowing `*` or `_` inside `$...$` to trigger Markdown emphasis.
 */
export function tokenizeInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let i = 0;
  let buffer = '';

  const flushBuffer = () => {
    if (buffer) {
      segments.push({ kind: 'text', value: buffer });
      buffer = '';
    }
  };

  while (i < text.length) {
    if (text[i] === '\\' && text[i + 1] === '$') {
      buffer += '$';
      i += 2;
      continue;
    }

    if (text[i] === '`') {
      const endIdx = findClosingCode(text, i + 1);
      if (endIdx !== -1) {
        flushBuffer();
        segments.push({ kind: 'code', value: text.slice(i + 1, endIdx) });
        i = endIdx + 1;
        continue;
      }
    }

    if (text[i] === '$' && text[i + 1] !== '$') {
      const endIdx = findClosingDollar(text, i + 1);
      if (endIdx !== -1) {
        flushBuffer();
        segments.push({ kind: 'math', value: text.slice(i + 1, endIdx) });
        i = endIdx + 1;
        continue;
      }
    }

    if (text[i] === '*' && text[i + 1] === '*') {
      const endIdx = findClosingEmphasis(text, i + 2, '**');
      if (endIdx !== -1 && endIdx > i + 2) {
        flushBuffer();
        segments.push({
          kind: 'bold',
          children: tokenizeInline(text.slice(i + 2, endIdx)),
        });
        i = endIdx + 2;
        continue;
      }
    }

    if (text[i] === '*' && text[i + 1] !== '*' && text[i + 1] !== ' ') {
      const endIdx = findClosingEmphasis(text, i + 1, '*');
      if (endIdx !== -1 && endIdx > i + 1) {
        flushBuffer();
        segments.push({
          kind: 'italic',
          children: tokenizeInline(text.slice(i + 1, endIdx)),
        });
        i = endIdx + 1;
        continue;
      }
    }

    buffer += text[i];
    i += 1;
  }

  flushBuffer();
  return segments;
}

function renderInlineSegments(segments: InlineSegment[], keyPrefix: string): React.ReactNode {
  return segments.map((seg, idx) => {
    const key = `${keyPrefix}-${idx}`;
    switch (seg.kind) {
      case 'text':
        return <React.Fragment key={key}>{seg.value}</React.Fragment>;
      case 'math':
        return <MathFormula key={key} tex={seg.value} />;
      case 'code':
        return (
          <code
            key={key}
            className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 font-mono text-[0.88em] text-[var(--accent-primary)] border border-[var(--border-subtle)]"
          >
            {seg.value}
          </code>
        );
      case 'bold':
        return (
          <strong key={key} className="font-semibold text-[var(--text-primary)]">
            {renderInlineSegments(seg.children, key)}
          </strong>
        );
      case 'italic':
        return (
          <em key={key} className="italic">
            {renderInlineSegments(seg.children, key)}
          </em>
        );
    }
  });
}

type BlockNode =
  | { kind: 'displayMath'; tex: string }
  | { kind: 'heading'; level: 3 | 4; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | { kind: 'paragraph'; text: string };

function parseBlocks(raw: string): BlockNode[] {
  const blocks: BlockNode[] = [];
  const normalized = raw.replace(/\r\n/g, '\n').trim();
  // Split out display math blocks $$...$$
  const parts: Array<{ isMath: boolean; value: string }> = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    const openIdx = normalized.indexOf('$$', cursor);
    if (openIdx === -1) {
      parts.push({ isMath: false, value: normalized.slice(cursor) });
      break;
    }
    if (openIdx > cursor) {
      parts.push({ isMath: false, value: normalized.slice(cursor, openIdx) });
    }
    const closeIdx = normalized.indexOf('$$', openIdx + 2);
    if (closeIdx === -1) {
      parts.push({ isMath: false, value: normalized.slice(openIdx) });
      break;
    }
    parts.push({ isMath: true, value: normalized.slice(openIdx + 2, closeIdx).trim() });
    cursor = closeIdx + 2;
  }

  for (const part of parts) {
    if (part.isMath) {
      if (part.value) {
        blocks.push({ kind: 'displayMath', tex: part.value });
      }
      continue;
    }

    const lines = part.value.split('\n');
    let idx = 0;
    while (idx < lines.length) {
      const line = lines[idx].trim();
      if (!line) {
        idx += 1;
        continue;
      }

      if (line.startsWith('#### ')) {
        blocks.push({ kind: 'heading', level: 4, text: line.slice(5).trim() });
        idx += 1;
        continue;
      }

      if (line.startsWith('### ')) {
        blocks.push({ kind: 'heading', level: 3, text: line.slice(4).trim() });
        idx += 1;
        continue;
      }

      if (line.startsWith('|') && idx + 1 < lines.length && /^\|[\s:|-]+\|?$/.test(lines[idx + 1].trim())) {
        const parseRow = (rowStr: string): string[] =>
          rowStr
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((cell) => cell.trim());
        const headers = parseRow(line);
        idx += 2;
        const rows: string[][] = [];
        while (idx < lines.length && lines[idx].trim().startsWith('|')) {
          rows.push(parseRow(lines[idx]));
          idx += 1;
        }
        blocks.push({ kind: 'table', headers, rows });
        continue;
      }

      if (/^[-•]\s+/.test(line)) {
        const items: string[] = [];
        while (idx < lines.length && /^[-•]\s+/.test(lines[idx].trim())) {
          items.push(lines[idx].trim().replace(/^[-•]\s+/, ''));
          idx += 1;
        }
        blocks.push({ kind: 'ul', items });
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        const items: string[] = [];
        while (idx < lines.length && /^\d+\.\s+/.test(lines[idx].trim())) {
          items.push(lines[idx].trim().replace(/^\d+\.\s+/, ''));
          idx += 1;
        }
        blocks.push({ kind: 'ol', items });
        continue;
      }

      const paraLines: string[] = [];
      while (
        idx < lines.length &&
        lines[idx].trim() !== '' &&
        !lines[idx].trim().startsWith('### ') &&
        !lines[idx].trim().startsWith('#### ') &&
        !/^[-•]\s+/.test(lines[idx].trim()) &&
        !/^\d+\.\s+/.test(lines[idx].trim()) &&
        !lines[idx].trim().startsWith('|')
      ) {
        paraLines.push(lines[idx].trim());
        idx += 1;
      }
      blocks.push({ kind: 'paragraph', text: paraLines.join(' ') });
    }
  }

  return blocks;
}

export const RichText: React.FC<RichTextProps> = ({ content, className = '' }) => {
  const blocks = React.useMemo(() => parseBlocks(content), [content]);

  return (
    <div className={`space-y-3 text-[15px] leading-[1.7] text-[var(--text-primary)] ${className}`}>
      {blocks.map((block, idx) => {
        const key = `blk-${idx}`;
        switch (block.kind) {
          case 'displayMath':
            return <MathFormula key={key} tex={block.tex} displayMode />;
          case 'heading':
            return block.level === 3 ? (
              <h3 key={key} className="pt-1 text-base font-semibold text-[var(--text-primary)]">
                {renderInlineSegments(tokenizeInline(block.text), key)}
              </h3>
            ) : (
              <h4 key={key} className="pt-0.5 text-[15px] font-semibold text-[var(--text-primary)]">
                {renderInlineSegments(tokenizeInline(block.text), key)}
              </h4>
            );
          case 'ul':
            return (
              <ul key={key} className="list-disc space-y-1.5 pl-5 text-[var(--text-secondary)]">
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{renderInlineSegments(tokenizeInline(item), `${key}-${i}`)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key} className="list-decimal space-y-1.5 pl-5 text-[var(--text-secondary)]">
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{renderInlineSegments(tokenizeInline(item), `${key}-${i}`)}</li>
                ))}
              </ol>
            );
          case 'table':
            return (
              <div key={key} className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] text-[var(--text-primary)]">
                    <tr>
                      {block.headers.map((h, i) => (
                        <th key={`${key}-h-${i}`} className="border-b border-[var(--border-subtle)] px-3 py-2 font-semibold">
                          {renderInlineSegments(tokenizeInline(h), `${key}-h-${i}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rIdx) => (
                      <tr key={`${key}-r-${rIdx}`} className="border-b border-[var(--border-subtle)] last:border-b-0">
                        {row.map((cell, cIdx) => (
                          <td key={`${key}-r-${rIdx}-c-${cIdx}`} className="px-3 py-2 text-[var(--text-secondary)]">
                            {renderInlineSegments(tokenizeInline(cell), `${key}-r-${rIdx}-c-${cIdx}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'paragraph':
            return (
              <p key={key} className="text-[var(--text-primary)]">
                {renderInlineSegments(tokenizeInline(block.text), key)}
              </p>
            );
        }
      })}
    </div>
  );
};
