# STUDYHUB Beta v1.0 — Multi-Course iOS Liquid Glass Learning Platform Design Spec

**Date:** 2026-11-18
**Version:** `Beta v1.0`
**Flagship Course:** `UET · IS2099 — Nhập môn Hệ Cơ sở dữ liệu` (Full Final-Exam Scope: `C1` → `C4_1` + `SQL`)

---

## 1. Product Vision & Multi-Course Positioning

**STUDYHUB** is a modular, multi-course university learning platform built with **Apple iOS Translucent / Liquid Glass** materials (`konsta` v5 + `@nkzw/liquid-glass` v1.3) and **`antigravity.google`-inspired kinetic motion** (`motion` v12), paired with crisp Vietnamese academic typography (**Be Vietnam Pro**, **JetBrains Mono**, **KaTeX**).

Key architectural rule: **Platform Core (`src/platform/`) is 100% course-agnostic.** Every course plugs in through a strongly typed `CourseManifest` (`src/courses/registry.ts`), accompanied by a ready-to-clone starter template (`src/courses/_course-template/`) so adding future courses (e.g. `MAT1052 · Xác suất Thống kê`, `INT2210 · Cấu trúc dữ liệu & Giải thuật`) requires zero changes to the shell, navigation, streak tracker, or exam engine.

---

## 2. Visual System, Motion & Versioning

1. **iOS Translucent / Liquid Glass Two-Tier Material System**:
   - **Tier 1 — Refractive / Highlighted Glass (`konsta/react` `<Glass>` + `@nkzw/liquid-glass`)**: Used on the floating navigation dock, `Beta v1.0` hero pill, interactive Bento showcase widgets, Streak cards, and `Ctrl+K` Command Palette over a slow-drifting pearl/indigo ambient mesh (zero neon glow borders).
   - **Tier 2 — High-Clarity Frosted Reading Glass**: `backdrop-filter: blur(24px) saturate(180%)` with `1px` specular hairline borders and WCAG AA+ contrast for long-form KaTeX math reading, data tables, and exam papers.
2. **Scene Transitions & Kinetic Components (`motion`)**:
   - Spring-driven route/tab transitions (`AnimatePresence` + `layoutId` sliding glass pill indicator).
   - Kinetic orbital/graph scene loader and live interactive widgets on `Home` (self-animating ER node graph, live LaTeX Algebra $\leftrightarrow$ SQL morpher, live `BCNF` schema splitter).
   - Full `prefers-reduced-motion` support.
3. **Explicit Versioning & Changelog System (`src/platform/changelog.ts`)**:
   - `APP_VERSION = 'Beta v1.0'` displayed prominently in a Liquid Glass pill at the top of the `Home` hero.
   - Structured `CHANGELOG_HISTORY` (`v0.1 Prototype` → `Beta v1.0`) accessible via a **Change Logs** shortcut in the `Home` footer and `Ctrl+K` palette, designed to increment cleanly on subsequent commits/updates.

---

## 3. Five-Surface Information Architecture

| Surface | Route Key | Core Responsibility |
| :--- | :--- | :--- |
| **1. `Home`** | `home` | Top `Beta v1.0` badge, kinetic `antigravity.google`-style Hero with live interactive widgets, 5-layer pedagogical explainer, **Multi-Course Catalog** (`IS2099` active + starter templates), and Footer with **Shortcuts**, **Change Logs** modal trigger, **Credits**, and **MIT License**. |
| **2. `Dashboard`** | `dashboard` | Global **Study Streak** counter, 56-day **Activity Heatmap**, daily study goal ring, *"Continue Learning"* shortcut, per-course chapter mastery breakdown, and Exam Arena score history. |
| **3. `Học tập`** | `learn` | Course selector + deeply authored progressive lessons (Intuition → Formal UET Definition & Symbol Guide → Step-by-Step Worked Written Walkthrough → Common Exam Traps → Live Interactive Workbench). |
| **4. `Phòng Lab`** | `labs` | Course-registered standalone interactive sandboxes (`IS2099`: Relational Algebra Playground, FD Closure $X^+$ & `1NF→BCNF` Normalizer, ER/EER Schema Mapper, SQL Runner). |
| **5. `Luyện đề (Beta)`** | `exams` | Standalone course-agnostic **Final Exam Arena**: timed university-grade LaTeX exam papers combining auto-graded Multiple Choice + Written Free-Response problems with step-by-step LaTeX grading rubrics. |

---

## 4. Deep Pedagogical Upgrade & Full Final-Exam Scope for `IS2099`

1. **Deep Re-authoring Strategy (`WorkedExampleSpec` + Expanded Explanations)**:
   - Every lesson is enriched with `workedExamples` (problem statement, step-by-step hand-solved LaTeX derivation, final boxed answer, and exam grading notes) plus thorough Vietnamese conceptual explanations so students understand *why* each theorem/operator works before attempting challenges.
2. **Module 6 — Phụ thuộc hàm & Chuẩn hóa Lược đồ (`C4_1.pdf`, 96 pages)**:
   - `6.1`: Dư thừa dữ liệu, Phụ thuộc hàm $X \to Y$ & Hệ tiên đề Armstrong (Phản xạ, Gia tăng, Bắc cầu + Luật Hợp, Tách, Bắc cầu giả).
   - `6.2`: Thuật toán tính **Bao đóng $X^+$**, kiểm tra tương đương hai tập PTH & tìm **Phủ tối tiểu** (*Minimal Cover*).
   - `6.3`: Thuật toán tìm **Tất cả Khóa dự tuyển** (phân hoạch thuộc tính Nguồn $L$, Trung gian $M$, Đích $R$) & Thuộc tính khóa / phi khóa.
   - `6.4`: Phép tách lược đồ **Bảo toàn thông tin (Lossless Join)** & **Bảo toàn phụ thuộc hàm**.
   - `6.5`: Chuẩn hóa từng bước **`1NF → 2NF → 3NF → BCNF`** & thuật toán phân rã về `BCNF` / `3NF`.
   - Powered by deterministic engine `src/domain/fd/fdEngine.ts` + interactive UI `src/components/workbench/NormalizationWorkbench.tsx`.
3. **Module 7 — Ngôn ngữ SQL Thực chiến Ôn thi Cuối kỳ**:
   - `7.1`: `DDL` & Ràng buộc toàn vẹn (`CREATE TABLE`, `PRIMARY KEY`, `FOREIGN KEY ... ON DELETE CASCADE / SET NULL`, `CHECK`).
   - `7.2`: Truy vấn `SELECT ... JOIN` (Inner/Left Join), loại trùng `DISTINCT` vs tập hợp Đại số quan hệ.
   - `7.3`: Gom nhóm `GROUP BY ... HAVING`, thứ tự thực thi câu lệnh SQL & bẫy `COUNT(col)` vs `COUNT(*)`.
   - `7.4`: Truy vấn lồng `IN / NOT IN / EXISTS / NOT EXISTS` & biểu diễn Phép chia $R \div S$ bằng hai tầng `NOT EXISTS`.
   - Powered by deterministic SQL-to-Relational evaluator `src/domain/sql/sqlEngine.ts` + `src/components/workbench/SQLWorkbench.tsx`.
4. **Standalone `Exam Arena (Beta)` Papers for `IS2099`**:
   - **Đề số 01 — Đề thi thử Cuối kỳ Chuẩn Cấu trúc UET (90 phút)**: 10 câu Trắc nghiệm phân loại (C1 → SQL) + 4 câu Tự luận lớn (Thiết kế & Ánh xạ ER, Đại số quan hệ & SQL `NOT EXISTS`, Tìm khóa + Bao đóng $X^+$ + Chuẩn hóa `3NF/BCNF`).
   - **Đề số 02 — Đề Tổng hợp Chuyên sâu Đại số, SQL & Chuẩn hóa (90 phút)**: Tập trung bẫy điểm 8.5–10.
