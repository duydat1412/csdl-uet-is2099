import { FunctionalDependencySpec } from '../types';

export interface ClosureStep {
  stepNumber: number;
  ruleUsed: FunctionalDependencySpec;
  added: string[];
  currentSet: string[];
}

export interface ClosureResult {
  seed: string[];
  closure: string[];
  steps: ClosureStep[];
}

export interface LMRPartition {
  sourceL: string[];
  middleM: string[];
  rightOnlyR: string[];
  isolated: string[];
}

export interface CandidateKeyResult {
  partition: LMRPartition;
  candidateKeys: string[][];
  primeAttributes: string[];
  nonPrimeAttributes: string[];
}

export interface NormalFormViolation {
  level: '2NF' | '3NF' | 'BCNF';
  fd: FunctionalDependencySpec;
  reason: string;
}

export interface NormalFormAnalysis {
  attributes: string[];
  normalizedFds: FunctionalDependencySpec[];
  candidateKeys: string[][];
  primeAttributes: string[];
  nonPrimeAttributes: string[];
  highestNormalForm: '1NF' | '2NF' | '3NF' | 'BCNF';
  violations: NormalFormViolation[];
}

export interface LosslessSplitResult {
  isLossless: boolean;
  intersection: string[];
  intersectionClosure: string[];
  reason: string;
}

export interface BCNFDecompositionStep {
  relationAttrs: string[];
  violatingFd: FunctionalDependencySpec;
  splitLeft: string[];
  splitRight: string[];
}

export interface BCNFDecompositionResult {
  steps: BCNFDecompositionStep[];
  finalRelations: Array<{
    name: string;
    attributes: string[];
    candidateKeys: string[][];
  }>;
}

export function splitRightHandSides(
  fds: FunctionalDependencySpec[],
): FunctionalDependencySpec[] {
  const out: FunctionalDependencySpec[] = [];
  const seen = new Set<string>();

  for (const fd of fds) {
    const left = Array.from(new Set(fd.left.map((s) => s.trim()).filter(Boolean))).sort();
    for (const r of fd.right) {
      const attr = r.trim();
      if (!attr || left.includes(attr)) continue;
      const key = `${left.join(',')}->${attr}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ left, right: [attr] });
      }
    }
  }
  return out;
}

export function formatFd(fd: FunctionalDependencySpec): string {
  const joinSide = (attrs: string[]) =>
    attrs.every((a) => a.length === 1) ? attrs.join('') : attrs.join(', ');
  return `${joinSide(fd.left)} -> ${joinSide(fd.right)}`;
}

export function formatFdList(fds: FunctionalDependencySpec[]): string {
  return fds.map(formatFd).join('; ');
}

export function computeAttributeClosure(
  seedAttrs: string[],
  fds: FunctionalDependencySpec[],
): ClosureResult {
  const atomicFds = splitRightHandSides(fds);
  const current = new Set(seedAttrs.map((a) => a.trim()).filter(Boolean));
  const seed = Array.from(current).sort();
  const steps: ClosureStep[] = [];

  let changed = true;
  while (changed) {
    changed = false;
    for (const fd of atomicFds) {
      const lhsSatisfied = fd.left.every((a) => current.has(a));
      if (!lhsSatisfied) continue;
      const added: string[] = [];
      for (const r of fd.right) {
        if (!current.has(r)) {
          current.add(r);
          added.push(r);
          changed = true;
        }
      }
      if (added.length > 0) {
        steps.push({
          stepNumber: steps.length + 1,
          ruleUsed: fd,
          added,
          currentSet: Array.from(current).sort(),
        });
      }
    }
  }

  return {
    seed,
    closure: Array.from(current).sort(),
    steps,
  };
}

export function partitionAttributesLMR(
  attributes: string[],
  fds: FunctionalDependencySpec[],
): LMRPartition {
  const all = Array.from(new Set(attributes.map((a) => a.trim()).filter(Boolean))).sort();
  const atomicFds = splitRightHandSides(fds);

  const inLeft = new Set<string>();
  const inRight = new Set<string>();
  for (const fd of atomicFds) {
    fd.left.forEach((a) => inLeft.add(a));
    fd.right.forEach((a) => inRight.add(a));
  }

  const sourceL: string[] = [];
  const middleM: string[] = [];
  const rightOnlyR: string[] = [];
  const isolated: string[] = [];

  for (const attr of all) {
    const l = inLeft.has(attr);
    const r = inRight.has(attr);
    if (l && r) middleM.push(attr);
    else if (l && !r) sourceL.push(attr);
    else if (!l && r) rightOnlyR.push(attr);
    else isolated.push(attr);
  }

  return { sourceL, middleM, rightOnlyR, isolated };
}

function isSuperset(container: string[], subset: string[]): boolean {
  const set = new Set(container);
  return subset.every((x) => set.has(x));
}

export function findAllCandidateKeys(
  attributes: string[],
  fds: FunctionalDependencySpec[],
): CandidateKeyResult {
  const all = Array.from(new Set(attributes.map((a) => a.trim()).filter(Boolean))).sort();
  const partition = partitionAttributesLMR(all, fds);
  const coreSeed = [...partition.sourceL, ...partition.isolated].sort();
  const middle = partition.middleM;

  const candidateKeys: string[][] = [];

  const isSuperkey = (cand: string[]): boolean => {
    const closure = computeAttributeClosure(cand, fds).closure;
    return isSuperset(closure, all);
  };

  if (coreSeed.length > 0 && isSuperkey(coreSeed)) {
    candidateKeys.push(coreSeed);
  } else {
    // BFS over subset sizes of middleM so minimal keys are found before supersets
    const queue: number[][] = [];
    for (let i = 0; i < middle.length; i += 1) {
      queue.push([i]);
    }
    if (coreSeed.length === 0 && middle.length === 0 && all.length > 0) {
      candidateKeys.push(all);
    }

    while (queue.length > 0) {
      const indices = queue.shift()!;
      const cand = [...coreSeed, ...indices.map((idx) => middle[idx])].sort();

      // Prune if cand is already a superset of any known candidate key
      if (candidateKeys.some((existingKey) => isSuperset(cand, existingKey))) {
        continue;
      }

      if (isSuperkey(cand)) {
        candidateKeys.push(cand);
        continue;
      }

      const lastIdx = indices[indices.length - 1];
      for (let next = lastIdx + 1; next < middle.length; next += 1) {
        queue.push([...indices, next]);
      }
    }
  }

  const primeSet = new Set<string>();
  for (const k of candidateKeys) {
    k.forEach((a) => primeSet.add(a));
  }
  const primeAttributes = Array.from(primeSet).sort();
  const nonPrimeAttributes = all.filter((a) => !primeSet.has(a));

  return {
    partition,
    candidateKeys: candidateKeys.sort((a, b) => a.join(',').localeCompare(b.join(','))),
    primeAttributes,
    nonPrimeAttributes,
  };
}

export function computeMinimalCover(
  fds: FunctionalDependencySpec[],
): FunctionalDependencySpec[] {
  // Step 1: Split RHS to single attributes
  let current = splitRightHandSides(fds);

  // Step 2: Eliminate extraneous attributes on LHS
  current = current.map((fd) => {
    if (fd.left.length <= 1) return fd;
    let reducedLeft = [...fd.left];
    for (const candidateDrop of fd.left) {
      const trialLeft = reducedLeft.filter((a) => a !== candidateDrop);
      if (trialLeft.length === 0) continue;
      const closure = computeAttributeClosure(trialLeft, current).closure;
      if (fd.right.every((r) => closure.includes(r))) {
        reducedLeft = trialLeft;
      }
    }
    return { left: reducedLeft, right: fd.right };
  });

  // Deduplicate after LHS reduction
  current = splitRightHandSides(current);

  // Step 3: Remove redundant FDs one by one
  let idx = 0;
  while (idx < current.length) {
    const candidate = current[idx];
    const withoutCandidate = current.filter((_, j) => j !== idx);
    const closureWithout = computeAttributeClosure(candidate.left, withoutCandidate).closure;
    if (candidate.right.every((r) => closureWithout.includes(r))) {
      current = withoutCandidate;
    } else {
      idx += 1;
    }
  }

  return current;
}

export function checkLosslessBinarySplit(
  allAttrs: string[],
  r1: string[],
  r2: string[],
  fds: FunctionalDependencySpec[],
): LosslessSplitResult {
  const all = Array.from(new Set(allAttrs)).sort();
  const s1 = Array.from(new Set(r1)).sort();
  const s2 = Array.from(new Set(r2)).sort();

  const unionSet = Array.from(new Set([...s1, ...s2])).sort();
  if (!isSuperset(unionSet, all)) {
    return {
      isLossless: false,
      intersection: [],
      intersectionClosure: [],
      reason: `Hợp của R1 ∪ R2 chưa bao phủ hết tất cả thuộc tính ban đầu (${all.join(', ')}).`,
    };
  }

  const s2Set = new Set(s2);
  const intersection = s1.filter((a) => s2Set.has(a));
  if (intersection.length === 0) {
    return {
      isLossless: false,
      intersection: [],
      intersectionClosure: [],
      reason: 'R1 ∩ R2 = ∅ (hai bảng không có thuộc tính chung nên tích nối sẽ sinh bộ giả!).',
    };
  }

  const intersectionClosure = computeAttributeClosure(intersection, fds).closure;
  const determinesR1 = isSuperset(intersectionClosure, s1);
  const determinesR2 = isSuperset(intersectionClosure, s2);

  if (determinesR1 || determinesR2) {
    const target = determinesR1 ? `R1(${s1.join(', ')})` : `R2(${s2.join(', ')})`;
    return {
      isLossless: true,
      intersection,
      intersectionClosure,
      reason: `Bảo toàn thông tin! Vì phần giao (${intersection.join(', ')})+ = {${intersectionClosure.join(', ')}} chứa trọn ${target}, nên phép nối tự nhiên R1 * R2 tái tạo nguyên vẹn quan hệ gốc.`,
    };
  }

  return {
    isLossless: false,
    intersection,
    intersectionClosure,
    reason: `Mất mát thông tin! Phần giao (${intersection.join(', ')})+ = {${intersectionClosure.join(', ')}} không phải siêu khóa của R1 hay R2.`,
  };
}

export function analyzeNormalForms(
  attributes: string[],
  fds: FunctionalDependencySpec[],
): NormalFormAnalysis {
  const all = Array.from(new Set(attributes.map((a) => a.trim()).filter(Boolean))).sort();
  const normalizedFds = splitRightHandSides(fds);
  const keyResult = findAllCandidateKeys(all, normalizedFds);
  const primeSet = new Set(keyResult.primeAttributes);

  const violations: NormalFormViolation[] = [];

  for (const fd of normalizedFds) {
    const rhsAttr = fd.right[0];
    const lhsClosure = computeAttributeClosure(fd.left, normalizedFds).closure;
    const lhsIsSuperkey = isSuperset(lhsClosure, all);
    const rhsIsPrime = primeSet.has(rhsAttr);

    if (!lhsIsSuperkey) {
      violations.push({
        level: 'BCNF',
        fd,
        reason: `${fd.left.join('')} không phải siêu khóa của lược đồ nhưng xác định ${rhsAttr}.`,
      });

      if (!rhsIsPrime) {
        violations.push({
          level: '3NF',
          fd,
          reason: `${fd.left.join('')} không phải siêu khóa và thuộc tính vế phải ${rhsAttr} không phải thuộc tính khóa.`,
        });

        const partialKey = keyResult.candidateKeys.find(
          (k) => fd.left.length < k.length && isSuperset(k, fd.left),
        );
        if (partialKey) {
          violations.push({
            level: '2NF',
            fd,
            reason: `Phụ thuộc bộ phận: thuộc tính không khóa ${rhsAttr} phụ thuộc vào tập con thực sự {${fd.left.join(', ')}} của khóa {${partialKey.join(', ')}}.`,
          });
        }
      }
    }
  }

  let highestNormalForm: NormalFormAnalysis['highestNormalForm'] = 'BCNF';
  if (violations.some((v) => v.level === '2NF')) {
    highestNormalForm = '1NF';
  } else if (violations.some((v) => v.level === '3NF')) {
    highestNormalForm = '2NF';
  } else if (violations.some((v) => v.level === 'BCNF')) {
    highestNormalForm = '3NF';
  }

  return {
    attributes: all,
    normalizedFds,
    candidateKeys: keyResult.candidateKeys,
    primeAttributes: keyResult.primeAttributes,
    nonPrimeAttributes: keyResult.nonPrimeAttributes,
    highestNormalForm,
    violations,
  };
}

function projectFdsOntoSubset(
  subAttrs: string[],
  originalFds: FunctionalDependencySpec[],
): FunctionalDependencySpec[] {
  const subSet = new Set(subAttrs);
  const projected: FunctionalDependencySpec[] = [];

  // Enumerate subsets X of subAttrs to recover all implied dependencies X -> (X+ ∩ subAttrs)
  const n = subAttrs.length;
  const maxMask = 1 << Math.min(n, 10);
  for (let mask = 1; mask < maxMask; mask += 1) {
    const lhs: string[] = [];
    for (let i = 0; i < n && i < 10; i += 1) {
      if (mask & (1 << i)) lhs.push(subAttrs[i]);
    }
    const closure = computeAttributeClosure(lhs, originalFds).closure;
    const rhsInSub = closure.filter((a) => subSet.has(a) && !lhs.includes(a));
    for (const r of rhsInSub) {
      projected.push({ left: lhs, right: [r] });
    }
  }

  return computeMinimalCover(projected);
}

export function decomposeToBCNF(
  attributes: string[],
  fds: FunctionalDependencySpec[],
): BCNFDecompositionResult {
  const all = Array.from(new Set(attributes)).sort();
  const normalizedOriginal = splitRightHandSides(fds);
  const steps: BCNFDecompositionStep[] = [];
  let pending: string[][] = [all];
  const finished: string[][] = [];

  let safety = 0;
  while (pending.length > 0 && safety < 25) {
    safety += 1;
    const rel = pending.shift()!;
    const relFds = projectFdsOntoSubset(rel, normalizedOriginal);
    const analysis = analyzeNormalForms(rel, relFds);

    const bcnfViolation = analysis.violations.find((v) => v.level === 'BCNF');
    if (!bcnfViolation) {
      finished.push(rel);
      continue;
    }

    const x = bcnfViolation.fd.left;
    const xClosureInRel = computeAttributeClosure(x, relFds).closure.filter((a) =>
      rel.includes(a),
    );
    const splitRight = Array.from(new Set([...x, ...xClosureInRel])).sort();
    const yOnly = splitRight.filter((a) => !x.includes(a));
    const splitLeft = rel.filter((a) => !yOnly.includes(a));

    steps.push({
      relationAttrs: rel,
      violatingFd: { left: x, right: yOnly },
      splitLeft,
      splitRight,
    });

    pending.push(splitRight, splitLeft);
  }

  finished.push(...pending);

  const finalRelations = finished.map((attrs, idx) => {
    const localFds = projectFdsOntoSubset(attrs, normalizedOriginal);
    const keys = findAllCandidateKeys(attrs, localFds).candidateKeys;
    return {
      name: `R${idx + 1}`,
      attributes: attrs,
      candidateKeys: keys,
    };
  });

  return { steps, finalRelations };
}

export interface FDPresetSpec {
  id: string;
  title: string;
  relationName: string;
  attributes: string[];
  fds: FunctionalDependencySpec[];
  description: string;
}

export const UET_FD_PRESETS: FDPresetSpec[] = [
  {
    id: 'flat-bangdiem',
    title: 'BANGDIEM_FLAT (C4_1.pdf tr. 5 — Vi phạm 2NF)',
    relationName: 'BANGDIEM_FLAT',
    attributes: ['Masv', 'Ho', 'Ten', 'Mamon', 'Tenmon', 'Diem'],
    fds: [
      { left: ['Masv'], right: ['Ho', 'Ten'] },
      { left: ['Mamon'], right: ['Tenmon'] },
      { left: ['Masv', 'Mamon'], right: ['Diem'] },
    ],
    description: 'Bảng gộp điểm sinh viên kinh điển chỉ đạt chuẩn 1NF do tồn tại phụ thuộc bộ phận.',
  },
  {
    id: 'nv-donvi-2nf',
    title: 'NHANVIEN_DONVI (C4_1.pdf tr. 46 — Đạt 2NF, chưa đạt 3NF)',
    relationName: 'NHANVIEN_DONVI',
    attributes: ['Manv', 'Hoten', 'Madv', 'Tendv', 'Truongdv'],
    fds: [
      { left: ['Manv'], right: ['Hoten', 'Madv'] },
      { left: ['Madv'], right: ['Tendv', 'Truongdv'] },
    ],
    description: 'Khóa là Manv, nhưng Madv → Tendv gây phụ thuộc bắc cầu.',
  },
  {
    id: 'lop-gv-bcnf',
    title: 'DANGKY_GV (C4_1.pdf tr. 58 — Đạt 3NF, vi phạm BCNF)',
    relationName: 'DANGKY_GV',
    attributes: ['MaSV', 'MonHoc', 'GiaoVien'],
    fds: [
      { left: ['MaSV', 'MonHoc'], right: ['GiaoVien'] },
      { left: ['GiaoVien'], right: ['MonHoc'] },
    ],
    description: 'Mẫu 3NF nhưng chưa BCNF kinh điển trong đề thi cuối kỳ UET.',
  },
  {
    id: 'exam-multi-key',
    title: 'Bài tập Tìm Khóa Đa Khóa R(A,B,C,D,E)',
    relationName: 'R',
    attributes: ['A', 'B', 'C', 'D', 'E'],
    fds: [
      { left: ['A', 'B'], right: ['C'] },
      { left: ['C'], right: ['D', 'E'] },
      { left: ['D'], right: ['A'] },
    ],
    description: 'B xuất hiện ở vế trái nên nằm trong mọi khóa; A, C, D nằm ở M tạo thành nhiều khóa dự tuyển.',
  },
];
