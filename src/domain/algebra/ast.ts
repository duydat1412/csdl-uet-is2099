import { RelationInstance } from '../types';

export type BinaryOpKind =
  | 'UNION'
  | 'INTERSECT'
  | 'DIFF'
  | 'CARTESIAN'
  | 'NATURAL_JOIN'
  | 'THETA_JOIN'
  | 'LEFT_OUTER_JOIN'
  | 'RIGHT_OUTER_JOIN'
  | 'FULL_OUTER_JOIN'
  | 'DIVISION';

export interface DivisionBreakdown {
  attributesY: string[];
  T1: RelationInstance;
  cartesianST1: RelationInstance;
  missingPairs: RelationInstance;
  T2: RelationInstance;
  finalT: RelationInstance;
}

export interface AggregateSpec {
  fn: 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'COUNT';
  arg: string; // '*' | 'col' | 'col1 * col2'
  alias?: string;
}

export interface ProjectionItem {
  expr: string;
  alias?: string;
}

export interface ASTNodeBase {
  id: string;
  label: string;
  latex: string;
  explanation?: string;
  intermediateResult?: RelationInstance;
  divisionBreakdown?: DivisionBreakdown;
}

export type ASTNode =
  | (ASTNodeBase & { kind: 'RelationRef'; name: string })
  | (ASTNodeBase & { kind: 'Selection'; condition: string; child: ASTNode })
  | (ASTNodeBase & { kind: 'Projection'; items: ProjectionItem[]; child: ASTNode })
  | (ASTNodeBase & {
      kind: 'Rename';
      newRelationName?: string;
      newAttributes?: string[];
      child: ASTNode;
    })
  | (ASTNodeBase & {
      kind: 'Group';
      groupBy: string[];
      aggregates: AggregateSpec[];
      child: ASTNode;
    })
  | (ASTNodeBase & {
      kind: 'Binary';
      op: BinaryOpKind;
      condition?: string;
      left: ASTNode;
      right: ASTNode;
    });

export interface ProgramStepResult {
  lineNumber: number;
  rawStatement: string;
  assignedTo?: string;
  latex: string;
  ast: ASTNode;
  result: RelationInstance;
}

export interface AlgebraProgramResult {
  steps: ProgramStepResult[];
  finalResult?: RelationInstance;
  finalLatex: string;
  error?: string;
}
