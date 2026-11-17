import { ModuleSpec } from '../domain/types';

export const MODULE_1_INTRO: ModuleSpec = {
  id: 'module-1',
  order: 1,
  title: 'Tổng quan về Hệ Cơ sở dữ liệu',
  sourceFile: 'C1.pdf (52 trang)',
  description:
    'Từ bài toán dư thừa dữ liệu trong tệp phẳng đến kiến trúc 3 lược đồ ANSI/SPARC, tính độc lập dữ liệu và các ngôn ngữ giao tiếp CSDL.',
  lessons: [
    /* ========================================================================
     * BÀI 1.1
     * ====================================================================== */
    {
      id: 'lesson-1-1',
      moduleId: 'module-1',
      orderLabel: '1.1',
      title: 'Dữ liệu, CSDL, Hệ QTCSDL & Nỗi đau của Tệp phẳng',
      subtitle:
        'Phân biệt 4 khái niệm nền tảng (Data, DB, DBMS, DBS) và tự tay kích hoạt 3 dị thường kinh điển khi lưu dữ liệu trên bảng phẳng.',
      slideRange: 'C1.pdf · tr. 4–14',
      estimatedMinutes: 12,
      steps: [
        {
          id: 'step-1-1-1',
          phaseLabel: 'Vấn đề',
          title: 'Vì sao Excel hay tệp văn bản (.csv) sụp đổ khi quản lý đào tạo?',
          narrative: [
            'Hãy hình dung Phòng Đào tạo cần lưu danh sách sinh viên đăng ký học phần và điểm thi. Cách tự nhiên nhất của người mới lập trình là tạo **một bảng phẳng duy nhất** `BANGDIEM_FLAT(Masv, Ho, Dem, Ten, Mamon, Tenmon, Diem)` giống như khung bên phải.',
            'Thoạt nhìn bảng 9 dòng rất gọn, nhưng hãy quan sát kỹ:',
            '- Họ tên của sinh viên `T1` (**Trần Văn An**) và `C2` (**Lê Đình Bắc**) bị lặp đi lặp lại ở mọi môn họ học.',
            '- Tên môn `Int1001` (**CSDL**) cũng bị chép lại nhiều lần.',
            'Sự **dư thừa dữ liệu (Data Redundancy)** này không chỉ tốn bộ nhớ mà còn dẫn tới **3 dị thường cập nhật (Update, Deletion, Insertion Anomalies)** làm sai lệch thông tin nghiệp vụ.',
          ].join('\n\n'),
          workbench: {
            kind: 'anomaly',
            datasetId: 'DAOTAO_FLAT',
            title: 'Bảng gộp BANGDIEM_FLAT chưa tách thực thể',
            caption: 'Quan sát sự lặp lại của họ tên sinh viên và tên môn học trên nhiều dòng.',
          },
        },
        {
          id: 'step-1-1-2',
          phaseLabel: 'Khám phá',
          title: 'Tự tay gây ra Dị thường Sửa đổi, Xóa và Chèn',
          narrative: [
            'Ở bàn thực hành bên phải, bạn hãy thử nhấn một trong **3 nút gây dị thường** (hoặc sửa trực tiếp ô `Tenmon` của một dòng bất kỳ):',
            '1. **Dị thường sửa đổi (Update Anomaly)**: Đổi tên môn `Int1001` từ `"CSDL"` sang `"Hệ Cơ sở dữ liệu"` ở dòng đầu tiên nhưng quên sửa các dòng còn lại $\\Rightarrow$ Cùng mã `Int1001` lại mang hai tên khác nhau!',
            '2. **Dị thường xóa (Deletion Anomaly)**: Sinh viên `T3` (**Trần Thị Hảo**) mới chỉ có điểm 1 môn `Int1003`. Nếu hủy kết quả thi dòng đó, toàn bộ hồ sơ họ tên của sinh viên `T3` cũng biến mất khỏi hệ thống!',
            '3. **Dị thường chèn (Insertion Anomaly)**: Khoa mở môn mới `Int3401` (*Trí tuệ nhân tạo*) nhưng chưa có sinh viên nào đăng ký $\\Rightarrow$ Không thể lưu môn học vì khóa chính $(\\underline{\\text{Masv}}, \\underline{\\text{Mamon}})$ cấm `Masv = null`.',
          ].join('\n\n'),
          workbench: {
            kind: 'anomaly',
            datasetId: 'DAOTAO_FLAT',
            title: 'Phòng thí nghiệm Dị thường Bảng phẳng',
            caption: 'Nhấn ít nhất 1 kịch bản dị thường để mở khóa phần định nghĩa chuẩn UET.',
          },
          challenge: {
            type: 'anomaly-sim',
            mode: 'flat-anomaly',
            datasetId: 'DAOTAO_FLAT',
            prompt:
              'Hãy nhấn thử ít nhất **1 trong 3 nút gây dị thường** (Sửa đổi, Xóa hoặc Chèn) trên bảng `BANGDIEM_FLAT` ở khung bên phải để quan sát hậu quả trực tiếp.',
            goalDescription:
              'Nhấn nút "1. Gây Dị thường Sửa đổi", "2. Gây Dị thường Xóa" hoặc "3. Gây Dị thường Chèn (PK null)" ở khung bên phải.',
          },
        },
        {
          id: 'step-1-1-3',
          phaseLabel: 'Lý thuyết UET',
          title: '4 khái niệm cốt lõi: Data · DB · DBMS · DBS',
          narrative: [
            'Để khắc phục triệt để hạn chế của hệ thống xử lý tệp truyền thống (*File Processing System*), ngành Cơ sở dữ liệu tách bạch dữ liệu khỏi chương trình ứng dụng và định nghĩa chuẩn xác 4 tầng khái niệm:',
            '| Thuật ngữ | Viết tắt | Bản chất theo giáo trình UET |',
            '| --- | --- | --- |',
            '| **Dữ liệu** | *Data* | Các sự kiện có thể ghi lại được và mang ý nghĩa tiềm ẩn (số, chuỗi, ngày tháng, hình ảnh...). |',
            '| **Cơ sở dữ liệu** | *DB (Database)* | Một tập hợp các dữ liệu **có liên quan với nhau**, được lưu trữ có tổ chức trên máy tính để phục vụ nhiều người dùng. |',
            '| **Hệ quản trị CSDL** | *DBMS* | Tập hợp **phần mềm tổng quát** cho phép định nghĩa, xây dựng, thao tác và bảo vệ CSDL (ví dụ: PostgreSQL, MySQL, Oracle, SQL Server). |',
            '| **Hệ Cơ sở dữ liệu** | *DBS (Database System)* | Tổ hợp hoàn chỉnh gồm **CSDL + Hệ QTCSDL + Phần mềm ứng dụng** (và người dùng/phần cứng vận hành). |',
          ].join('\n'),
          callouts: [
            {
              kind: 'definition',
              title: 'Công thức tóm tắt Hệ CSDL (DBS)',
              slideSource: 'C1.pdf · tr. 5–9',
              body: '$$\\text{DBS} = \\text{DB (Dữ liệu có cấu trúc)} + \\text{DBMS (Phần mềm quản trị)} + \\text{Ứng dụng khai thác}$$',
            },
            {
              kind: 'pitfall',
              title: 'Nhầm lẫn giữa DB và DBMS khi thi trắc nghiệm',
              slideSource: 'C1.pdf · tr. 7–8',
              body: '**MySQL, Oracle, SQL Server** là **Hệ quản trị CSDL (DBMS)** chứ không phải bản thân CSDL (DB). Còn tập dữ liệu Quản lý Đào tạo của trường ĐH Công nghệ được lưu bên trong PostgreSQL mới là **CSDL (DB)**.',
            },
          ],
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'DAOTAO',
            title: 'CSDL Quản lý Đào tạo sau khi tách bảng chuẩn hóa',
            caption: 'Thay vì 1 bảng phẳng dư thừa, CSDL tách thành SINHVIEN, MONHOC, SV_DIEM, LOP, SV_LOP liên kết chặt chẽ.',
          },
        },
        {
          id: 'step-1-1-4',
          phaseLabel: 'Thực hành',
          title: 'Kiểm tra nhanh phản xạ phân biệt khái niệm',
          narrative:
            'Hãy vận dụng đúng định nghĩa ở trang 5–12 của `C1.pdf` để trả lời câu hỏi kiểm tra dưới đây.',
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'DAOTAO',
            title: 'Đối chiếu CSDL Đào tạo (SINHVIEN, MONHOC, SV_DIEM)',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Trong hệ thống đăng ký học phần của UET sử dụng phần mềm **PostgreSQL** để quản lý các bảng `SINHVIEN`, `MONHOC`, `SV_DIEM` và cổng web `portal.uet.vnu.edu.vn`, phát biểu nào sau đây **chính xác nhất**?',
            options: [
              {
                id: 'a',
                label: 'PostgreSQL là Cơ sở dữ liệu (DB), còn các bảng `SINHVIEN`, `MONHOC` là Hệ quản trị CSDL (DBMS).',
                explanation: 'Ngược khái niệm: PostgreSQL là phần mềm quản trị (DBMS), còn tập bảng dữ liệu liên quan mới là CSDL (DB).',
              },
              {
                id: 'b',
                label: 'Tập bảng dữ liệu Đào tạo là **DB**, phần mềm PostgreSQL là **DBMS**, và toàn bộ tổ hợp gồm DB + PostgreSQL + cổng web ứng dụng tạo thành **Hệ CSDL (DBS)**.',
                explanation: 'Hoàn toàn chuẩn xác theo sơ đồ Hệ CSDL ở trang 8–9 của C1.pdf!',
              },
              {
                id: 'c',
                label: 'Lưu toàn bộ dữ liệu vào một tệp CSV duy nhất giúp loại bỏ dư thừa tốt hơn dùng DBMS.',
                explanation: 'Tệp phẳng CSV gây dư thừa dữ liệu, phụ thuộc chương trình - dữ liệu và phát sinh dị thường cập nhật.',
              },
            ],
            correctOptionId: 'b',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 1.2
     * ====================================================================== */
    {
      id: 'lesson-1-2',
      moduleId: 'module-1',
      orderLabel: '1.2',
      title: 'Đặc trưng của hướng tiếp cận CSDL & Các nhóm Người dùng',
      subtitle:
        'Nắm vững tính tự mô tả (Meta-data / Catalog), trừu tượng hóa dữ liệu, xử lý đa người dùng và phân loại Actors on the Scene.',
      slideRange: 'C1.pdf · tr. 15–26',
      estimatedMinutes: 10,
      steps: [
        {
          id: 'step-1-2-1',
          phaseLabel: 'Vấn đề',
          title: 'Nếu viết code C/Java đọc tệp nhị phân, chuyện gì xảy ra khi thêm 1 cột mới?',
          narrative: [
            'Trong **hướng tiếp cận xử lý tệp truyền thống**, cấu trúc bản ghi (ví dụ `struct SinhVien { char masv[10]; char ten[50]; }`) bị **nhúng cứng (hard-code)** bên trong mã nguồn của từng chương trình.',
            'Chỉ cần thêm một trường `NgaySinh` vào tệp dữ liệu, **mọi chương trình** đọc tệp đó đều bị lệch byte và phải sửa mã nguồn rồi biên dịch lại!',
            'Hướng tiếp cận CSDL giải quyết triệt để vấn đề này bằng **4 đặc trưng cốt lõi** (trang 16–21 `C1.pdf`):',
            '1. **Tính tự mô tả (Self-describing nature)**: DBMS lưu cả dữ liệu lẫn bản mô tả cấu trúc và ràng buộc (**Meta-data**) trong **DBMS Catalog** (Từ điển dữ liệu).',
            '2. **Cô lập giữa chương trình và dữ liệu, trừu tượng hóa dữ liệu** (*Program-Data Independence & Data Abstraction*).',
            '3. **Hỗ trợ nhiều khung nhìn (Multiple Views)** phù hợp từng nhóm người dùng.',
            '4. **Chia sẻ dữ liệu và xử lý giao dịch đa người dùng (Multiuser Transaction Processing)** bảo đảm tính nguyên tử và điều khiển tương tranh.',
          ].join('\n\n'),
          callouts: [
            {
              kind: 'definition',
              title: 'Siêu dữ liệu (Meta-data) & Catalog',
              slideSource: 'C1.pdf · tr. 17',
              body: '**Meta-data** là *"dữ liệu mô tả về dữ liệu"*: tên các bảng, tên cột, kiểu miền giá trị ($\\Dom$), khóa chính `PK`, khóa ngoại `FK`. Nhờ đọc Catalog, cùng một phần mềm DBMS có thể quản lý cả CSDL Đào tạo lẫn CSDL Ngân hàng mà không cần viết lại phần mềm.',
            },
          ],
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'CONGTY_PHG',
            title: 'Khám phá CSDL Đề án Công ty (CONGTY_PHG)',
            caption: 'Mỗi bảng bên dưới đều kèm theo Meta-data về Khóa chính (gạch chân) và Khóa ngoại.',
          },
        },
        {
          id: 'step-1-2-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Phân loại các nhóm con người quanh Hệ CSDL',
          narrative: [
            'Giáo trình UET (`C1.pdf` tr. 22–25) chia con người tham gia vào Hệ CSDL thành 2 nhóm lớn:',
            '### 1. Người trực tiếp làm việc trên hiện trường (*Actors on the Scene*)',
            '- **Quản trị viên CSDL (DBA — Database Administrator)**: Cấp phát quyền truy cập, điều phối và giám sát sử dụng, chịu trách nhiệm bảo mật và hiệu năng phần cứng/phần mềm.',
            '- **Người thiết kế CSDL (Database Designers)**: Nhận diện dữ liệu cần lưu, chọn cấu trúc biểu diễn (thiết kế ER, lược đồ quan hệ) trước khi cài đặt.',
            '- **Người dùng cuối (End Users)**:',
            '  - *Người dùng ngẫu nhiên (Casual)*: Thỉnh thoảng truy vấn thông tin khác nhau (cấp quản lý).',
            '  - *Người dùng ngây thơ / theo tham số (Naive / Parametric)*: Thực hiện lặp đi lặp lại các giao dịch chuẩn định sẵn (*Canned Transactions*) — ví dụ giao dịch viên ngân hàng, nhân viên bán vé.',
            '  - *Người dùng thành thạo (Sophisticated)*: Kỹ sư, nhà phân tích dữ liệu tự viết truy vấn phức tạp.',
            '- **Phân tích viên hệ thống & Lập trình viên ứng dụng (System Analysts & Application Programmers)**: Xây dựng các giao dịch chuẩn cho người dùng cuối.',
            '### 2. Người đứng sau hậu trường (*Workers behind the Scene*)',
            '- Người thiết kế và cài đặt phần mềm DBMS, người phát triển công cụ hỗ trợ (CASE tools) và nhân viên vận hành phần cứng/mạng.',
          ].join('\n'),
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'CONGTY_PHG',
            title: 'Ví dụ phân quyền góc nhìn trên CSDL Công ty',
            caption: 'Phòng Nhân sự cần xem cột LUONG, trong khi nhân viên tra cứu danh bạ chỉ được xem khung nhìn gồm HONV, TENNV, PHG.',
          },
        },
        {
          id: 'step-1-2-3',
          phaseLabel: 'Gỡ bẫy',
          title: 'Khi nào KHÔNG cần dùng Hệ QTCSDL?',
          narrative: [
            'Dù DBMS rất mạnh, slide trang 26 của `C1.pdf` lưu ý kỹ chi phí đầu tư (phần cứng, bản quyền, độ phức tạp quản trị). **Không nên dùng DBMS** khi:',
            '- Dữ liệu và ứng dụng quá đơn giản, ít thay đổi, định nghĩa rõ ràng.',
            '- Yêu cầu xử lý **thời gian thực cực kỳ ngặt nghèo (Stringent real-time requirements)** trên thiết bị nhúng nhỏ mà chi phí tầng DBMS không đáp ứng kịp.',
            '- Môi trường đơn người dùng (Single-user) không cần truy cập đồng thời.',
          ].join('\n\n'),
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'CONGTY_PHG',
            title: 'CSDL Công ty 6 bảng quan hệ',
          },
        },
        {
          id: 'step-1-2-4',
          phaseLabel: 'Thực hành',
          title: 'Nhận diện đúng vai trò người dùng & Meta-data',
          narrative: 'Kiểm tra nhanh kiến thức về Catalog và phân loại người dùng cuối.',
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'CONGTY_PHG',
            title: 'CSDL Công ty',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Nhân viên thu ngân siêu thị quét mã vạch và bấm nút thanh toán theo một biểu mẫu cố định hàng trăm lần mỗi ngày thuộc nhóm người dùng nào theo phân loại của `C1.pdf`?',
            options: [
              {
                id: 'a',
                label: 'Quản trị viên CSDL (DBA)',
                explanation: 'DBA là người quản trị quyền truy cập, sao lưu và tối ưu hệ thống.',
              },
              {
                id: 'b',
                label: 'Người dùng ngây thơ / theo tham số (*Naive / Parametric End Users*) chạy các giao dịch chuẩn định sẵn (*Canned Transactions*).',
                explanation: 'Chính xác! Đây là ví dụ điển hình nhất của Parametric End Users trong giáo trình Elmasri & slide UET.',
              },
              {
                id: 'c',
                label: 'Người đứng sau hậu trường (*Workers behind the Scene*)',
                explanation: 'Workers behind the Scene là đội ngũ lập trình ra bản thân hệ quản trị PostgreSQL/Oracle hoặc vận hành hạ tầng.',
              },
            ],
            correctOptionId: 'b',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 1.3
     * ====================================================================== */
    {
      id: 'lesson-1-3',
      moduleId: 'module-1',
      orderLabel: '1.3',
      title: 'Mô hình Dữ liệu, Lược đồ vs. Thể hiện & Kiến trúc 3 Lược đồ',
      subtitle:
        'Phân biệt rạch ròi Schema (Intension) với Instance (Extension) và làm chủ kiến trúc chuẩn ANSI/SPARC.',
      slideRange: 'C1.pdf · tr. 27–37',
      estimatedMinutes: 12,
      steps: [
        {
          id: 'step-1-3-1',
          phaseLabel: 'Vấn đề',
          title: 'Cấu trúc khung bảng và các dòng dữ liệu bên trong khác nhau thế nào theo thời gian?',
          narrative: [
            'Khi mới thiết kế bảng `SINHVIEN(Masv, Ho, Dem, Ten)`, bảng chưa hề có dòng nào — ta gọi đó là **trạng thái rỗng (Empty State)**.',
            'Đầu học kỳ, Phòng Đào tạo nhập 500 sinh viên khóa mới; mỗi tuần lại có sinh viên cập nhật thông tin. Các dòng dữ liệu thay đổi liên tục từng giây, nhưng cấu trúc 4 cột `(Masv, Ho, Dem, Ten)` thì hầu như đứng yên suốt nhiều năm!',
            'Sự đối lập tốc độ biến thiên này sinh ra cặp khái niệm cực kỳ quan trọng trong đề thi UET: **Lược đồ (Schema)** và **Thể hiện / Trạng thái (Instance / State)**.',
          ].join('\n\n'),
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'DAOTAO',
            title: 'Quan sát Lược đồ (dòng công thức trên đầu bảng) và Thể hiện (các bộ bên dưới)',
          },
        },
        {
          id: 'step-1-3-2',
          phaseLabel: 'Lý thuyết UET',
          title: '3 nhóm Mô hình dữ liệu & Cặp đối ngẫu Schema – Instance',
          narrative: [
            '### 1. Mô hình dữ liệu (*Data Model*) là gì?',
            'Là tập hợp các khái niệm dùng để mô tả **cấu trúc** của CSDL, các **phép toán** thao tác và các **ràng buộc** mà dữ liệu phải tuân theo. Slide `C1.pdf` (tr. 28–30) chia thành 3 mức:',
            '- **Mô hình mức cao / mức quan niệm (*Conceptual Data Models*)**: Gần với nhận thức người dùng cuối (tiêu biểu: **Mô hình ER / EER** học ở Chặng 2 & 3).',
            '- **Mô hình cài đặt / biểu diễn (*Representational / Implementation Models*)**: Cân bằng giữa cách người dùng hiểu và cách lưu trong máy (tiêu biểu: **Mô hình Quan hệ** học ở Chặng 4 & 5, ngoài ra lịch sử còn có Mô hình Mạng và Phân cấp).',
            '- **Mô hình mức thấp / mức vật lý (*Physical Data Models*)**: Mô tả chi tiết cách lưu byte trên đĩa từ, đường dẫn truy xuất (*Access Paths*), chỉ mục `B+Tree`, băm (*Hashing*).',
            '### 2. Lược đồ (*Database Schema*) vs. Trạng thái / Thể hiện (*Database State / Instance*)',
            '| Tiêu chí | Lược đồ CSDL (*Schema / Intension*) | Trạng thái / Thể hiện (*State / Instance / Extension*) |',
            '| --- | --- | --- |',
            '| **Định nghĩa** | Mô tả khung thiết kế, cấu trúc bảng, kiểu dữ liệu và ràng buộc toàn vẹn. | Tập dữ liệu thực tế đang lưu trữ trong CSDL **tại một thời điểm xác định**. |',
            '| **Tần suất thay đổi** | **Rất ít thay đổi** (chỉ đổi khi tiến hóa thiết kế — *Schema Evolution*). | **Thay đổi thường xuyên** mỗi khi `INSERT`, `DELETE`, `MODIFY`. |',
          ].join('\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Phân biệt 3 giai đoạn trạng thái của CSDL',
              slideSource: 'C1.pdf · tr. 32–33',
              body: '1. Khi vừa định nghĩa lược đồ xong $\\to$ **Trạng thái rỗng (*Empty State*)**.\n2. Khi nạp dữ liệu lần đầu $\\to$ **Trạng thái khởi đầu (*Initial State*)**.\n3. Ở mọi thời điểm vận hành sau đó, DBMS đảm bảo CSDL luôn ở một **Trạng thái hợp lệ (*Valid State*)** thỏa mãn mọi ràng buộc của Lược đồ.',
            },
          ],
          workbench: {
            kind: 'three-schema',
            datasetId: 'DAOTAO',
            title: 'Mô hình trực quan Kiến trúc 3 lược đồ ANSI/SPARC',
            caption: 'Quan sát 3 tầng: Mức ngoài (View) ↔ Mức quan niệm (Conceptual) ↔ Mức trong (Internal).',
          },
        },
        {
          id: 'step-1-3-3',
          phaseLabel: 'Khám phá',
          title: 'Kiến trúc 3 lược đồ ANSI/SPARC hoạt động như thế nào?',
          narrative: [
            'Để đạt được tính tự mô tả và hỗ trợ nhiều khung nhìn, kiến trúc **3 lược đồ ANSI/SPARC** (`C1.pdf` tr. 34–37) tách mô tả CSDL thành 3 tầng độc lập:',
            '1. **Mức trong (*Internal Level*)**: Có *Lược đồ trong* mô tả cấu trúc lưu trữ vật lý và đường dẫn truy xuất trên đĩa.',
            '2. **Mức quan niệm (*Conceptual Level*)**: Có *Lược đồ quan niệm* mô tả cấu trúc toàn thể CSDL cho cộng đồng người dùng (ẩn đi chi tiết lưu trữ vật lý; tập trung vào thực thể, kiểu dữ liệu, liên kết, ràng buộc).',
            '3. **Mức ngoài / Mức khung nhìn (*External / View Level*)**: Gồm nhiều *Lược đồ ngoài*, mỗi lược đồ chỉ phơi bày phần dữ liệu mà một nhóm người dùng quan tâm và ẩn phần còn lại.',
            'Dữ liệu **chỉ thực sự tồn tại trên đĩa ở mức vật lý**. Khi người dùng truy vấn trên Mức ngoài, DBMS thực hiện **Ánh xạ (Mapping)** từ Ngoài $\\to$ Quan niệm $\\to$ Trong để lấy dữ liệu trả về.',
          ].join('\n\n'),
          workbench: {
            kind: 'three-schema',
            datasetId: 'DAOTAO',
            title: 'Tương tác Kiến trúc 3 Lược đồ ANSI/SPARC',
            caption: 'Thử bấm 2 nút thay đổi ở khung bên phải để kiểm chứng vai trò của 2 tầng Ánh xạ.',
          },
        },
        {
          id: 'step-1-3-4',
          phaseLabel: 'Thực hành',
          title: 'Kiểm tra phân biệt Schema vs. Instance & 3 Mức lược đồ',
          narrative: 'Trả lời câu hỏi dưới đây để hoàn thành Bài 1.3.',
          workbench: {
            kind: 'three-schema',
            datasetId: 'DAOTAO',
            title: 'Kiến trúc 3 Lược đồ ANSI/SPARC',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Phát biểu nào sau đây **SAI** khi nói về Lược đồ CSDL (*Schema*) và Thể hiện CSDL (*Instance / State*) theo `C1.pdf`?',
            options: [
              {
                id: 'a',
                label: 'Lược đồ CSDL còn được gọi là *Intension*, còn trạng thái dữ liệu tại một thời điểm còn được gọi là *Extension*.',
                explanation: 'Phát biểu này ĐÚNG theo trang 31–32 của C1.pdf.',
              },
              {
                id: 'b',
                label: 'Mỗi khi thêm một sinh viên mới bằng lệnh `INSERT`, Lược đồ CSDL sẽ tự động thay đổi theo.',
                explanation: 'Chính xác đây là câu SAI! Khi INSERT/DELETE/MODIFY, chỉ có Trạng thái / Thể hiện (State / Instance) thay đổi, còn Lược đồ (Schema) giữ nguyên.',
              },
              {
                id: 'c',
                label: 'Trong kiến trúc 3 lược đồ, dữ liệu thực chất chỉ được lưu trữ vật lý ở dưới mức trong/vật lý.',
                explanation: 'Phát biểu này ĐÚNG: mức quan niệm và mức ngoài chỉ là các mô tả/khung nhìn logic, được ánh xạ xuống mức vật lý.',
              },
            ],
            correctOptionId: 'b',
          },
        },
      ],
    },

    /* ========================================================================
     * BÀI 1.4
     * ====================================================================== */
    {
      id: 'lesson-1-4',
      moduleId: 'module-1',
      orderLabel: '1.4',
      title: 'Tính Độc lập Dữ liệu, Ngôn ngữ CSDL & Kiến trúc Hệ QTCSDL',
      subtitle:
        'Phân biệt Độc lập dữ liệu Logic với Độc lập dữ liệu Vật lý và hệ thống hóa các ngôn ngữ DDL, SDL, VDL, DML.',
      slideRange: 'C1.pdf · tr. 38–52',
      estimatedMinutes: 12,
      steps: [
        {
          id: 'step-1-4-1',
          phaseLabel: 'Khám phá',
          title: 'Thí nghiệm trực tiếp: Độc lập Vật lý vs. Độc lập Logic',
          narrative: [
            'Mục tiêu lớn nhất của kiến trúc 3 lược đồ ANSI/SPARC là đạt được **Tính độc lập dữ liệu (Data Independence)** — khả năng thay đổi lược đồ ở một mức thấp hơn mà **không phải sửa lược đồ (và chương trình ứng dụng) ở mức cao hơn ngay trên nó**.',
            '- **Độc lập dữ liệu vật lý (*Physical Data Independence*)**: Khả năng thay đổi *Lược đồ trong* (ví dụ tạo thêm chỉ mục `B+Tree`, đổi cách sắp xếp tệp trên đĩa) mà không phải sửa *Lược đồ quan niệm* hay *Lược đồ ngoài*.',
            '- **Độc lập dữ liệu logic (*Logical Data Independence*)**: Khả năng thay đổi *Lược đồ quan niệm* (ví dụ thêm bảng mới, thêm cột `Email` hoặc tách bảng) mà không phải sửa *Lược đồ ngoài* của các ứng dụng hiện hành (chỉ cần cập nhật ánh xạ Ngoài–Quan niệm).',
          ].join('\n\n'),
          callouts: [
            {
              kind: 'pitfall',
              title: 'Loại độc lập nào khó đạt được hơn?',
              slideSource: 'C1.pdf · tr. 38–39',
              body: '**Độc lập dữ liệu logic khó đạt được hơn nhiều** so với độc lập dữ liệu vật lý, bởi các chương trình ứng dụng phụ thuộc chặt vào cấu trúc logic của dữ liệu mà chúng truy cập.',
            },
          ],
          workbench: {
            kind: 'three-schema',
            datasetId: 'DAOTAO',
            title: 'Thực hành kích hoạt Độc lập Dữ liệu Vật lý & Logic',
          },
          challenge: {
            type: 'anomaly-sim',
            mode: 'three-schema',
            datasetId: 'DAOTAO',
            prompt:
              'Ở khung bên phải, hãy nhấn thử **ít nhất một nút thay đổi** (*Thêm B+Tree Index* ở Mức trong hoặc *Thêm cột Email* ở Mức quan niệm) để kiểm chứng cách tầng Ánh xạ bảo vệ Mức ngoài.',
            goalDescription:
              'Nhấn nút "Thử Độc lập Vật lý: Thêm B+Tree Index" hoặc "Thử Độc lập Logic: Thêm cột Email" trên bàn thực hành.',
          },
        },
        {
          id: 'step-1-4-2',
          phaseLabel: 'Lý thuyết UET',
          title: 'Các ngôn ngữ của Hệ QTCSDL: DDL, SDL, VDL và DML',
          narrative: [
            'Tương ứng với 3 mức lược đồ và nhu cầu thao tác dữ liệu, `C1.pdf` (tr. 40–43) phân loại rõ các ngôn ngữ giao tiếp với DBMS:',
            '| Nhóm ngôn ngữ | Tên đầy đủ | Chức năng chính |',
            '| --- | --- | --- |',
            '| **DDL** | *Data Definition Language* | Định nghĩa **Lược đồ quan niệm** (và trong SQL hiện đại gộp cả định nghĩa bảng, ràng buộc, khung nhìn). |',
            '| **SDL** | *Storage Definition Language* | Đặc tả **Lược đồ trong** (cấu trúc lưu trữ vật lý). Trong các RDBMS hiện nay thường thay bằng các tham số cấu hình lưu trữ của DBA. |',
            '| **VDL** | *View Definition Language* | Đặc tả các **Lược đồ ngoài** (khung nhìn người dùng; trong SQL dùng `CREATE VIEW`). |',
            '| **DML** | *Data Manipulation Language* | Truy xuất, thêm, xóa, sửa dữ liệu trong CSDL. |',
            '',
            'Riêng **DML** có hai phong cách đối lập cần nhớ kỹ:',
            '- **DML mức cao / phi thủ tục (*High-level / Non-procedural / Declarative DML*)**: Người dùng chỉ khai báo **cần lấy dữ liệu gì** (*What*), không cần chỉ rõ cách duyệt từng bản ghi (*How*) — ví dụ SQL hoặc Phép tính quan hệ. Còn gọi là *Set-at-a-time DML* (xử lý cả tập hợp bộ một lúc).',
            '- **DML mức thấp / thủ tục (*Low-level / Procedural DML*)**: Thường nhúng trong ngôn ngữ chủ (C, Java) và phải dùng vòng lặp duyệt từng bản ghi (*Record-at-a-time*) để chỉ rõ lấy như thế nào.',
          ].join('\n'),
          workbench: {
            kind: 'three-schema',
            datasetId: 'DAOTAO',
            title: 'Liên hệ DDL / VDL / SDL với 3 mức kiến trúc ANSI/SPARC',
          },
        },
        {
          id: 'step-1-4-3',
          phaseLabel: 'Lý thuyết UET',
          title: 'Kiến trúc Tập trung vs. Khách–Chủ (Client/Server) của Hệ CSDL',
          narrative: [
            'Ở cuối chương 1 (`C1.pdf` tr. 46–51), hệ thống CSDL được triển khai theo sự tiến hóa kiến trúc phần cứng/mạng:',
            '1. **Kiến trúc Tập trung (*Centralized DBMS*)**: Toàn bộ phần mềm ứng dụng, giao diện đầu cuối và DBMS chạy trên một máy chủ lớn trung tâm; các thiết bị đầu cuối (*Dumb Terminals*) chỉ hiển thị màn hình.',
            '2. **Kiến trúc Khách–Chủ 2 tầng (*Two-Tier Client/Server*)**: Máy khách (*Client*) đảm nhận giao diện người dùng và logic ứng dụng, gửi truy vấn SQL qua mạng (ODBC/JDBC) trực tiếp tới **Database Server**.',
            '3. **Kiến trúc Khách–Chủ 3 tầng / $n$-tầng (*Three-Tier Architecture*)**: Phổ biến trên Web hiện đại — chèn thêm tầng **Application Server / Web Server** ở giữa *Client (Trình duyệt)* và *Database Server*, giúp tăng cường bảo mật (Client không chạm trực tiếp vào DB) và khả năng mở rộng quy mô.',
          ].join('\n\n'),
          workbench: {
            kind: 'dataset-preview',
            datasetId: 'CONGTY_PHG',
            title: 'Tổng kết Chặng 1 trên CSDL Công ty',
          },
        },
        {
          id: 'step-1-4-4',
          phaseLabel: 'Thực hành',
          title: 'Chốt kiến thức Chặng 1 (C1.pdf)',
          narrative: 'Hoàn thành câu hỏi tổng kết Chặng 1 trước khi bước sang Thiết kế Sơ đồ ER (`C2_1.pdf`).',
          workbench: {
            kind: 'three-schema',
            datasetId: 'DAOTAO',
            title: 'Ôn tập Độc lập dữ liệu & DML',
          },
          challenge: {
            type: 'quiz',
            prompt:
              'Khi DBA tạo thêm một chỉ mục `B+Tree` trên cột `LUONG` của bảng `NHANVIEN` để tăng tốc tìm kiếm mà **không cần chỉnh sửa Lược đồ Quan niệm hay mã nguồn ứng dụng**, tính chất nào của Hệ CSDL vừa phát huy tác dụng?',
            options: [
              {
                id: 'a',
                label: 'Tính độc lập dữ liệu vật lý (*Physical Data Independence*)',
                explanation: 'Chính xác! Chỉ mục B+Tree nằm ở Lược đồ trong (mức vật lý). Thay đổi mức trong mà không ảnh hưởng mức quan niệm chính là Độc lập dữ liệu vật lý.',
              },
              {
                id: 'b',
                label: 'Tính độc lập dữ liệu logic (*Logical Data Independence*)',
                explanation: 'Độc lập dữ liệu logic là thay đổi Lược đồ quan niệm (như thêm/tách bảng hoặc thêm cột) mà không ảnh hưởng các khung nhìn ở Mức ngoài.',
              },
              {
                id: 'c',
                label: 'Ngôn ngữ định nghĩa khung nhìn VDL (*View Definition Language*)',
                explanation: 'VDL dùng để định nghĩa khung nhìn ở mức ngoài, không phải tính chất độc lập vật lý khi tạo chỉ mục.',
              },
            ],
            correctOptionId: 'a',
          },
        },
      ],
    },
  ],
};
