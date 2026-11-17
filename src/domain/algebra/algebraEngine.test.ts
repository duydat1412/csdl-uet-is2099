import { describe, it, expect } from 'vitest';
import { UET_DATASETS } from '../datasets/uetDatasets';
import { compareRelations, evaluateAlgebraProgram, formatProgramToLatex } from './evaluator';

describe('Engine 3: Relational Algebra Parser, LaTeX Formatter & Set Evaluator', () => {
  it('evaluates Union, Intersection, Difference and rejects non-union-compatible relations', () => {
    const db = UET_DATASETS.SET_OPS_TOY;

    const unionRes = evaluateAlgebraProgram(db, 'R ∪ S');
    expect(unionRes.error).toBeUndefined();
    expect(unionRes.finalResult?.rows).toHaveLength(4); // (α,1),(α,2),(β,1),(β,3)

    const diffRes = evaluateAlgebraProgram(db, 'R - S');
    expect(diffRes.finalResult?.rows).toEqual([
      { A: 'α', B: 1 },
      { A: 'β', B: 1 },
    ]);

    const interRes = evaluateAlgebraProgram(db, 'R ∩ S');
    expect(interRes.finalResult?.rows).toEqual([{ A: 'α', B: 2 }]);

    // Incompatible schemas (degree mismatch & domain mismatch) -> clear Vietnamese error
    const badDegree = evaluateAlgebraProgram(db, 'GIAOVIEN ∪ MONHOC_SMALL');
    expect(badDegree.error).toContain('khả hợp');

    const badDomain = evaluateAlgebraProgram(db, 'R ∪ π_{SoTC, MaMH}(MONHOC_SMALL)');
    expect(badDomain.error).toContain('khả hợp');
  });

  it('evaluates Selection σ and Projection π with Set deduplication (C3_2.pdf pp. 28, 34)', () => {
    const db = UET_DATASETS.JOIN_TOY;

    const selRes = evaluateAlgebraProgram(db, 'σ_{A=B ∧ D>5}(R_SEL)');
    expect(selRes.error).toBeUndefined();
    expect(selRes.finalResult?.rows).toEqual([
      { A: 'α', B: 'α', C: 1, D: 7 },
      { A: 'β', B: 'β', C: 23, D: 10 },
    ]);

    // Projection deduplicates (α,1) appearing twice in R_PROJ (C3_2 p. 34)
    const projRes = evaluateAlgebraProgram(db, 'π_{A, C}(R_PROJ)');
    expect(projRes.finalResult?.rows).toHaveLength(3);
    expect(projRes.steps[0].ast.intermediateResult?.rows).toHaveLength(3);
  });

  it('handles Cartesian product column disambiguation, Theta join, Natural join, and Outer joins', () => {
    const db = UET_DATASETS.JOIN_TOY;

    // C3_2 p. 51: R_CART x S_CART qualifies shared B as R_CART.B and S_CART.B
    const cartRes = evaluateAlgebraProgram(db, 'R_CART × S_CART');
    expect(cartRes.error).toBeUndefined();
    expect(cartRes.finalResult?.rows).toHaveLength(8);
    expect(cartRes.finalResult?.schema.attributes.map((a) => a.name)).toEqual([
      'A',
      'R_CART.B',
      'S_CART.B',
      'C',
      'D',
    ]);

    // C3_2 p. 52: σ_{A=S_CART.B}(R_CART × S_CART) -> 3 rows
    const cartFilterRes = evaluateAlgebraProgram(db, 'σ_{A=S_CART.B}(R_CART × S_CART)');
    expect(cartFilterRes.finalResult?.rows).toHaveLength(3);

    // C3_2 p. 65: R_THETA ⨝_{B<D} S_THETA -> 3 pairs: (2<3), (2<6), (5<6)
    const thetaRes = evaluateAlgebraProgram(db, 'R_THETA ⨝_{B<D} S_THETA');
    expect(thetaRes.finalResult?.rows).toHaveLength(3);

    // C3_2 pp. 61-62 & 104: Natural join drops null Lop (10005) while Left Outer Join keeps it
    const daoOuter = UET_DATASETS.DAOTAO_OUTER;
    const natRes = evaluateAlgebraProgram(daoOuter, 'SINHVIEN * SV_LOPMH');
    expect(natRes.finalResult?.rows).toHaveLength(4);

    const lojRes = evaluateAlgebraProgram(
      daoOuter,
      'π_{SINHVIEN.Masv, Ho, Dem, Ten, Malop, Diem}(SINHVIEN ⟕_{SINHVIEN.Masv = SV_LOPMH.Masv} SV_LOPMH)',
    );
    expect(lojRes.error).toBeUndefined();
    expect(lojRes.finalResult?.rows).toHaveLength(7);
    const c1 = lojRes.finalResult?.rows.find((r) => r.Masv === 'C1');
    expect(c1?.Malop).toBeNull();
  });

  it('evaluates Multi-line Assignments, Rename ρ, and records intermediate AST steps (C3_2.pdf p. 46)', () => {
    const db = UET_DATASETS.CONGTY_PHG;
    const prog = `
      NV_P4 ← σ_{PHG=4}(NHANVIEN)
      KQ ← π_{HONV, TENNV}(NV_P4)
      ρ_{(HO, TEN)}(KQ)
    `;
    const res = evaluateAlgebraProgram(db, prog);
    expect(res.error).toBeUndefined();
    expect(res.steps).toHaveLength(3);
    expect(res.finalResult?.schema.attributes.map((a) => a.name)).toEqual(['HO', 'TEN']);
    expect(res.finalResult?.rows).toHaveLength(3);
  });

  it('evaluates Division ÷ AND produces the exact 4-step breakdown T1, S×T1, T2, T1−T2 (C3_2.pdf pp. 81–84)', () => {
    const divDb = UET_DATASETS.DIV_TOY;
    const res = evaluateAlgebraProgram(divDb, 'R ÷ S');
    expect(res.error).toBeUndefined();
    expect(res.finalResult?.rows).toEqual([
      { C: 'x1', D: 'y1' },
      { C: 'x1', D: 'y2' },
      { C: 'x2', D: 'y1' },
    ]);

    const breakdown = res.steps[0].ast.divisionBreakdown;
    expect(breakdown).toBeDefined();
    expect(breakdown?.T1.rows).toHaveLength(6);
    expect(breakdown?.T2.rows).toHaveLength(3);
    expect(breakdown?.finalT.rows).toHaveLength(3);

    // KYNANG_DB (C3_2 p. 75): A1 has all 3 skills
    const knRes = evaluateAlgebraProgram(UET_DATASETS.KYNANG_DB, 'NV_KYNANG ÷ KYNANG');
    expect(knRes.finalResult?.rows).toEqual([{ MaNV: 'A1' }]);
  });

  it('evaluates Grouping & Aggregate functions distinguishing COUNT(B) vs COUNT(*) (C3_2.pdf pp. 92, 94, 97)', () => {
    const aggDb = UET_DATASETS.AGG_TOY;

    const counts = evaluateAlgebraProgram(aggDb, 'ℱ_{SUM(A), AVG(A), MIN(A), MAX(B), COUNT(B), COUNT(*)}(R_AGG)');
    expect(counts.error).toBeUndefined();
    expect(counts.finalResult?.rows[0]).toEqual({
      'SUM(A)': 6,
      'AVG(A)': 1.5,
      'MIN(A)': 1,
      'MAX(B)': 4,
      'COUNT(B)': 3,
      'COUNT(*)': 4,
    });

    const grp = evaluateAlgebraProgram(aggDb, 'ρ_{(A, Sum_c)}(A ℱ_{SUM(C)}(R_GRP))');
    expect(grp.error).toBeUndefined();
    expect(grp.finalResult?.rows).toEqual([
      { A: 'α', Sum_c: 14 },
      { A: 'β', Sum_c: 3 },
      { A: 'γ', Sum_c: 10 },
    ]);

    // C3_2 p. 97: highest salary via R1 * NHANVIEN
    const congty = UET_DATASETS.CONGTY_PHG;
    const maxSal = evaluateAlgebraProgram(
      congty,
      'R1 ← ρ_{(LUONG)}(ℱ_{MAX(LUONG)}(NHANVIEN))\nR1 * NHANVIEN',
    );
    expect(maxSal.error).toBeUndefined();
    expect(maxSal.finalResult?.rows).toHaveLength(1);
    expect(maxSal.finalResult?.rows[0].TENNV).toBe('Vinh');
  });

  it('formats expressions into crisp KaTeX LaTeX preview strings and compares relation results', () => {
    const tex = formatProgramToLatex('π_{HONV, TENNV}(σ_{PHG=4 ∧ LUONG>=30000}(NHANVIEN))');
    expect(tex).toContain('\\pi_');
    expect(tex).toContain('\\sigma_');
    expect(tex).toContain('\\land');
    expect(tex).toContain('\\geq');

    const db = UET_DATASETS.CONGTY_PHG;
    const res1 = evaluateAlgebraProgram(db, 'π_{TENNV}(σ_{PHG=4}(NHANVIEN))');
    const res2 = evaluateAlgebraProgram(db, 'σ_{PHG=4}(NHANVIEN)\nπ_{TENNV}(σ_{PHG=4}(NHANVIEN))');
    expect(res1.finalResult && res2.finalResult).toBeTruthy();
    const cmp = compareRelations(res1.finalResult!, res2.finalResult!);
    expect(cmp.isEqual).toBe(true);
  });
});
