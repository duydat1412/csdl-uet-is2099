# UET Database Interactive Learning Web App (MVP) — Implementation Plan

> **For agentic workers:** Execute task-by-task in order with strict TypeScript, unit/component/curriculum integrity tests, production build check, and live browser visual inspection.

**Goal:** Hoàn thiện ứng dụng web học tập tương tác môn Cơ sở dữ liệu (UET.IS2099) từ đầu tới hết Đại số quan hệ (`C1.pdf` → `C3_2.pdf`) với hiển thị tiếng Việt sắc nét (`Be Vietnam Pro` + `JetBrains Mono`) và công thức LaTeX chuẩn PDF (`KaTeX`).

**Architecture:** Clean Architecture 3 lớp trên client-side (`src/domain/` thuần TypeScript không phụ thuộc React; `src/curriculum/` chứa kho dữ liệu chuẩn UET + 22 bài học; `src/components/` & `src/store/` cung cấp giao diện Split-Pane tối giản + lưu tiến độ `localStorage`).

**Tech Stack:** Vite 6, React 19, TypeScript 5 (strict), Tailwind CSS v4, KaTeX, Lucide React, Vitest, React Testing Library.

## Checklist Triển khai
- [ ] **Step 1:** Khởi tạo Git, scaffold Vite + React + TS + Tailwind v4 + KaTeX + Vitest, cấu hình Google Fonts & CSS Design System (`Light`/`Dark`/`System`).
- [ ] **Step 2:** Xây dựng `MathFormula.tsx` (hỗ trợ đầy đủ macro `\lojoin`, `\rojoin`, `\fojoin`, `\GF`, tiếng Việt trong `\text{...}`) & `RichText.tsx` kèm unit test.
- [ ] **Step 3:** Định nghĩa Domain Types (`src/domain/types.ts`) & Bộ dữ liệu chuẩn UET (`CONGTY`, `DAOTAO`, `KYNANG_DB`, `BANHANG_DB`, các bảng mẫu `R`, `S`, `T1`, `T2`) kèm test toàn vẹn dữ liệu.
- [ ] **Step 4:** Xây dựng & Unit-Test Bộ 3 Deterministic Engines (`anomalyEngine`, `erMappingEngine`, `algebra/` Tokenizer + Parser + LaTeX Formatter + Set Evaluator với AST trung gian & phân rã 4 bước Phép chia).
- [ ] **Step 5:** Xây dựng `progressStore` & Khung giao diện Split-Pane tối giản (`TopStudyBar` 48px, `SplitStudyWorkspace`, `MicroStepStream`, `ConceptCallout`, `InlineQuizCheck`, `ReferenceDrawer`).
- [ ] **Step 6:** Xây dựng Bộ 3 Workbenches (`RelationTableView`, `AnomalyWorkbench`, `ERDiagramCanvas`, `SchemaMapperWorkbench`, `AlgebraPlayground` với Live KaTeX Preview + AST Tree Inspector).
- [ ] **Step 7:** Biên soạn chi tiết 22 bài học trên 5 Chặng (`module1-intro.ts` → `module5-algebra.ts`) & chạy `curriculumIntegrity.test.ts` kiểm chứng 100% bài tập & công thức LaTeX.
- [ ] **Step 8:** Chạy `npm run typecheck`, `npm test -- --run`, `npm run build` và kiểm tra trực quan bằng trình duyệt thật ở cả Desktop/Mobile, Light/Dark mode.
