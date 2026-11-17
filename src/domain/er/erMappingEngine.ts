import { TargetTableSpec } from '../types';

export type MinMaxPair = [number, number | 'n'];

export interface CardinalityConversion {
  ratioSummary: '1:1' | '1:N' | 'N:1' | 'N:M';
  leftRatioLabel: string;
  rightRatioLabel: string;
  leftParticipation: 'total' | 'partial';
  rightParticipation: 'total' | 'partial';
}

function isMany(maxVal: number | 'n'): boolean {
  return maxVal === 'n' || maxVal > 1;
}

function pairsEqual(a: MinMaxPair, b: MinMaxPair): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export function formatMinMax(pair: MinMaxPair): string {
  return `(${pair[0]},${pair[1]})`;
}

/**
 * Converts UET/Elmasri (min, max) participation pairs on E1 -- R -- E2
 * into classical cardinality ratio labels placed on the respective ends.
 */
export function convertCardinalityConventions(
  leftMinMax: MinMaxPair,
  rightMinMax: MinMaxPair,
): CardinalityConversion {
  const leftParticipatesMany = isMany(leftMinMax[1]);
  const rightParticipatesMany = isMany(rightMinMax[1]);

  let ratioSummary: CardinalityConversion['ratioSummary'] = '1:1';
  let leftRatioLabel = '1';
  let rightRatioLabel = '1';

  if (leftParticipatesMany && rightParticipatesMany) {
    ratioSummary = 'N:M';
    leftRatioLabel = 'n';
    rightRatioLabel = 'm';
  } else if (rightParticipatesMany && !leftParticipatesMany) {
    ratioSummary = 'N:1';
    leftRatioLabel = 'n';
    rightRatioLabel = '1';
  } else if (leftParticipatesMany && !rightParticipatesMany) {
    ratioSummary = '1:N';
    leftRatioLabel = '1';
    rightRatioLabel = 'n';
  }

  return {
    ratioSummary,
    leftRatioLabel,
    rightRatioLabel,
    leftParticipation: leftMinMax[0] > 0 ? 'total' : 'partial',
    rightParticipation: rightMinMax[0] > 0 ? 'total' : 'partial',
  };
}

export interface CardinalityCheckResult {
  isCorrect: boolean;
  isSwappedError: boolean;
  feedback: string;
}

export function validateCardinalityAnswer(
  userLeft: MinMaxPair,
  userRight: MinMaxPair,
  expectedLeft: MinMaxPair,
  expectedRight: MinMaxPair,
  leftEntityName: string,
  rightEntityName: string,
): CardinalityCheckResult {
  if (pairsEqual(userLeft, expectedLeft) && pairsEqual(userRight, expectedRight)) {
    return {
      isCorrect: true,
      isSwappedError: false,
      feedback: `Chính xác! Mỗi thực thể ${leftEntityName} tham gia tối thiểu ${expectedLeft[0]} và tối đa ${expectedLeft[1]} lần; mỗi ${rightEntityName} tham gia tối thiểu ${expectedRight[0]} và tối đa ${expectedRight[1]} lần.`,
    };
  }

  if (
    pairsEqual(userLeft, expectedRight) &&
    pairsEqual(userRight, expectedLeft) &&
    !pairsEqual(expectedLeft, expectedRight)
  ) {
    return {
      isCorrect: false,
      isSwappedError: true,
      feedback: `Cẩn thận bẫy ngược chiều (min, max)! Bạn đang đặt cặp của ${leftEntityName} sang đầu ${rightEntityName} và ngược lại. Mẹo nhớ UET: Đứng tại thực thể nào, đọc câu "1 ${leftEntityName} liên kết với mấy ${rightEntityName}?" rồi ghi cặp ${formatMinMax(expectedLeft)} ngay sát ${leftEntityName}.`,
    };
  }

  return {
    isCorrect: false,
    isSwappedError: false,
    feedback: `Chưa khớp với mô tả bài toán. Gợi ý: Kiểm tra lại số lần tối thiểu (0 là không bắt buộc / bộ phận, 1 là bắt buộc / toàn bộ) và tối đa (1 hay n) ở mỗi đầu ${leftEntityName} và ${rightEntityName}.`,
  };
}

export interface EERSampleEntity {
  name: string;
  subclasses: string[];
}

export interface EERValidationResult {
  valid: boolean;
  feedback: string;
}

export function validateEERSpecialization(
  disjointness: 'd' | 'o',
  completeness: 'total' | 'partial',
  samples: EERSampleEntity[],
): EERValidationResult {
  for (const sample of samples) {
    if (disjointness === 'd' && sample.subclasses.length > 1) {
      return {
        valid: false,
        feedback: `Vi phạm ràng buộc rời rạc (d): Cá thể "${sample.name}" đang đồng thời thuộc ${sample.subclasses.length} lớp con (${sample.subclasses.join(', ')}). Với ký hiệu (d), mỗi cá thể chỉ thuộc tối đa 1 lớp con.`,
      };
    }
    if (completeness === 'total' && sample.subclasses.length === 0) {
      return {
        valid: false,
        feedback: `Vi phạm ràng buộc toàn bộ (Total - nét đôi): Cá thể "${sample.name}" thuộc lớp cha nhưng chưa thuộc bất kỳ lớp con nào.`,
      };
    }
  }

  return {
    valid: true,
    feedback: 'Tất cả cá thể mẫu đều thỏa mãn ràng buộc chuyên biệt hóa đã chọn.',
  };
}

export interface SchemaMappingResult {
  isCorrect: boolean;
  scorePercent: number;
  diagnostics: string[];
}

function normalizeSet(items: string[]): string[] {
  return Array.from(new Set(items.map((x) => x.trim().toUpperCase()))).sort();
}

function serializeFkList(fks: TargetTableSpec['foreignKeys']): string[] {
  return fks
    .map((fk) => `${normalizeSet(fk.columns).join(',')}->${fk.refTable.trim().toUpperCase()}(${normalizeSet(fk.refColumns).join(',')})`)
    .sort();
}

export function evaluateSchemaMapping(
  userTables: TargetTableSpec[],
  expectedTables: TargetTableSpec[],
): SchemaMappingResult {
  const diagnostics: string[] = [];
  let matchedTables = 0;

  const userByName = new Map<string, TargetTableSpec>();
  for (const t of userTables) {
    userByName.set(t.name.trim().toUpperCase(), t);
  }

  const expectedByName = new Map<string, TargetTableSpec>();
  for (const t of expectedTables) {
    expectedByName.set(t.name.trim().toUpperCase(), t);
  }

  for (const [expKey, expTable] of expectedByName.entries()) {
    const uTable = userByName.get(expKey);
    if (!uTable) {
      diagnostics.push(`Thiếu bảng quan hệ "${expTable.name}".`);
      continue;
    }

    const expCols = normalizeSet(expTable.columns);
    const uCols = normalizeSet(uTable.columns);
    const missingCols = expCols.filter((c) => !uCols.includes(c));
    const extraCols = uCols.filter((c) => !expCols.includes(c));

    const expPk = normalizeSet(expTable.primaryKey);
    const uPk = normalizeSet(uTable.primaryKey);
    const pkMatches = JSON.stringify(expPk) === JSON.stringify(uPk);

    const expFks = serializeFkList(expTable.foreignKeys);
    const uFks = serializeFkList(uTable.foreignKeys);
    const fkMatches = JSON.stringify(expFks) === JSON.stringify(uFks);

    if (missingCols.length === 0 && extraCols.length === 0 && pkMatches && fkMatches) {
      matchedTables += 1;
    } else {
      if (missingCols.length > 0) {
        diagnostics.push(
          `Bảng ${expTable.name} đang thiếu thuộc tính: ${missingCols.join(', ')} (kiểm tra lại khóa ngoại từ phía 1 hoặc thuộc tính của liên kết).`,
        );
      }
      if (extraCols.length > 0) {
        diagnostics.push(
          `Bảng ${expTable.name} đang dư thuộc tính: ${extraCols.join(', ')} (kiểm tra xem thuộc tính đa trị hoặc khóa ngoại có đặt nhầm bảng không).`,
        );
      }
      if (!pkMatches) {
        diagnostics.push(
          `Khóa chính (PK) của bảng ${expTable.name} chưa đúng (hãy kiểm tra quy tắc gạch chân PK, đặc biệt nếu đây là thực thể yếu hoặc bảng tách từ N:M / đa trị).`,
        );
      }
      if (!fkMatches) {
        diagnostics.push(
          `Khóa ngoại (FK) của bảng ${expTable.name} chưa đúng hoặc chưa trỏ về đúng bảng tham chiếu.`,
        );
      }
    }
  }

  for (const uKey of userByName.keys()) {
    if (!expectedByName.has(uKey)) {
      diagnostics.push(`Bảng "${uKey}" không cần thiết (kiểm tra lại liên kết 1:N hoặc 1:1 có bị tách thừa thành bảng riêng không).`);
    }
  }

  const total = Math.max(1, expectedByName.size);
  const scorePercent = Math.round((matchedTables / total) * 100);
  const isCorrect = diagnostics.length === 0 && matchedTables === expectedByName.size;

  return {
    isCorrect,
    scorePercent,
    diagnostics,
  };
}
