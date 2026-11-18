import { ModuleSpec } from '../domain/types';

export const MODULE_5_ALGEBRA: ModuleSpec = {
  id: 'module-5',
  order: 5,
  title: 'Đại số Quan hệ & Luyện Thi Tổng hợp',
  sourceFile: 'C3_2.pdf (111 trang)',
  description:
    'Các phép cập nhật và kiểm tra ràng buộc, phép toán tập hợp, Chọn σ, Chiếu π, Đổi tên ρ, các phép Nối (Join & Outer Join), Phép Chia 4 bước ÷, Gom nhóm ℱ và phòng luyện đề Giữa kỳ UET.',
  lessons: [
    /* ========================================================================
     * BÀI 5.1
     * ====================================================================== */
    {
      id: 'lesson-5-1',
      moduleId: 'module-5',
      orderLabel: '5.1',
      title: 'Các Phép toán Cập nhật Quan hệ & Chính sách Ràng buộc',
      subtitle:
        'Thực thi lệnh INSERT, DELETE, MODIFY chuẩn cú pháp slide UET và kiểm nghiệm 3 chính sách xử lý vi phạm tham chiếu (REJECT, CASCADE, SET_NULL).',
      slideRange: 'C3_2.pdf · tr. 4–17',
      estimatedMinutes: 14,
      steps: [
        {
          id: 'step-5-1-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Cú pháp hình thức của 3 phép cập nhật INSERT · DELETE · MODIFY',
          narrative: [
            'Trước khi học các phép truy vấn trích xuất dữ liệu, phần mở đầu `C3_2.pdf` (tr. 5–16) định nghĩa 3 phép toán làm thay đổi trạng thái quan hệ $r(R)$ cùng các vi phạm có thể phát sinh:',
            '### 1. Phép Thêm bộ — `INSERT(R; v1, v2, ..., vn)`',
            '- Có thể vi phạm **cả 4 loại ràng buộc**:',
            '  1. *Ràng buộc miền giá trị*: Ví dụ nhập `Diem = 15` ngoài khoảng $[0, 10]$.',
            '  2. *Ràng buộc khóa*: Nhập trùng mã khóa chính đã có.',
            '  3. *Toàn vẹn thực thể*: Nhập `null` vào thuộc tính khóa chính (`Masv = null`).',
            '  4. *Toàn vẹn tham chiếu*: Nhập điểm cho mã sinh viên `SV99` chưa hề tồn tại trong `SINHVIEN`!',
            '',
            '### 2. Phép Xóa bộ — `DELETE(R; điều_kiện)`',
            '- Không thể vi phạm miền giá trị, khóa hay toàn vẹn thực thể, nhưng **rất dễ vi phạm Toàn vẹn Tham chiếu** nếu bộ bị xóa ở bảng cha đang được các bộ ở bảng con tham chiếu tới!',
            '- Hệ QTCSDL xử lý bằng **1 trong 3 chính sách (`C3_2.pdf` tr. 11)**:',
            '  - **`REJECT` (Từ chối / Restrict)**: Hủy bỏ thao tác xóa (mặc định an toàn nhất).',
            '  - **`CASCADE` (Xóa dây chuyền)**: Xóa luôn tất cả các bộ con đang tham chiếu tới bộ vừa xóa.',
            '  - **`SET_NULL` (hoặc `SET DEFAULT`)**: Giữ các bộ con nhưng đổi giá trị khóa ngoại của chúng thành `null` (chỉ áp dụng được nếu cột `FK` không nằm trong `PK` của bảng con!).',
            '',
            '### 3. Phép Sửa đổi — `MODIFY(R; điều_kiện; cột = biểu_thức)`',
            '- Về bản chất tương đương kiểm tra ràng buộc trên giá trị mới (nhẹ nhàng nếu sửa cột thường, nhưng nghiêm ngặt như `DELETE + INSERT` nếu sửa `PK` hoặc `FK`).',
          ].join('\n'),
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'DAOTAO',
            title: 'Xem các mối liên kết Khóa ngoại trong CSDL DAOTAO',
            caption: 'SV_DIEM và SV_LOP đều có khóa ngoại tham chiếu về SINHVIEN(Masv).',
          },
        },
        {
          id: 'step-5-1-2',
          phaseLabel: 'Thực hành',
          title: 'Phòng thí nghiệm Ràng buộc Cập nhật (INSERT / DELETE / MODIFY)',
          narrative: [
            'Ở khung bên phải, bạn hãy bấm thử các **lệnh cập nhật mẫu** để chứng kiến cách DBMS bắt lỗi từng loại vi phạm, sau đó thử đổi chính sách từ `REJECT` sang `CASCADE` rồi chạy lại lệnh `DELETE(SINHVIEN; Masv = \'T1\')`!',
          ].join('\n\n'),
          workbench: {
            kind: 'anomaly',
            datasetId: 'DAOTAO',
            title: 'Sandbox Kiểm tra Ràng buộc Cập nhật UET',
          },
          challenge: {
            type: 'anomaly-sim',
            mode: 'relational-update',
            datasetId: 'DAOTAO',
            prompt:
              'Hãy nhấn thực thi ít nhất một lệnh kiểm nghiệm bên phải (ví dụ thử vi phạm khóa ngoại hoặc thêm môn học hợp lệ) để nắm chắc cơ chế bảo vệ toàn vẹn.',
            presetCommands: [
              {
                id: 'cmd-entity-err',
                label: '1. Thử lỗi Toàn vẹn Thực thể (PK = null)',
                command: "INSERT(SINHVIEN; null, 'Lê', 'Văn', 'Tùng')",
                expectStatus: 'ENTITY_INTEGRITY_VIOLATION',
              },
              {
                id: 'cmd-fk-err',
                label: '2. Thử lỗi Tham chiếu FK (Masv lạ)',
                command: "INSERT(SV_DIEM; 'SV99', 'Int1001', 9)",
                expectStatus: 'REFERENTIAL_VIOLATION',
              },
              {
                id: 'cmd-del-t1',
                label: '3. Xóa SV T1 đang có điểm (thử với REJECT / CASCADE)',
                command: "DELETE(SINHVIEN; Masv = 'T1')",
                expectStatus: 'REFERENTIAL_VIOLATION',
              },
              {
                id: 'cmd-valid-insert',
                label: '4. Thêm môn học mới hợp lệ',
                command: "INSERT(MONHOC; 'Int2005', 'Mạng máy tính', 3)",
                expectStatus: 'ok',
              },
            ],
            goalDescription:
              'Nhấn một trong các nút lệnh mẫu hoặc gõ lệnh cập nhật hợp lệ trên bàn thực hành.',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 5.2
     * ====================================================================== */
    {
      id: 'lesson-5-2',
      moduleId: 'module-5',
      orderLabel: '5.2',
      title: 'Phép toán Tập hợp (∪, ∩, −) & Điều kiện Khả hợp',
      subtitle:
        'Hiểu điều kiện tiên quyết để ghép dọc hai bảng (Union Compatibility) và ứng dụng phép Trừ (−) cho các câu truy vấn phủ định "CHƯA / KHÔNG".',
      slideRange: 'C3_2.pdf · tr. 18–25',
      estimatedMinutes: 14,
      steps: [
        {
          id: 'step-5-2-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Điều kiện Khả hợp (Union Compatibility) & 3 Phép toán Tập hợp',
          narrative: [
            'Vì mỗi quan hệ là một tập hợp các bộ, ta có thể áp dụng 3 phép toán tập hợp kinh điển **Hợp ($\\cup$)**, **Giao ($\\cap$)** và **Trừ ($-$)** — **NHƯNG chỉ khi hai quan hệ $R(A_1, \\dots, A_n)$ và $S(B_1, \\dots, B_m)$ KHẢ HỢP (*Union-Compatible*)** (`C3_2.pdf` tr. 19):',
            '1. **Cùng bậc**: $n = m$ (số lượng thuộc tính bằng nhau).',
            '2. **Tương thích miền giá trị từng cột tương ứng**: $\\Dom(A_i) = \\Dom(B_i)$ với mọi $1 \\le i \\le n$.',
            '*(Quy ước tên cột của kết quả mặc định lấy theo danh sách tên cột của quan hệ đứng trước $R$).*',
            '',
            '### Định nghĩa và tính chất đại số (`C3_2.pdf` tr. 20–24):',
            '- **Phép Hợp**: $R \\cup S = \\{ t \\mid t \\in R \\lor t \\in S \\}$ — **tự động loại bỏ các bộ trùng nhau**!',
            '- **Phép Giao**: $R \\cap S = \\{ t \\mid t \\in R \\land t \\in S \\}$ *(có thể biểu diễn qua phép trừ: $R \\cap S = R - (R - S)$)*.',
            '- **Phép Trừ**: $R - S = \\{ t \\mid t \\in R \\land t \\notin S \\}$.',
            '  - $\\cup$ và $\\cap$ có tính **giao hoán** và **kết hợp**.',
            '  - Riêng **phép Trừ ($-$) KHÔNG giao hoán** ($R - S \\ne S - R$) và không kết hợp!',
          ].join('\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Vũ khí giải mọi câu hỏi "Không / Chưa từng" trong Đại số Quan hệ',
              slideSource: 'C3_2.pdf · tr. 23',
              body: 'Khi đề bài yêu cầu *"Tìm sinh viên **chưa** học môn X"* hay *"Tìm trưởng phòng **không có** thân nhân"*, tuyệt đối **ĐỪNG viết điều kiện $\\sigma_{\\text{Mamon} \\ne X}$**! Vì 1 sinh viên học cả `CSDL` lẫn `NNLT` vẫn có dòng `CSDL != NNLT` nên không bị loại! Bạn **bắt buộc phải dùng Phép Trừ ($-$)**:\n$$\\text{(Tập tất cả mã SV)} - \\text{(Tập mã SV đã học môn } X\\text{)}$$',
            },
          ],
          workbench: {
            kind: 'algebra',
            datasetId: 'SET_OPS_TOY',
            title: 'Thử nghiệm Hợp, Giao, Trừ và Khả hợp trên SET_OPS_TOY',
            caption: 'Thử chạy GIAOVIEN ∪ NHANVIEN, GIAOVIEN ∩ NHANVIEN, hoặc thử GIAOVIEN ∪ MONHOC_SMALL để xem báo lỗi khả hợp!',
            initialExpression: 'GIAOVIEN ∩ NHANVIEN',
          },
        },
        {
          id: 'step-5-2-2',
          phaseLabel: 'Thực hành',
          title: 'Luyện tập Phép Trừ (−) tránh bẫy điều kiện khác (≠)',
          narrative: [
            'Trên CSDL `DAOTAO` ở khung bên phải, hãy tìm **danh sách mã sinh viên (`Masv`) chưa từng có điểm môn `\'Int1002\'`**. Bạn có thể dùng thanh công cụ ký hiệu `π`, `-`, `σ` hoặc gõ `pi`, `-`, `sigma`!',
          ].join('\n\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'DAOTAO',
            title: 'Thử thách Phép Trừ Tập hợp trên DAOTAO',
          },
          challenge: {
            type: 'algebra',
            datasetId: 'DAOTAO',
            prompt:
              'Viết biểu thức Đại số quan hệ trả về quan hệ 1 cột **`Masv`** gồm các sinh viên trong bảng `SINHVIEN` **chưa có điểm môn `\'Int1002\'`** trong bảng `SV_DIEM`.',
            starterExpression: "π_{Masv}(SINHVIEN) - ",
            solutionExpression: "π_{Masv}(SINHVIEN) - π_{Masv}(σ_{Mamon = 'Int1002'}(SV_DIEM))",
            hints: [
              'Hai vế của phép trừ (-) phải khả hợp (cùng là bảng 1 cột Masv).',
              "Lấy tập tất cả mã sinh viên π_{Masv}(SINHVIEN) trừ đi tập mã sinh viên đã học môn 'Int1002': π_{Masv}(σ_{Mamon = 'Int1002'}(SV_DIEM)).",
            ],
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 5.3
     * ====================================================================== */
    {
      id: 'lesson-5-3',
      moduleId: 'module-5',
      orderLabel: '5.3',
      title: 'Phép Chọn (σ), Phép Chiếu (π), Phép Gán (←) & Đổi tên (ρ)',
      subtitle:
        'Làm chủ bộ tứ phép toán một ngôi: lọc ngang bằng σ, cắt dọc khử trùng bằng π, tách bước trung gian bằng ← và đổi tên lược đồ bằng ρ.',
      slideRange: 'C3_2.pdf · tr. 26–49',
      estimatedMinutes: 16,
      steps: [
        {
          id: 'step-5-3-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Lọc ngang (Selection σ) vs. Trích dọc khử trùng (Projection π)',
          narrative: [
            'Hãy hình dung bảng quan hệ như một ma trận hai chiều (`C3_2.pdf` tr. 26–39):',
            '### 1. Phép Chọn — $\\sigma_{F}(R)$ (*Selection*: Lát cắt NGANG)',
            '- Trích ra các bộ của $R$ thỏa mãn biểu thức điều kiện logic $F$ (kết hợp $=, \\ne, <, \\le, >, \\ge$ với $\\land, \\lor, \\neg$).',
            '- **Lược đồ không đổi** (bậc của $\\sigma_F(R)$ bằng đúng bậc của $R$), số bộ $\\le |R|$.',
            '- **Tính chất giao hoán cực quý giá** (dùng để tối ưu hóa truy vấn): $\\sigma_{F_1}(\\sigma_{F_2}(R)) = \\sigma_{F_2}(\\sigma_{F_1}(R)) = \\sigma_{F_1 \\land F_2}(R)$.',
            '',
            '### 2. Phép Chiếu — $\\pi_{L}(R)$ (*Projection*: Lát cắt DỌC)',
            '- Chỉ giữ lại danh sách thuộc tính $L$ theo đúng thứ tự liệt kê và vứt bỏ các cột còn lại.',
            '- **BẪY SỐ 3 KHI THI UET — Tự động khử trùng lặp (*Duplicate Elimination*)**: Khác với `SELECT` mặc định của SQL giữ lại dòng trùng, kết quả của $\\pi_L(R)$ trong Đại số quan hệ là một **tập hợp toán học**, nên nếu nhiều nhân viên cùng thuộc phòng số 4 và bạn chiếu $\\pi_{\\text{PHG}}(\\text{NHANVIEN})$, số `4` **chỉ xuất hiện đúng 1 lần duy nhất**!',
            '- Lưu ý giao hoán: Phép chiếu **KHÔNG giao hoán** tùy ý! $\\pi_{L_1}(\\pi_{L_2}(R)) = \\pi_{L_1}(R)$ **chỉ hợp lệ khi $L_1 \\subseteq L_2$** (nếu $L_2$ đã vứt mất cột trong $L_1$ thì biểu thức lỗi ngay).',
          ].join('\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'JOIN_TOY',
            title: 'Kiểm chứng Phép Chiếu khử trùng trên bảng R_PROJ (C3_2.pdf tr. 34)',
            caption: 'R_PROJ có 4 bộ trong đó có hai bộ cùng mang (A=α, C=1). Hãy chạy π_{A, C}(R_PROJ) để thấy chỉ còn 3 bộ!',
            initialExpression: 'π_{A, C}(R_PROJ)',
          },
        },
        {
          id: 'step-5-3-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Biểu thức lồng nhau, Phép Gán (←) & Phép Đổi tên (ρ)',
          narrative: [
            'Khi câu truy vấn dài, slide `C3_2.pdf` (tr. 43–49) cho phép viết theo **2 cách tương đương**:',
            '1. **Biểu thức lồng nhau một dòng (*Single In-line Expression*)**: Ví dụ $\\pi_{\\text{HONV, TENNV}}(\\sigma_{\\text{PHG}=4}(\\text{NHANVIEN}))$.',
            '2. **Chuỗi phép gán từng bước (*Sequence of Assignments* dùng $\\leftarrow$)**: Cực kỳ sạch sẽ và dễ kiểm tra khi đi thi viết tay:',
            '$$\\text{NV\\_P4} \\leftarrow \\sigma_{\\text{PHG}=4}(\\text{NHANVIEN})$$',
            '$$\\text{KQ} \\leftarrow \\pi_{\\text{HONV, TENNV}}(\\text{NV\\_P4})$$',
            '',
            '### 3. Phép Đổi tên — $\\rho$ (*Rename Operator*)',
            'Dùng khi cần đổi tên quan hệ và/hoặc tên các cột (đặc biệt bắt buộc khi **tự nối một bảng với chính nó** như tìm người quản lý trực tiếp của nhân viên!):',
            '- $\\rho_{S(B_1, B_2, \\dots, B_n)}(R)$: Đổi cả tên quan hệ thành $S$ lẫn tên các thuộc tính thành $(B_1, \\dots, B_n)$.',
            '- $\\rho_{S}(R)$: Chỉ đổi tên quan hệ thành $S$.',
            '- $\\rho_{(B_1, B_2, \\dots, B_n)}(R)$: Chỉ đổi tên danh sách thuộc tính.',
          ].join('\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'CONGTY_PHG',
            title: 'Thử nghiệm Phép Gán nhiều dòng và Đổi tên trên CONGTY_PHG',
            initialExpression: 'NV4 ← σ_{PHG = 4}(NHANVIEN)\nπ_{HONV, TENNV, LUONG}(NV4)',
          },
        },
        {
          id: 'step-5-3-3',
          phaseLabel: 'Thực hành',
          title: 'Thực hành kết hợp Chọn (σ), Chiếu (π) và Đổi tên (ρ)',
          narrative: [
            'Trên CSDL `CONGTY_PHG`, hãy trích ra **họ, tên và lương** của các nhân viên làm việc ở **phòng số 5 (`PHG = 5`)** có **mức lương trên 39000 (`LUONG > 39000`)**, sau đó **đổi tên 3 cột kết quả thành `(HO, TEN, MUC_LUONG)`**!',
          ].join('\n\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'CONGTY_PHG',
            title: 'Thử thách Chọn + Chiếu + Đổi tên chuẩn UET',
          },
          challenge: {
            type: 'algebra',
            datasetId: 'CONGTY_PHG',
            checkColumnNames: true,
            prompt:
              'Lấy `HONV, TENNV, LUONG` của các nhân viên thuộc phòng `PHG = 5` có `LUONG > 39000`, đồng thời dùng phép đổi tên $\\rho$ để đặt tên 3 cột kết quả là **`(HO, TEN, MUC_LUONG)`**.',
            starterExpression:
              'NV5 ← σ_{PHG = 5 ∧ LUONG > 39000}(NHANVIEN)\nKQ ← π_{HONV, TENNV, LUONG}(NV5)\n',
            solutionExpression:
              'NV5 ← σ_{PHG = 5 ∧ LUONG > 39000}(NHANVIEN)\nKQ ← π_{HONV, TENNV, LUONG}(NV5)\nρ_{(HO, TEN, MUC_LUONG)}(KQ)',
            hints: [
              'Hai dòng đầu đã lọc đúng nhân viên phòng 5 lương > 39000 và chiếu 3 cột (HONV, TENNV, LUONG).',
              'Ở dòng thứ 3, áp dụng phép đổi tên cột: ρ_{(HO, TEN, MUC_LUONG)}(KQ).',
            ],
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 5.4
     * ====================================================================== */
    {
      id: 'lesson-5-4',
      moduleId: 'module-5',
      orderLabel: '5.4',
      title: 'Tích Đề-các (×), Các Phép Nối (⨝, *) & Nối Ngoài (⟕, ⟖, ⟗)',
      subtitle:
        'Hiểu cách ghép ngang nhiều bảng, phân biệt Theta Join với Natural Join (*), gỡ bẫy rơi bộ null bằng Outer Join và nắm Hệ phép toán đầy đủ.',
      slideRange: 'C3_2.pdf · tr. 50–74 & 100–106',
      estimatedMinutes: 18,
      steps: [
        {
          id: 'step-5-4-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Từ Tích Đề-các (×) đến Nối có điều kiện (⨝_F) và Nối Tự nhiên (*)',
          narrative: [
            'Khi thông tin nằm rải ở hai bảng $R$ (bậc $n$, $k_1$ bộ) và $S$ (bậc $m$, $k_2$ bộ), ta ghép chúng theo các cấp độ tinh gọn dần (`C3_2.pdf` tr. 50–67):',
            '1. **Tích Đề-các ($R \\times S$)**: Ghép **mọi** bộ của $R$ với **mọi** bộ của $S$ $\\implies$ tạo ra bảng bậc $n + m$ gồm đúng $k_1 \\times k_2$ bộ! Tự nó hầu như vô nghĩa nếu không đi kèm $\\sigma$ phía sau.',
            '2. **Nối có điều kiện / Theta Join ($R \\bowtie_{F} S$)**: Thực hiện tích Đề-các và lọc ngay theo điều kiện nối $F$:',
            '$$R \\bowtie_{F} S \\equiv \\sigma_{F}(R \\times S)$$',
            '   - Kết quả giữ nguyên **đầy đủ $n + m$ cột** của cả hai bảng. Nếu $F$ chỉ dùng dấu bằng `$=$`, ta gọi là **Nối bằng (*Equijoin*)** (do đó cột khóa nối bị lặp lại 2 lần!).',
            '3. **Nối tự nhiên (*Natural Join* — ký hiệu $*$ trên slide UET)**: $R * S$ tự động so sánh bằng trên **tất cả các cặp thuộc tính trùng tên** giữa $R$ và $S$, rồi **loại bỏ cột trùng để chỉ giữ lại 1 bản duy nhất** (bậc còn $n + m - k_{\\text{chung}}$). Nếu hai bảng không có cột nào trùng tên cần đổi tên trước bằng $\\rho$.',
          ].join('\n'),
          callouts: [
            {
              kind: 'definition',
              title: 'Hệ phép toán Đầy đủ (Complete Set of Relational Algebra Operations)',
              slideSource: 'C3_2.pdf · tr. 73',
              body: 'Tập **5 phép toán gốc $\\{\\sigma, \\pi, \\times, -, \\cup\\}$** tạo thành một **hệ đầy đủ**: mọi phép toán cổ điển khác đều biểu diễn được qua 5 phép này (ví dụ $R \\cap S = R - (R - S)$, $R \\bowtie_F S = \\sigma_F(R \\times S)$, và cả phép chia $R \\div S$ ở bài sau!).',
            },
          ],
          workbench: {
            kind: 'algebra',
            datasetId: 'CONGTY_PHG',
            title: 'So sánh Nối có điều kiện ⨝ trên CSDL Công ty',
            caption: 'Nhấn sang tab "Cây thực thi từng bước" bên dưới kết quả để xem bảng trung gian ở từng nút!',
            initialExpression: "π_{HONV, TENNV, TENPHG}(NHANVIEN ⨝_{PHG = MAPHG} PHONGBAN)",
          },
        },
        {
          id: 'step-5-4-2',
          phaseLabel: 'Gỡ bẫy',
          title: 'BẪY SỐ 4 KHI THI UET: Mất bộ do null ở Inner/Natural Join vs. Nối Ngoài (⟕, ⟖, ⟗)',
          narrative: [
            'Các phép nối $\\bowtie_F$ và $*$ được gọi là **Nối trong (*Inner Joins*)**: những bộ nào không tìm được đối tác khớp ở bảng bên kia — hoặc mang giá trị **`null` ngay tại thuộc tính nối** — sẽ **bị vứt bỏ hoàn toàn khỏi kết quả** (`C3_2.pdf` tr. 61 & 100)!',
            'Ví dụ trên `DAOTAO_OUTER` bên phải: bảng `SINHVIEN` có 7 sinh viên, nhưng chỉ 4 bạn có điểm trong `SV_LOPMH`. Nếu chạy `SINHVIEN * SV_LOPMH`, 3 sinh viên `C1`, `C3`, `T2` biến mất không dấu vết!',
            'Khi nghiệp vụ yêu cầu **giữ lại tất cả các bộ của một (hoặc cả hai) bảng** và điền `null` vào phần khuyết, ta dùng **Nối ngoài (*Outer Joins*, tr. 101–106)**:',
            '- **Nối ngoài trái ($R \\lojoin S$)**: Giữ **mọi bộ của bảng trái $R$**; bộ nào không khớp bên $S$ được đệm `null`.',
            '- **Nối ngoài phải ($R \\rojoin S$)**: Giữ **mọi bộ của bảng phải $S$**.',
            '- **Nối ngoài đầy đủ ($R \\fojoin S$)**: Giữ mọi bộ của **cả hai bảng $R$ và $S$**.',
          ].join('\n\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'DAOTAO_OUTER',
            title: 'Thử chạy SINHVIEN * SV_LOPMH (còn 4 bộ) rồi đối chiếu với ⟕!',
            initialExpression: 'SINHVIEN * SV_LOPMH',
          },
        },
        {
          id: 'step-5-4-3',
          phaseLabel: 'Thực hành',
          title: 'Thực hành Nối Ngoài Trái (⟕) giữ trọn danh sách Sinh viên',
          narrative: [
            'Trên CSDL `DAOTAO_OUTER`, Phòng Đào tạo cần in bảng tổng hợp gồm 6 cột **`SINHVIEN.Masv, Ho, Dem, Ten, Malop, Diem`** cho **TẤT CẢ 7 sinh viên** của trường (sinh viên nào chưa học lớp nào vẫn phải hiện họ tên kèm `Malop = null, Diem = null`). Hãy viết biểu thức thực hiện yêu cầu này!',
          ].join('\n\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'DAOTAO_OUTER',
            title: 'Thử thách Nối Ngoài Trái (Left Outer Join ⟕)',
          },
          challenge: {
            type: 'algebra',
            datasetId: 'DAOTAO_OUTER',
            prompt:
              'Dùng phép **Nối ngoài trái ($\\lojoin$)** giữa `SINHVIEN` và `SV_LOPMH` trên điều kiện bằng mã sinh viên, rồi chiếu 6 cột `(SINHVIEN.Masv, Ho, Dem, Ten, Malop, Diem)` để thu đủ 7 bộ.',
            starterExpression:
              'SINHVIEN ⟕_{SINHVIEN.Masv = SV_LOPMH.Masv} SV_LOPMH',
            solutionExpression:
              'π_{SINHVIEN.Masv, Ho, Dem, Ten, Malop, Diem}(SINHVIEN ⟕_{SINHVIEN.Masv = SV_LOPMH.Masv} SV_LOPMH)',
            hints: [
              'Sau phép nối có điều kiện SINHVIEN ⟕_{SINHVIEN.Masv = SV_LOPMH.Masv} SV_LOPMH, kết quả đang có 7 cột (vì cả hai bảng đều có cột Masv).',
              'Bọc bên ngoài bằng phép chiếu π_{SINHVIEN.Masv, Ho, Dem, Ten, Malop, Diem}(...) để giữ đúng 6 cột yêu cầu!',
            ],
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 5.5
     * ====================================================================== */
    {
      id: 'lesson-5-5',
      moduleId: 'module-5',
      orderLabel: '5.5',
      title: 'Phép Chia (R ÷ S) — Tư duy "Với mọi" & Giải phẫu 4 Bước',
      subtitle:
        'Chinh phục phép toán khó nhất đề thi giữa kỳ: hiểu thấu công thức chứng minh T1, S × T1, T2, T1 − T2 và tránh bẫy dư cột trong R.',
      slideRange: 'C3_2.pdf · tr. 75–89',
      estimatedMinutes: 18,
      steps: [
        {
          id: 'step-5-5-1',
          phaseLabel: 'Vấn đề',
          title: 'Làm sao biểu diễn lượng từ phổ dụng ∀ ("học TẤT CẢ các môn", "có ĐỦ MỌI kỹ năng")?',
          narrative: [
            'Xem CSDL `KYNANG_DB` ở khung bên phải (`C3_2.pdf` tr. 75): bảng `KYNANG` liệt kê 3 kỹ năng bắt buộc `(Ngôn ngữ C, Lập trình PHP, Lập trình Android)`, còn `NV_KYNANG(MaNV, Kynang)` ghi nhận kỹ năng từng người.',
            'Ta muốn tìm **`MaNV` sở hữu TẤT CẢ các kỹ năng có trong bảng `KYNANG`**.',
            'Đó chính là lúc dùng **Phép Chia (*Division* — ký hiệu $R(Z) \\div S(X)$)**:',
            '- Điều kiện lược đồ: Tập thuộc tính của số chia $S$ phải là tập con thực sự của số bị chia $R$: **$X \\subsetneq Z$**. Đặt phần thuộc tính còn lại là **$Y = Z - X$**.',
            '- Định nghĩa kết quả $T(Y) = R(Z) \\div S(X)$:',
            '$$t \\in T(Y) \\iff \\forall s \\in S(X),\\; \\text{bộ ghép } \\langle t, s \\rangle \\in R(Z)$$',
          ].join('\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'KYNANG_DB',
            title: 'Chạy thử NV_KYNANG ÷ KYNANG rồi bấm vào tab "Giải phẫu Phép chia 4 bước"!',
            caption: 'Quan sát trực tiếp A1 vượt qua vòng loại còn A2, A3, A4 bị rơi vào T2 vì thiếu kỹ năng nào.',
            initialExpression: 'NV_KYNANG ÷ KYNANG',
          },
        },
        {
          id: 'step-5-5-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'BẪY SỐ 5 KHI THI UET: Giải phẫu 4 bước biến đổi T1, T2 & Cạm bẫy dư cột trong R!',
          narrative: [
            'Đề thi tự luận UET rất hay yêu cầu *"Biểu diễn phép chia $R(Z) \\div S(X)$ qua các phép toán cơ bản $\\{\\pi, \\times, -\\}$"* (`C3_2.pdf` tr. 81–84). Hãy nắm lòng ý nghĩa trực quan của từng dòng thay vì học vẹt:',
            '1. **Bước 1 — Tập ứng viên ban đầu**: $T_1 \\leftarrow \\pi_Y(R)$ *(lấy danh sách mọi ứng viên $Y$ xuất hiện ít nhất 1 lần)*.',
            '2. **Bước 2 — Ghép lý tưởng trừ thực tế**: $(S \\times T_1)$ tạo ra *mọi cặp $(s, y)$ đáng lẽ phải có nếu mọi ứng viên đều đủ 100% tiêu chí*. Đem trừ đi $R$: $(S \\times T_1) - R$ chính là **danh sách các cặp tiêu chí bị THIẾU**!',
            '3. **Bước 3 — Kẻ không đạt chuẩn**: $T_2 \\leftarrow \\pi_Y((S \\times T_1) - R)$ *(chiếu lấy tên những ứng viên thiếu ít nhất 1 tiêu chí)*.',
            '4. **Bước 4 — Người chiến thắng**: $T \\leftarrow T_1 - T_2$ *(lấy tất cả ứng viên trừ đi những người bị thiếu $\\implies$ còn lại đúng những người có ĐỦ TẤT CẢ!)*.',
          ].join('\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'CẠM BẪY CHẾT NGƯỜI: Phải chiếu bỏ cột thừa của R trước khi chia!',
              slideSource: 'C3_2.pdf · tr. 85–88',
              body: 'Giả sử cần tìm `MANV` tham gia tất cả đề án `MADA` của phòng 5 từ bảng `NV_DEAN(MANV, MADA, SOGIO)`. Nếu bạn lấy nguyên bảng `NV_DEAN ÷ DA_P5` mà **quên chiếu bỏ cột `SOGIO`**, thì $Y = Z - X = \\{\\text{MANV, SOGIO}\\}$! Khi đó 1 nhân viên làm đề án 1 (10 giờ) và đề án 2 (20 giờ) sẽ bị coi là khác bộ `SOGIO` và trả về **rỗng $\\emptyset$**! **Luôn phải $\\pi_{\\text{MANV, MADA}}(\\text{NV\\_DEAN})$ trước khi chia!**',
            },
          ],
          workedExamples: [
            {
              id: 'ex-5-5-division-proof',
              title: 'Giải mẫu Phép Chia 4 bước + Khử cột thừa (C3_2.pdf tr. 85–88)',
              problemStatement:
                'Cho $R(\\text{NV\\_DEAN}) = \\{\\text{MANV, MADA, SOGIO}\\}$ và `DEAN(MADA, PHONG)`. Tìm `MANV` tham gia **tất cả** đề án do phòng 5 chủ trì, sau đó viết biểu thức tương đương chỉ dùng $\\{\\pi, \\times, -\\}$.',
              steps: [
                {
                  label: 'Bước A — Chuẩn bị số bị chia sạch (bỏ cột SOGIO) & số chia',
                  markdownLatex:
                    '$$\\text{DA\\_P5} \\leftarrow \\pi_{\\text{MADA}}(\\sigma_{\\text{PHONG}=5}(\\text{DEAN}))$$\n$$\\text{NV\\_DA} \\leftarrow \\pi_{\\text{MANV, MADA}}(\\text{NV\\_DEAN})$$',
                },
                {
                  label: 'Bước B — Dùng phép chia rút gọn',
                  markdownLatex: '$$\\text{KQ} \\leftarrow \\text{NV\\_DA} \\div \\text{DA\\_P5}$$',
                },
                {
                  label: 'Bước C — Khai triển tương đương qua 5 phép toán cơ bản',
                  markdownLatex:
                    '$$T_1 \\leftarrow \\pi_{\\text{MANV}}(\\text{NV\\_DA})$$\n$$T_2 \\leftarrow \\pi_{\\text{MANV}}((\\text{DA\\_P5} \\times T_1) - \\text{NV\\_DA})$$\n$$\\text{KQ} \\leftarrow T_1 - T_2$$',
                },
              ],
              conclusion:
                'Việc tách `NV_DA ← π_{MANV, MADA}(NV_DEAN)` trước khi chia là bắt buộc để `T1` chỉ chứa duy nhất cột `MANV`!',
            },
          ],
          workbench: {
            kind: 'algebra',
            datasetId: 'DIV_TOY',
            title: 'Đối chiếu ví dụ mẫu R(A,B,C,D) ÷ S(A,B) chuẩn C3_2.pdf tr. 77 & 81–84',
            initialExpression: 'R ÷ S',
          },
        },
        {
          id: 'step-5-5-3',
          phaseLabel: 'Thực hành',
          title: 'Bài toán kinh điển UET: Sinh viên học TẤT CẢ các lớp thầy Lê Đức Hòa dạy',
          narrative: [
            'Đây là bài tập nguyên bản trên trang 87 của `C3_2.pdf`! Trên CSDL `DAOTAO`, hãy tìm **họ, đệm, tên (`Ho, Dem, Ten`)** của những sinh viên đã đăng ký học **tất cả các lớp (`Malop`) do giáo viên `\'Lê Đức Hòa\'` giảng dạy**.',
            '- Bảng `LOP(Malop, Tenlop, Giaovien)` cho biết lớp nào do thầy Lê Đức Hòa dạy.',
            '- Bảng `SV_LOP(Masv, Malop)` cho biết sinh viên nào học lớp nào.',
            '- Sau khi tìm được `Masv` thỏa phép chia, nối tự nhiên `*` với `SINHVIEN` để chiếu lấy `Ho, Dem, Ten`!',
          ].join('\n\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'DAOTAO',
            title: 'Thử thách Phép Chia trên CSDL Đào tạo (C3_2.pdf tr. 87)',
          },
          challenge: {
            type: 'algebra',
            datasetId: 'DAOTAO',
            prompt:
              'Viết chương trình Đại số quan hệ tìm **`Ho, Dem, Ten`** của các sinh viên học **tất cả các lớp** do giáo viên **`\'Lê Đức Hòa\'`** dạy.',
            starterExpression:
              "LOP_LDH ← π_{Malop}(σ_{Giaovien = 'Lê Đức Hòa'}(LOP))\n",
            solutionExpression:
              "LOP_LDH ← π_{Malop}(σ_{Giaovien = 'Lê Đức Hòa'}(LOP))\nMASV_DU ← SV_LOP ÷ LOP_LDH\nπ_{Ho, Dem, Ten}(MASV_DU * SINHVIEN)",
            hints: [
              'Bước 2: Chia bảng SV_LOP(Masv, Malop) cho LOP_LDH(Malop) để thu được bảng 1 cột Masv: MASV_DU ← SV_LOP ÷ LOP_LDH.',
              'Bước 3: Nối tự nhiên MASV_DU với SINHVIEN rồi chiếu họ tên: π_{Ho, Dem, Ten}(MASV_DU * SINHVIEN).',
            ],
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 5.6
     * ====================================================================== */
    {
      id: 'lesson-5-6',
      moduleId: 'module-5',
      orderLabel: '5.6',
      title: 'Hàm Tập hợp, Gom nhóm (ℱ) & Phòng Luyện Thi Giữa Kỳ UET',
      subtitle:
        'Nắm vững COUNT(A) vs COUNT(*), mẫu tìm MAX không cần ORDER BY và giải trọn vẹn đề luyện tập Quản lý Bán hàng & CÔNGTY (tr. 107–109).',
      slideRange: 'C3_2.pdf · tr. 90–99 & 107–111',
      estimatedMinutes: 22,
      steps: [
        {
          id: 'step-5-6-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Phép Gom nhóm & Hàm kết hợp (_{G}ℱ_{f(A)}) — Phân biệt COUNT(B) và COUNT(*)',
          narrative: [
            'Đại số quan hệ cổ điển không tính được tổng lương hay đếm số nhân viên mỗi phòng, nên được mở rộng thêm **Toán tử Gom nhóm & Hàm kết hợp $\\mathcal{F}$** (`C3_2.pdf` tr. 90–98):',
            '$$\\GF{G_1, G_2, \\dots, G_k}{f_1(A_1), f_2(A_2), \\dots, f_m(A_m)}(R)$$',
            '- **Danh sách bên trái ($G_1, \\dots, G_k$)**: Các thuộc tính gom nhóm (tương ứng `GROUP BY`). Nếu **khuyết vế trái** ($\\mathcal{F}_{f(A)}(R)$), toàn bộ quan hệ $R$ được gom thành **1 nhóm duy nhất**!',
            '- **Danh sách bên phải**: Các hàm tập hợp `SUM`, `AVG`, `MAX`, `MIN`, `COUNT` (có thể đặt bí danh cột kết quả bằng `→` hoặc `AS` hoặc dùng $\\rho$ ở bước sau).',
            '',
            '### Điểm tinh tế bắt buộc phải nhớ (`C3_2.pdf` tr. 92):',
            '- Khác với $\\pi$, các hàm `SUM`, `AVG`, `COUNT` tính trên tập đa hợp giá trị thực tế của các bộ trong nhóm (không khử hai mức lương bằng nhau của 2 người khác nhau!).',
            '- **`COUNT(B)` bỏ qua các ô `B = null`**, trong khi **`COUNT(*)` đếm tổng số bộ trong nhóm bất kể `null`**! Thử chạy ngay ví dụ trên `AGG_TOY` ở khung bên phải để kiểm chứng `COUNT(B) = 3` còn `COUNT(*) = 4`!',
          ].join('\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'AGG_TOY',
            title: 'Kiểm chứng sự khác nhau giữa COUNT(B) và COUNT(*) trên R_AGG (tr. 92)',
            initialExpression: 'ℱ_{COUNT(B) → Dem_B, COUNT(*) → Dem_Dong, SUM(A) → Tong_A}(R_AGG)',
          },
        },
        {
          id: 'step-5-6-2',
          phaseLabel: 'Thực hành',
          title: 'Bài tập 1 (C3_2.pdf tr. 107): Tính tổng doanh thu của từng nhân viên Bán hàng',
          narrative: [
            'Mở màn phòng luyện thi bằng bài toán **Quản lý Bán hàng (`BANHANG_DB`)** ở trang 107 của `C3_2.pdf`!',
            '- Bảng `BanHang(MaNv, MaHh, MaDp, Soluong)` lưu số lượng bán từng mặt hàng tại từng địa phương.',
            '- Bảng `Hanghoa(MaHh, TenHh, Dongia, MaNcc)` lưu đơn giá `Dongia` của từng mặt hàng.',
            'Hãy nối hai bảng để tính **tổng tiền bán hàng (`SUM(Soluong * Dongia)`) gom nhóm theo từng mã nhân viên `MaNv`**!',
          ].join('\n\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'BANHANG_DB',
            title: 'Luyện tập Gom nhóm ℱ trên CSDL Quản lý Bán hàng (tr. 107)',
          },
          challenge: {
            type: 'algebra',
            datasetId: 'BANHANG_DB',
            prompt:
              'Tính tổng doanh thu bán hàng theo từng mã nhân viên `MaNv` (trả về 2 cột: `MaNv` và tổng `Soluong * Dongia`).',
            starterExpression: 'CT ← BanHang * Hanghoa\n',
            solutionExpression:
              'CT ← BanHang * Hanghoa\n_{MaNv}ℱ_{SUM(Soluong * Dongia) → DoanhThu}(CT)',
            hints: [
              'Sau khi nối tự nhiên CT ← BanHang * Hanghoa, mỗi dòng đã có đủ cả Soluong và Dongia.',
              'Dùng toán tử gom nhóm theo MaNv: _{MaNv}ℱ_{SUM(Soluong * Dongia) → DoanhThu}(CT).',
            ],
          },
        },
        {
          id: 'step-5-6-3',
          phaseLabel: 'Thực hành',
          title: 'Bài tập 2A (C3_2.pdf tr. 108–109): Mẫu tìm Nhân viên có Lương Cao Nhất (Argmax Pattern)',
          narrative: [
            'Trong đề thi Đại số quan hệ, rất nhiều bạn lúng túng trước câu: **"Tìm mã và họ tên nhân viên có mức lương cao nhất công ty"** vì viết `ℱ_{MAX(LUONG)}(NHANVIEN)` chỉ trả về con số `55000`, còn nếu gom nhóm `_{MANV}ℱ_{MAX(LUONG)}` thì mỗi người là 1 nhóm nên chẳng lọc được ai!',
            '**Kỹ thuật chuẩn 2 bước (*Argmax Pattern*)**:',
            '1. Tính mức lương lớn nhất toàn công ty vào bảng 1 ô: `MAX_L ← ℱ_{MAX(LUONG) → LUONG_MAX}(NHANVIEN)`.',
            '2. Đem `NHANVIEN` **nối bằng** với `MAX_L` theo điều kiện `LUONG = LUONG_MAX` rồi chiếu họ tên!',
            'Hãy áp dụng ngay kỹ thuật này trên CSDL **`CONGTY_EX`** ở khung bên phải!',
          ].join('\n\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'CONGTY_EX',
            title: 'Đề luyện thi CÔNGTY — Câu A: Tìm người có lương cao nhất',
          },
          challenge: {
            type: 'algebra',
            datasetId: 'CONGTY_EX',
            prompt:
              'Trên CSDL `CONGTY_EX`, hãy tìm **`MANV, HONV, TENNV, LUONG`** của nhân viên có mức lương cao nhất công ty.',
            starterExpression: 'MAX_L ← ℱ_{MAX(LUONG) → LUONG_MAX}(NHANVIEN)\n',
            solutionExpression:
              'MAX_L ← ℱ_{MAX(LUONG) → LUONG_MAX}(NHANVIEN)\nπ_{MANV, HONV, TENNV, LUONG}(NHANVIEN ⨝_{LUONG = LUONG_MAX} MAX_L)',
            hints: [
              'Bước 1 đã tạo quan hệ 1 cột 1 dòng MAX_L(LUONG_MAX).',
              'Bước 2: Nối NHANVIEN với MAX_L theo điều kiện LUONG = LUONG_MAX rồi chiếu π_{MANV, HONV, TENNV, LUONG}(...).',
            ],
          },
        },
        {
          id: 'step-5-6-4',
          phaseLabel: 'Thực hành',
          title: 'Bài tập 2B — Thử thách Trùm cuối Đề thi Giữa kỳ (C3_2.pdf tr. 109)',
          narrative: [
            'Câu hỏi phân loại điểm 9–10 kinh điển trên trang 109 của `C3_2.pdf`:',
            '> *"Cho biết mã và họ tên các **Trưởng đơn vị (`DONVI.MANQL`)** nhưng **không có thân nhân nào** trong bảng `THANNHAN`."*',
            'Câu này kết hợp hoàn hảo **Phép Chiếu $\\pi$**, **Phép Đổi tên $\\rho$** (để `MANQL` khả hợp với `MANV`), **Phép Trừ tập hợp $-$** và **Phép Nối tự nhiên $*$**! Hoàn thành thử thách này để tốt nghiệp trọn vẹn toàn bộ chương trình từ C1 đến hết Đại số Quan hệ!',
          ].join('\n\n'),
          workbench: {
            kind: 'algebra',
            datasetId: 'CONGTY_EX',
            title: 'Đề luyện thi CÔNGTY — Câu B: Trưởng đơn vị không có thân nhân',
          },
          challenge: {
            type: 'algebra',
            datasetId: 'CONGTY_EX',
            prompt:
              'Trên `CONGTY_EX`, tìm **`MANV, HONV, TENNV`** của những nhân viên đang làm người quản lý đơn vị (`DONVI.MANQL`) mà **không có bất kỳ thân nhân nào** trong `THANNHAN`.',
            starterExpression:
              'TR_DV ← ρ_{(MANV)}(π_{MANQL}(DONVI))\nCO_TN ← π_{MANV}(THANNHAN)\n',
            solutionExpression:
              'TR_DV ← ρ_{(MANV)}(π_{MANQL}(DONVI))\nCO_TN ← π_{MANV}(THANNHAN)\nKQ_MA ← TR_DV - CO_TN\nπ_{MANV, HONV, TENNV}(KQ_MA * NHANVIEN)',
            hints: [
              'Hai dòng đầu đã chuẩn bị tập mã trưởng đơn vị TR_DV(MANV) và tập mã nhân viên có thân nhân CO_TN(MANV) hoàn toàn khả hợp!',
              'Lấy KQ_MA ← TR_DV - CO_TN, sau đó nối tự nhiên với NHANVIEN: π_{MANV, HONV, TENNV}(KQ_MA * NHANVIEN).',
            ],
          },
        },
      ],
    },
  ],
};
