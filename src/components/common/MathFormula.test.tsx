import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MathFormula } from './MathFormula';
import { RichText, tokenizeInline } from './RichText';

describe('MathFormula & RichText (UET LaTeX + Vietnamese support)', () => {
  it('renders UET relational algebra operators via KaTeX without errors', () => {
    const { container } = render(
      <MathFormula
        tex={String.raw`\pi_{\text{HONV}, \text{TENNV}}(\sigma_{\text{PHG}=4 \land \text{LUONG}>25000}(\text{NHANVIEN}))`}
        displayMode
      />,
    );
    expect(container.querySelector('.katex-display')).toBeInTheDocument();
    expect(container.textContent).toContain('HONV');
    expect(container.textContent).toContain('NHANVIEN');
  });

  it('renders custom UET outer join, grouping F, and Vietnamese strings cleanly', () => {
    const { container } = render(
      <MathFormula
        tex={String.raw`\text{SINHVIEN} \lojoin_{\text{Lop}=\text{Malop}} \text{LOP} \quad \GF{\text{MAPHG}}{\text{COUNT}(*), \text{AVG}(\text{LUONG})}(\text{NHANVIEN}) \quad \text{“Lê Đức Hòa”}`}
      />,
    );
    expect(container.querySelector('.katex')).toBeInTheDocument();
    expect(container.textContent).toContain('Lê Đức Hòa');
    expect(container.textContent).toContain('MAPHG');
  });

  it('preserves * inside inline math without breaking Markdown italics', () => {
    const tokens = tokenizeInline('Phép nối tự nhiên $R * S$ và *nhấn mạnh* kết quả.');
    expect(tokens.some((t) => t.kind === 'math' && t.value === 'R * S')).toBe(true);
    expect(tokens.some((t) => t.kind === 'italic')).toBe(true);

    const { container } = render(<RichText content="Phép nối tự nhiên $R * S$ và *nhấn mạnh* kết quả." />);
    expect(container.querySelectorAll('.katex').length).toBe(1);
    expect(container.querySelector('em')?.textContent).toBe('nhấn mạnh');
  });
});
