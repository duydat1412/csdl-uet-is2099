export type CellValue = string | number | null;

export type DomainType = 'string' | 'integer' | 'float' | 'date';

export interface AttributeSchema {
  name: string;
  domain: DomainType;
  min?: number;
  max?: number;
  nullable?: boolean;
  description?: string;
}

export interface ForeignKeyConstraint {
  columns: string[];
  refTable: string;
  refColumns: string[];
}

export interface RelationSchema {
  name: string;
  attributes: AttributeSchema[];
  primaryKey: string[];
  candidateKeys?: string[][];
  foreignKeys?: ForeignKeyConstraint[];
}

export type RowHighlightKind = 'normal' | 'matched' | 'excluded' | 'conflict' | 'new' | 'null-dropped';

export interface TupleRow {
  [attribute: string]: CellValue;
}

export interface RelationInstance {
  schema: RelationSchema;
  rows: TupleRow[];
  /** Optional per-row visual markers for pedagogical highlight */
  rowHighlights?: Record<number, RowHighlightKind>;
}

export interface DatabaseState {
  id: string;
  title: string;
  description: string;
  relations: Record<string, RelationInstance>;
}

/* ============================================================================
 * ER & EER Diagram Types (UET / Elmasri Chen Notation)
 * ========================================================================== */

export type EREntityKind = 'strong' | 'weak';

export type ERAttributeKind =
  | 'simple'
  | 'key'
  | 'partialKey'
  | 'multivalued'
  | 'derived'
  | 'composite';

export interface EREntityNode {
  id: string;
  name: string;
  kind: EREntityKind;
  x: number;
  y: number;
}

export interface ERAttributeNode {
  id: string;
  name: string;
  kind: ERAttributeKind;
  parentId: string; // entityId, relationshipId, or parent composite attributeId
  x: number;
  y: number;
}

export interface ERRelationshipNode {
  id: string;
  name: string;
  identifying?: boolean;
  x: number;
  y: number;
}

export interface ERParticipationEdge {
  id: string;
  relationshipId: string;
  entityId: string;
  /** UET structural constraint (min, max) at entity side */
  minMax: [number, number | 'n'];
  /** Classical cardinality ratio placed near entity side (e.g., "1", "n", "m") */
  ratioLabel: string;
  totalParticipation?: boolean;
  roleLabel?: string;
  /** Optional visual bend offset for recursive relationships */
  curveOffset?: number;
}

export interface EERSpecializationNode {
  id: string;
  superclassId: string;
  subclassIds: string[];
  disjointness: 'd' | 'o' | 'u'; // disjoint, overlapping, union
  completeness: 'total' | 'partial';
  predicateLabel?: string;
  x: number;
  y: number;
}

export interface ERDiagramSpec {
  id: string;
  title: string;
  entities: EREntityNode[];
  attributes: ERAttributeNode[];
  relationships: ERRelationshipNode[];
  edges: ERParticipationEdge[];
  specializations?: EERSpecializationNode[];
  width?: number;
  height?: number;
}

/* ============================================================================
 * Curriculum & Interactive Workbench Types
 * ========================================================================== */

export interface CalloutSpec {
  kind: 'definition' | 'pitfall' | 'example' | 'slide-ref';
  title: string;
  body: string;
  slideSource?: string;
}

export interface QuizOption {
  id: string;
  label: string;
  explanation: string;
}

export interface QuizChallenge {
  type: 'quiz';
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
}

export interface AnomalySimChallenge {
  type: 'anomaly-sim';
  mode: 'flat-anomaly' | 'three-schema' | 'relational-update';
  datasetId: string;
  prompt: string;
  suggestedActionLabel?: string;
  /** For relational-update mode: expected constraint violation or target state */
  presetCommands?: Array<{
    id: string;
    label: string;
    command: string;
    expectStatus: 'ok' | 'DOMAIN_VIOLATION' | 'KEY_VIOLATION' | 'ENTITY_INTEGRITY_VIOLATION' | 'REFERENTIAL_VIOLATION';
  }>;
  goalDescription: string;
}

export interface CardinalityToggleChallenge {
  type: 'cardinality-toggle';
  diagramId: string;
  prompt: string;
  scenarioText: string;
  leftEntityName: string;
  rightEntityName: string;
  relationshipName: string;
  expectedLeftMinMax: [number, number | 'n'];
  expectedRightMinMax: [number, number | 'n'];
  expectedLeftRatio: string;
  expectedRightRatio: string;
  hint: string;
}

export interface EERConstraintChallenge {
  type: 'eer-validator';
  diagramId: string;
  prompt: string;
  expectedDisjointness: 'd' | 'o';
  expectedCompleteness: 'total' | 'partial';
  sampleCaseDescription: string;
  explanation: string;
}

export interface TargetTableSpec {
  name: string;
  columns: string[];
  primaryKey: string[];
  foreignKeys: ForeignKeyConstraint[];
}

export interface SchemaMapperChallenge {
  type: 'schema-mapper';
  diagramId: string;
  prompt: string;
  candidateColumns: string[];
  expectedTables: TargetTableSpec[];
  hints: string[];
}

export interface AlgebraChallenge {
  type: 'algebra';
  datasetId: string;
  prompt: string;
  starterExpression?: string;
  solutionExpression: string;
  /** Optional strict check on output column names (e.g., for rename ρ tasks) */
  checkColumnNames?: boolean;
  hints: string[];
}

export interface WorkedExampleStep {
  label: string;
  markdownLatex: string;
}

export interface WorkedExampleSpec {
  id: string;
  title: string;
  problemStatement: string;
  steps: WorkedExampleStep[];
  conclusion: string;
  examTip?: string;
}

export interface FunctionalDependencySpec {
  left: string[];
  right: string[];
}

export interface FDChallenge {
  type: 'fd-norm';
  prompt: string;
  relationName: string;
  attributes: string[];
  fds: FunctionalDependencySpec[];
  mode: 'closure' | 'candidate-keys' | 'normal-form';
  seedClosureTarget?: string[];
  expectedClosure?: string[];
  expectedKeys?: string[][];
  expectedHighestNormalForm?: '1NF' | '2NF' | '3NF' | 'BCNF';
  hints: string[];
}

export interface SQLChallenge {
  type: 'sql';
  datasetId: string;
  prompt: string;
  starterSql?: string;
  solutionSql: string;
  checkOrder?: boolean;
  hints: string[];
}

export type WorkbenchChallenge =
  | QuizChallenge
  | AnomalySimChallenge
  | CardinalityToggleChallenge
  | EERConstraintChallenge
  | SchemaMapperChallenge
  | AlgebraChallenge
  | FDChallenge
  | SQLChallenge;

export interface WorkbenchPanelConfig {
  kind:
    | 'anomaly'
    | 'three-schema'
    | 'er-diagram'
    | 'schema-mapper'
    | 'algebra'
    | 'normalization'
    | 'sql'
    | 'dataset-preview';
  datasetId?: string;
  diagramId?: string;
  title: string;
  caption?: string;
  initialExpression?: string;
  initialSql?: string;
  fdPreset?: {
    relationName: string;
    attributes: string[];
    fds: FunctionalDependencySpec[];
  };
}

export interface MicroStepSpec {
  id: string;
  phaseLabel: 'Vấn đề' | 'Khám phá' | 'Lý thuyết UET' | 'Gỡ bẫy' | 'Thực hành';
  title: string;
  narrative: string;
  callouts?: CalloutSpec[];
  workedExamples?: WorkedExampleSpec[];
  workbench?: WorkbenchPanelConfig;
  challenge?: WorkbenchChallenge;
}

export interface LessonSpec {
  id: string;
  moduleId: string;
  orderLabel: string;
  title: string;
  subtitle: string;
  slideRange: string;
  estimatedMinutes: number;
  steps: MicroStepSpec[];
}

export interface ModuleSpec {
  id: string;
  order: number;
  title: string;
  sourceFile: string;
  description: string;
  lessons: LessonSpec[];
}
