export const APP_VERSION = 'Beta v1.1';
export const APP_CODENAME = 'iOS Liquid Glass · Multi-Course Hub';
export const APP_RELEASE_DATE = '2026-11-18';
export const APP_REPOSITORY_URL = 'https://github.com/duydat1412/csdl-uet-is2099';

export interface ChangelogEntry {
  version: string;
  date: string;
  tag: 'beta' | 'major' | 'init';
  headline: string;
  highlights: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: 'Beta v1.1',
    date: '2026-11-18',
    tag: 'beta',
    headline: 'Tinh gọn Trang chủ Home & Mở Điều hướng Phân khu Khi Tham gia Học',
    highlights: [
      'Loại bỏ hoàn toàn thanh điều hướng phân khu ở đầu trang Home để giữ bố cục biên tập thoáng đãng, tập trung vào lời mời Tham gia học và Kệ môn học.',
      'Chuyển các lối tắt đi thẳng tới Dashboard, Phòng Lab, Luyện đề (Beta) và Change Logs thành dải Shortcut chìm tinh tế ở cuối trang Home.',
      'Thanh điều hướng Không gian Học tập (Dashboard, Học tập, Phòng Lab, Luyện đề) xuất hiện rõ ràng trên một hàng gọn gàng ngay khi người học nhấn Tham gia học.',
    ],
  },
  {
    version: 'Beta v1.0',
    date: '2026-11-18',
    tag: 'beta',
    headline:
      'Kiến trúc Đa Môn Học, Hệ giao diện iOS Translucent Glass & Trọn bộ Ôn thi Cuối kỳ IS2099',
    highlights: [
      'Nâng cấp toàn diện thành nền tảng STUDYHUB đa môn (Platform Core + Course Manifests) kèm bộ khung mẫu _course-template để nhân bản thêm môn học mới chỉ trong một thư mục.',
      'Áp dụng ngôn ngữ iOS Translucent / Liquid Glass hai tầng (Konsta UI v5 + @nkzw/liquid-glass + kính mờ đọc công thức KaTeX sắc nét) cùng chuyển cảnh lò xo và thành phần tương tác động (motion) lấy cảm hứng từ antigravity.google.',
      'Phân tách rõ 5 không gian: Home (Hero động, Triết lý giảng dạy, Kệ môn học, Shortcuts, Change Logs, Credits, License), Dashboard (Study Streak, Lịch nhiệt 56 ngày, Độ vững kỹ năng), Học tập, Phòng Lab tự do và Phòng Luyện đề Cuối kỳ (Exam Arena · Beta).',
      'Đào sâu toàn bộ lộ trình CSDL UET.IS2099: bổ sung Khung Bài giải mẫu tự luận từng bước ở mỗi bài trọng tâm, thêm trọn vẹn C4_1.pdf (Phụ thuộc hàm, Bao đóng X+, Tìm khóa, Phân rã 1NF→BCNF) và chuyên đề SQL thực chiến (JOIN, HAVING, NOT EXISTS).',
    ],
  },
  {
    version: 'v0.1.0-alpha',
    date: '2026-11-17',
    tag: 'init',
    headline: 'Phiên bản Khởi tạo Không gian Học tập Tương tác CSDL (C1 → C3_2)',
    highlights: [
      'Hoàn thiện 3 bộ máy thực hành client-side: Mô phỏng Dị thường bảng phẳng & Ràng buộc toàn vẹn, Sơ đồ vector SVG ER/EER và Sân chơi Đại số Quan hệ kèm giải phẫu Phép chia 4 bước.',
      'Thiết lập hệ font tiếng Việt Be Vietnam Pro + JetBrains Mono cùng công thức KaTeX tùy chỉnh ký hiệu nối ngoài và gom nhóm chuẩn bài giảng UET.',
    ],
  },
];
