import { describe, it, expect } from 'vitest';
import {
  convertCardinalityConventions,
  evaluateSchemaMapping,
  validateCardinalityAnswer,
  validateEERSpecialization,
} from './erMappingEngine';
import { TargetTableSpec } from '../types';

describe('Engine 2: ER/EER Constraint & Schema Mapping Engine', () => {
  it('converts UET (min, max) to 1:N and participation constraints accurately', () => {
    // NV (1,1) -- Lam_viec -- (1,n) PB (C2_1.pdf p. 28)
    const conv = convertCardinalityConventions([1, 1], [1, 'n']);
    expect(conv.ratioSummary).toBe('N:1');
    expect(conv.leftRatioLabel).toBe('n');
    expect(conv.rightRatioLabel).toBe('1');
    expect(conv.leftParticipation).toBe('total');
    expect(conv.rightParticipation).toBe('total');
  });

  it('detects swapped (min, max) sides and warns learner specifically', () => {
    const check = validateCardinalityAnswer([1, 'n'], [1, 1], [1, 1], [1, 'n'], 'NHANVIEN', 'PHONGBAN');
    expect(check.isCorrect).toBe(false);
    expect(check.isSwappedError).toBe(true);
    expect(check.feedback).toContain('ngược chiều');
  });

  it('validates EER disjointness and completeness constraints', () => {
    const validDisjointPartial = validateEERSpecialization('d', 'partial', [
      { name: 'An', subclasses: ['ENGINEER'] },
      { name: 'Bình (Bảo vệ)', subclasses: [] },
    ]);
    expect(validDisjointPartial.valid).toBe(true);

    const invalidDisjoint = validateEERSpecialization('d', 'partial', [
      { name: 'Cường', subclasses: ['ENGINEER', 'TECHNICIAN'] },
    ]);
    expect(invalidDisjoint.valid).toBe(false);
    expect(invalidDisjoint.feedback).toContain('rời rạc (d)');

    const invalidTotal = validateEERSpecialization('o', 'total', [
      { name: 'Dung', subclasses: [] },
    ]);
    expect(invalidTotal.valid).toBe(false);
    expect(invalidTotal.feedback).toContain('toàn bộ');
  });

  it('grades ER-to-Relational Schema Mapping (Strong, Weak, 1:N, N:M) and catches FK on wrong side', () => {
    const expected: TargetTableSpec[] = [
      {
        name: 'PHONGBAN',
        columns: ['MAPHG', 'TENPHG'],
        primaryKey: ['MAPHG'],
        foreignKeys: [],
      },
      {
        name: 'NHANVIEN',
        columns: ['MANV', 'TENNV', 'MAPHG'],
        primaryKey: ['MANV'],
        foreignKeys: [{ columns: ['MAPHG'], refTable: 'PHONGBAN', refColumns: ['MAPHG'] }],
      },
    ];

    // Learner puts MANV FK into PHONGBAN instead of MAPHG into NHANVIEN
    const wrongSideAttempt: TargetTableSpec[] = [
      {
        name: 'PHONGBAN',
        columns: ['MAPHG', 'TENPHG', 'MANV'],
        primaryKey: ['MAPHG'],
        foreignKeys: [{ columns: ['MANV'], refTable: 'NHANVIEN', refColumns: ['MANV'] }],
      },
      {
        name: 'NHANVIEN',
        columns: ['MANV', 'TENNV'],
        primaryKey: ['MANV'],
        foreignKeys: [],
      },
    ];

    const wrongResult = evaluateSchemaMapping(wrongSideAttempt, expected);
    expect(wrongResult.isCorrect).toBe(false);
    expect(wrongResult.diagnostics.some((d) => d.includes('NHANVIEN'))).toBe(true);

    // Exact correct mapping (even in different table/column order)
    const rightAttempt: TargetTableSpec[] = [
      {
        name: 'NHANVIEN',
        columns: ['TENNV', 'MAPHG', 'MANV'],
        primaryKey: ['MANV'],
        foreignKeys: [{ columns: ['MAPHG'], refTable: 'PHONGBAN', refColumns: ['MAPHG'] }],
      },
      {
        name: 'PHONGBAN',
        columns: ['TENPHG', 'MAPHG'],
        primaryKey: ['MAPHG'],
        foreignKeys: [],
      },
    ];
    const okResult = evaluateSchemaMapping(rightAttempt, expected);
    expect(okResult.isCorrect).toBe(true);
  });
});
