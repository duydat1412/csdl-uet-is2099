import { describe, it, expect } from 'vitest';
import { UET_DATASETS } from '../datasets/uetDatasets';
import { executeRelationalUpdate, simulateFlatTableAction } from './anomalyEngine';

describe('Engine 1: Anomaly Simulator & Relational Update Engine', () => {
  it('detects Update Anomaly when renaming Donvi on one row of NHANVIEN_PHONG', () => {
    const table = UET_DATASETS.NHANVIEN_PHONG_FLAT.relations.NHANVIEN_PHONG;
    const result = simulateFlatTableAction(
      table,
      { kind: 'update-single-row', rowIndex: 1, column: 'Donvi', newValue: 'Đào tạo CNTT' },
      { determinant: 'Maql', dependents: ['Donvi'] },
    );

    expect(result.anomalyType).toBe('UPDATE_ANOMALY');
    expect(result.affectedRows).toContain(1);
    expect(result.affectedRows).toContain(2);
    expect(result.affectedRows).toContain(6);
    expect(result.message).toContain('Dị thường sửa đổi');
  });

  it('detects Deletion Anomaly when deleting the last employee of a department', () => {
    const table = UET_DATASETS.NHANVIEN_PHONG_FLAT.relations.NHANVIEN_PHONG;
    const afterFirstDelete = simulateFlatTableAction(
      table,
      { kind: 'delete-row', rowIndex: 3 },
      { determinant: 'Donvi', dependents: ['Maql'] },
    );
    expect(afterFirstDelete.anomalyType).toBe('NONE');

    // Deleting the remaining employee of 'Hành chính' (now at index 3)
    const afterSecondDelete = simulateFlatTableAction(
      afterFirstDelete.updatedRelation,
      { kind: 'delete-row', rowIndex: 3 },
      { determinant: 'Donvi', dependents: ['Maql'] },
    );
    expect(afterSecondDelete.anomalyType).toBe('DELETION_ANOMALY');
    expect(afterSecondDelete.message).toContain('Hành chính');
  });

  it('detects Insertion Anomaly when adding a new course/department without a student/employee PK', () => {
    const table = UET_DATASETS.NHANVIEN_PHONG_FLAT.relations.NHANVIEN_PHONG;
    const result = simulateFlatTableAction(
      table,
      {
        kind: 'insert-partial',
        values: { Manv: null, Ho: null, Dem: null, Ten: null, Donvi: 'AI Lab', Maql: '11099' },
      },
      { determinant: 'Donvi', dependents: ['Maql'] },
    );
    expect(result.anomalyType).toBe('INSERTION_ANOMALY');
    expect(result.message).toContain('Dị thường chèn');
  });

  it('validates INSERT examples from C3_2.pdf pages 7–8', () => {
    const db = UET_DATASETS.DAOTAO;

    // Valid insert
    const okRes = executeRelationalUpdate(db, 'INSERT(SINHVIEN; "T5", "Nguyễn", "Hồng", "Anh")');
    expect(okRes.status).toBe('ok');
    expect(okRes.nextDb.relations.SINHVIEN.rows.length).toBe(6);

    // Null PK -> Entity Integrity violation (C3_2 p. 8)
    const nullPkRes = executeRelationalUpdate(db, 'INSERT(SINHVIEN; null, "Trần", "Bá", "Luận")');
    expect(nullPkRes.status).toBe('ENTITY_INTEGRITY_VIOLATION');

    // Duplicate PK -> Key violation (C3_2 p. 8)
    const dupPkRes = executeRelationalUpdate(db, 'INSERT(SV_DIEM; "T1", "Int1001", 9.5)');
    expect(dupPkRes.status).toBe('KEY_VIOLATION');

    // Missing referenced Mamon -> Referential violation (C3_2 p. 7-8)
    const fkRes = executeRelationalUpdate(db, 'INSERT(SV_DIEM; "T4", "Int1007", 6.0)');
    expect(fkRes.status).toBe('REFERENTIAL_VIOLATION');

    // Out-of-domain Diem=12 -> Domain violation (C3_2 p. 7)
    const domRes = executeRelationalUpdate(db, 'INSERT(SV_DIEM; "T1", "Int1001", 12)');
    expect(domRes.status).toBe('DOMAIN_VIOLATION');
  });

  it('validates DELETE referential policies (REJECT vs CASCADE) from C3_2.pdf pages 9–10', () => {
    const db = UET_DATASETS.DAOTAO;

    // Deleting T1 in SINHVIEN is rejected by default because SV_DIEM and SV_LOP reference T1
    const rejectRes = executeRelationalUpdate(db, 'DELETE(SINHVIEN; Masv = "T1")', 'REJECT');
    expect(rejectRes.status).toBe('REFERENTIAL_VIOLATION');

    // With CASCADE, deleting T1 removes T1 from SINHVIEN and cascades to SV_DIEM / SV_LOP
    const cascadeRes = executeRelationalUpdate(db, 'DELETE(SINHVIEN; Masv = "T1")', 'CASCADE');
    expect(cascadeRes.status).toBe('ok');
    expect(cascadeRes.nextDb.relations.SINHVIEN.rows.some((r) => r.Masv === 'T1')).toBe(false);
    expect(cascadeRes.nextDb.relations.SV_DIEM.rows.some((r) => r.Masv === 'T1')).toBe(false);
  });

  it('validates MODIFY commands from C3_2.pdf pages 12–13', () => {
    const db = UET_DATASETS.DAOTAO;

    const okMod = executeRelationalUpdate(
      db,
      'MODIFY(SV_DIEM; Masv="T1" and Mamon="Int1001"; Diem=5.5)',
    );
    expect(okMod.status).toBe('ok');
    const updatedRow = okMod.nextDb.relations.SV_DIEM.rows.find(
      (r) => r.Masv === 'T1' && r.Mamon === 'Int1001',
    );
    expect(updatedRow?.Diem).toBe(5.5);

    const dupMod = executeRelationalUpdate(db, 'MODIFY(SINHVIEN; Masv="T1"; Masv="C2")');
    expect(dupMod.status).toBe('KEY_VIOLATION');

    const congty = UET_DATASETS.CONGTY_PHG;
    const raiseRes = executeRelationalUpdate(congty, 'MODIFY(NHANVIEN; all; LUONG = LUONG * 1.1)');
    expect(raiseRes.status).toBe('ok');
    const tung = raiseRes.nextDb.relations.NHANVIEN.rows.find((r) => r.TENNV === 'Tung');
    expect(tung?.LUONG).toBe(44000);
  });
});
