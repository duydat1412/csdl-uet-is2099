import { ModuleSpec } from '../domain/types';

export const MODULE_3_EER: ModuleSpec = {
  id: 'module-3',
  order: 3,
  title: 'Mô hình Thực thể - Liên kết Mở rộng (EER)',
  sourceFile: 'C2_2.pdf (26 trang)',
  description:
    'Lớp cha / Lớp con, kế thừa thuộc tính & liên kết (ISA), chuyên biệt hóa vs tổng quát hóa, ràng buộc (d)/(o), đa kế thừa và kiểu hợp (Union Type).',
  lessons: [
    /* ========================================================================
     * BÀI 3.1
     * ====================================================================== */
    {
      id: 'lesson-3-1',
      moduleId: 'module-3',
      orderLabel: '3.1',
      title: 'Lớp cha / Lớp con, Kế thừa & Chuyên biệt hóa vs. Tổng quát hóa',
      subtitle:
        'Hiểu vì sao ER kinh điển chưa đủ cho bài toán phức tạp và cách EER dùng quan hệ tập con ⊂ (ISA) để kế thừa thuộc tính.',
      slideRange: 'C2_2.pdf · tr. 2–12',
      estimatedMinutes: 11,
      steps: [
        {
          id: 'step-3-1-1',
          phaseLabel: 'Vấn đề',
          title: 'Nếu dồn mọi thuộc tính của Thư ký, Kỹ sư, Nhân viên theo giờ vào chung bảng NHANVIEN thì sao?',
          narrative: [
            'Trong một tập đoàn lớn (`C2_2.pdf` tr. 4–5), cùng là `NHANVIEN` nhưng:',
            '- **Thư ký (`SECRETARY`)** có thuộc tính riêng `TocDoGoMay` (*TypingSpeed*).',
            '- **Kỹ sư (`ENGINEER`)** có thuộc tính riêng `LoaiKySu` (*EngType*) và riêng nhóm Kỹ sư mới tham gia liên kết quản lý dự án kỹ thuật.',
            '- **Nhân viên hưởng lương tháng (`SALARIED_EMP`)** có `LuongThang`, còn **Nhân viên theo giờ (`HOURLY_EMP`)** có `DonGiaGio`.',
            'Nếu nhét tất cả các cột đó vào một kiểu thực thể `NHANVIEN` duy nhất, hàng loạt ô dữ liệu sẽ bị bỏ trống (`null`) và ta không thể biểu diễn ràng buộc *"chỉ Kỹ sư mới được đứng tên hồ sơ thiết kế"*. Đó là lý do **Mô hình EER (*Enhanced Entity-Relationship*)** ra đời!',
          ].join('\n\n'),
          workbench: {
            kind: 'er-diagram',
            diagramId: 'EMPLOYEE_EER',
            title: 'Sơ đồ EER Nhân viên với 2 nhánh chuyên biệt hóa độc lập (C2_2.pdf tr. 5)',
            caption: 'Quan sát ký hiệu vòng tròn (d) và dấu tập con ⊂ mở về phía lớp cha.',
          },
        },
        {
          id: 'step-3-1-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Quan hệ Lớp cha – Lớp con (Superclass / Subclass) & Tính Kế thừa',
          narrative: [
            '### 1. Tập con thực thể & Cơ chế Kế thừa (*Type Inheritance*)',
            'Nếu $S$ là **lớp con (*Subclass*)** của **lớp cha (*Superclass*)** $C$, ký hiệu trên nhánh nối là dấu tập con $S \\subset C$ (còn gọi là quan hệ **ISA** — *"là một"*):',
            '- Mỗi thực thể thành viên $e \\in S$ chính là **cùng một thực thể ngoài đời thực** với một cá thể thuộc $C$ (không phải hai đối tượng tách rời!).',
            '- **Định luật kế thừa**: Mọi thực thể thuộc lớp con $S$ **kế thừa toàn bộ thuộc tính** (kể cả **thuộc tính khóa**!) của lớp cha $C$, đồng thời **kế thừa mọi kiểu liên kết** mà lớp cha $C$ tham gia (`C2_2.pdf` tr. 6–7).',
            '',
            '### 2. Hai chiều tư duy ngược nhau: Chuyên biệt hóa vs. Tổng quát hóa',
            '| Quá trình | Chiều suy diễn | Ví dụ điển hình trong `C2_2.pdf` |',
            '| --- | --- | --- |',
            '| **Chuyên biệt hóa (*Specialization*)** | **Từ trên xuống (*Top-Down*)**: Từ 1 lớp cha chung tách thành các lớp con dựa theo đặc trưng phân biệt. | Từ `NHANVIEN` chia thành `THUKY`, `KYSU`, `KYTHUATVIEN` theo nghề nghiệp. |',
            '| **Tổng quát hóa (*Generalization*)** | **Từ dưới lên (*Bottom-Up*)**: Nhận thấy nhiều kiểu thực thể có chung thuộc tính/khóa nên gom phần chung lên thành 1 lớp cha. | Từ `XE_CON` và `XE_TAI` (cùng có `BienSo`, `Gia`, `SoKhung`) tổng quát hóa lên lớp cha `PHUONGTIEN`. |',
          ].join('\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Lớp con có cần tự định nghĩa lại thuộc tính khóa mới không?',
              slideSource: 'C2_2.pdf · tr. 7',
              body: '**Không!** Lớp con mặc định kế thừa thuộc tính khóa của lớp cha (ví dụ `THUKY` dùng luôn khóa `MANV` kế thừa từ `NHANVIEN`). Trên sơ đồ EER, ta **không vẽ lặp lại** các bầu dục thuộc tính của lớp cha ở lớp con.',
            },
          ],
          workbench: {
            kind: 'er-diagram',
            diagramId: 'EMPLOYEE_EER',
            title: 'Đối chiếu thuộc tính riêng ở từng lớp con trong EMPLOYEE_EER',
          },
        },
        {
          id: 'step-3-1-3',
          phaseLabel: 'Thực hành',
          title: 'Phân biệt Chuyên biệt hóa, Tổng quát hóa và Kế thừa EER',
          narrative: 'Kiểm tra nhanh nguyên lý nền tảng của mô hình EER.',
          workbench: {
            kind: 'er-diagram',
            diagramId: 'EMPLOYEE_EER',
            title: 'Sơ đồ EMPLOYEE_EER',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Khi thiết kế CSDL quản lý phương tiện giao thông, người thiết kế khảo sát thấy hai thực thể `XE_HOI` và `XE_TAI` đều có chung `MaPhuongTien`, `BienSo`, `GiaBan` nên gộp phần chung lên thành lớp cha `PHUONGTIEN`. Thao tác tư duy này gọi là gì?',
            options: [
              {
                id: 'a',
                label: '**Tổng quát hóa (*Generalization* — đi từ dưới lên *Bottom-Up*)**.',
                explanation: 'Chính xác theo ví dụ kinh điển CAR + TRUCK → VEHICLE ở trang 10–11 của C2_2.pdf!',
              },
              {
                id: 'b',
                label: 'Chuyên biệt hóa (*Specialization* — đi từ trên xuống *Top-Down*).',
                explanation: 'Chuyên biệt hóa là đi theo chiều ngược lại: xuất phát từ lớp cha sẵn có rồi chia nhỏ xuống các lớp con.',
              },
              {
                id: 'c',
                label: 'Tạo kiểu thực thể yếu vì `XE_HOI` không có khóa.',
                explanation: 'Sai: cả XE_HOI và XE_TAI đều là thực thể có khóa MaPhuongTien kế thừa từ lớp cha, không phải thực thể yếu.',
              },
            ],
            correctOptionId: 'a',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 3.2
     * ====================================================================== */
    {
      id: 'lesson-3-2',
      moduleId: 'module-3',
      orderLabel: '3.2',
      title: 'Ràng buộc Rời rạc (d) / Chồng lấn (o) & Toàn bộ / Bộ phận',
      subtitle:
        'Làm chủ 4 tổ hợp ràng buộc chuyên biệt hóa trong EER và thực hành trực tiếp trên sơ đồ ĐAOTAO_EER.',
      slideRange: 'C2_2.pdf · tr. 13–19',
      estimatedMinutes: 12,
      steps: [
        {
          id: 'step-3-2-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Hai trục ràng buộc độc lập trên mỗi phép Chuyên biệt hóa',
          narrative: [
            'Mỗi vòng tròn chuyên biệt hóa từ lớp cha $C$ xuống các lớp con $\\{S_1, S_2, \\dots, S_m\\}$ được kiểm soát bởi **2 ràng buộc hoàn toàn độc lập nhau** (`C2_2.pdf` tr. 14–18):',
            '### 1. Ràng buộc Tách rời (*Disjointness Constraint*) — ghi trong vòng tròn:',
            '- **Rời rạc — `(d)` (*Disjoint*)**: Mỗi thực thể của lớp cha thuộc **tối đa 1 lớp con** ($S_i \\cap S_j = \\emptyset$ với $i \\ne j$). Ví dụ: Nhân viên hưởng lương biên chế hoặc hưởng lương theo giờ, không nhận cả hai chế độ.',
            '- **Chồng lấn / Giao nhau — `(o)` (*Overlapping*)**: Một thực thể của lớp cha **có thể đồng thời thuộc nhiều lớp con** ($S_i \\cap S_j \\ne \\emptyset$). Ví dụ: Một `NGUOI` trong trường đại học vừa là `NHANVIEN` (cán bộ trẻ), vừa là `HOCVIEN` đang theo học cao học!',
            '',
            '### 2. Ràng buộc Đầy đủ (*Completeness Constraint*) — nét vẽ từ lớp cha tới vòng tròn:',
            '- **Toàn bộ (*Total* — vẽ nét đôi)**: **Mọi** thực thể của lớp cha bắt buộc phải thuộc ít nhất 1 lớp con: $\\bigcup_{i=1}^m S_i = C$.',
            '- **Bộ phận (*Partial* — vẽ nét đơn)**: Có thể tồn tại thực thể thuộc lớp cha nhưng **không thuộc bất kỳ lớp con nào**: $\\bigcup_{i=1}^m S_i \\subsetneq C$.',
          ].join('\n'),
          callouts: [
            {
              kind: 'definition',
              title: '4 tổ hợp hợp lệ của chuyên biệt hóa EER',
              slideSource: 'C2_2.pdf · tr. 18',
              body: 'Vì 2 trục độc lập nhau nên có đúng $2 \\times 2 = 4$ khả năng:\n1. **Disjoint + Total** (`(d)` + nét đôi)\n2. **Disjoint + Partial** (`(d)` + nét đơn)\n3. **Overlapping + Total** (`(o)` + nét đôi)\n4. **Overlapping + Partial** (`(o)` + nét đơn)',
            },
          ],
          workbench: {
            kind: 'er-diagram',
            diagramId: 'DAOTAO_EER',
            title: 'Quan sát vòng tròn (o) kết hợp nét đôi trên DAOTAO_EER',
          },
        },
        {
          id: 'step-3-2-2',
          phaseLabel: 'Thực hành',
          title: 'Cấu hình ràng buộc EER cho bài toán Nhân sự Trường Đại học',
          narrative: [
            'Ở khung bên phải, bạn hãy đọc kỹ quy tắc nghiệp vụ của trường đại học và bấm chọn đúng cặp ràng buộc `(d)/(o)` cùng `Toàn bộ / Bộ phận` để xem sơ đồ EER cập nhật trực tiếp!',
          ].join('\n\n'),
          workbench: {
            kind: 'schema-mapper',
            diagramId: 'DAOTAO_EER',
            title: 'Thử thách Ràng buộc Chuyên biệt hóa EER',
          },
          challenge: {
            type: 'eer-validator',
            diagramId: 'DAOTAO_EER',
            prompt:
              'Chọn cặp ràng buộc chuyên biệt hóa đúng cho lớp cha **`NGUOI`** tách xuống hai lớp con **`HOCVIEN`** và **`NHANVIEN`**.',
            expectedDisjointness: 'o',
            expectedCompleteness: 'total',
            sampleCaseDescription:
              'Quy tắc nghiệp vụ (`C2_2.pdf` tr. 21 & 25): **Mọi cá nhân lưu trong CSDL nhà trường bắt buộc phải là Học viên hoặc Nhân viên (không lưu người ngoài). Đồng thời, một cán bộ Nhân viên trẻ vẫn có thể đăng ký làm Học viên cao học ngay tại trường.**',
            explanation:
              'Vì một cá nhân vừa có thể là Nhân viên vừa là Học viên nên phải dùng **(o) Chồng lấn (Overlapping)**; vì mọi người trong CSDL đều thuộc ít nhất một trong hai nhóm nên cạnh nối từ `NGUOI` xuống vòng tròn phải là **Toàn bộ (Nét đôi)**.',
          },
        },
        {
          id: 'step-3-2-3',
          phaseLabel: 'Gỡ bẫy',
          title: 'Hệ quả lan truyền khi Thêm / Xóa trên EER',
          narrative: [
            'Trang 19 của `C2_2.pdf` nhấn mạnh 3 quy tắc thực thi tự động trên EER mà đề thi lý thuyết rất hay hỏi:',
            '1. **Xóa một thực thể khỏi lớp cha $C$** $\\implies$ Tự động xóa thực thể đó khỏi **tất cả các lớp con** mà nó đang tham gia.',
            '2. **Chèn một thực thể mới vào lớp cha $C$**:',
            '   - Nếu chuyên biệt hóa xác định theo vị từ (*Predicate-defined*, ví dụ `JobType = "Secretary"`), thực thể thỏa vị từ nào sẽ tự động được đưa vào lớp con đó.',
            '   - Nếu chuyên biệt hóa là **Toàn bộ (Total — nét đôi)**, thực thể mới chèn vào $C$ **bắt buộc phải thuộc ít nhất một lớp con** ngay lập tức!',
          ].join('\n\n'),
          workbench: {
            kind: 'er-diagram',
            diagramId: 'EMPLOYEE_EER',
            title: 'So sánh chuyên biệt hóa Bộ phận (Nghề nghiệp) và Toàn bộ (Hình thức lương)',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 3.3
     * ====================================================================== */
    {
      id: 'lesson-3-3',
      moduleId: 'module-3',
      orderLabel: '3.3',
      title: 'Phân cấp vs. Lưới Đa kế thừa (Lattice) & Kiểu Hợp (Union Type)',
      subtitle:
        'Phân biệt cây phân cấp đơn kế thừa với lưới đa kế thừa (Shared Subclass TROGIANG) và kiểu hợp (Category OWNER).',
      slideRange: 'C2_2.pdf · tr. 20–26',
      estimatedMinutes: 12,
      steps: [
        {
          id: 'step-3-3-1',
          phaseLabel: 'Lý thuyết UET',
          title: 'Cây phân cấp (Hierarchy) vs. Lưới đa kế thừa (Lattice)',
          narrative: [
            'Khi một sơ đồ EER có nhiều tầng chuyên biệt hóa nối tiếp nhau (`C2_2.pdf` tr. 20–21):',
            '- **Phân cấp chuyên biệt hóa (*Specialization Hierarchy*)**: Ràng buộc dạng cây — mỗi lớp con chỉ có **duy nhất 1 lớp cha trực tiếp** (*Single Inheritance*).',
            '- **Lưới chuyên biệt hóa (*Specialization Lattice*)**: Tồn tại ít nhất một **Lớp con chung (*Shared Subclass*)** có **từ 2 lớp cha trực tiếp trở lên** (*Multiple Inheritance*).',
            '',
            'Hãy nhìn lớp `TROGIANG` ở cuối sơ đồ `DAOTAO_EER` bên phải: `TROGIANG` vừa là lớp con của `HOCVIEN`, vừa là lớp con của `NHANVIEN`! Do đó `TROGIANG` kế thừa **cả** thuộc tính `Lop` từ `HOCVIEN` **lẫn** `Hesoluong` từ `NHANVIEN` (và `MaSo, Hoten` từ gốc `NGUOI`).',
          ].join('\n\n'),
          workbench: {
            kind: 'er-diagram',
            diagramId: 'DAOTAO_EER',
            title: 'Lớp con chung TROGIANG tạo nên cấu trúc Lưới (Lattice)',
            caption: 'TROGIANG nhận hai nhánh ⊂ từ cả HOCVIEN lẫn NHANVIEN (đa kế thừa).',
          },
        },
        {
          id: 'step-3-3-2',
          phaseLabel: 'Gỡ bẫy',
          title: 'Phân biệt Đa kế thừa (Shared Subclass) với Kiểu Hợp (Union Type / Category)',
          narrative: [
            'Sinh viên cực kỳ dễ nhầm giữa **Lớp con chung (đa kế thừa)** và **Kiểu hợp (`u` — *Union Type / Category*)** ở trang 22–23 `C2_2.pdf`! Hãy đặt hai khái niệm cạnh nhau:',
            '| Đặc điểm | Lớp con chung (*Shared Subclass*) | Kiểu Hợp — vòng tròn `(u)` (*Union Type / Category*) |',
            '| --- | --- | --- |',
            '| **Quan hệ tập hợp** | Là **GIAO** tập con: $S \\subseteq C_1 \\cap C_2$ (mỗi cá thể phải thuộc **đồng thời tất cả** các lớp cha). | Là tập con của **HỢP**: $U \\subseteq C_1 \\cup C_2 \\cup C_3$ (mỗi cá thể chỉ thuộc **một trong số** các lớp cha khác loại). |',
            '| **Khóa của các lớp cha** | Các lớp cha thường chung một gốc (cùng khóa `MaSo`). | Các lớp cha có **khóa hoàn toàn khác nhau** (`PERSON` có `CCCD`, `BANK` có `MaNganHang`, `COMPANY` có `MaSoThue`). |',
            '| **Kế thừa thuộc tính** | Kế thừa **tất cả** thuộc tính của mọi lớp cha. | **Kế thừa có chọn lọc (*Selective Inheritance*)**: cá thể `OWNER` là ngân hàng thì chỉ mang thuộc tính của `BANK`! |',
          ].join('\n'),
          callouts: [
            {
              kind: 'slide-ref',
              title: 'Mẹo nhận diện nhanh vòng tròn (u) trên đề thi',
              slideSource: 'C2_2.pdf · tr. 22–23',
              body: 'Khi đề bài viết *"Chủ sở hữu xe (`OWNER`) có thể là một Cá nhân (`PERSON`), **hoặc** một Ngân hàng (`BANK`), **hoặc** một Công ty (`COMPANY`)"* — ba đối tượng gốc khác hẳn bản chất và khác khóa — chắc chắn phải dùng **Kiểu hợp `(u)`**!',
            },
          ],
          workbench: {
            kind: 'er-diagram',
            diagramId: 'VEHICLE_UNION_EER',
            title: 'Kiểu Hợp (u) OWNER kế thừa chọn lọc từ PERSON, BANK, COMPANY',
            caption: 'OWNER là tập con của (PERSON ∪ BANK ∪ COMPANY), sau đó tham gia liên kết owns với REGISTERED_VEHICLE.',
          },
        },
        {
          id: 'step-3-3-3',
          phaseLabel: 'Thực hành',
          title: 'Kiểm tra tổng kết Chặng 3 (Mô hình EER)',
          narrative: 'Hoàn thành câu hỏi phân biệt cốt lõi của Chặng 3 trước khi bước sang Mô hình Quan hệ.',
          workbench: {
            kind: 'er-diagram',
            diagramId: 'VEHICLE_UNION_EER',
            title: 'Sơ đồ Kiểu Hợp VEHICLE_UNION_EER',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Sự khác biệt bản chất toán học giữa **Lớp con chung `TROGIANG`** (đa kế thừa từ `HOCVIEN` và `NHANVIEN`) và **Kiểu hợp `OWNER`** (ký hiệu `(u)` từ `PERSON`, `BANK`, `COMPANY`) là gì?',
            options: [
              {
                id: 'a',
                label: 'Mỗi cá thể `TROGIANG` phải thuộc **đồng thời cả** `HOCVIEN` lẫn `NHANVIEN` ($\\text{TROGIANG} \\subseteq \\text{HOCVIEN} \\cap \\text{NHANVIEN}$); còn mỗi cá thể `OWNER` thuộc **hợp** của các lớp cha khác loại ($\\text{OWNER} \\subseteq \\text{PERSON} \\cup \\text{BANK} \\cup \\text{COMPANY}$) và kế thừa có chọn lọc.',
                explanation: 'Chính xác tuyệt đối theo định nghĩa trang 21–23 của C2_2.pdf!',
              },
              {
                id: 'b',
                label: 'Một cá thể `OWNER` bắt buộc vừa là Cá nhân, vừa là Ngân hàng, vừa là Công ty cùng một lúc.',
                explanation: 'Sai: Cá nhân không thể đồng thời là Ngân hàng — đó chính là lý do phải dùng phép Hợp (u) thay vì đa kế thừa.',
              },
              {
                id: 'c',
                label: 'Ký hiệu `(u)` dùng cho thực thể yếu không có khóa bộ phận.',
                explanation: 'Sai: `(u)` là Union Type / Category trong mô hình EER.',
              },
            ],
            correctOptionId: 'a',
          },
        },
      ],
    },
  ],
};
