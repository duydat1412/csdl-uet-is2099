# Thiết kế Sư phạm & Kiến trúc Hệ thống — Web Học Tập Tương Tác Cơ Sở Dữ Liệu (UET.IS2099 MVP)

## 1. Mục tiêu & Phạm vi MVP
Xây dựng ứng dụng web học tập tương tác trực tiếp trên trình duyệt cho môn **Nhập môn Hệ Cơ sở dữ liệu (UET.IS2099)**, bao phủ trọn vẹn từ đầu tới hết **Đại số quan hệ** theo 5 tập slide đã cung cấp (`C1.pdf`, `C2_1.pdf`, `C2_2.pdf`, `C3_1.pdf`, `C3_2.pdf`; riêng `C4_1.pdf` thuộc giai đoạn 2).

- **Tập trung 100% vào hiệu quả học tập**: Bỏ qua Menu điều hướng tổng, bỏ qua Dashboard thống kê; người học mở web là vào ngay không gian học **Split-Pane Study View** (`45%` Luồng bài giảng tương tác từng bước bên trái — `55%` Bàn thí nghiệm trực quan bên phải).
- **Chữ tiếng Việt & Ký hiệu Toán học chuẩn PDF**: Sử dụng cặp font `Be Vietnam Pro` + `JetBrains Mono` kết hợp thư viện **KaTeX** để hiển thị sắc nét toàn bộ ký hiệu chuẩn giáo trình UET ($\sigma, \pi, \rho, \cup, \cap, -, \times, \bowtie, *, \div, \mathcal{F}$, các phép nối ngoài $\lojoin, \rojoin, \fojoin$, ký hiệu tập hợp $\subseteq, \in, \forall, \exists$).

## 2. Triết lý Giảng dạy "5P Micro-Active Learning"
Kết hợp tinh hoa sư phạm từ **Stanford CS145 (Jennifer Widom)**, **CMU 15-445 (Andy Pavlo)**, **Brilliant.org**, **RelaX (UIBK)** và **SQLBolt**:
1. **Problem (Vấn đề thực tế)**: Không ném định nghĩa trước; để người học tự chạm vào nỗi đau dữ liệu trùng lặp/bất nhất.
2. **Play (Thao tác thử)**: Thử sửa/xóa dòng dữ liệu, gạt cặp `(min, max)`, ghép bảng hoặc thử truy vấn.
3. **Principle (Chốt lý thuyết & Ký hiệu UET)**: Rút ra công thức chuẩn xác bằng LaTeX đối chiếu trực tiếp với trang slide gốc.
4. **Pitfall (Gỡ bẫy sinh viên hay nhầm)**: Nhấn mạnh 5 điểm mù kinh điển (ngược chiều `(min, max)` vs `1:N`, đặt sai phía FK, khử trùng của `π`, mất dòng `null` ở `*`, bản chất 4 bước của `÷`).
5. **Practice (Thực hành tự chấm điểm)**: Thực hành trên 3 Deterministic Engines thuần client-side không cần API key.

## 3. Bộ 3 Deterministic Engines
1. **Engine 1 (`anomalyEngine`)**: Mô phỏng dị thường bảng phẳng (`NHANVIEN_PHONG`, `DAOTAO_FLAT`), thực thi câu lệnh cập nhật `INSERT`/`DELETE`/`MODIFY` kiểm tra vi phạm Miền, Khóa chính (`PK`), Khóa ngoại (`FK`) với chính sách `REJECT`, `CASCADE`, `SET_NULL`.
2. **Engine 2 (`erMappingEngine`)**: Vẽ sơ đồ ER/EER chuẩn ký hiệu Chen/Elmasri bằng SVG, đối chiếu `(min, max)` với `1:1`/`1:N`/`N:M`, kiểm chứng ràng buộc chuyên biệt hóa `d`/`o` và `Total`/`Partial`, chấm điểm ánh xạ ER → Quan hệ.
3. **Engine 3 (`algebra/`)**: Tokenizer + Recursive-Descent Parser + LaTeX Formatter + Set-Semantics Evaluator hỗ trợ gán nhiều dòng `←`, cây thực thi AST xem được bảng trung gian từng nút, và phân rã 4 bước ($T_1, S \times T_1, T_2, T_1 - T_2$) cho Phép chia `÷`.

## 4. Lộ trình 5 Chặng · 22 Bài học
- **Chặng 1 (`C1.pdf`)**: 4 bài học — Tổng quan Hệ CSDL, 6 đặc tính, Kiến trúc 3 mức ANSI/SPARC, Độc lập dữ liệu & Ngôn ngữ CSDL.
- **Chặng 2 (`C2_1.pdf`)**: 5 bài học — Thực thể, 6 loại thuộc tính, Liên kết & Đệ quy, Ràng buộc `(min, max)` vs `1:N`, Thực thể yếu & 6 bước thiết kế ER.
- **Chặng 3 (`C2_2.pdf`)**: 3 bài học — Lớp cha/con `ISA`, Ràng buộc `d`/`o` & `Total`/`Partial`, Phân cấp/Lưới/`Union`.
- **Chặng 4 (`C3_1.pdf`)**: 4 bài học — Quan hệ & Miền nguyên tố, Siêu khóa/Khóa/`PK`/`FK`, Quy tắc ánh xạ ER/EER sang Quan hệ.
- **Chặng 5 (`C3_2.pdf`)**: 6 bài học — Cập nhật `INSERT`/`DELETE`/`MODIFY`, Phép toán tập hợp, Chọn/Chiếu/Gán/Đổi tên, Tích Đề-các & các phép Nối/Nối ngoài, Phép chia `÷`, Hàm kết hợp/Gom nhóm `ℱ` & Luyện đề tổng hợp *CÔNGTY* / *BÁN HÀNG*.
