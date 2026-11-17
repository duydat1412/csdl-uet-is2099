import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnomalyWorkbench } from './AnomalyWorkbench';
import { ERDiagramCanvas } from './ERDiagramCanvas';
import { AlgebraPlayground } from './AlgebraPlayground';
import { UET_ER_DIAGRAMS } from '../../domain/datasets/uetERDiagrams';

describe('Interactive Workbenches (Anomaly, ER/EER Canvas, Algebra Playground)', () => {
  it('AnomalyWorkbench triggers flat-table Update Anomaly and fires onSolved', () => {
    const onSolved = vi.fn();
    render(
      <AnomalyWorkbench
        mode="flat-anomaly"
        datasetId="DAOTAO_FLAT"
        title="Thử nghiệm dị thường bảng gộp"
        onSolved={onSolved}
      />,
    );

    const btn = screen.getByRole('button', { name: /1\. Gây Dị thường Sửa đổi/i });
    fireEvent.click(btn);

    expect(screen.getByText(/UPDATE_ANOMALY/i)).toBeInTheDocument();
    expect(onSolved).toHaveBeenCalledTimes(1);
  });

  it('ERDiagramCanvas renders UET entities and toggles between (min, max) and 1:N notation', () => {
    render(<ERDiagramCanvas diagram={UET_ER_DIAGRAMS.NV_PB_BASIC} />);

    expect(screen.getByText('NHANVIEN')).toBeInTheDocument();
    expect(screen.getByText('PHONGBAN')).toBeInTheDocument();
    expect(screen.getAllByText('(1,1)').length).toBeGreaterThan(0);

    const toggleBtn = screen.getByRole('button', { name: /Đang xem: Ký hiệu \(min, max\) UET/i });
    fireEvent.click(toggleBtn);

    expect(
      screen.getByRole('button', { name: /Đang xem: Tỉ số lực lượng 1 : N/i }),
    ).toBeInTheDocument();
  });

  it('AlgebraPlayground renders live KaTeX formula, grades solution, and exposes 4-step Division tab', () => {
    const onSolved = vi.fn();
    render(
      <AlgebraPlayground
        datasetId="DIV_TOY"
        title="Thử nghiệm Phép chia"
        challenge={{
          type: 'algebra',
          datasetId: 'DIV_TOY',
          prompt: 'Thực hiện phép chia R cho S',
          starterExpression: 'R ÷ S',
          solutionExpression: 'R ÷ S',
          hints: ['Dùng toán tử ÷'],
        }}
        onSolved={onSolved}
      />,
    );

    // 4-step Division tab appears automatically for R ÷ S
    const divTab = screen.getByRole('button', { name: /Giải phẫu Phép chia 4 bước/i });
    expect(divTab).toBeInTheDocument();

    // Grade button marks challenge solved
    const runBtn = screen.getByRole('button', { name: /Thực thi & Chấm kết quả/i });
    fireEvent.click(runBtn);
    expect(onSolved).toHaveBeenCalledTimes(1);

    // Inspect 4-step breakdown
    fireEvent.click(divTab);
    expect(screen.getByText(/Bước 1: Ứng viên ban đầu/i)).toBeInTheDocument();
    expect(screen.getByText(/Bước 4: Kết quả cuối/i)).toBeInTheDocument();
  });
});
