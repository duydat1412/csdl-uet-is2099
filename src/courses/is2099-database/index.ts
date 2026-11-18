import { CURRICULUM_MODULES } from '../../curriculum';
import { CourseManifest } from '../../platform/types';
import { IS2099_FINAL_EXAMS } from './exams';

export const IS2099_COURSE: CourseManifest = {
  id: 'is2099',
  code: 'UET · IS2099',
  title: 'Nhập môn Hệ Cơ sở dữ liệu',
  shortTitle: 'Cơ sở dữ liệu',
  faculty: 'Khoa CNTT — ĐH Công nghệ (ĐHQGHN)',
  semesterTag: 'Trọn bộ Ôn thi Cuối kỳ (C1 → C4_1 + SQL)',
  accentHex: '#007AFF',
  status: 'active',
  summary:
    'Lộ trình 7 Chặng · 31 Bài học chuyên sâu bám sát 100% giáo trình UET: Kiến trúc 3 lược đồ, Thiết kế ER/EER, Ánh xạ Quan hệ, Đại số Quan hệ, Chuẩn hóa 1NF → BCNF và SQL thực chiến.',
  modules: CURRICULUM_MODULES,
  labs: [
    {
      id: 'lab-algebra',
      title: 'Sân chơi Đại số Quan hệ',
      subtitle: 'Biên dịch σ, π, ρ, ⨝, *, ⟕, ⟖, ⟗, ÷, ℱ kèm xem trước LaTeX và giải phẫu Phép chia 4 bước.',
      badge: 'C3_2 · Engine 3',
      engineKind: 'algebra',
      defaultDatasetId: 'CONGTY_EX',
    },
    {
      id: 'lab-normalization',
      title: 'Máy tính Phụ thuộc hàm & Chuẩn hóa',
      subtitle: 'Tính bao đóng X+ từng bước, phân hoạch L/M/R tìm tất cả khóa, Phủ tối tiểu và phân rã BCNF.',
      badge: 'C4_1 · Engine 4',
      engineKind: 'normalization',
    },
    {
      id: 'lab-sql',
      title: 'SQL Sandbox Thực chiến Cuối kỳ',
      subtitle: 'Chạy SELECT DISTINCT, LEFT JOIN, GROUP BY/HAVING, hai tầng NOT EXISTS & kiểm tra DDL CREATE TABLE.',
      badge: 'SQL · Engine 5',
      engineKind: 'sql',
      defaultDatasetId: 'DAOTAO',
    },
    {
      id: 'lab-er-schema',
      title: 'Sơ đồ Vector ER / EER & Ánh xạ',
      subtitle: 'Khám phá sơ đồ UET chuẩn, chuyển đổi tức thì (min, max) ↔ 1:N và ký hiệu chuyên biệt hóa.',
      badge: 'C2–C3_1 · Engine 2',
      engineKind: 'er-schema',
      defaultDiagramId: 'CONGTY_ER',
    },
    {
      id: 'lab-anomaly',
      title: 'Thí nghiệm Dị thường & Ràng buộc',
      subtitle: 'Kích hoạt Dị thường sửa/xóa/chèn bảng gộp và thử nghiệm INSERT / DELETE (REJECT, CASCADE, SET_NULL).',
      badge: 'C1 + C3_2 · Engine 1',
      engineKind: 'anomaly',
      defaultDatasetId: 'DAOTAO_FLAT',
    },
  ],
  exams: IS2099_FINAL_EXAMS,
  formulaSections: [
    {
      id: 'uet-f-algebra',
      title: 'Đại số Quan hệ & Phép chia 4 bước (C3_2)',
      markdownLatex: [
        '$$\\sigma_{F}(R) = \\{t \\in R \\mid F(t) = \\text{true}\\} \\quad;\\quad \\pi_{A_1,\\dots,A_k}(R) \\quad;\\quad \\rho_{S(B_1,\\dots,B_n)}(R)$$',
        '$$R(Z) \\div S(X):\\quad T_1 \\leftarrow \\pi_Y(R) \\;;\\; T_2 \\leftarrow \\pi_Y((S \\times T_1) - R) \\;;\\; T \\leftarrow T_1 - T_2 \\quad (Y = Z - X)$$',
        '$$R \\lojoin S \\;;\\; R \\rojoin S \\;;\\; R \\fojoin S \\quad;\\quad {}_{G_1,\\dots,G_k}\\mathcal{F}_{f_1(A_1),\\dots,f_m(A_m)}(R)$$',
      ].join('\n'),
    },
    {
      id: 'uet-f-fd',
      title: 'Hệ tiên đề Armstrong & Chuẩn hóa 1NF → BCNF (C4_1)',
      markdownLatex: [
        '- **Tiên đề**: Phản xạ ($Y \\subseteq X \\implies X \\to Y$), Gia tăng ($X \\to Y \\implies XZ \\to YZ$), Bắc cầu ($X \\to Y, Y \\to Z \\implies X \\to Z$).',
        '- **Định lý Bảo toàn thông tin tách đôi**: $(R_1 \\cap R_2)^+ \\supseteq R_1$ hoặc $(R_1 \\cap R_2)^+ \\supseteq R_2$.',
        '- **Chuẩn 3NF**: $\\forall X \\to A \\notin \\text{trivial}$: hoặc $X$ là **siêu khóa**, hoặc $A$ là **thuộc tính khóa**.',
        '- **Chuẩn BCNF**: $\\forall X \\to A \\notin \\text{trivial}$: **$X$ bắt buộc là siêu khóa**.',
      ].join('\n'),
    },
    {
      id: 'uet-f-sql',
      title: 'Bản dịch Chuẩn Đại số Quan hệ → SQL Cuối kỳ',
      markdownLatex: [
        '- **Phép Chiếu**: $\\pi_{A}(R) \\iff$ `SELECT DISTINCT A FROM R` (nhớ `DISTINCT` vì SQL giữ dòng trùng!).',
        '- **Phép Chia ($\\div$)**: Viết bằng hai tầng **`WHERE NOT EXISTS (... AND NOT EXISTS (...))`**.',
        '- **Gom nhóm**: `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY` (dùng `COUNT(col)` để bỏ qua `NULL` sau `LEFT JOIN`).',
      ].join('\n'),
    },
  ],
};
