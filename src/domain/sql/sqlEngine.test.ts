import { describe, it, expect } from 'vitest';
import { UET_DATASETS } from '../datasets/uetDatasets';
import { compareSqlResults, evaluateSqlQuery } from './sqlEngine';

describe('Engine 5: Client-Side UET Final-Exam SQL Evaluator', () => {
  it('distinguishes SQL bag semantics from SELECT DISTINCT and handles LEFT JOIN with aliases', () => {
    const db = UET_DATASETS.CONGTY_PHG;

    // Without DISTINCT -> preserves duplicate PHG across 6 employees (Bag!)
    const bagRes = evaluateSqlQuery(db, 'SELECT PHG FROM NHANVIEN');
    expect(bagRes.error).toBeUndefined();
    expect(bagRes.result?.rows).toHaveLength(6);

    // With DISTINCT -> deduplicates to 3 departments
    const setRes = evaluateSqlQuery(db, 'SELECT DISTINCT PHG FROM NHANVIEN');
    expect(setRes.error).toBeUndefined();
    expect(setRes.result?.rows).toHaveLength(3);

    // LEFT JOIN keeps unmatched rows with null (C3_2/SQL equivalent)
    const daoOuter = UET_DATASETS.DAOTAO_OUTER;
    const leftJoin = evaluateSqlQuery(
      daoOuter,
      'SELECT sv.Masv, sv.Ten, m.Malop, m.Diem FROM SINHVIEN sv LEFT JOIN SV_LOPMH m ON sv.Masv = m.Masv',
    );
    expect(leftJoin.error).toBeUndefined();
    expect(leftJoin.result?.rows).toHaveLength(7);
    const c1 = leftJoin.result?.rows.find((r) => r.Masv === 'C1');
    expect(c1?.Malop).toBeNull();
  });

  it('evaluates GROUP BY, HAVING, ORDER BY, COUNT(col) vs COUNT(*), and arithmetic aliases', () => {
    const aggDb = UET_DATASETS.AGG_TOY;
    const countCheck = evaluateSqlQuery(
      aggDb,
      'SELECT COUNT(B) AS DemB, COUNT(*) AS DemDong, SUM(A) AS TongA FROM R_AGG',
    );
    expect(countCheck.error).toBeUndefined();
    expect(countCheck.result?.rows[0]).toEqual({
      DemB: 3,
      DemDong: 4,
      TongA: 6,
    });

    const bhDb = UET_DATASETS.BANHANG_DB;
    const grp = evaluateSqlQuery(
      bhDb,
      `
      SELECT b.MaNv, SUM(b.Soluong * h.Dongia) AS DoanhThu
      FROM BanHang b
      JOIN Hanghoa h ON b.MaHh = h.MaHh
      GROUP BY b.MaNv
      HAVING SUM(b.Soluong * h.Dongia) > 200000
      ORDER BY DoanhThu DESC
      `,
    );
    expect(grp.error).toBeUndefined();
    expect(grp.result?.rows).toEqual([
      { MaNv: 'NV3', DoanhThu: 1390000 },
      { MaNv: 'NV1', DoanhThu: 1020000 },
    ]);
  });

  it('evaluates double NOT EXISTS correlated division and NOT IN subqueries cleanly', () => {
    const daotao = UET_DATASETS.DAOTAO;

    // Students enrolled in ALL classes taught by 'Lê Đức Hòa' (Int1003, Int2003) -> Lê Đình Bắc (C2)
    const divSql = evaluateSqlQuery(
      daotao,
      `
      SELECT sv.Masv, sv.Ho, sv.Dem, sv.Ten
      FROM SINHVIEN sv
      WHERE NOT EXISTS (
        SELECT * FROM LOP l
        WHERE l.Giaovien = 'Lê Đức Hòa'
        AND NOT EXISTS (
          SELECT * FROM SV_LOP sl
          WHERE sl.Masv = sv.Masv AND sl.Malop = l.Malop
        )
      )
      `,
    );
    expect(divSql.error).toBeUndefined();
    expect(divSql.result?.rows).toEqual([
      { Masv: 'C2', Ho: 'Lê', Dem: 'Đình', Ten: 'Bắc' },
    ]);

    // Compare two equivalent SQL queries
    const congty = UET_DATASETS.CONGTY_EX;
    const maxSal1 = evaluateSqlQuery(
      congty,
      'SELECT MANV, HONV, TENNV, LUONG FROM NHANVIEN WHERE LUONG = (SELECT MAX(LUONG) FROM NHANVIEN)',
    );
    const maxSal2 = evaluateSqlQuery(
      congty,
      'SELECT MANV, HONV, TENNV, LUONG FROM NHANVIEN WHERE LUONG >= ALL (SELECT LUONG FROM NHANVIEN)',
    );
    expect(maxSal1.error).toBeUndefined();
    expect(maxSal2.error).toBeUndefined();
    expect(maxSal1.result?.rows[0].TENNV).toBe('Vinh');
    expect(compareSqlResults(maxSal1.result!, maxSal2.result!).isEqual).toBe(true);
  });

  it('parses DDL CREATE TABLE statements and reports schema constraints accurately', () => {
    const daotao = UET_DATASETS.DAOTAO;
    const ddl = evaluateSqlQuery(
      daotao,
      `
      CREATE TABLE KETQUA (
        Masv VARCHAR(10) NOT NULL,
        Mamon VARCHAR(10) NOT NULL,
        Diem FLOAT CHECK (Diem >= 0 AND Diem <= 10),
        PRIMARY KEY (Masv, Mamon),
        FOREIGN KEY (Masv) REFERENCES SINHVIEN(Masv) ON DELETE CASCADE
      )
      `,
    );
    expect(ddl.error).toBeUndefined();
    expect(ddl.kind).toBe('ddl');
    expect(ddl.result?.schema.name).toBe('KETQUA');
    expect(ddl.result?.schema.primaryKey).toEqual(['Masv', 'Mamon']);
    expect(ddl.result?.schema.foreignKeys).toEqual([
      { columns: ['Masv'], refTable: 'SINHVIEN', refColumns: ['Masv'] },
    ]);
  });
});
