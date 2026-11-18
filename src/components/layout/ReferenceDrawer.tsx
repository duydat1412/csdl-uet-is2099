import React, { useEffect, useState } from 'react';
import { BookOpen, GitFork, Layers, Sigma, Table2, X } from 'lucide-react';
import { MathFormula } from '../common/MathFormula';
import { RichText } from '../common/RichText';

export interface ReferenceDrawerProps {
  open: boolean;
  onClose: () => void;
}

type RefTab = 'algebra' | 'norm-sql' | 'er' | 'mapping';

export const ReferenceDrawer: React.FC<ReferenceDrawerProps> = ({ open, onClose }) => {
  const [tab, setTab] = useState<RefTab>('algebra');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end"
      style={{ backgroundColor: 'rgb(15 23 42 / 0.42)' }}
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sổ tay Ký hiệu và Công thức chuẩn UET"
        className="h-full w-full max-w-xl overflow-y-auto flex flex-col"
        style={{
          backgroundColor: 'var(--bg-surface-solid)',
          borderLeft: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 px-5 py-3.5 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-surface-solid)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h2 className="text-sm font-bold leading-tight">Sổ tay Ký hiệu & Công thức UET</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Chuẩn bài giảng Nhập môn Cơ sở dữ liệu (C1 → C4_1 &amp; SQL)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng sổ tay"
            className="p-1.5 rounded-md transition-colors cursor-pointer"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="px-5 pt-3 pb-0 border-b flex flex-wrap gap-1.5"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {[
            { id: 'algebra' as const, label: 'Đại số QH (C3_2)', Icon: Sigma },
            { id: 'norm-sql' as const, label: 'Chuẩn hóa & SQL (C4_1)', Icon: GitFork },
            { id: 'er' as const, label: 'ER & EER (C2)', Icon: Layers },
            { id: 'mapping' as const, label: 'Ánh xạ ER → Bảng (C3_1)', Icon: Table2 },
          ].map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer"
                style={{
                  borderColor: active ? 'var(--accent-primary)' : 'transparent',
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-5 space-y-5 text-sm leading-relaxed">
          {tab === 'algebra' && (
            <>
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                  1. Phép toán một ngôi & Đổi tên (C3_2 tr. 26–49)
                </h3>
                <div
                  className="rounded-lg p-3.5 space-y-2.5 border"
                  style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
                >
                  <div>
                    <div className="font-semibold text-xs mb-1">Phép chọn (Selection — lọc ngang các bộ)</div>
                    <MathFormula tex="\sigma_{F}(R) = \{ t \in R \mid F(t) = \text{true} \}" displayMode />
                  </div>
                  <div>
                    <div className="font-semibold text-xs mb-1">Phép chiếu (Projection — trích cột & tự động khử trùng tập hợp)</div>
                    <MathFormula tex="\pi_{A_1, A_2, \dots, A_k}(R)" displayMode />
                  </div>
                  <div>
                    <div className="font-semibold text-xs mb-1">Phép gán & Phép đổi tên (Assignment & Rename)</div>
                    <MathFormula tex="T \leftarrow E \quad;\quad \rho_{S(B_1, \dots, B_n)}(R)" displayMode />
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                  2. Tập hợp, Đề-các & Các phép Nối (C3_2 tr. 18–67, 100–106)
                </h3>
                <div
                  className="rounded-lg p-3.5 space-y-2.5 border"
                  style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
                >
                  <RichText
                    content={[
                      '- **Khả hợp (Union Compatibility)**: $R(A_1,\\dots,A_n)$ và $S(B_1,\\dots,B_m)$ khả hợp khi $n = m$ và $\\Dom(A_i) = \\Dom(B_i)$ với mọi $1 \\le i \\le n$.',
                      '- **Hợp, Giao, Trừ**: $R \\cup S$, $R \\cap S$, $R - S$ (chú ý $R - S \\ne S - R$).',
                      '- **Tích Đề-các & Nối có điều kiện**: $R \\times S$ và $R \\bowtie_{F} S = \\sigma_{F}(R \\times S)$.',
                      '- **Nối tự nhiên (Natural Join)**: $R * S$ tự động bằng trên mọi thuộc tính trùng tên và **giữ lại 1 cột chung** (làm rơi bộ có `null` ở cột nối).',
                      '- **Nối ngoài (Outer Joins)**: Trái $R \\lojoin S$, Phải $R \\rojoin S$, Đầy đủ $R \\fojoin S$ (giữ bộ lẻ đôi bằng `null`).',
                    ].join('\n')}
                  />
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                  3. Phép chia 4 bước & Hàm gộp nhóm (C3_2 tr. 79–98)
                </h3>
                <div
                  className="rounded-lg p-3.5 space-y-2 border"
                  style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
                >
                  <div className="text-xs font-semibold">
                    <RichText content="Phép chia $R(Z) \div S(X)$ với $X \subseteq Z$ và $Y = Z - X$:" />
                  </div>
                  <MathFormula
                    tex="T_1 \leftarrow \pi_Y(R) \;;\; T_2 \leftarrow \pi_Y((S \times T_1) - R) \;;\; T \leftarrow T_1 - T_2"
                    displayMode
                  />
                  <div className="text-xs font-semibold pt-1">
                    <RichText content="Gom nhóm & Hàm tập hợp ($\text{COUNT}(A)$ bỏ qua `null`, còn $\text{COUNT}(*)$ đếm mọi bộ):" />
                  </div>
                  <MathFormula
                    tex="{}_{G_1, \dots, G_k}\mathcal{F}_{f_1(A_1), \dots, f_m(A_m)}(R)"
                    displayMode
                  />
                </div>
              </section>
            </>
          )}

          {tab === 'er' && (
            <section className="space-y-3">
              <div
                className="rounded-lg p-3.5 border space-y-2"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                  Ký hiệu sơ đồ ER / EER chuẩn bài giảng UET
                </h3>
                <RichText
                  content={[
                    '| Khái niệm | Ký hiệu trên slide UET | Ví dụ tiêu biểu |',
                    '| --- | --- | --- |',
                    '| Kiểu thực thể mạnh | Hình chữ nhật nét đơn | `NHANVIEN`, `PHONGBAN` |',
                    '| Kiểu thực thể yếu | Hình chữ nhật **nét đôi** + liên kết xác định **thoi nét đôi** | `THANNHAN` phụ thuộc `NHANVIEN` |',
                    '| Thuộc tính khóa | Hình bầu dục, tên **gạch chân nét liền** | $\\underline{\\text{MANV}}$ |',
                    '| Khóa bộ phận (Partial Key) | Hình bầu dục, tên **gạch chân nét đứt** | `TEN_TN` của `THANNHAN` |',
                    '| Thuộc tính đa trị | Hình bầu dục **nét đôi** | `DIADIEM` của `PHONGBAN`, `BANGCAP` |',
                    '| Thuộc tính dẫn xuất | Hình bầu dục **nét đứt** | `TUOI`, `TONG_NV` |',
                    '| Ràng buộc $(\\min, \\max)$ | Đặt **ngay sát thực thể đang xét** (ngược phía với $1:N$ cổ điển) | `NV (1,1) — Lam_viec — (1,n) PB` |',
                    '| Chuyên biệt hóa EER | Vòng tròn `(d)` rời rạc / `(o)` chồng lấn / `(u)` hội + ký hiệu $\\subset$ trên nhánh con | `NHANVIEN` $\\to$ `THUKY`, `KYSU` |',
                  ].join('\n')}
                />
              </div>
            </section>
          )}

          {tab === 'mapping' && (
            <section className="space-y-3">
              <div
                className="rounded-lg p-3.5 border space-y-2"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
              >
                  <div className="text-xs font-semibold">
                    <RichText content="7 Quy tắc vàng chuyển ER/EER sang Lược đồ Quan hệ (C3_1 tr. 26–40)" />
                  </div>
                <RichText
                  content={[
                    '1. **Thực thể mạnh**: Tạo bảng mới, giữ các thuộc tính đơn; tách thuộc tính phức hợp thành các thuộc tính thành phần đơn.',
                    '2. **Thực thể yếu $W$ (chủ $E$)**: Tạo bảng cho $W$, đưa khóa chính của $E$ vào làm khóa ngoại, **khóa chính của $W$ = $\\text{PK}(E) \\cup \\text{PartialKey}(W)$**.',
                    '3. **Liên kết $1:1$**: Đưa khóa chính bên tham gia bộ phận $(0,1)$ sang bên tham gia toàn bộ $(1,1)$ làm khóa ngoại (hoặc gộp bảng nếu cả hai đều $(1,1)$).',
                    '4. **Liên kết $1:N$**: **Luôn lấy khóa chính của phía $1$ chép sang phía $N$** làm khóa ngoại (kèm các thuộc tính riêng của liên kết). Tuyệt đối không chép ngược lại!',
                    '5. **Liên kết $N:M$**: Bắt buộc tách thành **bảng liên kết mới** có khóa chính là cặp khóa ngoại từ hai thực thể.',
                    '6. **Thuộc tính đa trị $A$**: Tách thành bảng mới có khóa chính gồm $(\\text{PK}(E), A)$.',
                    '7. **Liên kết bậc $n \\ge 3$ & Kế thừa EER**: Liên kết $n$-ngôi tách bảng mới; lớp con EER nhận lại khóa chính của lớp cha làm cả `PK` lẫn `FK` (hoặc gộp theo tùy chọn 8A–8D).',
                  ].join('\n')}
                />
              </div>
            </section>
          )}

          {tab === 'norm-sql' && (
            <section className="space-y-3">
              <div
                className="rounded-lg p-3.5 border space-y-2.5"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                  Phụ thuộc hàm &amp; Các Dạng chuẩn 1NF → BCNF (C4_1.pdf)
                </h3>
                <RichText
                  content={[
                    '- **Tiên đề Armstrong**: Phản xạ ($Y \\subseteq X \\implies X \\to Y$), Gia tăng ($X \\to Y \\implies XZ \\to YZ$), Bắc cầu ($X \\to Y, Y \\to Z \\implies X \\to Z$).',
                    '- **Tìm khóa theo $(L, M, R)$**: Nhóm chỉ ở vế trái/cô lập ($L$) bắt buộc nằm trong mọi khóa; ghép dần các phần tử ở nhóm hai vế ($M$) đến khi $K^+ = R$.',
                    '- **Tách nhị phân Bảo toàn thông tin**: $(R_1 \\cap R_2)^+ \\supseteq R_1$ hoặc $(R_1 \\cap R_2)^+ \\supseteq R_2$.',
                    '- **Chuẩn 3NF vs BCNF**: Với mọi $X \\to A$ không tầm thường, **3NF** cho phép $X$ là siêu khóa *hoặc* $A$ là thuộc tính khóa; **BCNF** bắt buộc **$X$ phải là siêu khóa**.',
                  ].join('\n')}
                />
              </div>

              <div
                className="rounded-lg p-3.5 border space-y-2"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                  Quy đổi Chuẩn sang SQL Cuối kỳ
                </h3>
                <RichText
                  content={[
                    '- **Phép chiếu $\\pi$**: `SELECT DISTINCT ...` (SQL không tự khử trùng).',
                    '- **Thứ tự 6 mệnh đề SQL**: `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`.',
                    '- **Phép chia $R \\div S$**: Dùng hai tầng **`WHERE NOT EXISTS (... AND NOT EXISTS (...))`**.',
                  ].join('\n')}
                />
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
};
