import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { APP_VERSION } from './version';

describe('STUDYHUB Beta v1.1 Multi-Course iOS Glass Shell Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders clean Home without top nav dock, displays Beta v1.1, and opens Change Logs from recessed footer', () => {
    render(<App />);

    // Top Hero version pill & footer show Beta v1.1 cleanly
    expect(screen.getAllByText(new RegExp(APP_VERSION, 'i')).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/Nhập môn Hệ Cơ sở dữ liệu/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/TEMPLATE-101/i).length).toBeGreaterThanOrEqual(1);

    // Home must NOT show the heavy workspace navigation dock at top
    expect(
      screen.queryByRole('navigation', { name: /Điều hướng phân khu STUDYHUB/i }),
    ).not.toBeInTheDocument();

    // Recessed footer Change Logs button opens ChangelogModal
    const changelogBtn = screen.getByRole('button', { name: /Xem Change Logs/i });
    fireEvent.click(changelogBtn);
    expect(
      screen.getByRole('dialog', { name: /Nhật ký cập nhật phiên bản STUDYHUB/i }),
    ).toBeInTheDocument();
  });

  it('reveals workspace navigation dock on Tham gia học ngay and switches across Learn, Dashboard, Labs, and Exams', () => {
    render(<App />);

    // Enter learning workspace via primary CTA
    fireEvent.click(screen.getByRole('button', { name: /Tham gia học ngay/i }));
    expect(
      screen.getByRole('navigation', { name: /Điều hướng phân khu STUDYHUB/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Dữ liệu, CSDL, Hệ QTCSDL & Nỗi đau của Tệp phẳng/i,
      }),
    ).toBeInTheDocument();

    // Switch to Dashboard -> Study Streak & 56-day heatmap visible
    fireEvent.click(screen.getAllByRole('button', { name: /^Dashboard$/i })[0]);
    expect(screen.getByText(/Study Streak Toàn Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Lịch nhiệt Hoạt động 8 Tuần Gần nhất/i)).toBeInTheDocument();

    // Switch to Labs -> interactive FD / Algebra / SQL tools available
    fireEvent.click(screen.getAllByRole('button', { name: /Phòng Lab/i })[0]);
    expect(screen.getByText(/Máy tính Phụ thuộc hàm & Chuẩn hóa/i)).toBeInTheDocument();

    // Switch to Exam Arena -> LaTeX Final Exam paper visible
    fireEvent.click(screen.getAllByRole('button', { name: /Luyện đề/i })[0]);
    expect(screen.getByText(/Đề Thi Thử Cuối Kỳ Chuẩn Cấu Trúc/i)).toBeInTheDocument();
    expect(screen.getByText(/Phần I\. Trắc nghiệm Chuyên sâu/i)).toBeInTheDocument();
    expect(screen.getByText(/Phần II\. Tự luận Tổng hợp/i)).toBeInTheDocument();

    // Switch back to Learn -> 7-Module deep curriculum opens
    fireEvent.click(screen.getAllByRole('button', { name: /^Học tập$/i })[0]);
    expect(
      screen.getByRole('heading', {
        name: /Dữ liệu, CSDL, Hệ QTCSDL & Nỗi đau của Tệp phẳng/i,
      }),
    ).toBeInTheDocument();
  });
});
