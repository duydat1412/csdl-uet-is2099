import { CourseManifest } from '../../platform/types';

/**
 * SAMPLE COURSE TEMPLATE — Bản mẫu để thêm môn học mới vào STUDYHUB chỉ trong 1 thư mục!
 *
 * Cách thêm môn học mới:
 * 1. Nhân bản thư mục `src/courses/_course-template/` thành `src/courses/<ma-mon>/`
 * 2. Điền thông tin môn học, các chương bài `modules` (dùng RichText + KaTeX + WorkedExampleSpec),
 *    các công cụ `labs` (nếu có) và ngân hàng đề `exams`
 * 3. Đăng ký manifest vừa tạo vào mảng `ALL_COURSES` trong `src/courses/registry.ts`
 *    → Home, Dashboard, Study Streak, Ctrl+K, Phòng Học và Phòng Luyện Đề tự động hỗ trợ ngay!
 */
export const COURSE_TEMPLATE_MANIFEST: CourseManifest = {
  id: 'course-template',
  code: 'TEMPLATE-101',
  title: 'Mẫu Kiến trúc Học phần Mới (Starter Template)',
  shortTitle: 'Khung mẫu mở rộng',
  faculty: 'STUDYHUB Platform SDK',
  semesterTag: 'Plug-and-Play Blueprint',
  accentHex: '#6366F1',
  status: 'template-sample',
  summary:
    'Tệp cấu hình mẫu chuẩn hóa để nhân bản nhanh môn học tiếp theo (hỗ trợ đầy đủ bài giảng LaTeX, bài giải mẫu tự luận, Study Streak, Dashboard và Luyện đề cuối kỳ).',
  modules: [
    {
      id: 'tpl-mod-1',
      order: 1,
      title: 'Chương Mẫu: Cấu trúc Một Bài Giảng Chuẩn STUDYHUB',
      sourceFile: 'src/courses/_course-template/index.ts',
      description:
        'Minh họa cách khai báo công thức KaTeX, hộp Khái niệm/Bẫy và Bài giải mẫu Tự luận cho môn học bất kỳ.',
      lessons: [
        {
          id: 'tpl-lesson-1',
          moduleId: 'tpl-mod-1',
          orderLabel: '1.1',
          title: 'Giới thiệu Cấu trúc CourseManifest & KaTeX Đa môn',
          subtitle:
            'Ví dụ minh họa trực tiếp cách STUDYHUB render bất kỳ ký hiệu toán học nào khi bạn thêm môn mới.',
          slideRange: 'Blueprint · Mục 1',
          estimatedMinutes: 3,
          steps: [
            {
              id: 'tpl-step-1',
              phaseLabel: 'Lý thuyết UET',
              title: 'Mọi môn học đều kế thừa chung Engine LaTeX, Streak & Đề thi',
              narrative: [
                'Khi tạo một môn mới dựa trên `CourseManifest`, bạn chỉ cần tập trung vào nội dung chuyên môn. Hệ thống khung nền (`src/platform/`) tự động lo:',
                '- **Hiển thị toán học KaTeX sắc nét**: Từ tích phân $\\int_a^b f(x)\\,dx$, ma trận xác suất đến độ phức tạp $O(n \\log n)$ hay đại số quan hệ.',
                '- **Theo dõi Study Streak & Dashboard**: Mỗi bước hoàn thành ở môn mới đều tự cộng dồn vào chuỗi ngày học liên tiếp toàn cục.',
                '- **Phòng Luyện đề LaTeX độc lập**: Hỗ trợ cả câu hỏi trắc nghiệm chấm tự động lẫn đề tự luận nhiều ý có biểu điểm.',
              ].join('\n\n'),
              workedExamples: [
                {
                  id: 'tpl-ex-1',
                  title: 'Ví dụ minh họa Khung Bài giải mẫu cho môn Giải tích / Xác suất',
                  problemStatement:
                    'Tính kỳ vọng toán học của biến ngẫu nhiên rời rạc hoặc kiểm chứng công thức Bayes.',
                  steps: [
                    {
                      label: 'Khai báo công thức gốc bằng LaTeX',
                      markdownLatex:
                        '$$P(A \\mid B) = \\frac{P(B \\mid A)\\,P(A)}{P(B)}$$',
                    },
                  ],
                  conclusion: 'Hoạt động tức thì trên nền kính mờ iOS Translucent Glass!',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  labs: [],
  exams: [
    {
      id: 'tpl-exam-demo',
      code: 'SAMPLE-01',
      title: 'Đề mẫu Minh họa Cấu trúc Exam Arena Đa môn',
      durationMinutes: 45,
      semesterLabel: 'Starter Blueprint',
      description: 'Minh họa định dạng một đề thi thử kết hợp Trắc nghiệm & Tự luận LaTeX.',
      mcqQuestions: [
        {
          id: 'tpl-q1',
          topicTag: 'Kiến trúc Hub',
          points: 1,
          prompt:
            'Thư mục nào đóng vai trò khuôn mẫu để thêm nhanh một môn học mới vào STUDYHUB?',
          options: [
            {
              id: 'a',
              label: '`src/courses/_course-template/index.ts` khai báo `CourseManifest` rồi đăng ký vào `src/courses/registry.ts`.',
              explanation: 'Chính xác! Tách biệt `src/platform/` giúp mọi môn mới chạy ngay.',
            },
            {
              id: 'b',
              label: 'Phải viết lại toàn bộ Thanh điều hướng và Dashboard cho từng môn.',
              explanation: 'Sai: Dashboard, Study Streak, Home và Exam Arena là phần lõi dùng chung.',
            },
          ],
          correctOptionId: 'a',
        },
      ],
      writtenProblems: [
        {
          id: 'tpl-w1',
          title: 'Bài tập Mẫu Tự luận Đa môn',
          topicTag: 'Blueprint',
          totalPoints: 2,
          contextMarkdownLatex:
            'Đây là khung chứa đề bài tự luận chuẩn LaTeX, cho phép nhúng công thức khối $f(x) = \\sum_{i=1}^n x_i$.',
          subparts: [
            {
              id: 'tpl-w1-a',
              label: 'Ý a)',
              points: 2,
              prompt: 'Kiểm tra hiển thị đáp án tự luận mẫu.',
              solutionMarkdownLatex:
                'Lời giải mẫu trình bày từng dòng với phương trình: $$E[X] = \\sum_{x} x \\cdot p(x)$$',
              gradingNotes: 'Ví dụ ghi chú thang điểm cho người tự chấm.',
            },
          ],
        },
      ],
    },
  ],
  formulaSections: [
    {
      id: 'tpl-f1',
      title: 'Mẫu Bảng Công thức Dùng chung',
      markdownLatex: 'Mỗi môn định nghĩa danh sách `formulaSections` riêng để nạp vào Sổ tay Ký hiệu & `Ctrl+K`.',
    },
  ],
};

export const MAT1052_PREVIEW_COURSE: CourseManifest = {
  id: 'mat1052-preview',
  code: 'MAT1052',
  title: 'Xác suất Thống kê (Lộ trình Tiếp theo)',
  shortTitle: 'Xác suất Thống kê',
  faculty: 'ĐH Công nghệ — ĐHQGHN',
  semesterTag: 'Planned Expansion',
  accentHex: '#0EA5E9',
  status: 'coming-soon',
  summary:
    'Mẫu môn học dự kiến tiếp theo: Biến ngẫu nhiên, Phân phối Chuẩn/Poisson, Ước lượng khoảng tin cậy và Kiểm định giả thuyết thống kê.',
  modules: [],
  labs: [],
  exams: [],
  formulaSections: [
    {
      id: 'mat-f1',
      title: 'Kỳ vọng, Phương sai & Phân phối Chuẩn',
      markdownLatex:
        '$$E(X) = \\int_{-\\infty}^{+\\infty} x f(x)\\,dx \\quad;\\quad \\operatorname{Var}(X) = E(X^2) - [E(X)]^2$$',
    },
  ],
};

export const INT2210_PREVIEW_COURSE: CourseManifest = {
  id: 'int2210-preview',
  code: 'INT2210',
  title: 'Cấu trúc Dữ liệu & Giải thuật (Lộ trình Tiếp theo)',
  shortTitle: 'CTDL & Giải thuật',
  faculty: 'Khoa CNTT — UET',
  semesterTag: 'Planned Expansion',
  accentHex: '#10B981',
  status: 'coming-soon',
  summary:
    'Mẫu môn học dự kiến: Đánh giá độ phức tạp Big-O, Cây tìm kiếm nhị phân & AVL, B-Tree (liên thông với chỉ mục CSDL), Đồ thị & Quy hoạch động.',
  modules: [],
  labs: [],
  exams: [],
  formulaSections: [
    {
      id: 'int-f1',
      title: 'Định lý Thợ (Master Theorem)',
      markdownLatex: '$$T(n) = a\\,T\\!\\left(\\frac{n}{b}\\right) + f(n)$$',
    },
  ],
};
