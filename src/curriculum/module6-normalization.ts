import { ModuleSpec } from '../domain/types';

export const MODULE_6_NORMALIZATION: ModuleSpec = {
  id: 'module-6',
  order: 6,
  title: 'Phụ thuộc hàm & Chuẩn hóa Lược đồ (1NF → BCNF)',
  sourceFile: 'C4_1.pdf (96 trang)',
  description:
    'Từ đo lường thiết kế tồi đến Phụ thuộc hàm X → Y, Hệ tiên đề Armstrong, Thuật toán tính bao đóng X+, Phủ tối tiểu, Tìm tất cả Khóa dự tuyển, Tách bảo toàn thông tin & Chuẩn hóa 1NF → 2NF → 3NF → BCNF.',
  lessons: [
    /* ========================================================================
     * BÀI 6.1
     * ====================================================================== */
    {
      id: 'lesson-6-1',
      moduleId: 'module-6',
      orderLabel: '6.1',
      title: 'Phụ thuộc hàm (X → Y) & Hệ tiên đề Armstrong',
      subtitle:
        'Hiểu bản chất toán học của Phụ thuộc hàm như một ràng buộc ngữ nghĩa toàn cục và vận dụng 6 quy tắc suy diễn Armstrong để chứng minh.',
      slideRange: 'C4_1.pdf · tr. 2–26',
      estimatedMinutes: 16,
      steps: [
        {
          id: 'step-6-1-1',
          phaseLabel: 'Vấn đề',
          title: 'Khi Thiết kế ER bị bỏ qua hoặc gộp sai: 4 dấu hiệu của một lược đồ quan hệ tồi',
          narrative: [
            'Ở Chặng 4, nếu đi đúng từ sơ đồ ER chuẩn xác thì các bảng sinh ra thường khá tốt. Nhưng trong thực tế nhiều hệ thống kế thừa (hoặc sinh viên thiết kế nhanh), người ta hay gom các thuộc tính khác thực thể vào chung một bảng lớn như `BANGDIEM_FLAT(Masv, Ho, Ten, Mamon, Tenmon, Diem)` hay `NHANVIEN_DONVI(Manv, Hoten, Madv, Tendv, Truongdv)`.',
            'Slide `C4_1.pdf` (tr. 4–12) chỉ ra **4 tiêu chí đo lường chất lượng lược đồ quan hệ**:',
            '1. **Ngữ nghĩa rõ ràng của thuộc tính (*Clear Semantics*)**: Mỗi bảng chỉ nên mô tả *một* loại thực thể hoặc *một* mối liên kết thuần nhất.',
            '2. **Giảm thiểu thông tin dư thừa** $\\to$ Triệt tiêu *Dị thường Chèn, Xóa, Sửa đổi*.',
            '3. **Hạn chế tối đa các giá trị `null` vô nghĩa** trong từng bộ.',
            '4. **Không sinh ra bộ giả (*Spurious Tuples*)** khi nối tự nhiên các bảng đã tách lại.',
            'Công cụ toán học giúp ta phát hiện chính xác chỗ nào đang "trộn hai chủ thể vào một bảng" chính là **Phụ thuộc hàm (*Functional Dependency* — FD)**!',
          ].join('\n\n'),
          workbench: {
            kind: 'normalization',
            title: 'Khám phá Phụ thuộc hàm trên bảng BANGDIEM_FLAT (C4_1.pdf tr. 5)',
            caption: 'Chọn từng thuộc tính vế trái X (ví dụ Masv hoặc Mamon) để thấy nó kéo theo những thuộc tính nào.',
            fdPreset: {
              relationName: 'BANGDIEM_FLAT',
              attributes: ['Masv', 'Ho', 'Ten', 'Mamon', 'Tenmon', 'Diem'],
              fds: [
                { left: ['Masv'], right: ['Ho', 'Ten'] },
                { left: ['Mamon'], right: ['Tenmon'] },
                { left: ['Masv', 'Mamon'], right: ['Diem'] },
              ],
            },
          },
        },
        {
          id: 'step-6-1-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Định nghĩa Hình thức của Phụ thuộc hàm & 6 Luật Suy diễn Armstrong',
          narrative: [
            'Cho lược đồ quan hệ $R(A_1, A_2, \\dots, A_n)$ và hai tập con thuộc tính $X, Y \\subseteq R$. Ta nói **$X$ xác định hàm $Y$** (hay $Y$ **phụ thuộc hàm** vào $X$), ký hiệu **$X \\to Y$**, khi và chỉ khi trên **MỌI trạng thái hợp lệ $r(R)$**:',
            '$$\\forall t_1, t_2 \\in r(R),\\quad t_1[X] = t_2[X] \\implies t_1[Y] = t_2[Y]$$',
            '*(Đọc bằng lời: Hễ hai bộ có giá trị trên nhóm cột $X$ giống nhau thì bắt buộc giá trị trên nhóm cột $Y$ của chúng cũng phải giống nhau!)*',
            '',
            '### Hệ tiên đề Armstrong (*Sound & Complete Inference Rules*, `C4_1.pdf` tr. 19–25):',
            '- **IR1 — Luật Phản xạ (*Reflexivity*)**: Nếu $Y \\subseteq X$ thì $X \\to Y$ *(đây gọi là phụ thuộc hàm **tầm thường** — Trivial FD)*.',
            '- **IR2 — Luật Gia tăng / Tăng trưởng (*Augmentation*)**: Nếu $X \\to Y$ thì $XZ \\to YZ$ *(ghép cùng tập $Z$ vào hai vế)*.',
            '- **IR3 — Luật Bắc cầu (*Transitivity*)**: Nếu $X \\to Y$ và $Y \\to Z$ thì $X \\to Z$.',
            '',
            'Từ 3 tiên đề gốc trên, ta suy ra **3 quy tắc dẫn xuất cực kỳ hay dùng khi chứng minh**:',
            '- **IR4 — Luật Tách (*Decomposition*)**: Nếu $X \\to YZ$ thì $X \\to Y$ và $X \\to Z$.',
            '- **IR5 — Luật Hợp (*Union*)**: Nếu $X \\to Y$ và $X \\to Z$ thì $X \\to YZ$.',
            '- **IR6 — Luật Bắc cầu giả (*Pseudotransitivity*)**: Nếu $X \\to Y$ và $WY \\to Z$ thì $WX \\to Z$.',
          ].join('\n'),
          workedExamples: [
            {
              id: 'ex-6-1-armstrong',
              title: 'Chứng minh suy diễn bằng Hệ tiên đề Armstrong (Dạng tự luận 1.5–2 điểm)',
              problemStatement:
                'Cho $R(A, B, C, D, E)$ và tập phụ thuộc hàm $F = \\{AB \\to C,\\; C \\to D,\\; D \\to E\\}$. Hãy chứng minh $F \\models AB \\to BE$ chỉ dùng các quy tắc Armstrong (IR1–IR6).',
              steps: [
                {
                  label: 'Áp dụng IR3 (Bắc cầu) từ AB → C và C → D',
                  markdownLatex:
                    'Vì $AB \\to C$ và $C \\to D$, theo **IR3 (Bắc cầu)** suy ra: $AB \\to D$.',
                },
                {
                  label: 'Áp dụng IR3 (Bắc cầu) lần hai với D → E',
                  markdownLatex:
                    'Kết hợp $AB \\to D$ và $D \\to E$, theo **IR3 (Bắc cầu)** suy ra: $AB \\to E$.',
                },
                {
                  label: 'Áp dụng IR1 (Phản xạ) và IR5 (Hợp)',
                  markdownLatex:
                    'Vì $B \\subseteq AB$, theo **IR1 (Phản xạ)** ta có $AB \\to B$. Kết hợp $AB \\to B$ và $AB \\to E$, theo **IR5 (Hợp)** thu được $AB \\to BE$ (đpcm).',
                },
              ],
              conclusion:
                'Từ $F$, ta suy diễn hợp lệ được $AB \\to BE$ mà không hề vi phạm tính tách biệt ngữ nghĩa.',
              examTip:
                'Khi chấm tự luận, giám khảo luôn tìm tên viết tắt của quy tắc (IR1/Phản xạ, IR2/Gia tăng, IR3/Bắc cầu...) ngay sau mỗi bước suy diễn!',
            },
          ],
          callouts: [
            {
              kind: 'pitfall',
              title: 'Cạm bẫy kinh điển: Thử bác bỏ 1 PTH vs. Khẳng định 1 PTH',
              slideSource: 'C4_1.pdf · tr. 16–18',
              body: '- Một **thể hiện bảng cụ thể $r(R)$** chỉ có thể dùng để **BÁC BỎ** phụ thuộc hàm (tìm ra 2 dòng cùng $X$ nhưng khác $Y$ $\\implies$ chắc chắn $X \\not\\to Y$).\n- Tuyệt đối **KHÔNG THỂ** nhìn 1 bảng có vài dòng tình cờ thỏa $X \\to Y$ rồi kết luận $X \\to Y$ đúng tổng quát! Phụ thuộc hàm là quy luật **ngữ nghĩa của bài toán**.',
            },
          ],
          workbench: {
            kind: 'normalization',
            title: 'Thử nghiệm Luật Hợp/Tách & Bắc cầu trên Máy tính FD',
            fdPreset: {
              relationName: 'R_ARMSTRONG',
              attributes: ['A', 'B', 'C', 'D', 'E'],
              fds: [
                { left: ['A', 'B'], right: ['C'] },
                { left: ['C'], right: ['D'] },
                { left: ['D'], right: ['E'] },
              ],
            },
          },
        },
        {
          id: 'step-6-1-3',
          phaseLabel: 'Thực hành',
          title: 'Kiểm tra nhận diện Luật Armstrong & Phản ví dụ Phụ thuộc hàm',
          narrative: 'Trả lời câu hỏi dưới đây để sang Bài 6.2 (Bao đóng & Phủ tối tiểu).',
          workbench: {
            kind: 'normalization',
            title: 'Bảng thử nghiệm R_ARMSTRONG',
            fdPreset: {
              relationName: 'R_ARMSTRONG',
              attributes: ['A', 'B', 'C', 'D', 'E'],
              fds: [
                { left: ['A', 'B'], right: ['C'] },
                { left: ['C'], right: ['D'] },
                { left: ['D'], right: ['E'] },
              ],
            },
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Cho bảng dữ liệu sinh viên hiện có 2 dòng: $\\langle \\text{T1, An, Int1001} \\rangle$ và $\\langle \\text{C2, Bình, Int1002} \\rangle$. Nhận xét nào sau đây **CHÍNH XÁC** theo `C4_1.pdf`?',
            options: [
              {
                id: 'a',
                label: 'Dù 2 dòng hiện tại có `Ten` khác nhau, ta **vẫn không thể** kết luận `Ten → Masv` chỉ từ thể hiện bảng này; nhưng nếu xuất hiện 2 sinh viên cùng tên `An` khác `Masv` thì bác bỏ ngay được `Ten → Masv`.',
                explanation: 'Chính xác tuyệt đối! Một thể hiện bảng chỉ đủ sức phủ định (bác bỏ) PTH chứ không chứng minh được PTH tổng quát.',
              },
              {
                id: 'b',
                label: 'Nếu $X \\to Y$ và $Z \\subseteq Y$ thì ta suy ra được $Y \\to X$.',
                explanation: 'Sai: PTH là một chiều! Ví dụ `Masv → HoTen` nhưng hai sinh viên khác `Masv` hoàn toàn có thể trùng `HoTen`.',
              },
              {
                id: 'c',
                label: 'Từ $XZ \\to YZ$ luôn rút gọn bỏ được $Z$ để suy ra $X \\to Y$ (quy tắc gạch bỏ Z).',
                explanation: 'Cực kỳ sai! Armstrong có luật Gia tăng (tăng thêm Z) chứ KHÔNG có luật triệt tiêu Z ở cả hai vế.',
              },
            ],
            correctOptionId: 'a',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 6.2
     * ====================================================================== */
    {
      id: 'lesson-6-2',
      moduleId: 'module-6',
      orderLabel: '6.2',
      title: 'Bao đóng Thuộc tính (X+) · Tương đương PTH & Phủ tối tiểu',
      subtitle:
        'Thuật toán O(|F|·n) tính X+ không cần dò tay Armstrong, kiểm tra tương đương hai tập PTH và rút gọn Phủ tối tiểu 3 bước.',
      slideRange: 'C4_1.pdf · tr. 27–38',
      estimatedMinutes: 16,
      steps: [
        {
          id: 'step-6-2-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Thuật toán tính Bao đóng tập thuộc tính X+ dưới tập F',
          narrative: [
            '**Bao đóng của tập thuộc tính $X$ đối với tập PTH $F$** (ký hiệu **$X^+_F$** hoặc ngắn gọn $X^+$) là **tập tất cả các thuộc tính $A$ mà ta có thể suy diễn được $X \\to A$ từ $F$** nhờ hệ tiên đề Armstrong (`C4_1.pdf` tr. 28).',
            'Thay vì phải mò mẫm chứng minh bằng IR1–IR6, ta chạy **Thuật toán lặp điểm bất động cực nhanh**:',
            '1. Khởi tạo $X^+ := X$.',
            '2. Lặp lại cho tới khi $X^+$ **không tăng thêm được phần tử nào nữa**:',
            '   - Với mỗi phụ thuộc hàm $Y \\to Z \\in F$: Nếu $Y \\subseteq X^+$ thì gộp thêm $Z$: $X^+ := X^+ \\cup Z$.',
            '3. Trả về $X^+$.',
            '',
            '### Ba ứng dụng vàng của $X^+$ trong bài thi:',
            '- **Kiểm tra thành viên**: $X \\to Y \\in F^+ \\iff Y \\subseteq X^+_F$.',
            '- **Kiểm tra siêu khóa**: $K$ là siêu khóa của $R \\iff K^+_F = R$.',
            '- **Kiểm tra tương đương $F \\equiv G$**: $F$ phủ $G$ ($\\forall X \\to Y \\in G,\\; Y \\subseteq X^+_F$) **VÀ** $G$ phủ $F$ ($\\forall X \\to Y \\in F,\\; Y \\subseteq X^+_G$).',
          ].join('\n'),
          workedExamples: [
            {
              id: 'ex-6-2-minimal-cover',
              title: 'Tìm Phủ tối tiểu (Minimal / Canonical Cover) 3 bước chuẩn C4_1.pdf',
              problemStatement:
                'Tìm phủ tối tiểu $F_c$ của tập phụ thuộc hàm $F = \\{A \\to BC,\\; B \\to C,\\; A \\to B,\\; AB \\to C\\}$.',
              steps: [
                {
                  label: 'Bước 1 — Tách vế phải thành từng thuộc tính đơn (IR4)',
                  markdownLatex:
                    '$F_1 = \\{A \\to B,\\; A \\to C,\\; B \\to C,\\; AB \\to C\\}$ (gộp trùng $A \\to B$).',
                },
                {
                  label: 'Bước 2 — Loại bỏ thuộc tính dư thừa ở vế trái (Extraneous LHS)',
                  markdownLatex:
                    'Xét $AB \\to C$: thử bỏ $B$ còn $A$. Tính $A^+_{F_1}$ thấy đã có $C$ $\\implies$ $B$ dư thừa $\\implies$ thay $AB \\to C$ bằng $A \\to C$ (lúc này trùng nên chỉ còn $\\{A \\to B,\\; A \\to C,\\; B \\to C\\}$).',
                },
                {
                  label: 'Bước 3 — Loại bỏ phụ thuộc hàm dư thừa',
                  markdownLatex:
                    'Kiểm tra $A \\to C$: tạm bỏ $A \\to C$ còn $F\' = \\{A \\to B,\\; B \\to C\\}$. Tính $A^+_{F\'} = \\{A, B, C\\} \\ni C \\implies A \\to C$ dư thừa nên gạch bỏ!',
                },
              ],
              conclusion: '$$F_c = \\{A \\to B,\\; B \\to C\\}$$',
              examTip:
                'Thứ tự thực hiện **Bước 1 → Bước 2 → Bước 3** là bắt buộc! Nếu làm Bước 3 trước Bước 2 có thể cho kết quả chưa tối giản ở vế trái.',
            },
          ],
          workbench: {
            kind: 'normalization',
            title: 'Xem Phủ tối tiểu & Bao đóng tự động trên Máy tính FD',
            caption: 'Chọn tab "4. Phân rã BCNF & Phủ tối tiểu" để kiểm chứng kết quả A → B; B → C.',
            fdPreset: {
              relationName: 'R_COVER',
              attributes: ['A', 'B', 'C'],
              fds: [
                { left: ['A'], right: ['B', 'C'] },
                { left: ['B'], right: ['C'] },
                { left: ['A', 'B'], right: ['C'] },
              ],
            },
          },
        },
        {
          id: 'step-6-2-2',
          phaseLabel: 'Thực hành',
          title: 'Thực hành tính Bao đóng X+ bằng tay & đối chiếu từng bước',
          narrative:
            'Hãy chạy tay thuật toán tính bao đóng trên giấy nháp rồi chọn đầy đủ tập thuộc tính thuộc **`{A, G}+`** ở khung bên phải!',
          workbench: {
            kind: 'normalization',
            title: 'Thử thách tính Bao đóng {A, G}+',
          },
          challenge: {
            type: 'fd-norm',
            prompt:
              'Cho $R(A, B, C, D, E, G)$ và $F = \\{A \\to B,\\; BC \\to D,\\; G \\to C,\\; D \\to E\\}$. Hãy chọn tất cả các thuộc tính thuộc bao đóng **`{A, G}+`**.',
            relationName: 'R_CLOSURE',
            attributes: ['A', 'B', 'C', 'D', 'E', 'G'],
            fds: [
              { left: ['A'], right: ['B'] },
              { left: ['B', 'C'], right: ['D'] },
              { left: ['G'], right: ['C'] },
              { left: ['D'], right: ['E'] },
            ],
            mode: 'closure',
            seedClosureTarget: ['A', 'G'],
            expectedClosure: ['A', 'B', 'C', 'D', 'E', 'G'],
            hints: [
              'Khởi tạo {A, G}. Vì A → B thêm B; vì G → C thêm C → tập hiện tại là {A, B, C, G}.',
              'Vì đã có cả B và C nên kích hoạt tiếp BC → D (thêm D), rồi D → E (thêm E) → đạt trọn vẹn {A, B, C, D, E, G}!',
            ],
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 6.3
     * ====================================================================== */
    {
      id: 'lesson-6-3',
      moduleId: 'module-6',
      orderLabel: '6.3',
      title: 'Thuật toán Phân hoạch (L, M, R) Tìm Tất cả Khóa dự tuyển',
      subtitle:
        'Nắm chắc phương pháp tìm 100% không bỏ sót Khóa dự tuyển cho mọi đề thi tự luận CSDL và phân loại Thuộc tính khóa / Thuộc tính không khóa.',
      slideRange: 'C4_1.pdf · tr. 29–33',
      estimatedMinutes: 16,
      steps: [
        {
          id: 'step-6-3-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Quy trình 4 bước Tìm Tất cả Khóa dự tuyển không bao giờ sót',
          narrative: [
            'Bài đầu tiên trong câu Chuẩn hóa của đề thi cuối kỳ UET hầu như luôn là: *"Tìm tất cả các khóa của lược đồ $R(U)$ đối với tập PTH $F$"*. Với lược đồ 6–7 thuộc tính có tới $2^7 - 1 = 127$ tập con, nếu thử bừa rất dễ sót khóa! Ta dùng **Thuật toán Phân hoạch $(L, M, R)$**:',
            '1. **Bước 1 — Phân loại các thuộc tính của $U$ dựa theo vế của $F$ (sau khi tách vế phải đơn)**:',
            '   - **Tập Nguồn $L$ (*Left-only* + thuộc tính cô lập)**: Chỉ xuất hiện ở **vế trái** hoặc không xuất hiện ở đâu cả. $\\implies$ **BẮT BUỘC có mặt trong MỌI khóa**!',
            '   - **Tập Đích $R_{\\text{only}}$ (*Right-only*)**: Chỉ xuất hiện ở **vế phải** (không ở vế trái). $\\implies$ **KHÔNG BAO GIỜ nằm trong bất kỳ khóa tối tiểu nào**!',
            '   - **Tập Trung gian $M$ (*Middle*)**: Xuất hiện ở **cả vế trái lẫn vế phải**.',
            '2. **Bước 2 — Thử tập lõi $K_0 = L$**: Tính $K_0^+$. Nếu $K_0^+ = U$ thì $K_0$ là **khóa dự tuyển DUY NHẤT**, dừng ngay!',
            '3. **Bước 3 — Ghép dần tập con của $M$ vào $L$** (từ 1 phần tử, 2 phần tử...): Với mỗi tập $X = L \\cup M_i$ **không chứa khóa nào đã tìm thấy trước đó**, tính $X^+$. Nếu $X^+ = U$ thì ghi nhận $X$ là một **Khóa dự tuyển** (và không ghép thêm vào $X$ nữa).',
            '4. **Bước 4 — Suy ra tập Thuộc tính khóa**: Là hợp của tất cả các khóa dự tuyển tìm được; phần còn lại của $U$ là **Thuộc tính không khóa (*Non-prime*)**.',
          ].join('\n'),
          workedExamples: [
            {
              id: 'ex-6-3-keys',
              title: 'Giải mẫu Tìm tất cả Khóa cho lược đồ nhiều khóa',
              problemStatement:
                'Cho $R(A, B, C, D, E)$ và $F = \\{AB \\to C,\\; C \\to DE,\\; D \\to A\\}$. Tìm tất cả khóa dự tuyển và phân loại thuộc tính.',
              steps: [
                {
                  label: 'Bước 1 — Lập bảng phân hoạch (L, M, R)',
                  markdownLatex:
                    '- Chỉ ở vế trái ($L$): $B$.\n- Chỉ ở vế phải ($R_{\\text{only}}$): $E$.\n- Cả hai vế ($M$): $A, C, D$.',
                },
                {
                  label: 'Bước 2 — Tính bao đóng tập lõi L = {B}',
                  markdownLatex: '$B^+ = \\{B\\} \\ne U \\implies$ Phải ghép thêm phần tử của $M = \\{A, C, D\\}$.',
                },
                {
                  label: 'Bước 3 — Thử lần lượt từng phần tử của M ghép vào B',
                  markdownLatex:
                    '- $AB^+ = \\{A, B, C, D, E\\} = U \\implies$ **Khóa 1: $AB$**.\n- $BC^+ = \\{B, C, D, E, A\\} = U \\implies$ **Khóa 2: $BC$**.\n- $BD^+ = \\{B, D, A, C, E\\} = U \\implies$ **Khóa 3: $BD$**.\nMọi tập con 2 phần tử của $M$ đều chứa $A, C$ hoặc $D$ nên chứa siêu khóa $\\implies$ Dừng!',
                },
              ],
              conclusion:
                'Lược đồ có đúng **3 khóa dự tuyển**: $\\{AB\\}, \\{BC\\}, \\{BD\\}$. Tập **Thuộc tính khóa** $= \\{A, B, C, D\\}$; **Thuộc tính không khóa** chỉ có $\\{E\\}$.',
            },
          ],
          workbench: {
            kind: 'normalization',
            title: 'Đối chiếu phân hoạch L / M / R trên Máy tính Tìm Khóa',
            fdPreset: {
              relationName: 'R',
              attributes: ['A', 'B', 'C', 'D', 'E'],
              fds: [
                { left: ['A', 'B'], right: ['C'] },
                { left: ['C'], right: ['D', 'E'] },
                { left: ['D'], right: ['A'] },
              ],
            },
          },
        },
        {
          id: 'step-6-3-2',
          phaseLabel: 'Thực hành',
          title: 'Tự tìm Khóa dự tuyển tối tiểu cho lược đồ R(A, B, C, D, G)',
          narrative:
            'Áp dụng quy tắc $L / M / R$ vừa học (nhớ chú ý thuộc tính cô lập không xuất hiện trong $F$!) để chọn đúng khóa dự tuyển của $R$ ở khung bên phải.',
          workbench: {
            kind: 'normalization',
            title: 'Thử thách Tìm Khóa Dự Tuyển',
          },
          challenge: {
            type: 'fd-norm',
            prompt:
              'Cho $R(A, B, C, D, G)$ và $F = \\{AB \\to C,\\; C \\to D,\\; B \\to A\\}$. Hãy chọn các thuộc tính tạo thành **Khóa dự tuyển duy nhất** của $R$.',
            relationName: 'R_KEYS',
            attributes: ['A', 'B', 'C', 'D', 'G'],
            fds: [
              { left: ['A', 'B'], right: ['C'] },
              { left: ['C'], right: ['D'] },
              { left: ['B'], right: ['A'] },
            ],
            mode: 'candidate-keys',
            expectedKeys: [['B', 'G']],
            hints: [
              'Thuộc tính B chỉ ở vế trái (bắt buộc trong khóa), còn G KHÔNG xuất hiện trong bất kỳ PTH nào nên cũng BẮT BUỘC nằm trong mọi khóa!',
              'Kiểm tra bao đóng {B, G}+: vì B → A nên có A → có AB → thêm C → thêm D → thu đủ {A, B, C, D, G}!',
            ],
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 6.4
     * ====================================================================== */
    {
      id: 'lesson-6-4',
      moduleId: 'module-6',
      orderLabel: '6.4',
      title: 'Phép tách Bảo toàn Thông tin (Lossless Join) & Bảo toàn PTH',
      subtitle:
        'Chứng minh khi nào tách đôi một bảng sẽ làm sinh bộ giả (mất thông tin gốc) và nắm vững điều kiện kết nối không mất thông tin.',
      slideRange: 'C4_1.pdf · tr. 39–43 & 64–75',
      estimatedMinutes: 14,
      steps: [
        {
          id: 'step-6-4-1',
          phaseLabel: 'Vấn đề',
          title: 'Tách sai gây "Bộ giả" (Spurious Tuples): Sai lầm kinh điển khi phân rã bảng',
          narrative: [
            'Mục tiêu của chuẩn hóa là chia nhỏ một bảng cồng kềnh $R$ thành các bảng con $\\rho = \\{R_1, R_2, \\dots, R_k\\}$ để hết dư thừa. Nhưng nếu chia bừa bãi, khi ta chạy lệnh nối tự nhiên $R_1 * R_2 * \\dots * R_k$, bảng thu được có thể **dôi ra thêm hàng loạt dòng giả chưa từng có trong dữ liệu ban đầu** (`C4_1.pdf` tr. 10–12)!',
            '',
            '### Hai tính chất vàng của một Phép tách tốt:',
            '1. **Phép tách nối không mất thông tin (*Lossless / Nonadditive Join Property*)**: Với **mọi** trạng thái hợp lệ $r(R)$ thỏa mãn $F$, luôn có: $\\pi_{R_1}(r) * \\pi_{R_2}(r) * \\dots * \\pi_{R_k}(r) = r$.',
            '2. **Bảo toàn phụ thuộc hàm (*Dependency Preservation*)**: Tập hợp các phụ thuộc hàm chiếu xuống từng bảng con $F_1 \\cup F_2 \\cup \\dots \\cup F_k$ vẫn **tương đương** với $F$ ban đầu ($(\\bigcup F_i)^+ = F^+$), nhờ đó DBMS kiểm tra ràng buộc trên từng bảng riêng lẻ mà không cần `JOIN` tốn kém!',
          ].join('\n\n'),
          workbench: {
            kind: 'normalization',
            title: 'Thử nghiệm Phép tách trên NHANVIEN_DONVI',
            fdPreset: {
              relationName: 'NHANVIEN_DONVI',
              attributes: ['Manv', 'Hoten', 'Madv', 'Tendv', 'Truongdv'],
              fds: [
                { left: ['Manv'], right: ['Hoten', 'Madv'] },
                { left: ['Madv'], right: ['Tendv', 'Truongdv'] },
              ],
            },
          },
        },
        {
          id: 'step-6-4-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Định lý Bảo toàn Thông tin cho Phép tách nhị phân R = (R1, R2)',
          narrative: [
            'Khi tách một quan hệ $R$ thành 2 quan hệ $R_1$ và $R_2$ (với $R_1 \\cup R_2 = R$), định lý `NJB` (trang 67 `C4_1.pdf`) khẳng định phép tách **bảo toàn thông tin khi và chỉ khi ít nhất một trong hai điều kiện sau suy ra được từ $F^+$**:',
            '$$(R_1 \\cap R_2) \\to R_1 \\quad\\text{HOẶC}\\quad (R_1 \\cap R_2) \\to R_2$$',
            'Nói cách khác gọn nhất để tính bằng thuật toán:',
            '- Tính bao đóng $(R_1 \\cap R_2)^+_F$. Nếu $(R_1 \\cap R_2)^+_F$ **chứa trọn mọi thuộc tính của $R_1$** hoặc **chứa trọn mọi thuộc tính của $R_2$** $\\implies$ **Bảo toàn thông tin**!',
            '- Nếu $R_1 \\cap R_2 = \\emptyset$ hoặc phần giao không là khóa của bên nào $\\implies$ Chắc chắn **mất mát thông tin** (sinh bộ giả)!',
          ].join('\n\n'),
          workedExamples: [
            {
              id: 'ex-6-4-lossless',
              title: 'Kiểm tra phép tách Bảo toàn thông tin trong đề thi',
              problemStatement:
                'Cho `NHANVIEN_DONVI(Manv, Hoten, Madv, Tendv, Truongdv)` với $F = \\{\\text{Manv} \\to \\text{Hoten, Madv};\\; \\text{Madv} \\to \\text{Tendv, Truongdv}\\}$. Hỏi tách thành $R_1(\\text{Manv, Hoten, Madv})$ và $R_2(\\text{Madv, Tendv, Truongdv})$ có bảo toàn thông tin không?',
              steps: [
                {
                  label: 'Kiểm tra phần giao R1 ∩ R2',
                  markdownLatex:
                    '$R_1 \\cup R_2 = U$, và $R_1 \\cap R_2 = \\{\\text{Madv}\\} \\ne \\emptyset$.',
                },
                {
                  label: 'Tính bao đóng của phần giao dưới F',
                  markdownLatex:
                    '$(\\text{Madv})^+_F = \\{\\text{Madv, Tendv, Truongdv}\\} = R_2$!',
                },
              ],
              conclusion:
                'Vì $(R_1 \\cap R_2) \\to R_2$ (Madv là khóa chính của bảng $R_2$), phép tách **bảo toàn 100% thông tin** và còn bảo toàn cả 2 phụ thuộc hàm!',
            },
          ],
          workbench: {
            kind: 'normalization',
            title: 'Xem bước tách trên NHANVIEN_DONVI (Tab 4: Phân rã BCNF)',
            fdPreset: {
              relationName: 'NHANVIEN_DONVI',
              attributes: ['Manv', 'Hoten', 'Madv', 'Tendv', 'Truongdv'],
              fds: [
                { left: ['Manv'], right: ['Hoten', 'Madv'] },
                { left: ['Madv'], right: ['Tendv', 'Truongdv'] },
              ],
            },
          },
        },
        {
          id: 'step-6-4-3',
          phaseLabel: 'Thực hành',
          title: 'Kiểm tra nhận diện Phép tách Bảo toàn Thông tin vs. Mất thông tin',
          narrative: 'Trả lời câu hỏi tình huống để chuyển sang bài tổng hợp các Dạng chuẩn `1NF → BCNF`.',
          workbench: {
            kind: 'normalization',
            title: 'Thử nghiệm Phép tách',
            fdPreset: {
              relationName: 'NHANVIEN_DONVI',
              attributes: ['Manv', 'Hoten', 'Madv', 'Tendv', 'Truongdv'],
              fds: [
                { left: ['Manv'], right: ['Hoten', 'Madv'] },
                { left: ['Madv'], right: ['Tendv', 'Truongdv'] },
              ],
            },
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Cho $R(A, B, C)$ với $F = \\{A \\to B\\}$. Ta tách $R$ thành $R_1(A, B)$ và $R_2(B, C)$. Phép tách này có bảo toàn thông tin không?',
            options: [
              {
                id: 'a',
                label: 'Có, vì cả hai bảng đều chứa $B$.',
                explanation: 'Sai! Phần giao $R_1 \\cap R_2 = \\{B\\}$, nhưng từ $B$ không suy ra được $A$ hay $C$ ($B^+ = \\{B\\}$ không chứa $R_1$ cũng chẳng chứa $R_2$) $\\implies$ Sinh bộ giả!',
              },
              {
                id: 'b',
                label: '**KHÔNG** — vì phần giao $R_1 \\cap R_2 = \\{B\\}$ không là siêu khóa của $R_1$ lẫn $R_2$ ($B^+ = \\{B\\}$). Phải tách thành $R_1(A, B)$ và $R_2(A, C)$ (giao là $A \\to AB$) mới bảo toàn thông tin!',
                explanation: 'Xuất sắc! R1(A, B) và R2(A, C) có phần giao A với A+ = {A, B} ⊇ R1 nên nối không mất thông tin.',
              },
              {
                id: 'c',
                label: 'Không xác định được vì $R$ không có khóa.',
                explanation: 'Sai: Theo thuật toán tìm khóa thì AC là khóa của R(A,B,C).',
              },
            ],
            correctOptionId: 'b',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 6.5
     * ====================================================================== */
    {
      id: 'lesson-6-5',
      moduleId: 'module-6',
      orderLabel: '6.5',
      title: 'Các Dạng chuẩn 1NF · 2NF · 3NF · BCNF & Thuật toán Phân rã',
      subtitle:
        'Nắm trọn bậc thang chuẩn hóa kinh điển từ 1NF tới BCNF, biết chính xác cách kiểm tra dạng chuẩn và phân rã giữ bảo toàn thông tin.',
      slideRange: 'C4_1.pdf · tr. 44–96',
      estimatedMinutes: 18,
      steps: [
        {
          id: 'step-6-5-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Bậc thang 4 Dạng chuẩn: 1NF ⊃ 2NF ⊃ 3NF ⊃ BCNF',
          narrative: [
            'Mỗi dạng chuẩn cao hơn lại siết chặt thêm một loại phụ thuộc gây dư thừa (`C4_1.pdf` tr. 44–62):',
            '- **Chuẩn 1 (`1NF`)**: Mọi giá trị trong mọi ô đều **nguyên tố (*Atomic*)**, không chứa thuộc tính đa trị hoặc lồng ghép.',
            '- **Chuẩn 2 (`2NF`)**: Đạt `1NF` **VÀ** mọi **thuộc tính không khóa** phải phụ thuộc **hàm đầy đủ** vào mọi khóa (tức là **không có** chuyện chỉ dựa vào một *tập con thực sự* của khóa phức hợp). *Hệ quả hay dùng để giải nhanh: Nếu mọi khóa chỉ gồm **1 thuộc tính đơn** thì lược đồ nghiễm nhiên đạt `2NF`!*',
            '- **Chuẩn 3 (`3NF`)**: Đạt `2NF` **VÀ** không có thuộc tính không khóa nào phụ thuộc **bắc cầu** vào khóa. Dạng định nghĩa chuẩn: Với **mọi** PTH không tầm thường $X \\to A \\in F^+$ ($A \\notin X$), phải thỏa **ít nhất 1 trong 2**:',
            '  - *(i)* **$X$ là Siêu khóa** của $R$, **HOẶC**',
            '  - *(ii)* **$A$ là Thuộc tính khóa** (*Prime attribute*).',
            '- **Chuẩn Boyce-Codd (`BCNF`)**: Siết chặt hơn `3NF` bằng cách **bỏ hẳn điều kiện nới lỏng (ii)**: Với **mọi** PTH không tầm thường $X \\to A \\in F^+$ ($A \\notin X$), **$X$ BẮT BUỘC phải là Siêu khóa** của $R$!',
          ].join('\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Đánh đổi quan trọng giữa 3NF và BCNF khi đi thi lý thuyết!',
              slideSource: 'C4_1.pdf · tr. 74–82',
              body: '- **Tách về `3NF`** (thuật toán tổng hợp Bernstein từ Phủ tối tiểu) **LUÔN LUÔN** đảm bảo đồng thời cả **Bảo toàn thông tin** lẫn **Bảo toàn phụ thuộc hàm**.\n- **Tách về `BCNF`** luôn đảm bảo **Bảo toàn thông tin** và triệt tiêu mọi dư thừa do PTH, **NHƯNG đôi khi có thể làm mất bảo toàn một vài phụ thuộc hàm** (ví dụ `DANGKY_GV(MaSV, MonHoc, GiaoVien)` với `GiaoVien → MonHoc` khi tách thành `(GiaoVien, MonHoc)` và `(MaSV, GiaoVien)` sẽ không còn giữ trực tiếp `{MaSV, MonHoc} → GiaoVien` trong 1 bảng đơn).',
            },
          ],
          workbench: {
            kind: 'normalization',
            title: 'Khảo sát ví dụ kinh điển DANGKY_GV (Đạt 3NF nhưng chưa BCNF)',
            fdPreset: {
              relationName: 'DANGKY_GV',
              attributes: ['MaSV', 'MonHoc', 'GiaoVien'],
              fds: [
                { left: ['MaSV', 'MonHoc'], right: ['GiaoVien'] },
                { left: ['GiaoVien'], right: ['MonHoc'] },
              ],
            },
          },
        },
        {
          id: 'step-6-5-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Bài giải mẫu tự luận: Kiểm tra Dạng chuẩn & Chuẩn hóa trọn vẹn về BCNF',
          narrative:
            'Hãy đọc kỹ trình tự 4 bước viết bài thi chuẩn UET trong khung mẫu bên dưới trước khi thực hành trên bộ chấm tự động!',
          workedExamples: [
            {
              id: 'ex-6-5-full',
              title: 'Đánh giá Dạng chuẩn và Phân rã BCNF cho DANGKY_GV',
              problemStatement:
                'Cho $R(\\text{MaSV, MonHoc, GiaoVien})$ với tập PTH $F = \\{\\{\\text{MaSV, MonHoc}\\} \\to \\text{GiaoVien};\\; \\text{GiaoVien} \\to \\text{MonHoc}\\}$.\na) Tìm tất cả khóa của $R$.\nb) Xác định dạng chuẩn cao nhất của $R$.\nc) Chuẩn hóa $R$ về BCNF.',
              steps: [
                {
                  label: 'Câu a) — Tìm tất cả Khóa dự tuyển',
                  markdownLatex:
                    'Nhóm Nguồn $L = \\{\\text{MaSV}\\}$, Trung gian $M = \\{\\text{MonHoc, GiaoVien}\\}$. Vì $\\text{MaSV}^+ = \\{\\text{MaSV}\\} \\ne R$, thử ghép thêm:\n- $\\{\\text{MaSV, MonHoc}\\}^+ = R \\implies K_1 = \\{\\text{MaSV, MonHoc}\\}$.\n- $\\{\\text{MaSV, GiaoVien}\\}^+ = R \\implies K_2 = \\{\\text{MaSV, GiaoVien}\\}$.\nVì $K_1 \\cup K_2 = \\{\\text{MaSV, MonHoc, GiaoVien}\\}$ nên **cả 3 thuộc tính đều là thuộc tính khóa** (không có thuộc tính không khóa nào).',
                },
                {
                  label: 'Câu b) — Kiểm tra bậc dạng chuẩn 1NF → 2NF → 3NF → BCNF',
                  markdownLatex:
                    '- **Đạt 3NF**: Không có thuộc tính không khóa nên hiển nhiên đạt `2NF` và `3NF` (cụ thể với $\\text{GiaoVien} \\to \\text{MonHoc}$, tuy $\\text{GiaoVien}$ chưa phải siêu khóa nhưng vế phải $\\text{MonHoc}$ là *thuộc tính khóa* nên vẫn đạt `3NF`).\n- **Không đạt BCNF**: Với $\\text{GiaoVien} \\to \\text{MonHoc}$, vế trái $\\text{GiaoVien}$ không phải siêu khóa!',
                },
                {
                  label: 'Câu c) — Phân rã bảo toàn thông tin về BCNF',
                  markdownLatex:
                    'Tách $R$ theo PTH vi phạm $\\text{GiaoVien} \\to \\text{MonHoc}$:\n- $R_1(\\underline{\\text{GiaoVien}}, \\text{MonHoc})$ (khóa `GiaoVien`, đạt BCNF).\n- $R_2(\\underline{\\text{MaSV}}, \\underline{\\text{GiaoVien}})$ (khóa `MaSV, GiaoVien`, đạt BCNF).\nKiểm tra bảo toàn thông tin: $R_1 \\cap R_2 = \\{\\text{GiaoVien}\\} \\to R_1$ $\\implies$ Thỏa!',
                },
              ],
              conclusion:
                'Dạng chuẩn cao nhất của lược đồ gốc là **`3NF`**, sau phân rã thu được $\\{R_1(\\text{GiaoVien, MonHoc}), R_2(\\text{MaSV, GiaoVien})\\}$ đạt chuẩn **`BCNF`**.',
            },
          ],
          workbench: {
            kind: 'normalization',
            title: 'Máy tính Chuẩn hóa BCNF (Tab 3 & Tab 4)',
            fdPreset: {
              relationName: 'DANGKY_GV',
              attributes: ['MaSV', 'MonHoc', 'GiaoVien'],
              fds: [
                { left: ['MaSV', 'MonHoc'], right: ['GiaoVien'] },
                { left: ['GiaoVien'], right: ['MonHoc'] },
              ],
            },
          },
        },
        {
          id: 'step-6-5-3',
          phaseLabel: 'Thực hành',
          title: 'Thực hành chẩn đoán Dạng chuẩn cao nhất cho lược đồ tổng hợp',
          narrative:
            'Hãy tự tìm khóa rồi kiểm tra xem phụ thuộc hàm nào đang vi phạm chuẩn trên lược đồ **`KHO_HANG(MaPhieu, MaHang, TenHang, SoLuong)`**, sau đó bấm chọn dạng chuẩn cao nhất ở khung bên phải!',
          workbench: {
            kind: 'normalization',
            title: 'Chấm tự động Dạng chuẩn cao nhất (C4_1.pdf)',
          },
          challenge: {
            type: 'fd-norm',
            prompt:
              'Xác định **Dạng chuẩn cao nhất (`1NF`, `2NF`, `3NF` hay `BCNF`)** của lược đồ `KHO_HANG(MaPhieu, MaHang, TenHang, SoLuong)` với tập PTH $F = \\{\\{\\text{MaPhieu, MaHang}\\} \\to \\text{SoLuong};\\; \\text{MaHang} \\to \\text{TenHang}\\}$.',
            relationName: 'KHO_HANG',
            attributes: ['MaPhieu', 'MaHang', 'TenHang', 'SoLuong'],
            fds: [
              { left: ['MaPhieu', 'MaHang'], right: ['SoLuong'] },
              { left: ['MaHang'], right: ['TenHang'] },
            ],
            mode: 'normal-form',
            expectedHighestNormalForm: '1NF',
            hints: [
              'Tập Nguồn L = {MaPhieu, MaHang}. Bao đóng {MaPhieu, MaHang}+ = toàn bộ 4 cột ⇒ Khóa duy nhất là {MaPhieu, MaHang}.',
              'Xét MaHang → TenHang: TenHang là thuộc tính không khóa, mà lại phụ thuộc chỉ vào 1 phần (MaHang ⊂ {MaPhieu, MaHang}) của khóa chính! Do đó bảng VI PHẠM 2NF → Dạng chuẩn cao nhất chỉ là 1NF!',
            ],
          },
        },
      ],
    },
  ],
};
