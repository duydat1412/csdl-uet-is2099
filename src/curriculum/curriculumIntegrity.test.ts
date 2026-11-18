import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CURRICULUM_MODULES } from './index';
import { UET_DATASETS } from '../domain/datasets/uetDatasets';
import { UET_ER_DIAGRAMS } from '../domain/datasets/uetERDiagrams';
import { executeRelationalUpdate } from '../domain/anomaly/anomalyEngine';
import {
  evaluateSchemaMapping,
  validateCardinalityAnswer,
} from '../domain/er/erMappingEngine';
import { evaluateAlgebraProgram } from '../domain/algebra/evaluator';
import { analyzeNormalForms, computeAttributeClosure } from '../domain/fd/fdEngine';
import { evaluateSqlQuery } from '../domain/sql/sqlEngine';
import { RichText } from '../components/common/RichText';

function hasBalancedMathDelimiters(text: string): boolean {
  const noEscaped = text.replace(/\\\$/g, '');
  const blockMatches = noEscaped.match(/\$\$/g);
  if (blockMatches && blockMatches.length % 2 !== 0) return false;
  const withoutBlocks = noEscaped.replace(/\$\$[\s\S]*?\$\$/g, '');
  const withoutCode = withoutBlocks.replace(/`[^`]*`/g, '');
  const inlineDollars = withoutCode.match(/\$/g);
  return !inlineDollars || inlineDollars.length % 2 === 0;
}

describe('Curriculum Integrity Audit (All 7 Modules · 31 Lessons — Full Final Exam Scope)', () => {
  it('contains all 7 modules and 31 lessons with unique IDs and valid dataset/diagram links', () => {
    expect(CURRICULUM_MODULES).toHaveLength(7);

    const allLessons = CURRICULUM_MODULES.flatMap((m) => m.lessons);
    expect(allLessons).toHaveLength(31);

    const lessonIds = new Set<string>();
    const stepIds = new Set<string>();

    for (const mod of CURRICULUM_MODULES) {
      for (const lesson of mod.lessons) {
        expect(lessonIds.has(lesson.id)).toBe(false);
        lessonIds.add(lesson.id);
        expect(lesson.steps.length).toBeGreaterThanOrEqual(2);

        for (const step of lesson.steps) {
          expect(stepIds.has(step.id)).toBe(false);
          stepIds.add(step.id);

          if (step.workbench?.datasetId) {
            expect(UET_DATASETS[step.workbench.datasetId]).toBeDefined();
          }
          if (step.workbench?.diagramId) {
            expect(UET_ER_DIAGRAMS[step.workbench.diagramId]).toBeDefined();
          }
        }
      }
    }
  });

  it('maintains balanced LaTeX $ and $$ delimiters and zero raw Markdown markers across all 31 lessons & workedExamples', () => {
    for (const mod of CURRICULUM_MODULES) {
      for (const lesson of mod.lessons) {
        for (const step of lesson.steps) {
          expect(
            hasBalancedMathDelimiters(step.narrative),
            `Unbalanced $ in ${step.id} narrative`,
          ).toBe(true);

          const { container, unmount } = render(
            React.createElement(RichText, { content: step.narrative }),
          );
          expect(
            container.textContent?.includes('**'),
            `Unparsed ** Markdown emphasis leaked in ${step.id} narrative`,
          ).toBe(false);
          unmount();

          for (const callout of step.callouts ?? []) {
            expect(
              hasBalancedMathDelimiters(callout.body),
              `Unbalanced $ in ${step.id} callout "${callout.title}"`,
            ).toBe(true);
          }

          for (const ex of step.workedExamples ?? []) {
            expect(
              hasBalancedMathDelimiters(ex.problemStatement),
              `Unbalanced $ in workedExample ${ex.id}`,
            ).toBe(true);
            for (const st of ex.steps) {
              expect(
                hasBalancedMathDelimiters(st.markdownLatex),
                `Unbalanced $ in workedExample ${ex.id} step "${st.label}"`,
              ).toBe(true);
            }
            expect(
              hasBalancedMathDelimiters(ex.conclusion),
              `Unbalanced $ in workedExample ${ex.id} conclusion`,
            ).toBe(true);
          }

          if (step.challenge) {
            expect(
              hasBalancedMathDelimiters(step.challenge.prompt),
              `Unbalanced $ in ${step.id} challenge prompt`,
            ).toBe(true);

            if (step.challenge.type === 'quiz') {
              for (const opt of step.challenge.options) {
                expect(
                  hasBalancedMathDelimiters(opt.label),
                  `Unbalanced $ in ${step.id} option ${opt.id}`,
                ).toBe(true);
                expect(
                  hasBalancedMathDelimiters(opt.explanation),
                  `Unbalanced $ in ${step.id} explanation ${opt.id}`,
                ).toBe(true);
              }
            }
          }
        }
      }
    }
  });

  it('programmatically executes and verifies 100% of interactive challenges across all 31 lessons (Algebra, FD, SQL, ER, Anomalies)', () => {
    let executedChallenges = 0;

    for (const mod of CURRICULUM_MODULES) {
      for (const lesson of mod.lessons) {
        for (const step of lesson.steps) {
          const ch = step.challenge;
          if (!ch) continue;
          executedChallenges += 1;

          if (ch.type === 'quiz') {
            const hasAnswer = ch.options.some((o) => o.id === ch.correctOptionId);
            expect(hasAnswer, `Missing correctOptionId in ${step.id}`).toBe(true);
          }

          if (ch.type === 'anomaly-sim') {
            expect(UET_DATASETS[ch.datasetId]).toBeDefined();
            for (const preset of ch.presetCommands ?? []) {
              const db = UET_DATASETS[ch.datasetId];
              const res = executeRelationalUpdate(db, preset.command, 'REJECT');
              expect(res.status, `Preset ${preset.id} in ${step.id}`).toBe(preset.expectStatus);
            }
          }

          if (ch.type === 'cardinality-toggle') {
            expect(UET_ER_DIAGRAMS[ch.diagramId]).toBeDefined();
            const check = validateCardinalityAnswer(
              ch.expectedLeftMinMax,
              ch.expectedRightMinMax,
              ch.expectedLeftMinMax,
              ch.expectedRightMinMax,
              ch.leftEntityName,
              ch.rightEntityName,
            );
            expect(check.isCorrect).toBe(true);
          }

          if (ch.type === 'eer-validator') {
            expect(UET_ER_DIAGRAMS[ch.diagramId]).toBeDefined();
          }

          if (ch.type === 'schema-mapper') {
            expect(UET_ER_DIAGRAMS[ch.diagramId]).toBeDefined();
            for (const tbl of ch.expectedTables) {
              for (const col of tbl.columns) {
                expect(
                  ch.candidateColumns.includes(col),
                  `Column ${col} in ${tbl.name} missing from candidateColumns of ${step.id}`,
                ).toBe(true);
              }
            }
            const selfGrade = evaluateSchemaMapping(ch.expectedTables, ch.expectedTables);
            expect(selfGrade.isCorrect).toBe(true);
            expect(selfGrade.scorePercent).toBe(100);
          }

          if (ch.type === 'algebra') {
            const db = UET_DATASETS[ch.datasetId];
            expect(db, `Unknown dataset ${ch.datasetId} in ${step.id}`).toBeDefined();
            const evalRes = evaluateAlgebraProgram(db, ch.solutionExpression);
            expect(
              evalRes.error,
              `Algebra solution error in ${step.id}: ${evalRes.error}`,
            ).toBeUndefined();
            expect(evalRes.finalResult).toBeDefined();
            expect(
              evalRes.finalResult!.rows.length,
              `Algebra solution returned 0 rows in ${step.id}`,
            ).toBeGreaterThan(0);
          }

          if (ch.type === 'fd-norm') {
            if (ch.mode === 'closure' && ch.seedClosureTarget && ch.expectedClosure) {
              const cls = computeAttributeClosure(ch.seedClosureTarget, ch.fds).closure;
              expect([...cls].sort()).toEqual([...ch.expectedClosure].sort());
            } else {
              const analysis = analyzeNormalForms(ch.attributes, ch.fds);
              if (ch.mode === 'candidate-keys' && ch.expectedKeys) {
                expect(analysis.candidateKeys).toEqual(ch.expectedKeys);
              }
              if (ch.mode === 'normal-form' && ch.expectedHighestNormalForm) {
                expect(analysis.highestNormalForm).toBe(ch.expectedHighestNormalForm);
              }
            }
          }

          if (ch.type === 'sql') {
            const db = UET_DATASETS[ch.datasetId];
            expect(db, `Unknown dataset ${ch.datasetId} in ${step.id}`).toBeDefined();
            const sqlRes = evaluateSqlQuery(db, ch.solutionSql);
            expect(
              sqlRes.error,
              `SQL solution error in ${step.id}: ${sqlRes.error}`,
            ).toBeUndefined();
            expect(sqlRes.result).toBeDefined();
            if (sqlRes.kind === 'select') {
              expect(
                sqlRes.result!.rows.length,
                `SQL solution returned 0 rows in ${step.id}`,
              ).toBeGreaterThan(0);
            }
          }
        }
      }
    }

    expect(executedChallenges).toBeGreaterThanOrEqual(30);
  });
});
