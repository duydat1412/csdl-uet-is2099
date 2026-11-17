import { describe, it, expect } from 'vitest';
import { UET_DATASETS, validateDatabaseIntegrity } from './uetDatasets';
import { UET_ER_DIAGRAMS } from './uetERDiagrams';

describe('UET Authentic Datasets & ER Diagrams', () => {
  it('contains all core UET datasets with valid primary keys and foreign keys', () => {
    const requiredIds = [
      'DAOTAO_FLAT',
      'NHANVIEN_PHONG_FLAT',
      'DAOTAO',
      'DAOTAO_OUTER',
      'CONGTY_PHG',
      'CONGTY_EX',
      'KYNANG_DB',
      'BANHANG_DB',
      'SET_OPS_TOY',
      'JOIN_TOY',
      'DIV_TOY',
      'AGG_TOY',
    ];

    for (const id of requiredIds) {
      const db = UET_DATASETS[id];
      expect(db, `Missing dataset ${id}`).toBeDefined();
      const errors = validateDatabaseIntegrity(db);
      expect(errors, `Integrity errors in ${id}: ${errors.join('; ')}`).toEqual([]);
    }
  });

  it('populates non-empty tuples for CONGTY_EX and BANHANG_DB so final exercises return real rows', () => {
    const congty = UET_DATASETS.CONGTY_EX;
    expect(congty.relations.NHANVIEN.rows.length).toBeGreaterThanOrEqual(6);
    expect(congty.relations.DONVI.rows.length).toBeGreaterThanOrEqual(3);
    expect(congty.relations.DEAN.rows.length).toBeGreaterThanOrEqual(4);
    expect(congty.relations.NV_DEAN.rows.length).toBeGreaterThanOrEqual(6);
    expect(congty.relations.THANNHAN.rows.length).toBeGreaterThanOrEqual(4);

    const banhang = UET_DATASETS.BANHANG_DB;
    expect(banhang.relations.BanHang.rows.length).toBeGreaterThanOrEqual(6);
    expect(banhang.relations.Hanghoa.rows.length).toBeGreaterThanOrEqual(4);
  });

  it('defines authentic UET ER and EER diagrams', () => {
    expect(UET_ER_DIAGRAMS.NV_PB_BASIC).toBeDefined();
    expect(UET_ER_DIAGRAMS.CONGTY_ER).toBeDefined();
    expect(UET_ER_DIAGRAMS.NHANVIEN_THANNHAN_WEAK).toBeDefined();
    expect(UET_ER_DIAGRAMS.EMPLOYEE_EER).toBeDefined();
    expect(UET_ER_DIAGRAMS.DAOTAO_EER).toBeDefined();
    expect(UET_ER_DIAGRAMS.VEHICLE_UNION_EER).toBeDefined();
  });
});
