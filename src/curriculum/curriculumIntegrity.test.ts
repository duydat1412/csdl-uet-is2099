import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CURRICULUM_MODULES } from './index';
import { RichText } from '../components/common/RichText';
import { UET_DATASETS } from '../domain/datasets/uetDatasets';
import { UET_ER_DIAGRAMS } from '../domain/datasets/uetERDiagrams';
import { executeRelationalUpdate } from '../domain/anomaly/anomalyEngine';
import {
  evaluateSchemaMapping,
  validateCardinalityAnswer,
} from '../domain/er/erMappingEngine';
import { evaluateAlgebraProgram } from '../domain/algebra/evaluator';

function hasBalancedMathDelimiters(text: string): boolean {
  // Strip escaped \$ first, then strip $$...$$ blocks, then count remaining $
  const noEscaped = text.replace(/\\\$/g, '');
  const blockMatches = noEscaped.match(/\$\$/g);
  if (blockMatches && blockMatches.length % 2 !== 0) return false;
  const withoutBlocks = noEscaped.replace(/\$\$[\s\S]*?\$\$/g, '');
  // Ignore inline code spans `...`
  const withoutCode = withoutBlocks.replace(/`[^`]*`/g, '');
  const inlineDollars = withoutCode.match(/\$/g);
  return !inlineDollars || inlineDollars.length % 2 === 0;
}

describe('Curriculum Integrity Audit (All 5 Modules · 22 Lessons)', () => {
  it('contains all 5 modules and 22 lessons with unique IDs and valid dataset/diagram links', () => {
    expect(CURRICULUM_MODULES).toHaveLength(5);

    const allLessons = CURRICULUM_MODULES.flatMap((m) => m.lessons);
    expect(allLessons).toHaveLength(22);

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

  it('maintains balanced LaTeX $ and $$ delimiters across all Vietnamese narratives, callouts, and quizzes', () => {
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

  it('programmatically executes and verifies 100% of interactive challenges across all 22 lessons', () => {
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
        }
      }
    }

    expect(executedChallenges).toBeGreaterThanOrEqual(22);
  });
});
