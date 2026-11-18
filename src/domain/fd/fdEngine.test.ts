import { describe, it, expect } from 'vitest';
import {
  analyzeNormalForms,
  checkLosslessBinarySplit,
  computeAttributeClosure,
  computeMinimalCover,
  decomposeToBCNF,
  findAllCandidateKeys,
  formatFdList,
  partitionAttributesLMR,
} from './fdEngine';

describe('Engine 4: Functional Dependencies, Closure X+, Keys & 1NF–BCNF Normalization', () => {
  it('computes X+ step-by-step trace accurately for Armstrong closures', () => {
    const fds = [
      { left: ['A'], right: ['B', 'C'] },
      { left: ['C', 'D'], right: ['E'] },
      { left: ['B'], right: ['D'] },
      { left: ['E'], right: ['A'] },
    ];
    const res = computeAttributeClosure(['A'], fds);
    expect(res.closure).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(res.steps.length).toBeGreaterThanOrEqual(4);
  });

  it('partitions L / M / R and finds ALL candidate keys accurately', () => {
    // Classic UET multi-key example: R(A,B,C,D), F = {A->B, B->C, C->D, D->A} -> keys A, B, C, D
    const cycleAttrs = ['A', 'B', 'C', 'D'];
    const cycleFds = [
      { left: ['A'], right: ['B'] },
      { left: ['B'], right: ['C'] },
      { left: ['C'], right: ['D'] },
      { left: ['D'], right: ['A'] },
    ];
    const keysCycle = findAllCandidateKeys(cycleAttrs, cycleFds);
    expect(keysCycle.candidateKeys).toEqual([['A'], ['B'], ['C'], ['D']]);

    // R(A,B,C,D,E,G), F = {AB->C, C->A, BC->D, ACD->B, BE->C, CE->FA, CF->BD, D->EF}
    // Wait: let's test clean L/M/R partitioning: G appears nowhere -> must be in every key!
    const attrs = ['A', 'B', 'C', 'D', 'G'];
    const fds = [
      { left: ['A', 'B'], right: ['C'] },
      { left: ['C'], right: ['D'] },
      { left: ['B'], right: ['A'] },
    ];
    const part = partitionAttributesLMR(attrs, fds);
    expect(part.isolated).toEqual(['G']);
    expect(part.sourceL).toEqual(['B']);
    expect(part.rightOnlyR).toEqual(['D']);

    const keysRes = findAllCandidateKeys(attrs, fds);
    // B -> A -> AB -> C -> D, plus G isolated => BG is the unique candidate key!
    expect(keysRes.candidateKeys).toEqual([['B', 'G']]);
  });

  it('detects 1NF, 2NF, 3NF, BCNF accurately and checks lossless binary join + BCNF decomposition', () => {
    // 1NF only: BANGDIEM_FLAT(Masv, Ho, Ten, Mamon, Tenmon, Diem) with Masv->Ho,Ten; Mamon->Tenmon; Masv,Mamon->Diem
    const flatAnalysis = analyzeNormalForms(
      ['Masv', 'Ho', 'Ten', 'Mamon', 'Tenmon', 'Diem'],
      [
        { left: ['Masv'], right: ['Ho', 'Ten'] },
        { left: ['Mamon'], right: ['Tenmon'] },
        { left: ['Masv', 'Mamon'], right: ['Diem'] },
      ],
    );
    expect(flatAnalysis.candidateKeys).toEqual([['Mamon', 'Masv']]);
    expect(flatAnalysis.highestNormalForm).toBe('1NF');

    // 2NF only (transitive dependency): NHANVIEN_DONVI(Manv, Ten, Maphg, Tenphg)
    const twoNfAnalysis = analyzeNormalForms(
      ['Manv', 'Ten', 'Maphg', 'Tenphg'],
      [
        { left: ['Manv'], right: ['Ten', 'Maphg'] },
        { left: ['Maphg'], right: ['Tenphg'] },
      ],
    );
    expect(twoNfAnalysis.highestNormalForm).toBe('2NF');

    // 3NF but NOT BCNF (classic C4_1 example: LOP_GV(MaSV, MonHoc, GiaoVien) with {MaSV,MonHoc}->GiaoVien and GiaoVien->MonHoc)
    const threeNfOnly = analyzeNormalForms(
      ['MaSV', 'MonHoc', 'GiaoVien'],
      [
        { left: ['MaSV', 'MonHoc'], right: ['GiaoVien'] },
        { left: ['GiaoVien'], right: ['MonHoc'] },
      ],
    );
    expect(threeNfOnly.highestNormalForm).toBe('3NF');

    // BCNF decomposition splits GiaoVien -> MonHoc losslessly
    const bcnfDecomp = decomposeToBCNF(
      ['MaSV', 'MonHoc', 'GiaoVien'],
      [
        { left: ['MaSV', 'MonHoc'], right: ['GiaoVien'] },
        { left: ['GiaoVien'], right: ['MonHoc'] },
      ],
    );
    expect(bcnfDecomp.finalRelations.length).toBe(2);

    // Lossless check
    const lossless = checkLosslessBinarySplit(
      ['Manv', 'Ten', 'Maphg', 'Tenphg'],
      ['Manv', 'Ten', 'Maphg'],
      ['Maphg', 'Tenphg'],
      [
        { left: ['Manv'], right: ['Ten', 'Maphg'] },
        { left: ['Maphg'], right: ['Tenphg'] },
      ],
    );
    expect(lossless.isLossless).toBe(true);

    // Minimal cover removes redundant/extraneous
    const minCov = computeMinimalCover([
      { left: ['A'], right: ['B', 'C'] },
      { left: ['B'], right: ['C'] },
      { left: ['A', 'B'], right: ['C'] },
    ]);
    expect(formatFdList(minCov)).toBe('A -> B; B -> C');
    expect(formatFdList([{ left: ['Manv'], right: ['Hoten', 'Madv'] }])).toBe(
      'Manv -> Hoten, Madv',
    );
  });
});
