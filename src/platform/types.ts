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
