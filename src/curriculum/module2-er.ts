import { ModuleSpec } from '../domain/types';

export const MODULE_2_ER: ModuleSpec = {
  id: 'module-2',
  order: 2,
  title: 'Mô hình Thực thể - Liên kết (ER)',
  sourceFile: 'C2_1.pdf (52 trang)',
  description:
    'Quy trình thiết kế CSDL mức quan niệm, 6 loại thuộc tính, liên kết đệ quy/đa ngôi, bẫy ngược chiều (min, max) vs 1:N và thực thể yếu.',
  lessons: [
    /* ========================================================================
     * BÀI 2.1
     * ====================================================================== */
    {
      id: 'lesson-2-1',
      moduleId: 'module-2',
      orderLabel: '2.1',
      title: 'Quy trình Thiết kế CSDL & Kiểu Thực thể (Entity Types)',
      subtitle:
        'Hiểu quy trình 6 bước thiết kế CSDL và phân biệt Thực thể (Entity), Kiểu thực thể (Entity Type) với Tập thực thể (Entity Set).',
      slideRange: 'C2_1.pdf · tr. 2–10',
      estimatedMinutes: 10,
      steps: [
        {
          id: 'step-2-1-1',
          phaseLabel: 'Vấn đề',
          title: 'Làm sao chuyển một văn bản khảo sát nghiệp vụ dài 3 trang thành các bảng chuẩn xác?',
          narrative: [
            'Khi khách hàng mô tả bài toán *"Quản lý Đề án Công ty"* bằng ngôn ngữ tự nhiên tiếng Việt, nếu bạn nhảy ngay vào gõ lệnh `CREATE TABLE`, bạn rất dễ bỏ sót mối liên hệ hoặc gộp nhầm thông tin gây dị thường như ở Bài 1.1.',
            'Vì vậy, quy trình thiết kế CSDL chuẩn (`C2_1.pdf` tr. 4–6) luôn đi qua **các pha tuần tự**:',
            '1. **Thu thập & phân tích yêu cầu** (*Requirements Collection & Analysis*) $\\to$ Đặc tả yêu cầu dữ liệu và yêu cầu chức năng.',
            '2. **Thiết kế quan niệm (*Conceptual Design*)** $\\to$ Dùng mô hình mức cao **ER / EER** để vẽ lược đồ quan niệm độc lập hoàn toàn với phần mềm DBMS cụ thể.',
            '3. **Thiết kế logic (*Logical Design / Data Model Mapping*)** $\\to$ Ánh xạ sơ đồ ER sang Lược đồ Quan hệ (học ở Chặng 4).',
            '4. **Thiết kế vật lý (*Physical Design*)** $\\to$ Chọn cấu trúc tệp, chỉ mục, phân vùng đĩa.',
          ].join('\n\n'),
          workbench: {
            kind: 'er-diagram',
            diagramId: 'CONGTY_ER',
            title: 'Bức tranh toàn cảnh Sơ đồ ER Công ty (C2_1.pdf tr. 36)',
            caption: 'Đích đến của Thiết kế quan niệm: toàn bộ bài toán Công ty gói gọn trên một sơ đồ trực quan.',
          },
        },
        {
          id: 'step-2-1-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Thực thể · Kiểu thực thể · Tập thực thể',
          narrative: [
            'Trong mô hình ER của Peter Chen (1976), thế giới thực được mô tả qua các đối tượng độc lập:',
            '- **Thực thể (*Entity*)**: Một sự vật/đối tượng cụ thể tồn tại độc lập trong thế giới thực — có thể hữu hình (nhân viên *Nguyễn Tùng*, chiếc ô tô) hoặc vô hình (đề án *Sản phẩm X*, môn học *CSDL*).',
            '- **Kiểu thực thể (*Entity Type*)**: Khuôn mẫu chung cho các thực thể có **cùng tập thuộc tính** (ví dụ kiểu thực thể `NHANVIEN`, `PHONGBAN`). Trên sơ đồ ER, kiểu thực thể mạnh vẽ bằng **hình chữ nhật nét đơn**.',
            '- **Tập thực thể (*Entity Set*)**: Tập hợp tất cả các thực thể cụ thể thuộc về một kiểu thực thể đang tồn tại trong CSDL **tại một thời điểm xác định**.',
          ].join('\n\n'),
          callouts: [
            {
              kind: 'slide-ref',
              title: 'Liên hệ với Bài 1.3 (Schema vs. Instance)',
              slideSource: 'C2_1.pdf · tr. 9–10',
              body: '**Kiểu thực thể** (*Entity Type*) tương ứng với phần **Lược đồ (Intension)** không đổi, còn **Tập thực thể** (*Entity Set*) tương ứng với **Thể hiện / Trạng thái (Extension)** thay đổi theo thời gian. Tuy nhiên, cả hai thường được gọi chung bằng cùng một tên như `NHANVIEN`.',
            },
          ],
          workbench: {
            kind: 'er-diagram',
            diagramId: 'NV_PB_BASIC',
            title: 'Hai kiểu thực thể mạnh NHANVIEN và PHONGBAN',
          },
        },
        {
          id: 'step-2-1-3',
          phaseLabel: 'Thực hành',
          title: 'Nhận diện Kiểu thực thể vs. Thực thể cá biệt',
          narrative: 'Kiểm tra nhanh khả năng phân biệt khái niệm nền tảng của mô hình ER.',
          workbench: {
            kind: 'er-diagram',
            diagramId: 'NV_PB_BASIC',
            title: 'Sơ đồ NHANVIEN — PHONGBAN',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Trong bài toán Quản lý Đào tạo, **"Môn Cơ sở dữ liệu (mã Int1001, 3 tín chỉ)"** là gì, còn hình chữ nhật **`MONHOC`** vẽ trên sơ đồ ER biểu diễn khái niệm gì?',
            options: [
              {
                id: 'a',
                label: '`"Môn CSDL (Int1001)"` là một **Thực thể (Entity)** cụ thể; còn hình chữ nhật `MONHOC` biểu diễn **Kiểu thực thể (Entity Type)**.',
                explanation: 'Chính xác! Cá thể cụ thể là Entity, còn khuôn mẫu chung vẽ bằng hình chữ nhật trên sơ đồ ER là Entity Type.',
              },
              {
                id: 'b',
                label: 'Cả hai đều là thuộc tính đa trị trên sơ đồ ER.',
                explanation: 'Chưa đúng: thuộc tính vẽ bằng hình bầu dục, còn đối tượng độc lập là thực thể.',
              },
              {
                id: 'c',
                label: 'Thiết kế sơ đồ ER thuộc pha Thiết kế vật lý nên phụ thuộc vào phiên bản MySQL hay Oracle.',
                explanation: 'Sai: Thiết kế ER là Thiết kế quan niệm (Conceptual Design), hoàn toàn độc lập với DBMS cụ thể.',
              },
            ],
            correctOptionId: 'a',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 2.2
     * ====================================================================== */
    {
      id: 'lesson-2-2',
      moduleId: 'module-2',
      orderLabel: '2.2',
      title: '6 Loại Thuộc tính, Miền giá trị & Thuộc tính Khóa',
      subtitle:
        'Phân biệt thuộc tính Đơn/Phức hợp, Đơn trị/Đa trị, Lưu trữ/Dẫn xuất và quy ước hình bầu dục chuẩn UET.',
      slideRange: 'C2_1.pdf · tr. 11–18',
      estimatedMinutes: 14,
      steps: [
        {
          id: 'step-2-2-1',
          phaseLabel: 'Lý thuyết UET',
          title: '3 trục phân loại tạo nên 6 loại thuộc tính trong ER',
          narrative: [
            'Mỗi thực thể được mô tả bởi các **thuộc tính (*Attributes*)**, mỗi thuộc tính nhận giá trị từ một **miền giá trị (*Value Set / Domain*)**. Giáo trình UET (`C2_1.pdf` tr. 11–16) phân loại thuộc tính theo 3 cặp đối lập:',
            '1. **Đơn (*Simple / Atomic*) vs. Phức hợp (*Composite*)**:',
            '   - *Thuộc tính đơn*: Không thể chia nhỏ hơn (ví dụ `GioiTinh`, `Luong`).',
            '   - *Thuộc tính phức hợp*: Có thể tách thành các thành phần nhỏ mang ý nghĩa độc lập — ví dụ `HoTen` gồm `(Ho, Dem, Ten)` hoặc `DiaChi` gồm `(SoNha, Duong, Quan, ThanhPho)`. Trên sơ đồ ER vẽ thành các hình bầu dục con nối từ bầu dục cha.',
            '2. **Đơn trị (*Single-valued*) vs. Đa trị (*Multivalued*)**:',
            '   - *Đơn trị*: Mỗi thực thể chỉ nhận duy nhất 1 giá trị (ví dụ `NgaySinh`, `MaNV`).',
            '   - *Đa trị*: Một thực thể có thể nhận **nhiều giá trị đồng thời** — ví dụ `BANGCAP` của một nhân viên (vừa có bằng Kỹ sư, vừa có bằng Thạc sĩ) hoặc `DIADIEM` của một phòng ban (trụ sở ở cả Hà Nội, TP HCM, Vũng Tàu). Ký hiệu: **hình bầu dục nét đôi**.',
            '3. **Lưu trữ (*Stored*) vs. Dẫn xuất (*Derived*)**:',
            '   - *Dẫn xuất*: Giá trị tính toán được từ các thuộc tính/liên kết khác — ví dụ `Tuoi` suy ra từ `NgaySinh` và năm hiện tại, hoặc `SoLuongNV` của phòng ban đếm từ liên kết `Lam_viec`. Ký hiệu: **hình bầu dục nét đứt**.',
          ].join('\n'),
          workbench: {
            kind: 'er-diagram',
            diagramId: 'NV_PB_BASIC',
            title: 'Quan sát ký hiệu Thuộc tính Khóa (MANV) và Đa trị (BANGCAP)',
            caption: 'Chú ý hình bầu dục nét đôi ở BANGCAP và đường gạch chân liền ở MANV, MAPHG.',
          },
        },
        {
          id: 'step-2-2-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Thuộc tính Khóa (Key Attribute) & Giá trị Rỗng (NULL)',
          narrative: [
            '### 1. Thuộc tính Khóa (*Key Attribute*)',
            'Là thuộc tính (hoặc tập thuộc tính tối tiểu) mà giá trị của nó **khác nhau đôi một trên mọi thực thể** trong tập thực thể ở mọi thời điểm:',
            '$$\\forall e_1, e_2 \\in E,\\; e_1 \\ne e_2 \\implies e_1[K] \\ne e_2[K]$$',
            '- Trên sơ đồ ER: Tên thuộc tính khóa được **gạch chân nét liền** bên trong hình bầu dục (ví dụ $\\underline{\\text{MANV}}$).',
            '- Nếu một kiểu thực thể có nhiều khóa (ví dụ `SINHVIEN` có cả `MaSV` lẫn `CCCD`), mỗi khóa đều được biểu diễn riêng.',
            '- Nếu khóa gồm nhiều thuộc tính ghép lại (khóa phức hợp), cần đảm bảo tính **tối tiểu (*Minimality*)**: bỏ bớt bất kỳ thành phần nào cũng làm mất tính duy nhất.',
            '### 2. Khi nào thuộc tính mang giá trị `null`? (`C2_1.pdf` tr. 15)',
            '- **Không áp dụng (*Not Applicable*)**: Ví dụ thuộc tính `BangDaiHoc` đối với nhân viên chưa học đại học.',
            '- **Chưa biết (*Unknown*)**: Thực thể thực sự có giá trị đó nhưng hiện tại chưa thu thập được (ví dụ chưa biết số điện thoại nhà riêng).',
          ].join('\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Đừng nhầm Khóa phức hợp với Thuộc tính đa trị!',
              slideSource: 'C2_1.pdf · tr. 16–18',
              body: 'Thuộc tính **đa trị** (như `DIADIEM` của `PHONGBAN`) chứa *nhiều giá trị cùng loại* cho 1 thực thể (vẽ **bầu dục nét đôi**). Còn **thuộc tính phức hợp** (như `HoTen` = `Ho` + `Dem` + `Ten`) ghép các thành phần khác nhau lại thành một giá trị cấu trúc (vẽ **bầu dục phân nhánh**).',
            },
          ],
          workbench: {
            kind: 'er-diagram',
            diagramId: 'CONGTY_ER',
            title: 'Đối chiếu các loại thuộc tính trên sơ đồ CONGTY_ER',
            caption: 'Tìm bầu dục nét đôi DIADIEM của PHONGBAN và các khóa gạch chân MANV, MAPHG, MADA.',
          },
        },
        {
          id: 'step-2-2-3',
          phaseLabel: 'Thực hành',
          title: 'Chọn đúng ký hiệu thuộc tính trên sơ đồ ER',
          narrative: 'Vận dụng quy tắc ký hiệu hình bầu dục trong `C2_1.pdf` để giải tình huống thiết kế thực tế.',
          workbench: {
            kind: 'er-diagram',
            diagramId: 'CONGTY_ER',
            title: 'Sơ đồ ER Công ty',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Khi vẽ sơ đồ ER cho hệ thống Quản lý Đào tạo: một giảng viên có thể có **nhiều số điện thoại liên hệ**, và thuộc tính **`ThâmNiênCôngTác`** được tính tự động từ `NămTuyểnDụng`. Bạn phải vẽ hai thuộc tính này như thế nào?',
            options: [
              {
                id: 'a',
                label: '`SoDienThoai` vẽ hình bầu dục **nét đứt**, còn `ThamNienCongTac` vẽ hình bầu dục **nét đôi**.',
                explanation: 'Bị ngược: nét đôi là đa trị, nét đứt là dẫn xuất!',
              },
              {
                id: 'b',
                label: '`SoDienThoai` là thuộc tính **đa trị** (vẽ hình bầu dục **nét đôi**); còn `ThamNienCongTac` là thuộc tính **dẫn xuất** (vẽ hình bầu dục **nét đứt**).',
                explanation: 'Chính xác tuyệt đối theo quy ước ký hiệu ER trang 14 & 35 của C2_1.pdf!',
              },
              {
                id: 'c',
                label: 'Gạch chân liền cả hai thuộc tính vì chúng quan trọng.',
                explanation: 'Gạch chân liền chỉ dành riêng cho Thuộc tính Khóa (Key Attribute) dùng để định danh duy nhất thực thể.',
              },
            ],
            correctOptionId: 'b',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 2.3
     * ====================================================================== */
    {
      id: 'lesson-2-3',
      moduleId: 'module-2',
      orderLabel: '2.3',
      title: 'Kiểu Liên kết, Bậc của Liên kết & Liên kết Đệ quy',
      subtitle:
        'Hiểu bản chất toán học của tập liên kết, phân biệt liên kết bậc 2 với bậc 3 (Ternary) và vai trò (Role Name) trong liên kết đệ quy.',
      slideRange: 'C2_1.pdf · tr. 19–24',
      estimatedMinutes: 12,
      steps: [
        {
          id: 'step-2-3-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Kiểu liên kết (Relationship Type) & Bậc (Degree)',
          narrative: [
            'Khi thuộc tính của thực thể này tham chiếu sang một thực thể khác (ví dụ *"Trưởng phòng của Phòng ban"* hay *"Đề án do Phòng ban chủ trì"*), trong mô hình ER ta **không vẽ thành thuộc tính khóa ngoại** như bảng quan hệ, mà phải biểu diễn tường minh thành **Kiểu liên kết (*Relationship Type*)** hình thoi!',
            '- Một kiểu liên kết $R$ bậc $n$ giữa các kiểu thực thể $E_1, E_2, \\dots, E_n$ định nghĩa một tập liên kết mà mỗi cá thể liên kết $r_i \\in R$ là một bộ kết hợp $(e_1, e_2, \\dots, e_n)$ với $e_j \\in E_j$.',
            '- **Bậc của kiểu liên kết (*Degree*)**: Số lượng kiểu thực thể tham gia vào liên kết đó:',
            '  - **Bậc 2 (*Binary*)**: Phổ biến nhất — ví dụ `NHANVIEN — Lam_viec — PHONGBAN`.',
            '  - **Bậc 3 (*Ternary*)**: Ba thực thể cùng ràng buộc đồng thời trong một sự kiện — ví dụ `NHACUNGCAP` cung cấp `LINHKIEN` cho một `DUAN` cụ thể với `SOLUONG` xác định (`C2_1.pdf` tr. 22).',
            '- **Thuộc tính của liên kết**: Liên kết cũng có thể mang thuộc tính riêng! Ví dụ `SOGIO` làm việc của nhân viên trên đề án thuộc về liên kết `Phan_cong` (`N:M`), hoặc `NG_NHANCHUC` thuộc về liên kết `La_truong_phong` (`1:1`).',
          ].join('\n'),
          workbench: {
            kind: 'er-diagram',
            diagramId: 'NHACUNGCAP_TERNARY',
            title: 'Liên kết bậc 3 (Ternary) Cung_cap chuẩn C2_1.pdf tr. 22',
            caption: 'Mỗi bộ (Nhà cung cấp s, Mặt hàng p, Dự án j) xác định duy nhất số lượng cung cấp trong sự kiện đó.',
          },
        },
        {
          id: 'step-2-3-2',
          phaseLabel: 'Khám phá',
          title: 'Liên kết Đệ quy (Recursive Relationship) & Tên Vai trò (Role Names)',
          narrative: [
            'Điều gì xảy ra nếu **cùng một kiểu thực thể** tham gia nhiều hơn một lần vào cùng một kiểu liên kết với hai tư cách khác nhau?',
            'Hãy nhìn sơ đồ `NHANVIEN_RECURSIVE` bên phải (`C2_1.pdf` tr. 23): Một nhân viên có thể là **Người quản lý (Supervisor)** trực tiếp của nhiều nhân viên khác, đồng thời chính người đó lại là **Cấp dưới (Subordinate)** chịu sự giám sát của giám đốc!',
            '- Liên kết này vẫn có **bậc bằng 2** (vì mỗi mối quan hệ giám sát ghép cặp 2 thực thể: 1 người quản lý + 1 cấp dưới).',
            '- Vì cả hai nhánh đều nối vào hình chữ nhật `NHANVIEN`, ta **bắt buộc phải ghi Tên vai trò (*Role Name*)** trên hai cạnh nối (ví dụ `Người quản lý` và `Cấp dưới`) để tránh nhập nhằng ngữ nghĩa!',
          ].join('\n\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Liên kết đệ quy có phải là liên kết bậc 1 (Unary) theo nghĩa chỉ có 1 nhánh không?',
              slideSource: 'C2_1.pdf · tr. 23',
              body: 'Trong giáo trình UET/Elmasri, liên kết đệ quy `Quan_ly` vẫn là **liên kết hai ngôi (Binary Relationship)** vì có **2 nhánh vai trò** cùng nối từ một kiểu thực thể `NHANVIEN` vào hình thoi `Quan_ly`!',
            },
          ],
          workbench: {
            kind: 'er-diagram',
            diagramId: 'NHANVIEN_RECURSIVE',
            title: 'Liên kết đệ quy Quan_ly trên NHANVIEN kèm tên vai trò',
            caption: 'Thử bấm nút chuyển đổi (min, max) ↔ 1:N trên sơ đồ để quan sát hai nhánh vai trò.',
          },
        },
        {
          id: 'step-2-3-3',
          phaseLabel: 'Thực hành',
          title: 'Phân biệt Liên kết bậc 3 với ba liên kết bậc 2 rời rạc',
          narrative: 'Kiểm tra tư duy thiết kế liên kết nâng cao.',
          workbench: {
            kind: 'er-diagram',
            diagramId: 'NHACUNGCAP_TERNARY',
            title: 'Liên kết bậc 3 Cung_cap',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Vì sao trong bài toán *"Nhà cung cấp $s$ cung cấp Mặt hàng $p$ cho Dự án $j$ với Số lượng cụ thể"*, ta phải dùng **liên kết bậc 3 `Cung_cap`** thay vì tách thành 3 liên kết hai ngôi rời rạc `(s-p)`, `(p-j)`, `(s-j)`?',
            options: [
              {
                id: 'a',
                label: 'Vì biết $s$ có bán $p$, $j$ có dùng $p$, và $s$ có ký hợp đồng với $j$ vẫn **không suy ra được** có đúng là chính $s$ đã giao mặt hàng $p$ đó cho dự án $j$ hay không (mất thông tin bộ ba $(s, p, j)$ và chỗ đặt `SOLUONG`).',
                explanation: 'Xuất sắc! Đây chính là lý do kinh điển trong C2_1.pdf & C3_1.pdf: ba liên kết bậc 2 không tương đương ngữ nghĩa với một liên kết bậc 3.',
              },
              {
                id: 'b',
                label: 'Vì sơ đồ ER không cho phép vẽ quá 2 hình thoi.',
                explanation: 'Sai: Sơ đồ ER không giới hạn số lượng hình thoi liên kết.',
              },
              {
                id: 'c',
                label: 'Vì liên kết đệ quy bắt buộc có bậc bằng 3.',
                explanation: 'Sai: Liên kết đệ quy nối 2 vai trò của cùng 1 kiểu thực thể là bậc 2.',
              },
            ],
            correctOptionId: 'a',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 2.4
     * ====================================================================== */
    {
      id: 'lesson-2-4',
      moduleId: 'module-2',
      orderLabel: '2.4',
      title: 'Tỉ số Lực lượng, Sự tham gia & Bẫy ngược chiều (min, max)',
      subtitle:
        'Làm chủ bẫy số 1 trong đề thi giữa kỳ UET: quy tắc đặt cặp (min, max) ngược phía hoàn toàn so với tỉ số 1 : N cổ điển.',
      slideRange: 'C2_1.pdf · tr. 25–30',
      estimatedMinutes: 15,
      steps: [
        {
          id: 'step-2-4-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Cách 1: Tỉ số lực lượng (1:1, 1:N, N:M) & Tham gia Toàn bộ / Bộ phận',
          narrative: [
            'Để ràng buộc số lượng cá thể tham gia liên kết, cách truyền thống thứ nhất dùng kết hợp **2 thông tin**:',
            '1. **Tỉ số lực lượng (*Cardinality Ratio*)**: `1:1`, `1:N` (hoặc `N:1`), `N:M` — chỉ số liên kết **tối đa**.',
            '   - Ví dụ `NHANVIEN (n) — Lam_viec — (1) PHONGBAN`: 1 phòng ban có nhiều (`n`) nhân viên, nên chữ `n` ghi ở phía `NHANVIEN`; 1 nhân viên thuộc 1 phòng ban nên số `1` ghi ở phía `PHONGBAN`.',
            '2. **Ràng buộc tham gia (*Participation / Existence Constraint*)**: Chỉ sự tham gia **tối thiểu**:',
            '   - **Tham gia toàn bộ (*Total Participation* — vẽ nét đôi)**: **Mọi** thực thể trong tập đều bắt buộc tham gia ít nhất 1 liên kết (ví dụ mọi nhân viên đều phải thuộc 1 phòng ban).',
            '   - **Tham gia bộ phận (*Partial Participation* — vẽ nét đơn)**: Có những thực thể không tham gia liên kết (ví dụ trong liên kết `La_truong_phong`, phần lớn nhân viên bình thường không làm trưởng phòng).',
          ].join('\n'),
          workbench: {
            kind: 'er-diagram',
            diagramId: 'NV_PB_BASIC',
            title: 'Bấm nút chuyển đổi góc trên phải sơ đồ để so sánh (min, max) và 1 : N!',
            caption: 'Hãy quan sát kỹ hai con số ở hai đầu liên kết Lam_viec đổi chỗ cho nhau như thế nào.',
          },
        },
        {
          id: 'step-2-4-2',
          phaseLabel: 'Gỡ bẫy',
          title: 'BẪY SỐ 1 KHI THI UET: Ký hiệu (min, max) đặt NGƯỢC ĐẦU với 1 : N!',
          narrative: [
            'Trên trang 28 của `C2_1.pdf`, giáo trình giới thiệu cách biểu diễn thay thế gọn và chính xác hơn là **Ràng buộc cấu trúc $(\\min, \\max)$**:',
            'Với mỗi kiểu thực thể $E$ tham gia vào liên kết $R$, ta gắn cặp số nguyên $(\\min, \\max)$ **ngay trên cạnh nối của $E$** — nghĩa là **mỗi thực thể $e \\in E$ bắt buộc tham gia ít nhất $\\min$ lần và nhiều nhất $\\max$ lần vào $R$**:',
            '$$0 \\le \\min \\le \\max \\quad (\\max \\ge 1)$$',
            '- $\\min = 0 \\iff$ Tham gia **bộ phận** (nét đơn).',
            '- $\\min \\ge 1 \\iff$ Tham gia **toàn bộ** (nét đôi).',
            '',
            '### Tại sao sinh viên rất hay viết ngược?',
            'Xét câu: *"Mỗi nhân viên làm việc cho đúng 1 phòng ban; mỗi phòng ban có từ 1 đến nhiều nhân viên"*:',
            '- Theo **Tỉ số lực lượng cổ điển**: `NHANVIEN` — **`n`** — `Lam_viec` — **`1`** — `PHONGBAN`.',
            '- Theo **Chuẩn $(\\min, \\max)$ trên slide UET**:',
            '  - Đứng tại `NHANVIEN` tự hỏi: *"1 nhân viên làm cho mấy phòng?"* $\\to$ Tối thiểu 1, tối đa 1 $\\implies$ Ghi **`(1,1)` ngay sát `NHANVIEN`**!',
            '  - Đứng tại `PHONGBAN` tự hỏi: *"1 phòng ban có mấy nhân viên?"* $\\to$ Tối thiểu 1, tối đa $n$ $\\implies$ Ghi **`(1,n)` ngay sát `PHONGBAN`**!',
          ].join('\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Quy tắc vàng chống viết ngược (min, max)',
              slideSource: 'C2_1.pdf · tr. 28',
              body: '**"Đứng ở thực thể nào — đếm số liên kết của 1 cá thể thuộc thực thể đó — rồi ghi $(\\min, \\max)$ ngay dưới chân mình!"** Tuyệt đối không ném số đếm sang đầu bên kia như kiểu $1:N$.',
            },
          ],
          workbench: {
            kind: 'er-diagram',
            diagramId: 'NV_PB_BASIC',
            title: 'Kiểm chứng liên kết Lam_viec và La_truong_phong trên NV_PB_BASIC',
          },
        },
        {
          id: 'step-2-4-3',
          phaseLabel: 'Thực hành',
          title: 'Thực hành đặt cặp (min, max) cho liên kết La_truong_phong',
          narrative: [
            'Bây giờ đến lượt bạn tự cấu hình cặp $(\\min, \\max)$ trên bàn thực hành bên phải cho liên kết `La_truong_phong` giữa `NHANVIEN` và `PHONGBAN`!',
            'Nếu bạn vô tình đặt ngược hai đầu, bộ chấm điểm sẽ chỉ ra ngay bẫy đảo chiều.',
          ].join('\n\n'),
          workbench: {
            kind: 'schema-mapper',
            diagramId: 'NV_PB_BASIC',
            title: 'Thử thách (min, max) chống bẫy ngược chiều',
          },
          challenge: {
            type: 'cardinality-toggle',
            diagramId: 'NV_PB_BASIC',
            prompt:
              'Hãy chọn đúng cặp $(\\min, \\max)$ ở hai đầu `NHANVIEN` và `PHONGBAN` cho liên kết **`La_truong_phong`**.',
            scenarioText:
              'Quy tắc nghiệp vụ Công ty (`C2_1.pdf` tr. 28 & 36): **Một nhân viên có thể không làm trưởng phòng nào, hoặc làm trưởng phòng của tối đa 1 phòng ban. Ngược lại, mỗi phòng ban bắt buộc phải có đúng 1 trưởng phòng.**',
            leftEntityName: 'NHANVIEN',
            rightEntityName: 'PHONGBAN',
            relationshipName: 'La_truong_phong',
            expectedLeftMinMax: [0, 1],
            expectedRightMinMax: [1, 1],
            expectedLeftRatio: '1',
            expectedRightRatio: '1',
            hint: 'Đứng tại NHANVIEN: 1 nhân viên quản lý tối thiểu 0, tối đa 1 phòng → (0,1). Đứng tại PHONGBAN: 1 phòng có tối thiểu 1, tối đa 1 trưởng phòng → (1,1).',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 2.5
     * ====================================================================== */
    {
      id: 'lesson-2-5',
      moduleId: 'module-2',
      orderLabel: '2.5',
      title: 'Kiểu Thực thể Yếu & Tổng kết Thiết kế Sơ đồ ER Hoàn chỉnh',
      subtitle:
        'Nắm vững bộ tứ Thực thể yếu — Thực thể chủ — Liên kết xác định — Khóa bộ phận và đọc thông thạo sơ đồ Đề án Công ty.',
      slideRange: 'C2_1.pdf · tr. 31–52',
      estimatedMinutes: 14,
      steps: [
        {
          id: 'step-2-5-1',
          phaseLabel: 'Vấn đề',
          title: 'Nếu hai nhân viên khác nhau cùng có con gái tên "Trinh" sinh cùng ngày thì định danh thế nào?',
          narrative: [
            'Trong CSDL Công ty, ta cần lưu thông tin **Thân nhân (`THANNHAN`)** của nhân viên để tính bảo hiểm y tế, gồm các thuộc tính: `TENTN`, `GT` (giới tính), `NS` (ngày sinh), `QUANHE`.',
            'Nhận xét quan trọng:',
            '- Bản thân `THANNHAN` **không có mã định danh độc lập toàn cục** (không lưu CCCD cho trẻ nhỏ): hai nhân viên khác nhau hoàn toàn có thể cùng có con tên `"Minh"` sinh cùng ngày!',
            '- Một thân nhân chỉ tồn tại trong CSDL Công ty **chừng nào nhân viên bảo lãnh người đó còn làm việc**. Nếu nhân viên nghỉ việc và bị xóa, thân nhân đó không còn lý do tồn tại.',
            'Những kiểu thực thể không có thuộc tính khóa riêng như vậy được gọi là **Kiểu thực thể yếu (*Weak Entity Type*)**.',
          ].join('\n\n'),
          workbench: {
            kind: 'er-diagram',
            diagramId: 'NHANVIEN_THANNHAN_WEAK',
            title: 'Thực thể yếu THANNHAN phụ thuộc vào thực thể chủ NHANVIEN',
            caption: 'Quan sát 4 ký hiệu đặc trưng: chữ nhật nét đôi, thoi nét đôi, cạnh tham gia toàn bộ nét đôi và khóa bộ phận nét đứt.',
          },
        },
        {
          id: 'step-2-5-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Bộ 4 thành phần bắt buộc của Kiểu Thực thể Yếu',
          narrative: [
            'Theo `C2_1.pdf` (tr. 31–35), mỗi **Kiểu thực thể yếu $W$** luôn đi kèm trọn bộ 4 yếu tố:',
            '1. **Kiểu thực thể chủ / thực thể xác định (*Owner / Identifying Entity Type* $E$)**: Kiểu thực thể mà $W$ phụ thuộc tồn tại vào (ví dụ `NHANVIEN`).',
            '2. **Liên kết xác định (*Identifying Relationship*)**: Liên kết nối $W$ với $E$, vẽ bằng **hình thoi nét đôi** (ví dụ `Co_than_nhan` hoặc `Phu_thuoc`).',
            '3. **Tham gia toàn bộ bắt buộc**: Thực thể yếu $W$ **luôn luôn tham gia toàn bộ** (vẽ **nét đôi**, $\\min \\ge 1$) vào liên kết xác định, vì không có chủ thì thực thể yếu không thể được định danh!',
            '4. **Khóa bộ phận (*Partial Key / Discriminator*)**: Tập thuộc tính dùng để phân biệt các thực thể yếu **thuộc cùng một thực thể chủ** (ví dụ trong phạm vi 1 nhân viên thì các thân nhân có `TEN_TN` đôi một khác nhau). Ký hiệu: **gạch chân nét đứt** bên trong bầu dục.',
            '',
            '$$\\text{Khóa đầy đủ của } W = \\text{Khóa của thực thể chủ } E \\;\\cup\\; \\text{Khóa bộ phận của } W$$',
          ].join('\n'),
          callouts: [
            {
              kind: 'example',
              title: 'Một ví dụ thực thể yếu quen thuộc khác trong đề thi UET',
              slideSource: 'C2_1.pdf · tr. 44–50',
              body: '- `HOADON` (chủ, khóa `SoHD`) và `CHITIET_DON` (yếu, khóa bộ phận `STT_Dong`).\n- `TOANHA` (chủ, khóa `MaToa`) và `PHONGHOC` (yếu, khóa bộ phận `SoPhong` như `301`, `302` trùng nhau giữa tòa G2 và E3).',
            },
          ],
          workbench: {
            kind: 'er-diagram',
            diagramId: 'CONGTY_ER',
            title: 'Tổng hợp toàn bộ ký hiệu ER trên sơ đồ CONGTY_ER',
            caption: 'Kiểm tra lại cả 4 thực thể NHANVIEN, PHONGBAN, DEAN, THANNHAN và 5 liên kết trên cùng một bản thiết kế.',
          },
        },
        {
          id: 'step-2-5-3',
          phaseLabel: 'Thực hành',
          title: 'Đặt ràng buộc (min, max) cho thực thể yếu THANNHAN',
          narrative:
            'Hãy củng cố cả kiến thức Thực thể yếu lẫn quy tắc $(\\min, \\max)$ trên sơ đồ `NHANVIEN_THANNHAN_WEAK` ở khung bên phải!',
          workbench: {
            kind: 'schema-mapper',
            diagramId: 'NHANVIEN_THANNHAN_WEAK',
            title: 'Thực hành (min, max) trên liên kết xác định Co_than_nhan',
          },
          challenge: {
            type: 'cardinality-toggle',
            diagramId: 'NHANVIEN_THANNHAN_WEAK',
            prompt:
              'Thiết lập cặp $(\\min, \\max)$ chuẩn UET cho liên kết xác định **`Co_than_nhan`** giữa thực thể chủ `NHANVIEN` và thực thể yếu `THANNHAN`.',
            scenarioText:
              'Quy tắc nghiệp vụ: **Một nhân viên có thể chưa kê khai thân nhân nào hoặc có nhiều thân nhân. Ngược lại, mỗi thân nhân trong CSDL bắt buộc phụ thuộc vào đúng 1 nhân viên duy nhất.**',
            leftEntityName: 'NHANVIEN',
            rightEntityName: 'THANNHAN',
            relationshipName: 'Co_than_nhan',
            expectedLeftMinMax: [0, 'n'],
            expectedRightMinMax: [1, 1],
            expectedLeftRatio: '1',
            expectedRightRatio: 'n',
            hint: '1 NHANVIEN có từ 0 đến n thân nhân → đặt (0,n) cạnh NHANVIEN. 1 THANNHAN bắt buộc gắn với đúng 1 nhân viên chủ → đặt (1,1) cạnh THANNHAN!',
          },
        },
        {
          id: 'step-2-5-4',
          phaseLabel: 'Thực hành',
          title: 'Kiểm tra tổng kết Chặng 2 (Mô hình ER)',
          narrative: 'Trả lời câu hỏi tổng kết trước khi sang Mô hình Thực thể - Liên kết Mở rộng (EER).',
          workbench: {
            kind: 'er-diagram',
            diagramId: 'CONGTY_ER',
            title: 'Sơ đồ ER Công ty hoàn chỉnh',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Trên sơ đồ ER chuẩn bài giảng UET (`C2_1.pdf`), tổ hợp ký hiệu nào biểu diễn đúng một **Kiểu thực thể yếu** và **Khóa bộ phận** của nó?',
            options: [
              {
                id: 'a',
                label: 'Hình chữ nhật nét đơn, nối nét đơn vào hình thoi nét đơn, khóa gạch chân nét liền.',
                explanation: 'Đó là ký hiệu của kiểu thực thể mạnh thông thường.',
              },
              {
                id: 'b',
                label: 'Hình chữ nhật **nét đôi**, nối bằng cạnh **nét đôi** (tham gia toàn bộ) vào hình thoi **nét đôi** (liên kết xác định), và thuộc tính khóa bộ phận **gạch chân nét đứt**.',
                explanation: 'Chính xác 100% cả 4 chi tiết ký hiệu chuẩn slide C2_1.pdf tr. 35!',
              },
              {
                id: 'c',
                label: 'Hình bầu dục nét đôi nối vào hình chữ nhật nét đứt.',
                explanation: 'Hình bầu dục nét đôi là thuộc tính đa trị, không tồn tại hình chữ nhật nét đứt trong ER chuẩn.',
              },
            ],
            correctOptionId: 'b',
          },
        },
      ],
    },
  ],
};
