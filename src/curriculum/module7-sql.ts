import { ModuleSpec } from '../domain/types';

export const MODULE_7_SQL: ModuleSpec = {
  id: 'module-7',
  order: 7,
  title: 'Ngôn ngữ Truy vấn SQL Thực chiến Cuối kỳ',
  sourceFile: 'Chuyên đề Ôn thi Cuối kỳ (SQL ↔ Đại số Quan hệ)',
  description:
    'Làm chủ câu hỏi viết lệnh SQL chiếm tỷ trọng lớn trong đề thi cuối kỳ: DDL & Khóa ngoại CASCADE/SET NULL, Bag vs DISTINCT, GROUP BY/HAVING và Phép chia hai tầng NOT EXISTS.',
  lessons: [
    /* ========================================================================
     * BÀI 7.1
     * ====================================================================== */
    {
      id: 'lesson-7-1',
      moduleId: 'module-7',
      orderLabel: '7.1',
      title: 'SQL DDL: CREATE TABLE · Ràng buộc Miền · PRIMARY KEY & FOREIGN KEY',
      subtitle:
        'Dịch thẳng từ Lược đồ Quan hệ (Chặng 4) và Chính sách Toàn vẹn Tham chiếu (Bài 5.1) sang câu lệnh SQL CREATE TABLE chuẩn điểm tối đa.',
      slideRange: 'SQL Phần 1 · Định nghĩa Lược đồ',
      estimatedMinutes: 14,
      steps: [
        {
          id: 'step-7-1-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Cấu trúc một lệnh CREATE TABLE đầy đủ cả 4 loại Ràng buộc Toàn vẹn',
          narrative: [
            'Ở đề thi cuối kỳ, câu đầu tiên của phần SQL thường yêu cầu *"Viết lệnh DDL định nghĩa bảng `...` cài đặt đầy đủ khóa chính, khóa ngoại và ràng buộc kiểm tra"*. Hãy đối chiếu từng loại ràng buộc đã học ở Bài 4.2 sang từ khóa SQL:',
            '1. **Miền giá trị (*Domain & Check*)**: Kiểu dữ liệu (`VARCHAR(10)`, `INT`, `FLOAT`, `DATE`), `NOT NULL`, và `CHECK (Diem >= 0 AND Diem <= 10)`.',
            '2. **Toàn vẹn Thực thể & Khóa chính**: `PRIMARY KEY (col1, col2)` — bắt buộc khai báo `PRIMARY KEY (...)` ở cuối bảng khi khóa gồm **2 thuộc tính trở lên** (như thực thể yếu hay bảng nối `N:M`)!',
            '3. **Toàn vẹn Tham chiếu & Chính sách Xóa/Sửa**: `FOREIGN KEY (col) REFERENCES BangCha(colCha) ON DELETE [CASCADE | SET NULL | RESTRICT]`.',
          ].join('\n\n'),
          workedExamples: [
            {
              id: 'ex-7-1-ddl',
              title: 'Viết lệnh tạo bảng NV_DEAN có khóa chính kép và 2 khóa ngoại',
              problemStatement:
                'Chuyển lược đồ $\\text{NV\\_DEAN}(\\underline{\\text{MANV}}, \\underline{\\text{MADA}}, \\text{SOGIO})$ với `SOGIO >= 0`, `MANV` tham chiếu `NHANVIEN(MANV)` và `MADA` tham chiếu `DEAN(MADA)` sang SQL.',
              steps: [
                {
                  label: 'Khai báo cột & CHECK',
                  markdownLatex:
                    '`MANV VARCHAR(10) NOT NULL`, `MADA INT NOT NULL`, `SOGIO FLOAT CHECK (SOGIO >= 0)`.',
                },
                {
                  label: 'Đặt Khóa chính ghép & 2 Khóa ngoại ở cuối bảng',
                  markdownLatex:
                    '`PRIMARY KEY (MANV, MADA)`, `FOREIGN KEY (MANV) REFERENCES NHANVIEN(MANV) ON DELETE CASCADE`, `FOREIGN KEY (MADA) REFERENCES DEAN(MADA) ON DELETE CASCADE`.',
                },
              ],
              conclusion:
                'Không được viết `PRIMARY KEY` ngay sau cả 2 cột `MANV` và `MADA` (SQL sẽ báo lỗi có 2 khóa chính!), mà phải gom thành một dòng `PRIMARY KEY (MANV, MADA)` ở cuối.',
            },
          ],
          workbench: {
            kind: 'sql',
            datasetId: 'DAOTAO',
            title: 'Thử nghiệm phân tích DDL CREATE TABLE trong SQL Sandbox',
            initialSql:
              'CREATE TABLE KETQUA (\n  Masv VARCHAR(10) NOT NULL,\n  Mamon VARCHAR(10) NOT NULL,\n  Diem FLOAT CHECK (Diem >= 0 AND Diem <= 10),\n  PRIMARY KEY (Masv, Mamon),\n  FOREIGN KEY (Masv) REFERENCES SINHVIEN(Masv) ON DELETE CASCADE\n)',
          },
        },
        {
          id: 'step-7-1-2',
          phaseLabel: 'Thực hành',
          title: 'Thực hành viết lệnh CREATE TABLE cho Thực thể Yếu THANNHAN',
          narrative:
            'Hãy tự viết lệnh `CREATE TABLE THANNHAN (...)` với khóa chính ghép `(MANV, TEN_TN)` và khóa ngoại `MANV` tham chiếu `NHANVIEN(MANV)` ở khung bên phải rồi bấm **Chạy & Chấm SQL**!',
          workbench: {
            kind: 'sql',
            datasetId: 'CONGTY_EX',
            title: 'Thử thách viết SQL DDL cho bảng THANNHAN',
          },
          challenge: {
            type: 'sql',
            datasetId: 'CONGTY_EX',
            prompt:
              'Viết lệnh `CREATE TABLE THANNHAN` gồm 4 cột (`MANV VARCHAR(10) NOT NULL`, `TEN_TN VARCHAR(30) NOT NULL`, `GT VARCHAR(5)`, `QUANHE VARCHAR(20)`), đặt khóa chính ghép `(MANV, TEN_TN)` và khóa ngoại `MANV` trỏ về `NHANVIEN(MANV)`.',
            starterSql:
              'CREATE TABLE THANNHAN (\n  MANV VARCHAR(10) NOT NULL,\n  TEN_TN VARCHAR(30) NOT NULL,\n  GT VARCHAR(5),\n  QUANHE VARCHAR(20),\n  \n)',
            solutionSql:
              'CREATE TABLE THANNHAN (\n  MANV VARCHAR(10) NOT NULL,\n  TEN_TN VARCHAR(30) NOT NULL,\n  GT VARCHAR(5),\n  QUANHE VARCHAR(20),\n  PRIMARY KEY (MANV, TEN_TN),\n  FOREIGN KEY (MANV) REFERENCES NHANVIEN(MANV) ON DELETE CASCADE\n)',
            hints: [
              'Thêm dòng PRIMARY KEY (MANV, TEN_TN), ở cuối trước dấu đóng ngoặc.',
              'Thêm dòng FOREIGN KEY (MANV) REFERENCES NHANVIEN(MANV) ON DELETE CASCADE.',
            ],
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 7.2
     * ====================================================================== */
    {
      id: 'lesson-7-2',
      moduleId: 'module-7',
      orderLabel: '7.2',
      title: 'SELECT · JOIN · LEFT JOIN & Sự khác biệt Tập đa hợp (Bag) vs. Tập hợp (Set)',
      subtitle:
        'Hiểu vì sao phép Chiếu π(R) trong Đại số quan hệ tự khử trùng còn SELECT trong SQL thì không, và cách dùng DISTINCT cùng các phép Nối.',
      slideRange: 'SQL Phần 2 · Truy vấn Cơ bản & Kết nối Bảng',
      estimatedMinutes: 15,
      steps: [
        {
          id: 'step-7-2-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Dịch từ Đại số Quan hệ sang SQL & Bẫy lớn nhất: DISTINCT',
          narrative: [
            'Mọi câu truy vấn Đại số quan hệ cơ bản đều có bản dịch tương ứng trực tiếp sang SQL:',
            '- $\\pi_{A_1, A_2}(\\sigma_{F}(R)) \\iff$ **`SELECT DISTINCT A1, A2 FROM R WHERE F`**',
            '- $R \\bowtie_{F} S \\iff$ **`SELECT ... FROM R JOIN S ON F`**',
            '- $R \\lojoin_{F} S \\iff$ **`SELECT ... FROM R LEFT JOIN S ON F`**',
            '',
            '### Vì sao SQL KHÔNG tự khử trùng lặp như $\\pi$?',
            'Trong thực tế hệ QTCSDL thương mại, việc sắp xếp hoặc băm để loại dòng trùng tốn rất nhiều thời gian CPU/RAM. Vì vậy SQL coi mỗi bảng kết quả là một **Tập đa hợp (*Bag / Multiset*)**. Nếu bạn viết `SELECT MADV FROM NHANVIEN`, 6 nhân viên trả về đủ 6 dòng (lặp lại số `4` hai lần, số `5` ba lần)! Muốn tương đương 100% với $\\pi_{\\text{MADV}}(\\text{NHANVIEN})$, bạn phải thêm **`SELECT DISTINCT MADV`**!',
          ].join('\n\n'),
          workbench: {
            kind: 'sql',
            datasetId: 'CONGTY_EX',
            title: 'Thử chạy so sánh SELECT MADV với SELECT DISTINCT MADV',
            initialSql: 'SELECT DISTINCT nv.MADV, dv.TENDV\nFROM NHANVIEN nv\nJOIN DONVI dv ON nv.MADV = dv.MADV',
          },
        },
        {
          id: 'step-7-2-2',
          phaseLabel: 'Thực hành',
          title: 'Thực hành JOIN ba bảng: Nhân viên tham gia Đề án ở Hà Nội',
          narrative:
            'Áp dụng phép `JOIN` kết hợp `DISTINCT` trên CSDL `CONGTY_EX` để truy vấn danh sách nhân viên không trùng lặp.',
          workbench: {
            kind: 'sql',
            datasetId: 'CONGTY_EX',
            title: 'Thử thách SELECT DISTINCT + Multi-Table JOIN',
          },
          challenge: {
            type: 'sql',
            datasetId: 'CONGTY_EX',
            prompt:
              'Viết câu lệnh SQL trả về **`MANV, HONV, TENNV`** (không trùng lặp nếu một người làm nhiều đề án) của các nhân viên tham gia **ít nhất 1 đề án có địa điểm `DD_DA = \'Hà Nội\'`** (kết nối `NHANVIEN`, `NV_DEAN`, `DEAN`).',
            starterSql:
              "SELECT DISTINCT nv.MANV, nv.HONV, nv.TENNV\nFROM NHANVIEN nv\nJOIN NV_DEAN pc ON nv.MANV = pc.MANV\n",
            solutionSql:
              "SELECT DISTINCT nv.MANV, nv.HONV, nv.TENNV\nFROM NHANVIEN nv\nJOIN NV_DEAN pc ON nv.MANV = pc.MANV\nJOIN DEAN da ON pc.MADA = da.MADA\nWHERE da.DD_DA = 'Hà Nội'",
            hints: [
              'Nối tiếp bảng DEAN: JOIN DEAN da ON pc.MADA = da.MADA.',
              "Lọc điều kiện WHERE da.DD_DA = 'Hà Nội' (vì dùng SELECT DISTINCT nên mỗi nhân viên chỉ hiện đúng 1 lần).",
            ],
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 7.3
     * ====================================================================== */
    {
      id: 'lesson-7-3',
      moduleId: 'module-7',
      orderLabel: '7.3',
      title: 'GROUP BY · HAVING & Thứ tự Thực thi Logic 6 Mệnh đề SQL',
      subtitle:
        'Hiểu rạch ròi vì sao WHERE chạy trước GROUP BY nên không được chứa SUM/COUNT, và tránh mọi bẫy alias hay LEFT JOIN + COUNT(*).',
      slideRange: 'SQL Phần 3 · Gom nhóm & Hàm tập hợp',
      estimatedMinutes: 16,
      steps: [
        {
          id: 'step-7-3-1',
          phaseLabel: 'Gỡ bẫy',
          title: 'Thứ tự Thực thi 6 Mệnh đề SQL & 3 Lỗi Mất Điểm Phổ Biến Nhất',
          narrative: [
            'Dù ta viết `SELECT` ngay đầu câu, nhưng máy SQL lại thực thi câu truy vấn theo **thứ tự logic cố định dưới đây**:',
            '1. **`FROM` / `JOIN`**: Ghép nối các bảng nguồn.',
            '2. **`WHERE`**: Lọc từng **dòng đơn lẻ** (chưa hề gom nhóm!).',
            '3. **`GROUP BY`**: Xếp các dòng đạt `WHERE` thành từng **nhóm**.',
            '4. **`HAVING`**: Lọc trên từng **nhóm** bằng các hàm gộp `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`.',
            '5. **`SELECT`**: Tính toán biểu thức chiếu và đặt bí danh `AS ...`.',
            '6. **`ORDER BY`** (và `LIMIT`): Sắp xếp kết quả cuối.',
            '',
            '### Nhìn vào thứ tự 1 → 6, bạn tự giải thích được ngay 3 bẫy kinh điển:',
            '- **Bẫy 1 — Đặt `SUM(SOGIO) > 30` ở `WHERE`**: Sai cú pháp/logic vì khi `WHERE` chạy ở Bước 2, các nhóm ở Bước 3 chưa hình thành $\\implies$ Điều kiện trên hàm gộp **BẮT BUỘC đặt trong `HAVING`**!',
            '- **Bẫy 2 — Thống kê cả phòng chưa có nhân viên (`COUNT(nv.MANV)` vs `COUNT(*)`)**: Nếu `DONVI` `LEFT JOIN` `NHANVIEN`, phòng ban trống vẫn sinh ra 1 dòng có `nv.MANV = NULL`. Dùng `COUNT(*)` sẽ đếm nhầm phòng đó có **`1` nhân viên**, còn **`COUNT(nv.MANV)`** (như ta đã thấy ở Bài 5.6!) bỏ qua `NULL` nên trả về đúng **`0`**!',
            '- **Bẫy 3 — Ghi cột thừa trong `SELECT` không có trong `GROUP BY`**: Khi đã dùng `GROUP BY`, mọi cột đứng ngoài hàm gộp ở `SELECT` phải có mặt trong `GROUP BY`.',
          ].join('\n\n'),
          workbench: {
            kind: 'sql',
            datasetId: 'BANHANG_DB',
            title: 'Thử chạy GROUP BY & HAVING trên CSDL Quản lý Bán hàng',
            initialSql:
              'SELECT b.MaNv, COUNT(*) AS SoLuotBan, SUM(b.Soluong * h.Dongia) AS DoanhThu\nFROM BanHang b\nJOIN Hanghoa h ON b.MaHh = h.MaHh\nGROUP BY b.MaNv\nHAVING SUM(b.Soluong * h.Dongia) > 200000\nORDER BY DoanhThu DESC',
          },
        },
        {
          id: 'step-7-3-2',
          phaseLabel: 'Thực hành',
          title: 'Thực hành GROUP BY ... HAVING trên CSDL Công ty',
          narrative:
            'Áp dụng `JOIN` + `GROUP BY` + `HAVING` trên `CONGTY_EX` để tìm các đề án có tổng giờ công lớn.',
          workbench: {
            kind: 'sql',
            datasetId: 'CONGTY_EX',
            title: 'Thử thách GROUP BY & HAVING trên CONGTY_EX',
          },
          challenge: {
            type: 'sql',
            datasetId: 'CONGTY_EX',
            prompt:
              'Tìm **`MADA, TENDA`** và **tổng số giờ làm việc (`SUM(SOGIO) AS TongGio`)** của những đề án có tổng số giờ tham gia **lớn hơn hoặc bằng `35` giờ** (nối `DEAN` và `NV_DEAN`).',
            starterSql:
              'SELECT da.MADA, da.TENDA, SUM(pc.SOGIO) AS TongGio\nFROM DEAN da\nJOIN NV_DEAN pc ON da.MADA = pc.MADA\n',
            solutionSql:
              'SELECT da.MADA, da.TENDA, SUM(pc.SOGIO) AS TongGio\nFROM DEAN da\nJOIN NV_DEAN pc ON da.MADA = pc.MADA\nGROUP BY da.MADA, da.TENDA\nHAVING SUM(pc.SOGIO) >= 35',
            hints: [
              'Nhóm theo cả 2 cột đứng ngoài hàm gộp: GROUP BY da.MADA, da.TENDA.',
              'Lọc nhóm có tổng giờ >= 35 bằng mệnh đề HAVING SUM(pc.SOGIO) >= 35.',
            ],
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 7.4
     * ====================================================================== */
    {
      id: 'lesson-7-4',
      moduleId: 'module-7',
      orderLabel: '7.4',
      title: 'Truy vấn Lồng Tương quan (NOT EXISTS) & Phép Chia bằng SQL',
      subtitle:
        'Thành thạo kỹ năng ghi điểm 9–10 cuối kỳ: chuyển đổi phép Trừ (−) sang NOT IN / NOT EXISTS và phép Chia (÷) sang hai tầng NOT EXISTS.',
      slideRange: 'SQL Phần 4 · Truy vấn Lồng Nâng cao',
      estimatedMinutes: 18,
      steps: [
        {
          id: 'step-7-4-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Biến đổi lượng từ "TẤT CẢ" (∀) thành "KHÔNG TỒN TẠI ... MÀ KHÔNG"',
          narrative: [
            'Ngôn ngữ SQL chuẩn không có ký hiệu phép chia `÷` hay từ khóa `FOR ALL`. Muốn viết truy vấn dạng *"Tìm sinh viên $sv$ đã học **TẤT CẢ** các lớp do thầy Lê Đức Hòa dạy"*, ta sử dụng định lý phủ định hai lần của logic vị từ:',
            '$$\\forall x \\in P,\\; Q(x) \\;\\equiv\\; \\neg \\exists x \\in P : \\neg Q(x)$$',
            '**Phiên âm sang tiếng Việt tự nhiên cực dễ nhớ**:',
            '> *"Chọn sinh viên `sv` sao cho **KHÔNG TỒN TẠI** lớp `l` nào của thầy Lê Đức Hòa **MÀ KHÔNG TỒN TẠI** dòng đăng ký học lớp `l` của sinh viên `sv` trong `SV_LOP`!"*',
            '',
            'Vì bên trong truy vấn con `SV_LOP sl` có điều kiện `WHERE sl.Masv = sv.Masv AND sl.Malop = l.Malop` móc nối ngược ra biến vòng ngoài `sv` và `l`, đây gọi là **Truy vấn lồng tương quan (*Correlated Nested Query*)**.',
          ].join('\n\n'),
          workedExamples: [
            {
              id: 'ex-7-4-div-sql',
              title: 'Đối chiếu song song Phép Chia Đại số Quan hệ ↔ SQL Hai tầng NOT EXISTS',
              problemStatement:
                'Cho CSDL `DAOTAO` (`SINHVIEN`, `LOP`, `SV_LOP`). Tìm `Masv, Ho, Dem, Ten` của các sinh viên học **tất cả các lớp do giáo viên `\'Lê Đức Hòa\'` dạy**.',
              steps: [
                {
                  label: 'Cách 1 — Đại số Quan hệ (Bài 5.5)',
                  markdownLatex:
                    '$$\\text{LOP\\_LDH} \\leftarrow \\pi_{\\text{Malop}}(\\sigma_{\\text{Giaovien}=\\text{\'Lê Đức Hòa\'}}(\\text{LOP}))$$\n$$\\pi_{\\text{Masv, Ho, Dem, Ten}}((\\text{SV\\_LOP} \\div \\text{LOP\\_LDH}) * \\text{SINHVIEN})$$',
                },
                {
                  label: 'Cách 2 — SQL Hai tầng NOT EXISTS (Đề thi Cuối kỳ)',
                  markdownLatex:
                    '```sql\nSELECT sv.Masv, sv.Ho, sv.Dem, sv.Ten\nFROM SINHVIEN sv\nWHERE NOT EXISTS (\n  SELECT * FROM LOP l\n  WHERE l.Giaovien = \'Lê Đức Hòa\'\n    AND NOT EXISTS (\n      SELECT * FROM SV_LOP sl\n      WHERE sl.Masv = sv.Masv AND sl.Malop = l.Malop\n    )\n)\n```',
                },
              ],
              conclusion:
                'Thầy Lê Đức Hòa dạy 2 lớp (`Int1003` và `Int2003`). Chỉ có sinh viên **`C2` — Lê Đình Bắc** học đủ cả 2 lớp đó.',
              examTip:
                'Mẹo gài bẫy hay gặp ở đề nâng cao: Nếu tập chia `LOP` có thể rỗng, người kỹ tính còn kẹp thêm `AND EXISTS (SELECT * FROM LOP l0 WHERE l0.Giaovien = \'Lê Đức Hòa\')` để tránh mệnh đề rỗng luôn đúng (vacuous truth)!',
            },
          ],
          workbench: {
            kind: 'sql',
            datasetId: 'DAOTAO',
            title: 'Chạy thử SQL hai tầng NOT EXISTS ngay trên CSDL Đào tạo',
            initialSql:
              "SELECT sv.Masv, sv.Ho, sv.Dem, sv.Ten\nFROM SINHVIEN sv\nWHERE NOT EXISTS (\n  SELECT * FROM LOP l\n  WHERE l.Giaovien = 'Lê Đức Hòa'\n  AND NOT EXISTS (\n    SELECT * FROM SV_LOP sl\n    WHERE sl.Masv = sv.Masv AND sl.Malop = l.Malop\n  )\n)",
          },
        },
        {
          id: 'step-7-4-2',
          phaseLabel: 'Thực hành',
          title: 'Thử thách cuối chương trình: Nhân viên tham gia TẤT CẢ đề án của Đơn vị 5',
          narrative: [
            'Trên CSDL `CONGTY_EX`, hãy dùng kỹ thuật **hai tầng `NOT EXISTS`** (hoặc đối chiếu kết quả bằng `GROUP BY ... HAVING`) để tìm **`MANV, HONV, TENNV`** của những nhân viên tham gia **tất cả các đề án do Đơn vị số 5 (`DEAN.MADV = 5`) chủ trì**!',
          ].join('\n\n'),
          workbench: {
            kind: 'sql',
            datasetId: 'CONGTY_EX',
            title: 'Thử thách Trùm Cuối SQL: Hai tầng NOT EXISTS trên CONGTY_EX',
          },
          challenge: {
            type: 'sql',
            datasetId: 'CONGTY_EX',
            prompt:
              'Viết câu lệnh SQL tìm **`MANV, HONV, TENNV`** của nhân viên tham gia **tất cả đề án có `DEAN.MADV = 5`** (gồm `NV02` — Nguyễn Tùng và `NV06` — Bùi Hằng).',
            starterSql:
              'SELECT nv.MANV, nv.HONV, nv.TENNV\nFROM NHANVIEN nv\nWHERE NOT EXISTS (\n  SELECT * FROM DEAN da\n  WHERE da.MADV = 5\n  AND NOT EXISTS (\n    \n  )\n)',
            solutionSql:
              'SELECT nv.MANV, nv.HONV, nv.TENNV\nFROM NHANVIEN nv\nWHERE NOT EXISTS (\n  SELECT * FROM DEAN da\n  WHERE da.MADV = 5\n  AND NOT EXISTS (\n    SELECT * FROM NV_DEAN pc\n    WHERE pc.MANV = nv.MANV AND pc.MADA = da.MADA\n  )\n)',
            hints: [
              'Trong truy vấn con sâu nhất, kiểm tra sự tồn tại của dòng phân công khớp cả nhân viên ngoài cùng và đề án vòng giữa.',
              'Viết: SELECT * FROM NV_DEAN pc WHERE pc.MANV = nv.MANV AND pc.MADA = da.MADA.',
            ],
          },
        },
      ],
    },
  ],
};
