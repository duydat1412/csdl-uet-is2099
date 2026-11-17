import { ModuleSpec } from '../domain/types';

export const MODULE_4_RELATIONAL: ModuleSpec = {
  id: 'module-4',
  order: 4,
  title: 'Mô hình Dữ liệu Quan hệ & Ánh xạ ER → Quan hệ',
  sourceFile: 'C3_1.pdf (43 trang)',
  description:
    'Định nghĩa toán học của Quan hệ, Siêu khóa / Khóa dự tuyển / Khóa chính, Toàn vẹn Thực thể & Tham chiếu, và thuật toán 7 bước chuyển ER/EER sang Lược đồ Quan hệ.',
  lessons: [
    /* ========================================================================
     * BÀI 4.1
     * ====================================================================== */
    {
      id: 'lesson-4-1',
      moduleId: 'module-4',
      orderLabel: '4.1',
      title: 'Định nghĩa Toán học của Quan hệ & 4 Đặc trưng Cốt lõi',
      subtitle:
        'Hiểu vì sao một bảng dữ liệu được gọi là "Quan hệ" (tập con của tích Đề-các các miền giá trị nguyên tố) và hệ quả tập hợp của nó.',
      slideRange: 'C3_1.pdf · tr. 2–13',
      estimatedMinutes: 11,
      steps: [
        {
          id: 'step-4-1-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Lược đồ quan hệ R(A1, A2, ..., An), Bậc (Degree) & Thể hiện r(R)',
          narrative: [
            'Do **E. F. Codd (IBM, 1970)** đề xuất, Mô hình dữ liệu Quan hệ đặt nền móng toán học chặt chẽ dựa trên lý thuyết tập hợp (`C3_1.pdf` tr. 4–9):',
            '- **Miền giá trị (*Domain* — $\\Dom(A_i)$)**: Tập hợp các **giá trị nguyên tố (*Atomic values*)** không thể chia nhỏ hơn về mặt logic, gắn với một kiểu dữ liệu và định dạng xác định.',
            '- **Lược đồ quan hệ (*Relation Schema*)**: Ký hiệu $R(A_1, A_2, \\dots, A_n)$, gồm tên quan hệ $R$ và danh sách $n$ thuộc tính. Con số $n$ gọi là **Bậc (*Degree / Arity*)** của lược đồ quan hệ.',
            '- **Trạng thái / Thể hiện quan hệ (*Relation State / Instance* $r(R)$)**: Là một tập hợp hữu hạn gồm $m$ **bộ giá trị $n$-thành phần (*$n$-tuples*)** $r = \\{t_1, t_2, \\dots, t_m\\}$, trong đó mỗi bộ $t = \\langle v_1, v_2, \\dots, v_n \\rangle$ thỏa mãn $v_i \\in \\Dom(A_i) \\cup \\{\\text{null}\\}$:',
            '$$r(R) \\subseteq (\\Dom(A_1) \\cup \\{\\text{null}\\}) \\times (\\Dom(A_2) \\cup \\{\\text{null}\\}) \\times \\dots \\times (\\Dom(A_n) \\cup \\{\\text{null}\\})$$',
          ].join('\n'),
          callouts: [
            {
              kind: 'definition',
              title: 'Bảng đối chiếu thuật ngữ Hình thức vs. Thực tế',
              slideSource: 'C3_1.pdf · tr. 6',
              body: '- **Quan hệ (*Relation*)** $\\leftrightarrow$ Bảng (*Table*)\n- **Bộ (*Tuple*)** $\\leftrightarrow$ Hàng / Bản ghi (*Row / Record*)\n- **Thuộc tính (*Attribute*)** $\\leftrightarrow$ Cột (*Column / Field*)\n- **Bậc (*Degree*)** = Số cột $n$; **Lực lượng (*Cardinality*)** = Số bộ $m$ hiện có.',
            },
          ],
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'DAOTAO',
            title: 'Quan sát Bậc (số cột) và Lực lượng (số bộ) trên CSDL Đào tạo',
            caption: 'Ví dụ SINHVIEN(Masv, Ho, Dem, Ten) có bậc n = 4 và lực lượng hiện tại m = 5 bộ.',
          },
        },
        {
          id: 'step-4-1-2',
          phaseLabel: 'Gỡ bẫy',
          title: '4 Đặc trưng sống còn phân biệt Quan hệ toán học với bảng Excel thông thường',
          narrative: [
            'Vì $r(R)$ được định nghĩa là một **tập hợp toán học các bộ**, slide `C3_1.pdf` (tr. 10–13) rút ra 4 hệ quả cực kỳ quan trọng:',
            '1. **Thứ tự các bộ trong quan hệ không quan trọng** (vì tập hợp $\\{t_1, t_2\\} = \\{t_2, t_1\\}$). Không tồn tại khái niệm *"bộ thứ 3 cố định"* ở mức logic!',
            '2. **Không bao giờ có hai bộ trùng hệt nhau** trong cùng một quan hệ (tính chất tập hợp khử trùng lặp).',
            '3. **Thứ tự các giá trị bên trong một bộ phải khớp với thứ tự thuộc tính** khi viết dạng danh sách có thứ tự $\\langle v_1, \\dots, v_n \\rangle$ (hoặc nếu định nghĩa bộ là ánh xạ tên-thuộc-tính $\\to$ giá-trị thì thứ tự cột cũng trở nên độc lập).',
            '4. **Mỗi giá trị trong một bộ phải là nguyên tố (*Flat Relational Model / Chuẩn 1NF*)**: Tuyệt đối **không được chứa tập hợp đa trị hay thuộc tính phức hợp lồng bên trong một ô**!',
          ].join('\n\n'),
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'CONGTY_PHG',
            title: 'Xem bảng DIADIEM_PHG trong CONGTY_PHG',
            caption: 'Vì mô hình quan hệ cấm ô đa trị {Vũng Tàu, Nha Trang, TP HCM}, phòng số 5 phải tách thành 3 bộ nguyên tố riêng biệt trong DIADIEM_PHG!',
          },
        },
        {
          id: 'step-4-1-3',
          phaseLabel: 'Thực hành',
          title: 'Kiểm tra tính nguyên tố và tính tập hợp của Quan hệ',
          narrative: 'Trả lời câu hỏi kiểm tra để mở khóa bài học về Khóa và Ràng buộc Toàn vẹn.',
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'CONGTY_PHG',
            title: 'CSDL Công ty ở dạng Quan hệ chuẩn 1NF',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Xét lược đồ quan hệ `PHONGBAN(MAPHG, TENPHG, TRPHG, NG_NHANCHUC)` hiện đang chứa 3 dòng dữ liệu. Phát biểu nào sau đây **ĐÚNG** theo `C3_1.pdf`?',
            options: [
              {
                id: 'a',
                label: 'Quan hệ `PHONGBAN` có bậc (*Degree*) bằng 3 và có thể chứa 2 dòng giống hệt nhau.',
                explanation: 'Sai cả hai ý: có 4 thuộc tính nên bậc bằng 4 (3 là số bộ/lực lượng), và quan hệ là tập hợp nên không chứa 2 bộ trùng nhau.',
              },
              {
                id: 'b',
                label: 'Quan hệ `PHONGBAN` có **bậc (*Degree*) bằng 4**, hiện có **3 bộ (*Tuples*)**, và mọi giá trị trong mỗi ô đều là **giá trị nguyên tố (*Atomic*)**.',
                explanation: 'Chính xác tuyệt đối!',
              },
              {
                id: 'c',
                label: 'Có thể nhét danh sách `{"Vũng Tàu", "Nha Trang", "TP HCM"}` vào một ô duy nhất trong bảng quan hệ chuẩn.',
                explanation: 'Vi phạm tiên đề giá trị nguyên tố (First Normal Form) của mô hình quan hệ phẳng.',
              },
            ],
            correctOptionId: 'b',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 4.2
     * ====================================================================== */
    {
      id: 'lesson-4-2',
      moduleId: 'module-4',
      orderLabel: '4.2',
      title: 'Siêu khóa, Khóa, Khóa chính & 4 Ràng buộc Toàn vẹn Quan hệ',
      subtitle:
        'Phân biệt sắc nét Superkey ⊇ Candidate Key ⊇ Primary Key và làm chủ Toàn vẹn Thực thể (PK ≠ null) cùng Toàn vẹn Tham chiếu (FK).',
      slideRange: 'C3_1.pdf · tr. 14–25',
      estimatedMinutes: 14,
      steps: [
        {
          id: 'step-4-2-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Từ Siêu khóa (Superkey) đến Khóa dự tuyển (Key) và Khóa chính (Primary Key)',
          narrative: [
            'Vì quan hệ là một tập hợp không có hai bộ trùng hệt nhau, luôn tồn tại các tập con thuộc tính giúp phân biệt các bộ (`C3_1.pdf` tr. 16–19):',
            '- **Siêu khóa (*Superkey* — $SK$)**: Tập con thuộc tính $SK \\subseteq R$ sao cho trên **mọi** trạng thái hợp lệ $r(R)$, không có hai bộ khác nhau nào trùng giá trị trên $SK$:',
            '$$\\forall t_1, t_2 \\in r(R),\\; t_1 \\ne t_2 \\implies t_1[SK] \\ne t_2[SK]$$',
            '  *(Mọi quan hệ đều có ít nhất 1 siêu khóa tầm thường chính là toàn bộ tập thuộc tính $R$!).*',
            '- **Khóa / Khóa dự tuyển (*Key / Candidate Key* — $K$)**: Là một **siêu khóa tối tiểu (*Minimal Superkey*)** — nghĩa là nếu bỏ đi bất kỳ thuộc tính nào khỏi $K$ thì phần còn lại **không còn là siêu khóa nữa**!',
            '- **Khóa chính (*Primary Key* — $PK$)**: Một khóa dự tuyển được người thiết kế chọn làm phương tiện chính để nhận diện các bộ trong bảng (ký hiệu **gạch chân liền** $\\underline{PK}$, ưu tiên khóa ít thuộc tính/ngắn gọn). Các khóa dự tuyển còn lại gọi là *Unique / Alternate Keys*.',
          ].join('\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Tính chất Khóa là ràng buộc của LƯỢC ĐỒ, không nhìn theo 1 bảng dữ liệu tình cờ!',
              slideSource: 'C3_1.pdf · tr. 16–17',
              body: 'Giả sử hôm nay bảng `SINHVIEN` có 5 người tình cờ mang 5 chữ `Ten` khác nhau (`An, Bắc, Hảo, Lâm, Ngọc`). Bạn **không được** kết luận `{Ten}` là khóa, vì ngày mai nhập thêm một bạn tên `An` khác là trùng ngay! Khóa phải đúng trên **mọi trạng thái hợp lệ** theo quy tắc nghiệp vụ.',
            },
          ],
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'CONGTY_PHG',
            title: 'Kiểm tra PK (biểu tượng chìa khóa) và FK (biểu tượng mắt xích) trên CONGTY_PHG',
          },
        },
        {
          id: 'step-4-2-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Toàn vẹn Thực thể (Entity Integrity) & Toàn vẹn Tham chiếu (Referential Integrity)',
          narrative: [
            'Giáo trình UET (`C3_1.pdf` tr. 14–24) hệ thống hóa các ràng buộc trên mô hình quan hệ gồm:',
            '1. **Ràng buộc miền giá trị (*Domain Constraints*)**: Giá trị của mỗi thuộc tính $A$ trong bộ $t$ phải là giá trị nguyên tố thuộc $\\Dom(A)$ (hoặc `null` nếu được phép).',
            '2. **Ràng buộc khóa (*Key Constraints*)**: Các bộ phải đôi một phân biệt trên mọi khóa $K$.',
            '3. **Ràng buộc toàn vẹn thực thể (*Entity Integrity*)**: **Không một thuộc tính nào tham gia vào Khóa chính $PK$ được phép nhận giá trị `null`!** ($t[PK_i] \\ne \\text{null},\\; \\forall PK_i \\in PK$). Lý do: nếu `PK` chứa `null`, ta không thể định danh được bộ đó.',
            '4. **Ràng buộc toàn vẹn tham chiếu (*Referential Integrity* — Khóa ngoại `FK`)**: Tập thuộc tính $FK$ trên lược đồ tham chiếu $R_1$ trỏ tới khóa chính $PK$ của lược đồ được tham chiếu $R_2$ (có thể $R_1 \\equiv R_2$ như `MA_NQL` trỏ về `NHANVIEN.MANV`!) nếu thỏa:',
            '   - Cùng miền giá trị: $\\Dom(FK_i) = \\Dom(PK_i)$, và',
            '   - Với mọi bộ $t_1 \\in r_1(R_1)$: **hoặc** tồn tại $t_2 \\in r_2(R_2)$ sao cho $t_1[FK] = t_2[PK]$, **hoặc** $t_1[FK]$ hoàn toàn mang giá trị `null` (trường hợp `FK` không nằm trong khóa chính của $R_1$ và nghiệp vụ cho phép chưa liên kết, ví dụ Tổng giám đốc có `MA_NQL = null`).',
          ].join('\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Khóa ngoại (FK) CÓ ĐƯỢC nhận giá trị null không?',
              slideSource: 'C3_1.pdf · tr. 22–23',
              body: '**CÓ!** Khác với Khóa chính (cấm tuyệt đối `null`), **Khóa ngoại được phép nhận `null`** (nếu nó không đồng thời là thành phần của khóa chính bảng $R_1$). Xem ngay dòng đầu bảng `NHANVIEN` bên phải: ông `Pham Vinh` (`888665555`) là lãnh đạo cao nhất nên khóa ngoại đệ quy `MA_NQL = null` hoàn toàn hợp lệ!',
            },
          ],
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'CONGTY_PHG',
            title: 'Quan sát dòng 1 bảng NHANVIEN: MA_NQL = null hợp lệ với Ràng buộc Tham chiếu',
          },
        },
        {
          id: 'step-4-2-3',
          phaseLabel: 'Thực hành',
          title: 'Phân biệt Superkey, Candidate Key, PK và FK',
          narrative: 'Kiểm tra độ chắc chắn của bạn trước hai câu bẫy kinh điển nhất về Khóa.',
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'CONGTY_PHG',
            title: 'Bảng NHANVIEN và NV_DEAN trong CONGTY_PHG',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Trong bảng `SINHVIEN(Masv, CCCD, HoTen, Lop)` mà cả `Masv` lẫn `CCCD` đều định danh duy nhất từng sinh viên, tập thuộc tính **`{Masv, HoTen}`** được gọi là gì, và phát biểu nào về `null` là đúng?',
            options: [
              {
                id: 'a',
                label: '`{Masv, HoTen}` là **Siêu khóa (*Superkey*)** nhưng **không phải Khóa dự tuyển** (vì dư `HoTen`, không tối tiểu); ngoài ra **Khóa chính cấm `null`** còn **Khóa ngoại có thể nhận `null`** (nếu không thuộc PK).',
                explanation: 'Hoàn toàn chính xác! Bỏ HoTen đi thì {Masv} vẫn duy nhất nên {Masv, HoTen} không tối tiểu → chỉ là Siêu khóa.',
              },
              {
                id: 'b',
                label: '`{Masv, HoTen}` là Khóa dự tuyển tối tiểu, và mọi Khóa ngoại trong CSDL đều cấm nhận giá trị `null`.',
                explanation: 'Sai cả hai vế: {Masv, HoTen} dư thừa thuộc tính HoTen, và Khóa ngoại (như MA_NQL của giám đốc) được phép null.',
              },
              {
                id: 'c',
                label: 'Một bảng có thể có đồng thời 2 Khóa chính (Primary Key) riêng biệt.',
                explanation: 'Sai: Một bảng có thể có nhiều Khóa dự tuyển (Candidate Keys), nhưng chỉ chọn đúng 1 Khóa chính (Primary Key) — khóa chính đó có thể gồm nhiều cột ghép lại chứ không phải 2 khóa chính rời nhau.',
              },
            ],
            correctOptionId: 'a',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 4.3
     * ====================================================================== */
    {
      id: 'lesson-4-3',
      moduleId: 'module-4',
      orderLabel: '4.3',
      title: 'Ánh xạ ER → Quan hệ (Phần 1): Thực thể Mạnh, Thực thể Yếu & Đa trị',
      subtitle:
        'Thực hành trực tiếp Bước 1, Bước 2 và Bước 6 của thuật toán chuyển đổi lược đồ ER sang Lược đồ Quan hệ.',
      slideRange: 'C3_1.pdf · tr. 26–29 & 36',
      estimatedMinutes: 15,
      steps: [
        {
          id: 'step-4-3-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Quy tắc ánh xạ Thực thể Mạnh, Phức hợp, Thực thể Yếu & Thuộc tính Đa trị',
          narrative: [
            'Thuật toán chuyển đổi ER sang Quan hệ (`C3_1.pdf` tr. 26–37) xử lý các kiểu thực thể và thuộc tính đặc biệt như sau:',
            '1. **Bước 1 — Kiểu thực thể mạnh $E$**: Tạo quan hệ $R$ chứa mọi thuộc tính đơn của $E$. Nếu $E$ có **thuộc tính phức hợp** (như `HoTen` gồm `Ho, Dem, Ten`), chỉ đưa **các thuộc tính thành phần đơn** vào $R$. Chọn khóa chính của $E$ làm `PK` của $R$. (Thuộc tính dẫn xuất không lưu thành cột).',
            '2. **Bước 2 — Kiểu thực thể yếu $W$ (có chủ $E$)**:',
            '   - Tạo quan hệ $R$ cho $W$ chứa các thuộc tính đơn của $W$.',
            '   - Đưa khóa chính $\\text{PK}(E)$ của thực thể chủ vào $R$ làm **khóa ngoại `FK`** tham chiếu tới $E$.',
            '   - **Khóa chính của $R$ là khóa ghép**: $\\text{PK}(R) = \\text{PK}(E) \\cup \\text{PartialKey}(W)$!',
            '3. **Bước 6 — Thuộc tính đa trị $A$ của thực thể $E$** (như `BANGCAP` của `NHANVIEN` hay `DIADIEM` của `PHONGBAN`):',
            '   - Vì bảng quan hệ cấm ô đa trị, **bắt buộc tách thành một quan hệ mới $R_A$** gồm cột $A$ kết hợp với khóa chính $\\text{PK}(E)$ làm khóa ngoại.',
            '   - **Khóa chính của $R_A$ là toàn bộ cặp $(\\text{PK}(E), A)$**!',
          ].join('\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Lỗi kinh điển khi ánh xạ Thực thể yếu & Thuộc tính đa trị',
              slideSource: 'C3_1.pdf · tr. 29 & 36',
              body: '- Với thực thể yếu `THANNHAN(MANV, TEN_TN, GT, QUANHE)`: nhiều bạn chỉ gạch chân mỗi `TEN_TN` hoặc chỉ gạch chân `MANV`. Phải gạch chân **cả hai** $(\\underline{\\text{MANV}}, \\underline{\\text{TEN\\_TN}})$!\n- Với bảng tách từ đa trị `DIADIEM_PHG(MAPHG, DIADIEM)`: nếu chỉ đặt `MAPHG` làm PK thì phòng số 5 chỉ lưu được 1 địa điểm duy nhất! Phải gạch chân **cả hai** $(\\underline{\\text{MAPHG}}, \\underline{\\text{DIADIEM}})$.',
            },
          ],
          workbench: {
            kind: 'er-diagram',
            diagramId: 'NHANVIEN_THANNHAN_WEAK',
            title: 'Quan sát sơ đồ NHANVIEN — Co_than_nhan — THANNHAN',
          },
        },
        {
          id: 'step-4-3-2',
          phaseLabel: 'Thực hành',
          title: 'Tự tay thiết kế bảng cho Thực thể Mạnh NHANVIEN & Thực thể Yếu THANNHAN',
          narrative: [
            'Ở bàn thực hành bên phải, bạn hãy chuyển sơ đồ `NHANVIEN_THANNHAN_WEAK` thành **2 bảng quan hệ `NHANVIEN` và `THANNHAN`** hoàn chỉnh (chọn đúng cột, đánh dấu khóa chính `PK` và khai báo khóa ngoại `FK` từ `THANNHAN` về `NHANVIEN`)!',
          ].join('\n\n'),
          workbench: {
            kind: 'schema-mapper',
            diagramId: 'NHANVIEN_THANNHAN_WEAK',
            title: 'Thực hành ánh xạ Thực thể Yếu THANNHAN',
          },
          challenge: {
            type: 'schema-mapper',
            diagramId: 'NHANVIEN_THANNHAN_WEAK',
            prompt:
              'Ánh xạ sơ đồ `NHANVIEN_THANNHAN_WEAK` thành 2 lược đồ quan hệ **`NHANVIEN`** và **`THANNHAN`** (đầy đủ cột, khóa chính `PK` và khóa ngoại `FK`).',
            candidateColumns: ['MANV', 'HOTEN', 'TEN_TN', 'QUANHE'],
            expectedTables: [
              {
                name: 'NHANVIEN',
                columns: ['MANV', 'HOTEN'],
                primaryKey: ['MANV'],
                foreignKeys: [],
              },
              {
                name: 'THANNHAN',
                columns: ['MANV', 'TEN_TN', 'QUANHE'],
                primaryKey: ['MANV', 'TEN_TN'],
                foreignKeys: [
                  { columns: ['MANV'], refTable: 'NHANVIEN', refColumns: ['MANV'] },
                ],
              },
            ],
            hints: [
              'Bảng NHANVIEN gồm 2 cột (MANV, HOTEN) với khóa chính là MANV.',
              'Bảng THANNHAN phải mượn thêm MANV từ thực thể chủ: gồm (MANV, TEN_TN, QUANHE), gạch chân PK cho CẢ HAI cột (MANV, TEN_TN), và khai báo FK: MANV → NHANVIEN(MANV).',
            ],
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 4.4
     * ====================================================================== */
    {
      id: 'lesson-4-4',
      moduleId: 'module-4',
      orderLabel: '4.4',
      title: 'Ánh xạ ER → Quan hệ (Phần 2): Liên kết 1:1, 1:N, N:M, Đa ngôi & EER',
      subtitle:
        'Gỡ bẫy ngược chiều khóa ngoại 1:N, nắm vững tách bảng N:M / bậc 3 và 4 phương án ánh xạ kế thừa EER (8A–8D).',
      slideRange: 'C3_1.pdf · tr. 30–43',
      estimatedMinutes: 16,
      steps: [
        {
          id: 'step-4-4-1',
          phaseLabel: 'Gỡ bẫy',
          title: 'BẪY SỐ 2 KHI THI UET: Đưa Khóa ngoại đi chiều nào trong liên kết 1:1, 1:N và N:M?',
          narrative: [
            'Đây là chỗ mất điểm nhiều nhất khi chuyển sơ đồ ER sang các bảng quan hệ (`C3_1.pdf` tr. 30–35):',
            '### 1. Bước 3 — Liên kết hai ngôi `1:1` (ví dụ `NHANVIEN (0,1) — La_truong_phong — (1,1) PHONGBAN`)',
            '- Chọn thực thể tham gia **toàn bộ `(1,1)`** làm bên nhận khóa ngoại! Ở đây **mọi phòng ban đều có trưởng phòng**, còn đa số nhân viên không làm trưởng phòng. Nếu đặt `MAPHG_QL` vào `NHANVIEN` sẽ sinh ra 95% ô `null`! Do đó ta đưa `MANV` (đổi tên thành `TRPHG`) kèm thuộc tính liên kết `NG_NHANCHUC` sang bảng **`PHONGBAN`**.',
            '',
            '### 2. Bước 4 — Liên kết hai ngôi `1:N` (ví dụ `PHONGBAN` phía `1` — `Lam_viec` — `NHANVIEN` phía `N`)',
            '- **QUY TẮC BẤT DI BẤT DỊCH**: **Luôn luôn lấy Khóa chính của phía `1` (`MAPHG`) chép sang bảng phía `N` (`NHANVIEN`) làm Khóa ngoại!**',
            '- Tại sao cấm làm ngược lại? Nếu bạn chép `MANV` sang bảng `PHONGBAN`, một phòng có 20 nhân viên sẽ khiến ô `MANV` trong `PHONGBAN` bị đa trị (vi phạm chuẩn 1NF)!',
            '',
            '### 3. Bước 5 & Bước 7 — Liên kết `N:M` và Liên kết bậc $n \\ge 3$',
            '- Với `N:M` (như `NHANVIEN` — `Phan_cong` — `DEAN` có thuộc tính `SOGIO`), không thể đặt khóa ngoại ở bên nào mà không bị đa trị $\\implies$ **Bắt buộc tạo bảng mới** `NV_DEAN(MANV, MADA, SOGIO)` với khóa chính là cặp $(\\underline{\\text{MANV}}, \\underline{\\text{MADA}})$.',
            '- Với liên kết bậc $n \\ge 3$ (như `Cung_cap`), cũng tách thành bảng mới `CUNGCAP(MA_NCC, MA_MH, MA_DA, SOLUONG)` nhận khóa ngoại từ tất cả các thực thể tham gia.',
          ].join('\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Cẩn thận nhìn nhầm phía 1 và phía N khi sơ đồ viết (min, max)!',
              slideSource: 'C3_1.pdf · tr. 33',
              body: 'Nhớ lại Bài 2.4: Trên sơ đồ viết `NHANVIEN (1,1) — Lam_viec — (1,n) PHONGBAN`, con số `(1,n)` nằm cạnh `PHONGBAN` nghĩa là **1 phòng có $n$ nhân viên** $\\implies$ **`PHONGBAN` là phía `1`**, còn **`NHANVIEN` mới là phía `N`**! Vì vậy `MAPHG` phải đi vào bảng `NHANVIEN`.',
            },
          ],
          workbench: {
            kind: 'er-diagram',
            diagramId: 'NV_PB_BASIC',
            title: 'Đối chiếu liên kết Lam_viec (1:N), La_truong_phong (1:1) và đa trị BANGCAP',
          },
        },
        {
          id: 'step-4-4-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Bước 8 — 4 Phương án Ánh xạ Chuyên biệt hóa EER sang Quan hệ',
          narrative: [
            'Với lớp cha $C$ (khóa $k$) và các lớp con $S_1, \\dots, S_m$, giáo trình mở rộng 4 lựa chọn ánh xạ (`C3_1.pdf` tr. 38–42):',
            '- **Phương án 8A (Chuẩn phổ biến nhất — Đa bảng Lớp cha + Các lớp con)**: Tạo bảng $L$ cho lớp cha $C$ giữ khóa $k$ và thuộc tính chung; tạo bảng $L_i$ cho mỗi lớp con $S_i$ gồm **(khóa $k$ kế thừa + thuộc tính riêng của $S_i$)**, trong đó $k$ vừa là `PK` vừa là `FK` tham chiếu về $L(k)$. Áp dụng được cho **mọi** loại ràng buộc (`d/o`, `Total/Partial`)!',
            '- **Phương án 8B (Chỉ tạo bảng cho các Lớp con)**: Mỗi bảng $L_i$ ôm cả thuộc tính chung của $C$ lẫn thuộc tính riêng. **Chỉ hợp lệ hoàn toàn khi chuyên biệt hóa là `(d)` Rời rạc + `Total` Toàn bộ** (nếu `(o)` sẽ dư thừa dữ liệu; nếu `Partial` sẽ đánh rơi thực thể cha không thuộc lớp con nào!).',
            '- **Phương án 8C (Gộp 1 bảng duy nhất + 1 cột phân loại `Type` $t$)**: Áp dụng cho chuyên biệt hóa **`(d)` Rời rạc** (chấp nhận sinh các ô `null` ở thuộc tính riêng).',
            '- **Phương án 8D (Gộp 1 bảng duy nhất + $m$ cột cờ Boolean $t_1, \\dots, t_m$)**: Áp dụng cho chuyên biệt hóa **`(o)` Chồng lấn**.',
          ].join('\n'),
          workbench: {
            kind: 'er-diagram',
            diagramId: 'EMPLOYEE_EER',
            title: 'Liên hệ Phương án 8A–8D trên sơ đồ EMPLOYEE_EER',
          },
        },
        {
          id: 'step-4-4-3',
          phaseLabel: 'Thực hành',
          title: 'Thực hành tổng hợp: Ánh xạ NHANVIEN — PHONGBAN (kèm 1:N, 1:1 và Đa trị)',
          narrative: [
            'Đây là bài tập kinh điển kết tinh toàn bộ Chặng 4! Từ sơ đồ `NV_PB_BASIC` ở khung bên phải, bạn hãy hoàn thiện **3 bảng quan hệ**:',
            '1. `NHANVIEN`: nhận khóa ngoại `MAPHG` từ liên kết `1:N` `Lam_viec`.',
            '2. `PHONGBAN`: nhận khóa ngoại `TRPHG` (tham chiếu `NHANVIEN.MANV`) và thuộc tính `NG_NHANCHUC` từ liên kết `1:1` `La_truong_phong`.',
            '3. `NV_BANGCAP`: tách từ thuộc tính đa trị `BANGCAP` của `NHANVIEN`.',
          ].join('\n\n'),
          workbench: {
            kind: 'schema-mapper',
            diagramId: 'NV_PB_BASIC',
            title: 'Tổng duyệt Ánh xạ ER → Quan hệ (1:N + 1:1 + Đa trị)',
          },
          challenge: {
            type: 'schema-mapper',
            diagramId: 'NV_PB_BASIC',
            prompt:
              'Thiết kế đầy đủ 3 lược đồ quan hệ **`NHANVIEN`**, **`PHONGBAN`** và **`NV_BANGCAP`** từ sơ đồ `NV_PB_BASIC` (nhớ khai báo đúng cả `PK` lẫn `FK`).',
            candidateColumns: [
              'MANV',
              'TENNV',
              'LUONG',
              'MAPHG',
              'TENPHG',
              'TRPHG',
              'NG_NHANCHUC',
              'BANGCAP',
            ],
            expectedTables: [
              {
                name: 'NHANVIEN',
                columns: ['MANV', 'TENNV', 'LUONG', 'MAPHG'],
                primaryKey: ['MANV'],
                foreignKeys: [
                  { columns: ['MAPHG'], refTable: 'PHONGBAN', refColumns: ['MAPHG'] },
                ],
              },
              {
                name: 'PHONGBAN',
                columns: ['MAPHG', 'TENPHG', 'TRPHG', 'NG_NHANCHUC'],
                primaryKey: ['MAPHG'],
                foreignKeys: [
                  { columns: ['TRPHG'], refTable: 'NHANVIEN', refColumns: ['MANV'] },
                ],
              },
              {
                name: 'NV_BANGCAP',
                columns: ['MANV', 'BANGCAP'],
                primaryKey: ['MANV', 'BANGCAP'],
                foreignKeys: [
                  { columns: ['MANV'], refTable: 'NHANVIEN', refColumns: ['MANV'] },
                ],
              },
            ],
            hints: [
              'Bảng NHANVIEN có các cột (MANV, TENNV, LUONG, MAPHG) với PK = MANV và FK: MAPHG → PHONGBAN(MAPHG).',
              'Bảng PHONGBAN có các cột (MAPHG, TENPHG, TRPHG, NG_NHANCHUC) với PK = MAPHG và FK: TRPHG → NHANVIEN(MANV).',
              'Bảng NV_BANGCAP tách từ thuộc tính đa trị có 2 cột (MANV, BANGCAP), gạch chân PK cho CẢ HAI (MANV, BANGCAP), và FK: MANV → NHANVIEN(MANV).',
            ],
          },
        },
      ],
    },
  ],
};
