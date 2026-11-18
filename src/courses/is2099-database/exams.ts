import { ExamPaperSpec } from '../../platform/types';

export const IS2099_FINAL_EXAMS: ExamPaperSpec[] = [
  {
    id: 'is2099-final-01',
    code: 'ĐỀ MẪU 01',
    title: 'Đề Thi Thử Cuối Kỳ Chuẩn Cấu Trúc UET.IS2099',
    durationMinutes: 90,
    semesterLabel: 'Học kỳ II · 90 phút · Trắc nghiệm + Tự luận (10.0 điểm)',
    description:
      'Bao phủ toàn bộ 7 Chặng ôn thi cuối kỳ: Thiết kế & Ánh xạ ER/EER, Đại số Quan hệ, SQL (GROUP BY / NOT EXISTS), Tìm khóa, Bao đóng X+ và Chuẩn hóa 1NF → BCNF.',
    mcqQuestions: [
      {
        id: 'f1-mcq-1',
        topicTag: 'Kiến trúc 3 Lược đồ (C1)',
        points: 0.5,
        prompt:
          'Việc Quản trị viên (DBA) thay đổi cấu trúc lưu trữ vật lý từ `Heap File` sang `B+Tree Index` trên bảng `NHANVIEN` mà không phải viết lại Lược đồ Quan niệm hay ứng dụng minh họa tính chất nào?',
        options: [
          {
            id: 'a',
            label: 'Độc lập dữ liệu vật lý (*Physical Data Independence*)',
            explanation: 'Chính xác! Thay đổi Mức trong (lưu trữ vật lý/chỉ mục) không ảnh hưởng Mức quan niệm chính là Độc lập dữ liệu vật lý.',
          },
          {
            id: 'b',
            label: 'Độc lập dữ liệu logic (*Logical Data Independence*)',
            explanation: 'Độc lập logic là thay đổi cấu trúc bảng ở Mức quan niệm mà không làm hỏng Khung nhìn (Mức ngoài).',
          },
          {
            id: 'c',
            label: 'Toàn vẹn tham chiếu (*Referential Integrity*)',
            explanation: 'Toàn vẹn tham chiếu là ràng buộc giá trị Khóa ngoại trỏ tới Khóa chính tồn tại.',
          },
        ],
        correctOptionId: 'a',
      },
      {
        id: 'f1-mcq-2',
        topicTag: 'Sơ đồ ER & (min, max) (C2_1)',
        points: 0.5,
        prompt:
          'Xét quy tắc: *"Mỗi Khoa có tối thiểu 1 và tối đa nhiều Giảng viên; mỗi Giảng viên bắt buộc công tác tại đúng 1 Khoa"*. Theo ký hiệu $(\\min, \\max)$ chuẩn UET đặt **ngay sát mỗi thực thể**, cách ghi nào đúng?',
        options: [
          {
            id: 'a',
            label: '`KHOA (1,1) — Cong_tac — (1,n) GIANGVIEN`',
            explanation: 'Bị ngược chiều! Đây là bẫy đặt tỉ số lực lượng 1:N cổ điển vào vị trí của (min, max).',
          },
          {
            id: 'b',
            label: '`KHOA (1,n) — Cong_tac — (1,1) GIANGVIEN`',
            explanation: 'Chính xác! Đứng ở 1 Khoa có 1..n Giảng viên → ghi (1,n) cạnh KHOA; 1 Giảng viên thuộc 1 Khoa → ghi (1,1) cạnh GIANGVIEN.',
          },
          {
            id: 'c',
            label: '`KHOA (0,n) — Cong_tac — (0,1) GIANGVIEN`',
            explanation: 'Sai min: đề bài nói "tối thiểu 1" và "bắt buộc đúng 1", tức tham gia toàn bộ (1,...).',
          },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'f1-mcq-3',
        topicTag: 'Mô hình EER (C2_2)',
        points: 0.5,
        prompt:
          'Trong trường đại học, mọi thành viên lưu trong bảng `NGUOI` bắt buộc phải là `SINHVIEN` hoặc `CANBO` (không có ai khác), và một cán bộ trẻ vẫn có thể đang học thêm cao học (vừa là `CANBO` vừa là `SINHVIEN`). Phép chuyên biệt hóa dùng ký hiệu nào?',
        options: [
          {
            id: 'a',
            label: 'Vòng tròn `(d)` kết hợp nét đơn (*Disjoint + Partial*)',
            explanation: 'Sai cả hai trục: vừa có người đồng thời thuộc 2 lớp con, vừa bắt buộc ai cũng phải thuộc ít nhất 1 lớp con.',
          },
          {
            id: 'b',
            label: 'Vòng tròn `(o)` kết hợp nét đôi (*Overlapping + Total*)',
            explanation: 'Hoàn toàn chuẩn xác! (o) cho phép giao nhau, nét đôi bắt buộc mọi cá thể cha thuộc ít nhất 1 lớp con.',
          },
          {
            id: 'c',
            label: 'Vòng tròn `(u)` (*Union Type*)',
            explanation: '(u) dùng cho lớp con gom từ nhiều lớp cha khác nguồn/khác khóa nhau.',
          },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'f1-mcq-4',
        topicTag: 'Đại số Quan hệ vs SQL (C3_2 & SQL)',
        points: 0.5,
        prompt:
          'Biểu thức Đại số quan hệ $\\pi_{\\text{PHG}}(\\text{NHANVIEN})$ tương đương với câu truy vấn SQL nào dưới đây trên bảng có 6 nhân viên chia ở 3 phòng `1, 4, 5`?',
        options: [
          {
            id: 'a',
            label: '`SELECT PHG FROM NHANVIEN` (trả về 6 dòng)',
            explanation: 'Sai: SQL mặc định dùng Bag (giữ bản sao trùng), còn phép Chiếu π trong Đại số quan hệ tự khử trùng tập hợp!',
          },
          {
            id: 'b',
            label: '`SELECT DISTINCT PHG FROM NHANVIEN` (trả về 3 dòng)',
            explanation: 'Chính xác! Phải thêm DISTINCT thì SQL mới trả về tập hợp khử trùng giống hệt phép Chiếu π.',
          },
          {
            id: 'c',
            label: '`SELECT COUNT(PHG) FROM NHANVIEN`',
            explanation: 'Sai: COUNT trả về 1 giá trị vô hướng đếm số lượng.',
          },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'f1-mcq-5',
        topicTag: 'Phụ thuộc hàm & Bao đóng (C4_1)',
        points: 0.5,
        prompt:
          'Cho $R(A, B, C, D)$ và $F = \\{AB \\to C,\\; C \\to D,\\; D \\to A\\}$. Khẳng định nào sau đây về tập Khóa dự tuyển của $R$ là **ĐÚNG**?',
        options: [
          {
            id: 'a',
            label: 'Chỉ có duy nhất 1 khóa dự tuyển là `{A, B}`.',
            explanation: 'Thiếu khóa! B ở nguồn L, còn A, C, D ở M: ta có BC+ = {B,C,D,A} = R và BD+ = {B,D,A,C} = R nên có tới 3 khóa!',
          },
          {
            id: 'b',
            label: 'Có 3 khóa dự tuyển là **`AB`**, **`BC`** và **`BD`**.',
            explanation: 'Chính xác tuyệt đối! L = {B} nên mọi khóa đều chứa B; ghép lần lượt A, C, D đều thu được bao đóng bằng R.',
          },
          {
            id: 'c',
            label: 'Tập `{B}` là khóa dự tuyển vì $B$ nằm trong nhóm nguồn $L$.',
            explanation: 'Sai: B+ = {B} ≠ R vì không có PTH nào có vế trái chỉ là {B}.',
          },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'f1-mcq-6',
        topicTag: 'Dạng chuẩn 3NF vs BCNF (C4_1)',
        points: 0.5,
        prompt:
          'Cho $R(A, B, C)$ với $F = \\{AB \\to C,\\; C \\to B\\}$. Dạng chuẩn cao nhất mà lược đồ $R$ đạt được là gì?',
        options: [
          {
            id: 'a',
            label: 'Chỉ đạt `1NF`',
            explanation: 'Sai: Các khóa là AB và AC → mọi thuộc tính A, B, C đều là thuộc tính khóa nên đạt cả 2NF và 3NF.',
          },
          {
            id: 'b',
            label: 'Đạt **`3NF`** nhưng **KHÔNG đạt `BCNF`**',
            explanation: 'Chính xác! Cả AB và AC là khóa → C→B có vế phải B là thuộc tính khóa (nên đạt 3NF), nhưng C chưa là siêu khóa (vi phạm BCNF).',
          },
          {
            id: 'c',
            label: 'Đạt hoàn chỉnh **`BCNF`**',
            explanation: 'Sai: Với C → B, C+ = {C, B} ≠ R nên C không phải siêu khóa, vi phạm BCNF.',
          },
        ],
        correctOptionId: 'b',
      },
    ],
    writtenProblems: [
      {
        id: 'f1-w1',
        title: 'Câu 1: Thiết kế & Ánh xạ ER sang Lược đồ Quan hệ',
        topicTag: 'ER & Ánh xạ (C2_1 + C3_1)',
        totalPoints: 2.5,
        contextMarkdownLatex:
          'Một hệ thống Quản lý Đặt phòng Khách sạn cần lưu:\n- **Khách sạn (`KHACHSAN`)**: Mã KS (`MaKS` duy nhất), Tên KS, Địa chỉ (phức hợp: Số nhà, Đường, Thành phố), nhiều Số điện thoại (`SDT`).\n- **Phòng (`PHONG`)**: Số phòng (`SoPhong` — chỉ duy nhất trong phạm vi từng khách sạn, ví dụ cả KS A và KS B đều có phòng `101`), Loại phòng, Giá thuê.\n- **Khách hàng (`KHACH`)**: Mã khách (`MaKH`), Họ tên, CCCD.\n- Mỗi khách hàng có thể đặt thuê nhiều phòng với **Ngày nhận** và **Ngày trả** cụ thể; một phòng cũng có thể được nhiều khách đặt qua các khoảng thời gian khác nhau.',
        subparts: [
          {
            id: 'f1-w1-a',
            label: 'a)',
            points: 1.0,
            prompt:
              'Xác định rõ các kiểu Thực thể (Mạnh/Yếu), thuộc tính đặc biệt và cặp ràng buộc $(\\min, \\max)$ cho hai liên kết `Co_phong` (`KHACHSAN` — `PHONG`) và `Dat_phong` (`KHACH` — `PHONG`).',
            solutionMarkdownLatex:
              '1. **`KHACHSAN`**: Thực thể mạnh (`MaKS` gạch chân liền PK; `DiaChi` phức hợp tách `SoNha, Duong, ThanhPho`; `SDT` bầu dục **nét đôi** đa trị).\n2. **`PHONG`**: **Thực thể yếu** (chữ nhật nét đôi) phụ thuộc thực thể chủ `KHACHSAN`; `SoPhong` là **khóa bộ phận** (gạch chân nét đứt). Liên kết xác định `Co_phong` vẽ hình thoi nét đôi: `KHACHSAN (1,n) — Co_phong — (1,1) PHONG`.\n3. **`KHACH` & Liên kết `Dat_phong`**: `KHACH (0,n) — Dat_phong — (0,n) PHONG` (kiểu $N:M$), có 2 thuộc tính liên kết `NgayNhan`, `NgayTra`.',
            gradingNotes:
              'Đúng thực thể yếu PHONG + khóa bộ phận SoPhong (0.4đ); đúng đa trị SDT & phức hợp DiaChi (0.3đ); đúng (min,max) không ngược chiều (0.3đ).',
          },
          {
            id: 'f1-w1-b',
            label: 'b)',
            points: 1.5,
            prompt:
              'Chuyển toàn bộ thiết kế trên sang Lược đồ Quan hệ (gạch chân Khóa chính và chỉ rõ Khóa ngoại `FK`).',
            solutionMarkdownLatex:
              '- $\\text{KHACHSAN}(\\underline{\\text{MaKS}}, \\text{TenKS}, \\text{SoNha}, \\text{Duong}, \\text{ThanhPho})$\n- $\\text{KS\\_SDT}(\\underline{\\text{MaKS}}, \\underline{\\text{SDT}})$ với `FK: MaKS → KHACHSAN(MaKS)`\n- $\\text{PHONG}(\\underline{\\text{MaKS}}, \\underline{\\text{SoPhong}}, \\text{LoaiPhong}, \\text{GiaThue})$ với `FK: MaKS → KHACHSAN(MaKS)`\n- $\\text{KHACH}(\\underline{\\text{MaKH}}, \\text{HoTen}, \\text{CCCD})$\n- $\\text{DATPHONG}(\\underline{\\text{MaKS}}, \\underline{\\text{SoPhong}}, \\underline{\\text{MaKH}}, \\underline{\\text{NgayNhan}}, \\text{NgayTra})$ với `FK1: (MaKS, SoPhong) → PHONG(MaKS, SoPhong)` và `FK2: MaKH → KHACH(MaKH)`.',
            gradingNotes:
              'Tách bảng KS_SDT cho đa trị (0.3đ); PHONG lấy ghép PK(MaKS, SoPhong) (0.5đ); DATPHONG nối được khóa ghép từ PHONG + KHACH + NgayNhan (0.7đ).',
          },
        ],
      },
      {
        id: 'f1-w2',
        title: 'Câu 2: Truy vấn Đại số Quan hệ & SQL (C3_2 + SQL)',
        topicTag: 'Đại số & SQL',
        totalPoints: 2.5,
        contextMarkdownLatex:
          'Cho CSDL Quản lý Đề án Công ty gồm:\n- $\\text{NHANVIEN}(\\underline{\\text{MANV}}, \\text{HONV}, \\text{TENNV}, \\text{LUONG}, \\text{MADV})$\n- $\\text{DONVI}(\\underline{\\text{MADV}}, \\text{TENDV}, \\text{MANQL})$\n- $\\text{DEAN}(\\underline{\\text{MADA}}, \\text{TENDA}, \\text{MADV})$\n- $\\text{NV\\_DEAN}(\\underline{\\text{MANV}}, \\underline{\\text{MADA}}, \\text{SOGIO})$',
        subparts: [
          {
            id: 'f1-w2-a',
            label: 'a)',
            points: 1.0,
            prompt:
              'Viết biểu thức **Đại số Quan hệ** cho biết `MANV, TENNV` của những nhân viên tham gia **tất cả các đề án do đơn vị có tên `\'Nghiên cứu\'` chủ trì**.',
            solutionMarkdownLatex:
              '$$\\text{DV\\_NC} \\leftarrow \\pi_{\\text{MADV}}(\\sigma_{\\text{TENDV}=\\text{\'Nghiên cứu\'}}(\\text{DONVI}))$$\n$$\\text{DA\\_NC} \\leftarrow \\pi_{\\text{MADA}}(\\text{DEAN} * \\text{DV\\_NC})$$\n$$\\text{NV\\_DA} \\leftarrow \\pi_{\\text{MANV, MADA}}(\\text{NV\\_DEAN}) \\quad \\text{(Bắt buộc bỏ cột SOGIO!)}$$\n$$\\text{KQ} \\leftarrow \\pi_{\\text{MANV, TENNV}}((\\text{NV\\_DA} \\div \\text{DA\\_NC}) * \\text{NHANVIEN})$$',
            gradingNotes:
              'Quên chiếu bỏ cột SOGIO trước phép chia ÷ bị trừ 0.4đ vì kết quả sẽ rỗng!',
          },
          {
            id: 'f1-w2-b',
            label: 'b)',
            points: 1.5,
            prompt:
              'Viết **2 câu lệnh SQL**: *(i)* Thống kê từng `MADV, TENDV` và số lượng nhân viên của đơn vị đó (kể cả đơn vị chưa có ai); *(ii)* Biểu diễn lại câu (a) bằng SQL hai tầng `NOT EXISTS`.',
            solutionMarkdownLatex:
              '```sql\n-- (i) Thống kê kể cả đơn vị 0 nhân viên:\nSELECT dv.MADV, dv.TENDV, COUNT(nv.MANV) AS SoNV\nFROM DONVI dv\nLEFT JOIN NHANVIEN nv ON dv.MADV = nv.MADV\nGROUP BY dv.MADV, dv.TENDV;\n\n-- (ii) Phép chia bằng hai tầng NOT EXISTS:\nSELECT nv.MANV, nv.TENNV\nFROM NHANVIEN nv\nWHERE NOT EXISTS (\n  SELECT * FROM DEAN da\n  JOIN DONVI dv ON da.MADV = dv.MADV\n  WHERE dv.TENDV = \'Nghiên cứu\'\n    AND NOT EXISTS (\n      SELECT * FROM NV_DEAN pc\n      WHERE pc.MANV = nv.MANV AND pc.MADA = da.MADA\n    )\n);\n```',
            gradingNotes:
              '(i) Dùng LEFT JOIN + COUNT(nv.MANV) thay vì COUNT(*) được 0.6đ; (ii) Đúng hai tầng NOT EXISTS tương quan được 0.9đ.',
          },
        ],
      },
      {
        id: 'f1-w3',
        title: 'Câu 3: Tìm Khóa · Bao đóng X+ & Chuẩn hóa BCNF (C4_1)',
        topicTag: 'Phụ thuộc hàm & Chuẩn hóa',
        totalPoints: 2.0,
        contextMarkdownLatex:
          'Cho lược đồ quan hệ $Q(\\text{MaHD, MaSP, TenSP, SoLuong, DonGia, MaKH, TenKH})$ và tập phụ thuộc hàm:\n$$F = \\{\\text{MaHD} \\to \\text{MaKH};\\; \\text{MaKH} \\to \\text{TenKH};\\; \\text{MaSP} \\to \\text{TenSP, DonGia};\\; \\{\\text{MaHD, MaSP}\\} \\to \\text{SoLuong}\\}$$',
        subparts: [
          {
            id: 'f1-w3-a',
            label: 'a)',
            points: 0.75,
            prompt: 'Tìm tất cả các khóa dự tuyển của $Q$ và xác định dạng chuẩn cao nhất hiện tại của $Q$.',
            solutionMarkdownLatex:
              '- Phân hoạch: Nhóm nguồn $L = \\{\\text{MaHD, MaSP}\\}$. Tính $\\{\\text{MaHD, MaSP}\\}^+ = \\{\\text{MaHD, MaSP, MaKH, TenKH, TenSP, DonGia, SoLuong}\\} = Q$.\n- Suy ra $Q$ có **duy nhất 1 khóa**: $K = \\{\\text{MaHD, MaSP}\\}$.\n- Xét $\\text{MaHD} \\to \\text{MaKH}$ và $\\text{MaSP} \\to \\text{TenSP, DonGia}$: các thuộc tính không khóa phụ thuộc **bộ phận** vào tập con của khóa $K$ $\\implies$ Vi phạm `2NF` $\\implies$ **Dạng chuẩn cao nhất là `1NF`**.',
            gradingNotes:
              'Đúng khóa (0.4đ), kết luận 1NF kèm chỉ ra phụ thuộc bộ phận (0.35đ).',
          },
          {
            id: 'f1-w3-b',
            label: 'b)',
            points: 1.25,
            prompt: 'Phân rã $Q$ thành các lược đồ đạt chuẩn `BCNF` sao cho bảo toàn thông tin.',
            solutionMarkdownLatex:
              'Phân rã lần lượt theo các PTH vi phạm:\n1. Tách phụ thuộc bộ phận của `MaSP`: $Q_1(\\underline{\\text{MaSP}}, \\text{TenSP, DonGia})$.\n2. Tách phụ thuộc bộ phận & bắc cầu của `MaHD`: $Q_2(\\underline{\\text{MaHD}}, \\text{MaKH})$ và $Q_3(\\underline{\\text{MaKH}}, \\text{TenKH})$ (để khử `MaHD → MaKH → TenKH` vi phạm 3NF/BCNF).\n3. Phần còn lại: $Q_4(\\underline{\\text{MaHD}}, \\underline{\\text{MaSP}}, \\text{SoLuong})$.\nCả 4 quan hệ $Q_1, Q_2, Q_3, Q_4$ đều có vế trái mọi PTH là siêu khóa $\\implies$ Đạt trọn **`BCNF`** và nối bảo toàn thông tin!',
            gradingNotes:
              'Nhớ tách nốt MaKH → TenKH ra bảng Q3 để tránh rơi lại 2NF (0.5đ).',
          },
        ],
      },
    ],
  },
  {
    id: 'is2099-final-02',
    code: 'ĐỀ MẪU 02',
    title: 'Đề Ôn Luyện Phân Loại 8.5–10 Điểm (C4_1 & SQL Nâng cao)',
    durationMinutes: 60,
    semesterLabel: 'Chuyên sâu · 60 phút · 6.0 điểm trọng tâm',
    description:
      'Tập trung các bẫy phân loại điểm cao: Phủ tối tiểu, Kiểm tra bảo toàn thông tin, 3NF bảo toàn PTH vs BCNF và SQL lồng nhiều tầng.',
    mcqQuestions: [
      {
        id: 'f2-mcq-1',
        topicTag: 'Bảo toàn thông tin',
        points: 0.5,
        prompt:
          'Cho $R(A, B, C)$ và $F = \\{A \\to B\\}$. Phép tách nào sau đây **BẢO TOÀN THÔNG TIN**?',
        options: [
          {
            id: 'a',
            label: '$R_1(A, C)$ và $R_2(B, C)$',
            explanation: 'Sai: phần giao C có C+ = {C}, không xác định được R1 hay R2.',
          },
          {
            id: 'b',
            label: '$R_1(A, B)$ và $R_2(A, C)$',
            explanation: 'Chính xác! Phần giao là {A}, và A+ = {A, B} ⊇ R1 nên nối không mất thông tin.',
          },
          {
            id: 'c',
            label: '$R_1(A, B)$ và $R_2(B, C)$',
            explanation: 'Sai: phần giao B có B+ = {B}, sinh bộ giả khi nối.',
          },
        ],
        correctOptionId: 'b',
      },
      {
        id: 'f2-mcq-2',
        topicTag: 'SQL HAVING & COUNT',
        points: 0.5,
        prompt:
          'Khi dùng `DONVI dv LEFT JOIN NHANVIEN nv ON dv.MADV = nv.MADV` rồi `GROUP BY dv.MADV`, phòng chưa có nhân viên nào sẽ trả kết quả nào khi tính `COUNT(*)` so với `COUNT(nv.MANV)`?',
        options: [
          {
            id: 'a',
            label: '`COUNT(*)` trả về **`1`** (vì vẫn có 1 dòng đệm NULL từ LEFT JOIN), còn `COUNT(nv.MANV)` trả về **`0`**.',
            explanation: 'Chính xác! Đây là bẫy cực hay gặp khi thống kê bằng LEFT JOIN trong SQL.',
          },
          {
            id: 'b',
            label: 'Cả hai đều trả về `0`.',
            explanation: 'Sai: COUNT(*) đếm tổng số dòng trong nhóm kể cả dòng có giá trị NULL.',
          },
          {
            id: 'c',
            label: 'Cả hai đều trả về `NULL`.',
            explanation: 'Sai: hàm COUNT không bao giờ trả về NULL mà luôn trả số nguyên ≥ 0.',
          },
        ],
        correctOptionId: 'a',
      },
    ],
    writtenProblems: [
      {
        id: 'f2-w1',
        title: 'Bài Toán Nâng cao: Phủ tối tiểu, Nhiều Khóa & Phân rã 3NF/BCNF',
        topicTag: 'C4_1 · Lý thuyết Phân rã',
        totalPoints: 5.0,
        contextMarkdownLatex:
          'Cho lược đồ $R(A, B, C, D, E)$ và tập phụ thuộc hàm:\n$$F = \\{AB \\to CD,\\; C \\to E,\\; E \\to A,\\; D \\to B\\}$$',
        subparts: [
          {
            id: 'f2-w1-a',
            label: 'a)',
            points: 2.0,
            prompt: 'Tìm Phủ tối tiểu $F_c$ của $F$ và liệt kê đầy đủ tất cả các Khóa dự tuyển của $R$.',
            solutionMarkdownLatex:
              '1. **Phủ tối tiểu**: Tách vế phải đơn: $F_1 = \\{AB \\to C, AB \\to D, C \\to E, E \\to A, D \\to B\\}$. Không có thuộc tính dư thừa ở vế trái và không có PTH nào dư thừa $\\implies F_c = F_1$.\n2. **Tìm khóa**: Mọi thuộc tính $A, B, C, D, E$ đều xuất hiện cả hai vế ($M = \\{A, B, C, D, E\\}, L = \\emptyset$).\n   - Thử đơn lẻ: đều không đạt $R$.\n   - Thử cặp 2 phần tử: $AB^+ = R, BC^+ = R, AD^+ = R, BD^+ = R, BE^+ = R, CD^+ = R, DE^+ = R$ (kiểm tra lần lượt: mọi cặp không có khóa 1 phần tử; chú ý $AC^+ = \\{A,C,E\\} \\ne R$, $AE^+ = \\{A,E\\} \\ne R$, $CE^+ = \\{C,E,A\\} \\ne R$).\n   - Các khóa dự tuyển (bậc 2): **`AB`, `AD`, `BC`, `BD`, `BE`, `CD`, `DE`**!',
            gradingNotes:
              'Kiểm tra từng cặp và giải thích vì sao AC, AE, CE chưa đạt khóa được trọn 2.0đ.',
          },
          {
            id: 'f2-w1-b',
            label: 'b)',
            points: 3.0,
            prompt:
              'Lược đồ $R$ đã đạt `3NF` chưa? Đạt `BCNF` chưa? Nếu tách $R$ theo $C \\to E$ thành $R_1(C, E)$ và $R_2(A, B, C, D)$, phép tách có bảo toàn thông tin không?',
            solutionMarkdownLatex:
              '- **Kiểm tra `3NF`**: Mọi thuộc tính $A, B, C, D, E$ đều thuộc ít nhất một khóa dự tuyển $\\implies$ Không tồn tại thuộc tính không khóa nào $\\implies$ **$R$ ĐẠT `3NF`**!\n- **Kiểm tra `BCNF`**: Xét $C \\to E$ với $C^+ = \\{C, E, A\\} \\ne R$ $\\implies C$ không phải siêu khóa $\\implies$ **$R$ KHÔNG đạt `BCNF`**!\n- **Kiểm tra phép tách $(R_1(C, E), R_2(A, B, C, D))$**: Phần giao $R_1 \\cap R_2 = \\{C\\}$. Vì $C^+ = \\{C, E, A\\} \\supseteq R_1(C, E)$ nên $(R_1 \\cap R_2) \\to R_1$ $\\implies$ **Phép tách BẢO TOÀN THÔNG TIN!** (Tuy nhiên phụ thuộc $E \\to A$ lúc này không còn nằm trọn trong một bảng đơn nữa).',
            gradingNotes:
              'Nhận xét cả về việc mất bảo toàn PTH E → A khi tách về BCNF là điểm cộng tuyệt đối!',
          },
        ],
      },
    ],
  },
];
