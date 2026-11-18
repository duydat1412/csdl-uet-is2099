# STUDYHUB Beta v1.0 Multi-Course Glass Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform STUDYHUB into a modular multi-course learning platform (`Beta v1.0`) styled with Apple iOS Translucent / Liquid Glass (`konsta` + `@nkzw/liquid-glass`) and `antigravity.google`-inspired kinetic motion (`motion`), featuring 5 distinct surfaces (`Home`, `Dashboard` with Study Streak, `Learn`, `Labs`, and `Exam Arena`), a reusable course starter template, and deep final-exam coverage for `UET · IS2099` (`C1` → `C4_1` Normalization + `SQL`).

**Architecture:** Separate the codebase into a course-agnostic Platform Core (`src/platform/`) and plug-and-play Course Manifests (`src/courses/`). Platform Core owns global navigation, iOS Liquid Glass + Frosted surfaces, `motion` scene transitions, Study Streak + 56-day activity heatmap persistence, version/changelog tracking (`Beta v1.0`), and the LaTeX Exam Arena engine; each course supplies modules, worked examples, domain lab descriptors, formula sheets, and exam papers.

**Tech Stack:** React 19, TypeScript 5.7 (strict, zero `any`), Tailwind CSS v4, `motion` v12, `konsta` v5 (`theme="ios"`), `@nkzw/liquid-glass` v1.3, `katex`, `lucide-react`, Vite 6, Vitest + React Testing Library.

---

## File Structure Map

### Platform Core (`src/platform/`)
- `src/platform/version.ts` — `APP_VERSION = 'Beta v1.0'`, build metadata, and structured `CHANGELOG_ENTRIES`.
- `src/platform/types.ts` — `HubRouteId`, `CourseManifest`, `LabToolDescriptor`, `ExamPaperSpec`, `ExamMcqQuestion`, `ExamWrittenProblem`, `FormulaSectionSpec`.
- `src/platform/store/hubStore.ts` — Multi-course state, daily Study Streak calculation, 56-day ISO date activity log, exam score history, active route & active course ID.
- `src/platform/store/hubStore.test.ts` — Unit tests for streak continuity, daily increment, multi-course progress isolation, and localStorage recovery.
- `src/platform/ui/GlassPrimitives.tsx` — Wraps `konsta/react` (`KonstaProvider`, `Glass`, `Segmented`, `SegmentedButton`) + `@nkzw/liquid-glass` (`LiquidGlass` safe wrapper with JSDOM guard) + `FrostedReadingGlass` surface for crisp KaTeX rendering.
- `src/platform/ui/SceneTransition.tsx` — `motion` spring scene transition wrapper + `KineticOrbitalLoader` (`antigravity.google`-inspired animated vector node graph).
- `src/platform/ui/FloatingGlassDock.tsx` — iOS translucent top floating dock with `motion` `layoutId` pill indicator, course selector pill, Streak flame counter, `Ctrl+K` trigger, and theme toggle.
- `src/platform/ui/CommandPalette.tsx` — `Ctrl+K` global quick switcher across courses, lessons, labs, exams, formula sheet, and changelog.
- `src/platform/ui/ChangelogModal.tsx` — Glass modal displaying version history (`Beta v1.0`, `v0.1 Prototype`) triggered from Home badge/footer or `Ctrl+K`.
- `src/platform/pages/HomePage.tsx` — Top `Beta v1.0` Liquid Glass pill, kinetic interactive Hero Bento showcase, 5-layer pedagogical explainer, Multi-Course Catalog, and Footer (Keyboard Shortcuts, Change Logs button, Multi-course guide, Credits, MIT License).
- `src/platform/pages/DashboardPage.tsx` — Study Streak hero card, 56-day Activity Heatmap, Daily Goal progress ring, *"Continue Learning"* card, per-course chapter mastery bars, and Exam Arena history.
- `src/platform/pages/LearnPage.tsx` — Course-aware split/focus study workspace integrating deep worked examples and interactive workbenches.
- `src/platform/pages/LabsPage.tsx` — Standalone multi-tool sandbox switching among the active course's registered interactive engines.
- `src/platform/pages/ExamArenaPage.tsx` — Course-agnostic Final Exam simulator (countdown timer, LaTeX MCQ auto-grader, LaTeX Written problems with point rubrics and step-by-step solutions).

### New Domain Engines & Curriculum Extensions (`src/domain/` & `src/courses/`)
- `src/domain/types.ts` — Extend `MicroStepSpec` with `workedExamples?: WorkedExampleSpec[]` and `WorkbenchChallenge` with `FDChallenge` & `SQLChallenge`.
- `src/domain/fd/fdEngine.ts` + `src/domain/fd/fdEngine.test.ts` — Deterministic Functional Dependency engine: attribute closure $X^+$ with step-by-step Armstrong trace, Minimal Cover, Candidate Key finder ($L/M/R$ partitioning), Lossless-Join test, Normal Form checker (`1NF`, `2NF`, `3NF`, `BCNF`), and `BCNF`/`3NF` decomposition.
- `src/domain/sql/sqlEngine.ts` + `src/domain/sql/sqlEngine.test.ts` — Deterministic in-memory SQL engine supporting `SELECT [DISTINCT]`, `FROM` + `JOIN` / `LEFT JOIN`, `WHERE` (including correlated/uncorrelated `IN`, `NOT IN`, `EXISTS`, `NOT EXISTS`), `GROUP BY`, `HAVING`, `ORDER BY`, and `CREATE TABLE` DDL validation against `UET_DATASETS`.
- `src/components/story/WorkedExampleCard.tsx` — Collapsible/stepped hand-solved exam walkthrough card with KaTeX derivation steps and grading rubric tips.
- `src/components/workbench/NormalizationWorkbench.tsx` — Interactive $X^+$ closure calculator, candidate key verifier, and `1NF → BCNF` step-by-step normalizer.
- `src/components/workbench/SQLWorkbench.tsx` — Interactive SQL editor with schema browser, keyword pills, live execution table, and query comparison auto-grader.
- `src/curriculum/module1-intro.ts` .. `src/curriculum/module5-algebra.ts` — Deep pedagogical enrichment (thorough symbol explanations + `workedExamples` for every core exam archetype).
- `src/curriculum/module6-normalization.ts` — 5 deep lessons covering `C4_1.pdf` (96 pages): FDs & Armstrong's Axioms, $X^+$ & Minimal Cover, Candidate Keys, Lossless Join & Dependency Preservation, `1NF → 2NF → 3NF → BCNF`.
- `src/curriculum/module7-sql.ts` — 4 deep lessons covering Final-Exam SQL: `DDL` & Referential Actions, `JOIN` & Bag vs. Set semantics, `GROUP BY ... HAVING`, Nested Queries & Relational Division via double `NOT EXISTS`.
- `src/courses/_course-template/index.ts` — Documented starter `CourseManifest` sample + Coming Soon preview courses (`MAT1052 · Xác suất Thống kê`, `INT2210 · Cấu trúc dữ liệu & Giải thuật`) so future courses plug in seamlessly.
- `src/courses/is2099-database/exams.ts` — Full university-grade LaTeX Final Exam papers (MCQ + Written Free-Response with rubrics).
- `src/courses/is2099-database/index.ts` & `src/courses/registry.ts` — Course manifest registration.

---

### Task 1: Versioning, Changelog & Multi-Course Domain Types

**Files:**
- Create: `src/platform/version.ts`
- Create: `src/platform/types.ts`
- Modify: `src/domain/types.ts`

- [ ] **Step 1: Create `src/platform/version.ts` with `Beta v1.0` and structured changelog**

```ts
export const APP_VERSION = 'Beta v1.0';
export const APP_CODENAME = 'iOS Liquid Glass · Multi-Course Hub';
export const APP_RELEASE_DATE = '2026-11-18';

export interface ChangelogEntry {
  version: string;
  date: string;
  tag: 'major' | 'beta' | 'init';
  headline: string;
  highlights: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: 'Beta v1.0',
    date: '2026-11-18',
    tag: 'beta',
    headline: 'Kiến trúc Đa Môn Học, Giao diện iOS Translucent Glass & Trọn bộ Ôn thi Cuối kỳ IS2099',
    highlights: [
      'Nâng cấp lên nền tảng STUDYHUB đa môn học (Multi-Course Plugin Architecture) kèm bộ mẫu _course-template để mở rộng môn mới tức thì.',
      'Chuyển đổi toàn bộ hệ giao diện sang ngôn ngữ iOS Translucent / Liquid Glass (Konsta UI v5 + @nkzw/liquid-glass) kết hợp chuyển cảnh động chuẩn antigravity.google (motion).',
      'Ra mắt 5 phân khu độc lập: Home (Hero động, Kệ môn học, Shortcuts, Changelog), Dashboard (Study Streak & Lịch nhiệt 56 ngày), Học tập, Phòng Lab tự do, và Phòng Luyện đề Cuối kỳ (Exam Arena · Beta).',
      'Biên soạn chuyên sâu toàn bộ 7 Chặng môn CSDL (IS2099): bổ sung Bài giải mẫu tự luận từng bước, trọn vẹn C4_1.pdf (Phụ thuộc hàm, Bao đóng X+, Chuẩn hóa 1NF→BCNF) và chuyên đề SQL thực chiến.',
    ],
  },
  {
    version: 'v0.1.0-alpha',
    date: '2026-11-17',
    tag: 'init',
    headline: 'Phiên bản Khởi tạo Không gian Học tập CSDL (C1 → C3_2)',
    highlights: [
      'Xây dựng 3 bộ máy tương tác đầu tiên: Mô phỏng Dị thường bảng phẳng, Sơ đồ SVG ER/EER và Sân chơi Đại số Quan hệ kèm giải phẫu Phép chia 4 bước.',
      'Tích hợp bộ phông chữ tiếng Việt Be Vietnam Pro + JetBrains Mono và công thức toán học KaTeX khớp ký hiệu bài giảng UET.',
    ],
  },
];
```

- [ ] **Step 2: Extend `src/domain/types.ts` with `WorkedExampleSpec`, `FDChallenge`, and `SQLChallenge`**

Add `WorkedExampleSpec` (problem prompt, step-by-step LaTeX derivations, final answer, exam rubric note), `FDChallenge` (`datasetTitle`, `attributes`, `fds`, `targetQuestionKind: 'closure' | 'candidate-keys' | 'normal-form'`, expected answers, hints), `SQLChallenge` (`datasetId`, `prompt`, `starterSql`, `solutionSql`, `hints`), and expand `WorkbenchPanelConfig['kind']` with `'normalization' | 'sql'`.

- [ ] **Step 3: Create `src/platform/types.ts` defining `CourseManifest`, `LabToolDescriptor`, and `ExamPaperSpec`**

```ts
import { ModuleSpec } from '../domain/types';

export type HubRouteId = 'home' | 'dashboard' | 'learn' | 'labs' | 'exams';

export interface LabToolDescriptor {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  engineKind: 'algebra' | 'normalization' | 'sql' | 'er-schema' | 'anomaly';
  defaultDatasetId?: string;
  defaultDiagramId?: string;
}

export interface ExamMcqQuestion {
  id: string;
  topicTag: string;
  points: number;
  prompt: string;
  options: Array<{ id: string; label: string; explanation: string }>;
  correctOptionId: string;
}

export interface ExamWrittenSubpart {
  id: string;
  label: string;
  points: number;
  prompt: string;
  solutionMarkdownLatex: string;
  gradingNotes: string;
}

export interface ExamWrittenProblem {
  id: string;
  title: string;
  topicTag: string;
  totalPoints: number;
  contextMarkdownLatex: string;
  subparts: ExamWrittenSubpart[];
}

export interface ExamPaperSpec {
  id: string;
  code: string;
  title: string;
  durationMinutes: number;
  semesterLabel: string;
  description: string;
  mcqQuestions: ExamMcqQuestion[];
  writtenProblems: ExamWrittenProblem[];
}

export interface FormulaSectionSpec {
  id: string;
  title: string;
  markdownLatex: string;
}

export interface CourseManifest {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  faculty: string;
  semesterTag: string;
  accentHex: string;
  status: 'active' | 'template-sample' | 'coming-soon';
  summary: string;
  modules: ModuleSpec[];
  labs: LabToolDescriptor[];
  exams: ExamPaperSpec[];
  formulaSections: FormulaSectionSpec[];
}
```

- [ ] **Step 4: Run `npm run typecheck` and commit Task 1**

Run: `npm run typecheck` -> Expected: `0` errors.
Commit: `git commit -m "feat(platform): add version Beta v1.0, changelog, and multi-course manifest types"`

---

### Task 2: Multi-Course Hub Store with Study Streak & 56-Day Heatmap (TDD)

**Files:**
- Create: `src/platform/store/hubStore.test.ts`
- Create: `src/platform/store/hubStore.ts`

- [ ] **Step 1: Write failing unit tests in `src/platform/store/hubStore.test.ts`**

Test:
1. Consecutive daily activity (`2026-11-16`, `2026-11-17`, `2026-11-18`) computes `currentStreak === 3` and `longestStreak === 3`; a 2-day gap resets `currentStreak` to `1` while preserving `longestStreak === 3`.
2. Completing steps in course `'is2099'` increments today's activity count in `dailyActivityByDate`, updates per-course progress without polluting `'sample-template'`, and records exam attempts.
3. Syncs both `data-theme` AND `.dark` class on `document.documentElement` so Tailwind `dark:` and Konsta UI dark glass tokens stay 100% synchronized.

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run src/platform/store/hubStore.test.ts` -> Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/platform/store/hubStore.ts`**

Provide `<HubProvider>` and `useHub()` managing `activeRoute`, `activeCourseId`, `streak` (`currentStreak`, `longestStreak`, `lastStudyDate`), `dailyActivityByDate: Record<string, number>`, `dailyGoalTarget` (default `5` actions/steps per day), `examHistory`, and seamless backward-compatible migration/bridge with `ProgressProvider`.

- [ ] **Step 4: Run test to verify pass & commit**

Run: `npx vitest run src/platform/store/hubStore.test.ts` -> Expected: PASS.
Commit: `git commit -m "feat(store): implement multi-course hub store with study streak and activity heatmap"`

---

### Task 3: iOS Translucent / Liquid Glass UI Kit & `antigravity.google` Motion Shell

**Files:**
- Modify: `src/styles/design-system.css`
- Create: `src/platform/ui/GlassPrimitives.tsx`
- Create: `src/platform/ui/SceneTransition.tsx`
- Create: `src/platform/ui/FloatingGlassDock.tsx`
- Create: `src/platform/ui/CommandPalette.tsx`
- Create: `src/platform/ui/ChangelogModal.tsx`

- [ ] **Step 1: Upgrade `src/styles/design-system.css` for iOS Spatial Glass & Ambient Mesh**

Import `konsta/react/theme.css` alongside `@import "tailwindcss";` and `@import "katex/dist/katex.min.css";`. Define Light Pearl (`#F4F6FB` with soft sapphire/indigo ambient radial gradients) and Dark Spatial Slate (`#060A14` with subtle silver-cobalt ambient light — zero neon borders), `.ios-glass-card`, `.ios-glass-reading`, `.ios-specular-border`, and preserve `.katex .mtext { font-family: var(--font-sans) !important; }`.

- [ ] **Step 2: Build `src/platform/ui/GlassPrimitives.tsx` (`Konsta` + `@nkzw/liquid-glass` Safe Integration)**

Export:
- `HubThemeShell`: wraps `<KonstaProvider theme="ios" dark={resolvedDark}>` + ambient kinetic background mesh.
- `LiquidPillBadge`: uses `@nkzw/liquid-glass` `<LiquidGlass mode="standard">` when in live browser with 2D canvas support (anchored properly for its internal `-50%/-50%` transform) and graceful Konsta `<Glass highlight>` fallback in SSR/JSDOM/Safari.
- `IosGlassCard`: wraps Konsta `<Glass highlight>` with specular `1px` rim for interactive cards, metrics, and navigation.
- `ReadingGlassSurface`: crisp `backdrop-blur-2xl` surface without pixel displacement so KaTeX formulas stay razor-sharp.

- [ ] **Step 3: Build `SceneTransition.tsx`, `FloatingGlassDock.tsx`, `CommandPalette.tsx`, and `ChangelogModal.tsx`**

- `SceneTransition`: `AnimatePresence mode="wait"` spring transition (`opacity`, subtle `y: 12 -> 0`, `scale: 0.992 -> 1`, `filter: blur(4px) -> blur(0px)`) + `KineticOrbitalLoader` SVG component.
- `FloatingGlassDock`: iOS translucent pill bar with `motion.div layoutId="active-nav-pill"`, switching smoothly across `Home`, `Dashboard`, `Học tập`, `Phòng Lab`, `Luyện đề`, plus Course Selector pill, Streak Flame counter, `Ctrl+K` button, and Light/Dark/System toggle.

- [ ] **Step 4: Verify TypeScript compilation and commit**

Run: `npm run typecheck` -> Expected: `0` errors.
Commit: `git commit -m "feat(ui): build iOS liquid glass primitives, floating dock, scene transitions, and changelog modal"`

---

### Task 4: Engine 4 — Functional Dependencies & `1NF → BCNF` Normalization (`C4_1.pdf`)

**Files:**
- Create: `src/domain/fd/fdEngine.test.ts`
- Create: `src/domain/fd/fdEngine.ts`
- Create: `src/components/workbench/NormalizationWorkbench.tsx`

- [ ] **Step 1: Write failing tests in `src/domain/fd/fdEngine.test.ts`**

Test against classic `C4_1.pdf` UET problems:
1. `computeAttributeClosure(['A', 'B'], fds)` returns exact `closure` set and step-by-step `trace` showing which FD $X \to Y$ fired at each iteration.
2. `findAllCandidateKeys(attributes, fds)` partitions attributes into Source ($L$), Middle ($M$), Right-only ($R$) and finds all minimal candidate keys accurately (including multi-key BCNF schemas like `R(A,B,C,D)` or `LOP_GIAOVIEN`).
3. `analyzeNormalForms(attributes, fds)` identifies prime vs non-prime attributes, detects exact violating FDs for `2NF` (partial dependency), `3NF` (transitive dependency), and `BCNF` (determinant not a superkey), and `decomposeToBCNF` / `checkLosslessBinarySplit` verifies $R_1 \cap R_2 \to R_1$ or $R_1 \cap R_2 \to R_2$.

- [ ] **Step 2: Run test to confirm failure**

Run: `npx vitest run src/domain/fd/fdEngine.test.ts` -> Expected: FAIL.

- [ ] **Step 3: Implement `src/domain/fd/fdEngine.ts` and `src/components/workbench/NormalizationWorkbench.tsx`**

Build complete deterministic engine + interactive glass workbench allowing students to:
- Enter custom attributes & FDs (or pick UET `C4_1.pdf` presets),
- Click attributes to compute $X^+$ step-by-step with LaTeX trace,
- View $L / M / R$ attribute classification and all Candidate Keys,
- Inspect `1NF → 2NF → 3NF → BCNF` status badges and step-by-step lossless decomposition, plus auto-grading for `FDChallenge`.

- [ ] **Step 4: Run tests & commit**

Run: `npx vitest run src/domain/fd/fdEngine.test.ts && npm run typecheck` -> Expected: PASS.
Commit: `git commit -m "feat(fd): add Armstrong closure, candidate key finder, and 1NF-BCNF normalization engine"`

---

### Task 5: Engine 5 — Client-Side Exam SQL Runner (`SELECT`, `JOIN`, `HAVING`, `NOT EXISTS`)

**Files:**
- Create: `src/domain/sql/sqlEngine.test.ts`
- Create: `src/domain/sql/sqlEngine.ts`
- Create: `src/components/workbench/SQLWorkbench.tsx`

- [ ] **Step 1: Write failing tests in `src/domain/sql/sqlEngine.test.ts`**

Test against `UET_DATASETS.DAOTAO` and `UET_DATASETS.CONGTY_EX`:
1. `SELECT` without `DISTINCT` preserves duplicates (bag semantics) while `SELECT DISTINCT` deduplicates.
2. `INNER JOIN` and `LEFT OUTER JOIN` with table aliases (`FROM NHANVIEN nv LEFT JOIN THANNHAN tn ON nv.MANV = tn.MANV`).
3. `GROUP BY ... HAVING` with `COUNT(*)`, `COUNT(col)`, `SUM`, `AVG`, `MAX`, `MIN` and `ORDER BY`.
4. Correlated subqueries `WHERE NOT EXISTS (SELECT * FROM ... WHERE ...)` including double `NOT EXISTS` relational division (*"Sinh viên học tất cả các lớp thầy Lê Đức Hòa dạy"*).

- [ ] **Step 2: Run test to confirm failure**

Run: `npx vitest run src/domain/sql/sqlEngine.test.ts` -> Expected: FAIL.

- [ ] **Step 3: Implement `src/domain/sql/sqlEngine.ts` and `src/components/workbench/SQLWorkbench.tsx`**

Implement clean recursive SQL parser & tuple-binding evaluator supporting outer-scope correlated bindings (`outerRow`) for `EXISTS / NOT EXISTS / IN / NOT IN`, paired with `SQLWorkbench.tsx` featuring dataset schema pills, SQL keyword snippets, live result table, and deterministic result comparison against `solutionSql`.

- [ ] **Step 4: Run tests & commit**

Run: `npx vitest run src/domain/sql/sqlEngine.test.ts && npm run typecheck` -> Expected: PASS.
Commit: `git commit -m "feat(sql): add correlated SQL evaluator and interactive SQL workbench"`

---

### Task 6: Deep Final-Exam Curriculum Upgrade (`C1` → `C4_1` + `SQL`)

**Files:**
- Create: `src/components/story/WorkedExampleCard.tsx`
- Modify: `src/components/story/MicroStepStream.tsx`
- Modify: `src/components/workbench/WorkbenchHost.tsx`
- Modify: `src/curriculum/module1-intro.ts` .. `src/curriculum/module5-algebra.ts`
- Create: `src/curriculum/module6-normalization.ts`
- Create: `src/curriculum/module7-sql.ts`
- Modify: `src/curriculum/index.ts`
- Modify: `src/curriculum/curriculumIntegrity.test.ts`

- [ ] **Step 1: Create `WorkedExampleCard.tsx` and wire `normalization` & `sql` into `WorkbenchHost.tsx` and `MicroStepStream.tsx`**

Render structured step-by-step worked exam problems (with collapsible or progressive derivation steps in KaTeX + exam grading remarks) inside every lesson.

- [ ] **Step 2: Author `module6-normalization.ts` (5 thorough lessons from `C4_1.pdf`) and `module7-sql.ts` (4 thorough lessons for Final-Exam SQL)**

Include deep conceptual intuition, formal proofs, hand-solved worked examples, and interactive `FDChallenge` + `SQLChallenge` steps. Enrich Modules 1–5 with worked written examples and symbol-by-symbol formal breakdowns.

- [ ] **Step 3: Expand `curriculumIntegrity.test.ts` to audit all 7 Modules (31 Lessons), including `FDChallenge` & `SQLChallenge` auto-grading**

Run: `npx vitest run src/curriculum/curriculumIntegrity.test.ts` -> Expected: 100% PASS across all 7 modules, balanced `$` math, zero leaked `**` markers, and verified solutions for every challenge.
Commit: `git commit -m "feat(curriculum): add deep worked examples, C4_1 normalization module, and SQL final-exam module"`

---

### Task 7: Multi-Course Registry, Starter Sample Template & Standalone Exam Arena (Beta)

**Files:**
- Create: `src/courses/_course-template/index.ts`
- Create: `src/courses/is2099-database/exams.ts`
- Create: `src/courses/is2099-database/index.ts`
- Create: `src/courses/registry.ts`
- Create: `src/platform/pages/ExamArenaPage.tsx`

- [ ] **Step 1: Create `src/courses/_course-template/index.ts` & Coming-Soon sample manifests**

Provide a clean, well-commented starter template (`SAMPLE_COURSE_TEMPLATE` + preview cards for `MAT1052 · Xác suất Thống kê` and `INT2210 · Cấu trúc dữ liệu & Giải thuật`) demonstrating how a new course plugs into `COURSE_REGISTRY` in under 50 lines.

- [ ] **Step 2: Author `src/courses/is2099-database/exams.ts` with full LaTeX Final Exam Papers**

Author 2 complete 90-minute Final Exam papers (`Đề Cuối Kỳ Mẫu #01 — Chuẩn Cấu Trúc Tự Luận + Trắc Nghiệm UET`, `Đề Cuối Kỳ Tổng Hợp #02 — Phân Loại 8.5–10 Điểm`) rendered in crisp LaTeX covering ER/EER mapping, Relational Algebra, Correlated SQL, and $X^+$ / Lossless-Join / `3NF` & `BCNF` decomposition with full point rubrics.

- [ ] **Step 3: Build `src/platform/pages/ExamArenaPage.tsx`**

Standalone exam feature with paper selector, live countdown timer, MCQ interactive sheet with instant score & explanations, Written Free-Response exam sheet with self-assessment point checkboxes and toggleable step-by-step LaTeX solutions, saving scores to `hubStore`.

- [ ] **Step 4: Typecheck and commit**

Run: `npm run typecheck` -> Expected: `0` errors.
Commit: `git commit -m "feat(exams): add multi-course registry, starter template, and LaTeX Final Exam Arena"`

---

### Task 8: `Home`, `Dashboard`, `Labs`, `Learn` Pages & Kinetic App Integration

**Files:**
- Create: `src/platform/pages/HomePage.tsx`
- Create: `src/platform/pages/DashboardPage.tsx`
- Create: `src/platform/pages/LabsPage.tsx`
- Create: `src/platform/pages/LearnPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Build `HomePage.tsx` with `Beta v1.0` badge, Live Kinetic Bento Showcase, Course Catalog & Complete Footer**

- Top Hero pill displaying `STUDYHUB · Beta v1.0` (clickable to open `ChangelogModal`).
- `antigravity.google`-inspired Interactive Dynamic Showcase (live animated ER physics nodes, live Algebra $\leftrightarrow$ SQL LaTeX morpher, live `BCNF` decomposition preview, live Study Streak preview — zero static wall-of-text or cheap neon).
- Multi-Course Catalog (`IS2099` active + template previews) & 5-Layer Pedagogical Philosophy section.
- Comprehensive Footer with **Keyboard Shortcuts** (`Ctrl+K`, `Alt+1..5`), **Change Logs (`Beta v1.0`)** trigger button, **Multi-Course Architecture note**, **Credits**, and **MIT License**.

- [ ] **Step 2: Build `DashboardPage.tsx` (Study Streak + 56-Day Heatmap + Mastery) & `LabsPage.tsx`**

Render Study Streak counter, 56-day calendar heatmap, daily goal ring, *"Continue Where You Left Off"* card, course filter, 7-module mastery progress bars, and Exam Arena history.

- [ ] **Step 3: Wire `LearnPage.tsx` and `src/App.tsx` with `FloatingGlassDock`, `SceneTransition`, `CommandPalette`, and `ChangelogModal`**

Connect keyboard shortcuts (`Ctrl+K` / `Cmd+K` for Command Palette, `Alt+1..5` for instant page transitions) and smooth `motion` transitions across all 5 surfaces.

- [ ] **Step 4: Write integration tests for Multi-Page Navigation, Version Badge & Changelog Shortcut**

Create `src/platform/platformApp.test.tsx` verifying `Beta v1.0` renders at the top of `Home`, clicking `Change Logs` in the footer opens `ChangelogModal`, switching to `Dashboard` renders `Study Streak`, switching to `Luyện đề` renders `Exam Arena`, and switching to `Học tập` opens the 7-module curriculum.
Commit: `git commit -m "feat(hub): integrate Home, Dashboard, Labs, Learn, and Exam Arena with iOS glass shell"`

---

### Task 9: Final Reality Check, Browser Visual Audit & Vercel Production Deployment

**Files:**
- Modify: `vite.config.ts` (chunk splitting for `motion`, `konsta`, `katex`, `courses`)

- [ ] **Step 1: Run full automated test suite, strict typecheck, and production build**

Run: `npx vitest run && npm run typecheck && npm run build`
Expected: 100% test pass, `0` TS errors, clean Vite production chunks.

- [ ] **Step 2: Visual & Interactive Browser Audit (`1440x900` & `390x844`, Light & Dark Glass)**

Start Vite server and verify via headless browser:
- `Home` top `Beta v1.0` Liquid Glass badge, live dynamic hero components, and footer `Change Logs` / `Shortcuts` / `Credits` / `License`.
- Smooth `SceneTransition` across `Home` → `Dashboard` (Streak + Heatmap) → `Học tập` (Module 6 Normalization & Module 7 SQL) → `Phòng Lab` → `Luyện đề` (LaTeX Final Exam).
- Zero console errors and zero horizontal overflow on desktop and mobile.

- [ ] **Step 3: Push to `origin/main` and verify Vercel Auto-Deployment (`READY`)**

Run: `git push origin main`
Inspect Vercel deployment via `vercel-plugin_vercel` (`list_deployments` / `get_deployment`) until `readyState === 'READY'` and verify HTTP `200` on `https://csdl-uet-is2099-amber.vercel.app`.
