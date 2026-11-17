import { CellValue, DatabaseState, RelationInstance } from '../types';

function makeTupleKey(values: CellValue[]): string {
  return JSON.stringify(values);
}

export function validateDatabaseIntegrity(db: DatabaseState): string[] {
  const errors: string[] = [];

  for (const [relName, rel] of Object.entries(db.relations)) {
    const pkCols = rel.schema.primaryKey;
    const seenPks = new Set<string>();

    rel.rows.forEach((row, rowIndex) => {
      // Check domain bounds
      for (const attr of rel.schema.attributes) {
        const val = row[attr.name];
        if (val === undefined) {
          errors.push(`${relName}[${rowIndex}].${attr.name} is undefined`);
          continue;
        }
        if (val === null) {
          if (attr.nullable === false || pkCols.includes(attr.name)) {
            errors.push(`${relName}[${rowIndex}].${attr.name} violates NOT NULL / Entity Integrity`);
          }
          continue;
        }
        if ((attr.domain === 'integer' || attr.domain === 'float') && typeof val === 'number') {
          if (attr.min !== undefined && val < attr.min) {
            errors.push(`${relName}[${rowIndex}].${attr.name}=${val} < min ${attr.min}`);
          }
          if (attr.max !== undefined && val > attr.max) {
            errors.push(`${relName}[${rowIndex}].${attr.name}=${val} > max ${attr.max}`);
          }
        }
      }

      // Check PK uniqueness
      if (pkCols.length > 0) {
        const pkVals = pkCols.map((c) => row[c]);
        const key = makeTupleKey(pkVals);
        if (seenPks.has(key)) {
          errors.push(`${relName}[${rowIndex}] duplicate PK ${key}`);
        }
        seenPks.add(key);
      }

      // Check Foreign Keys
      for (const fk of rel.schema.foreignKeys ?? []) {
        const fkVals = fk.columns.map((c) => row[c]);
        if (fkVals.every((v) => v === null)) continue;
        const targetRel = db.relations[fk.refTable];
        if (!targetRel) {
          errors.push(`${relName} FK references missing table ${fk.refTable}`);
          continue;
        }
        const targetKey = makeTupleKey(fkVals);
        const found = targetRel.rows.some(
          (tRow) => makeTupleKey(fk.refColumns.map((rc) => tRow[rc])) === targetKey,
        );
        if (!found) {
          errors.push(
            `${relName}[${rowIndex}] FK (${fk.columns.join(',')})=${targetKey} missing in ${fk.refTable}(${fk.refColumns.join(',')})`,
          );
        }
      }
    });
  }

  return errors;
}

const DAOTAO_FLAT: DatabaseState = {
  id: 'DAOTAO_FLAT',
  title: 'Bảng phẳng Điểm Sinh viên (Chưa chuẩn hóa)',
  description: 'Bảng gộp từ C4_1.pdf (trang 5) & C1.pdf dùng để minh họa sự dư thừa và dị thường cập nhật.',
  relations: {
    BANGDIEM_FLAT: {
      schema: {
        name: 'BANGDIEM_FLAT',
        attributes: [
          { name: 'Masv', domain: 'string', nullable: false },
          { name: 'Ho', domain: 'string' },
          { name: 'Dem', domain: 'string' },
          { name: 'Ten', domain: 'string' },
          { name: 'Mamon', domain: 'string', nullable: false },
          { name: 'Tenmon', domain: 'string' },
          { name: 'Diem', domain: 'float', min: 0, max: 10 },
        ],
        primaryKey: ['Masv', 'Mamon'],
      },
      rows: [
        { Masv: 'T1', Ho: 'Trần', Dem: 'Văn', Ten: 'An', Mamon: 'Int1001', Tenmon: 'CSDL', Diem: 8 },
        { Masv: 'T1', Ho: 'Trần', Dem: 'Văn', Ten: 'An', Mamon: 'Int1002', Tenmon: 'NNLT', Diem: 9 },
        { Masv: 'C2', Ho: 'Lê', Dem: 'Đình', Ten: 'Bắc', Mamon: 'Int1003', Tenmon: 'TRR', Diem: 7 },
        { Masv: 'C2', Ho: 'Lê', Dem: 'Đình', Ten: 'Bắc', Mamon: 'Int1002', Tenmon: 'NNLT', Diem: 3 },
        { Masv: 'T3', Ho: 'Trần', Dem: 'Thị', Ten: 'Hảo', Mamon: 'Int1003', Tenmon: 'TRR', Diem: 10 },
        { Masv: 'T4', Ho: 'Vũ', Dem: 'Đức', Ten: 'Lâm', Mamon: 'Int1002', Tenmon: 'NNLT', Diem: 8 },
        { Masv: 'C2', Ho: 'Lê', Dem: 'Đình', Ten: 'Bắc', Mamon: 'Int1001', Tenmon: 'CSDL', Diem: 8 },
        { Masv: 'T4', Ho: 'Vũ', Dem: 'Đức', Ten: 'Lâm', Mamon: 'Int1001', Tenmon: 'CSDL', Diem: 7 },
        { Masv: 'C3', Ho: 'Phạm', Dem: 'Hải', Ten: 'Ngọc', Mamon: 'Int1003', Tenmon: 'TRR', Diem: 6 },
      ],
    },
  },
};

const NHANVIEN_PHONG_FLAT: DatabaseState = {
  id: 'NHANVIEN_PHONG_FLAT',
  title: 'Bảng phẳng NHANVIEN_PHONG (C4_1.pdf tr. 4 & 8)',
  description: 'Gộp chung thông tin Nhân viên và Đơn vị vào một bảng duy nhất.',
  relations: {
    NHANVIEN_PHONG: {
      schema: {
        name: 'NHANVIEN_PHONG',
        attributes: [
          { name: 'Manv', domain: 'string', nullable: false },
          { name: 'Ho', domain: 'string' },
          { name: 'Dem', domain: 'string' },
          { name: 'Ten', domain: 'string' },
          { name: 'Donvi', domain: 'string' },
          { name: 'Maql', domain: 'string' },
        ],
        primaryKey: ['Manv'],
      },
      rows: [
        { Manv: '11001', Ho: 'Trần', Dem: 'Văn', Ten: 'An', Donvi: 'Nghiên cứu', Maql: '11001' },
        { Manv: '11002', Ho: 'Lê', Dem: 'Đình', Ten: 'Bắc', Donvi: 'Đào tạo', Maql: '11002' },
        { Manv: '11003', Ho: 'Trần', Dem: 'Thị', Ten: 'Hảo', Donvi: 'Đào tạo', Maql: '11002' },
        { Manv: '11004', Ho: 'Vũ', Dem: 'Đức', Ten: 'Lâm', Donvi: 'Hành chính', Maql: '11005' },
        { Manv: '11005', Ho: 'Phạm', Dem: 'Hải', Ten: 'Ngọc', Donvi: 'Hành chính', Maql: '11005' },
        { Manv: '11006', Ho: 'Trần', Dem: 'Văn', Ten: 'Cường', Donvi: 'Nghiên cứu', Maql: '11001' },
        { Manv: '11007', Ho: 'Vũ', Dem: 'Vân', Ten: 'Long', Donvi: 'Đào tạo', Maql: '11002' },
      ],
    },
  },
};

const DAOTAO: DatabaseState = {
  id: 'DAOTAO',
  title: 'CSDL Quản lý Đào tạo (C3_2.pdf tr. 3, 10, 78, 87)',
  description: 'CSDL chuẩn hóa gồm Sinh viên, Môn học, Bảng điểm, Lớp học phần và Đăng ký lớp.',
  relations: {
    SINHVIEN: {
      schema: {
        name: 'SINHVIEN',
        attributes: [
          { name: 'Masv', domain: 'string', nullable: false },
          { name: 'Ho', domain: 'string' },
          { name: 'Dem', domain: 'string', nullable: true },
          { name: 'Ten', domain: 'string' },
        ],
        primaryKey: ['Masv'],
      },
      rows: [
        { Masv: 'T1', Ho: 'Trần', Dem: 'Văn', Ten: 'An' },
        { Masv: 'C2', Ho: 'Lê', Dem: 'Đình', Ten: 'Bắc' },
        { Masv: 'T3', Ho: 'Trần', Dem: 'Thị', Ten: 'Hảo' },
        { Masv: 'T4', Ho: 'Vũ', Dem: 'Đức', Ten: 'Lâm' },
        { Masv: 'C3', Ho: 'Phạm', Dem: 'Hải', Ten: 'Ngọc' },
      ],
    },
    MONHOC: {
      schema: {
        name: 'MONHOC',
        attributes: [
          { name: 'Mamon', domain: 'string', nullable: false },
          { name: 'Tenmon', domain: 'string' },
          { name: 'Sotinchi', domain: 'integer', min: 1, max: 10 },
        ],
        primaryKey: ['Mamon'],
      },
      rows: [
        { Mamon: 'Int1001', Tenmon: 'CSDL', Sotinchi: 3 },
        { Mamon: 'Int1002', Tenmon: 'NGLT C', Sotinchi: 4 },
        { Mamon: 'Int1003', Tenmon: 'TRR', Sotinchi: 3 },
      ],
    },
    SV_DIEM: {
      schema: {
        name: 'SV_DIEM',
        attributes: [
          { name: 'Masv', domain: 'string', nullable: false },
          { name: 'Mamon', domain: 'string', nullable: false },
          { name: 'Diem', domain: 'float', min: 0, max: 10 },
        ],
        primaryKey: ['Masv', 'Mamon'],
        foreignKeys: [
          { columns: ['Masv'], refTable: 'SINHVIEN', refColumns: ['Masv'] },
          { columns: ['Mamon'], refTable: 'MONHOC', refColumns: ['Mamon'] },
        ],
      },
      rows: [
        { Masv: 'T1', Mamon: 'Int1001', Diem: 8 },
        { Masv: 'T1', Mamon: 'Int1002', Diem: 9 },
        { Masv: 'C2', Mamon: 'Int1003', Diem: 7 },
        { Masv: 'C2', Mamon: 'Int1002', Diem: 3 },
        { Masv: 'T3', Mamon: 'Int1003', Diem: 10 },
        { Masv: 'T4', Mamon: 'Int1002', Diem: 8 },
        { Masv: 'C2', Mamon: 'Int1001', Diem: 8 },
        { Masv: 'T4', Mamon: 'Int1001', Diem: 7 },
        { Masv: 'C3', Mamon: 'Int1003', Diem: 6 },
        { Masv: 'T1', Mamon: 'Int1003', Diem: 5 },
      ],
    },
    LOP: {
      schema: {
        name: 'LOP',
        attributes: [
          { name: 'Malop', domain: 'string', nullable: false },
          { name: 'Tenlop', domain: 'string' },
          { name: 'Giaovien', domain: 'string' },
        ],
        primaryKey: ['Malop'],
      },
      rows: [
        { Malop: 'Int1001', Tenlop: 'THCS', Giaovien: 'Lê Văn Tân' },
        { Malop: 'Int1002', Tenlop: 'CSDL', Giaovien: 'Trần Văn Thịnh' },
        { Malop: 'Int1003', Tenlop: 'CTD', Giaovien: 'Lê Đức Hòa' },
        { Malop: 'Int2003', Tenlop: 'NLHDH', Giaovien: 'Lê Đức Hòa' },
      ],
    },
    SV_LOP: {
      schema: {
        name: 'SV_LOP',
        attributes: [
          { name: 'Masv', domain: 'string', nullable: false },
          { name: 'Malop', domain: 'string', nullable: false },
        ],
        primaryKey: ['Masv', 'Malop'],
        foreignKeys: [
          { columns: ['Masv'], refTable: 'SINHVIEN', refColumns: ['Masv'] },
          { columns: ['Malop'], refTable: 'LOP', refColumns: ['Malop'] },
        ],
      },
      rows: [
        { Masv: 'T1', Malop: 'Int1001' },
        { Masv: 'T1', Malop: 'Int1002' },
        { Masv: 'C2', Malop: 'Int1003' },
        { Masv: 'C2', Malop: 'Int1002' },
        { Masv: 'T3', Malop: 'Int1003' },
        { Masv: 'T4', Malop: 'Int1002' },
        { Masv: 'C2', Malop: 'Int1001' },
        { Masv: 'T4', Malop: 'Int1001' },
        { Masv: 'C3', Malop: 'Int1003' },
        { Masv: 'T1', Malop: 'Int1003' },
        { Masv: 'C2', Malop: 'Int2003' },
      ],
    },
    BANGDIEM: {
      schema: {
        name: 'BANGDIEM',
        attributes: [
          { name: 'Masv', domain: 'string', nullable: false },
          { name: 'Ho', domain: 'string' },
          { name: 'Dem', domain: 'string' },
          { name: 'Ten', domain: 'string' },
          { name: 'Mamon', domain: 'string', nullable: false },
          { name: 'Diem', domain: 'float', min: 0, max: 10 },
        ],
        primaryKey: ['Masv', 'Mamon'],
      },
      rows: [
        { Masv: 'T1', Ho: 'Trần', Dem: 'Văn', Ten: 'An', Mamon: 'Int1001', Diem: 8 },
        { Masv: 'T1', Ho: 'Trần', Dem: 'Văn', Ten: 'An', Mamon: 'Int1002', Diem: 9 },
        { Masv: 'C2', Ho: 'Lê', Dem: 'Đình', Ten: 'Bắc', Mamon: 'Int1003', Diem: 7 },
        { Masv: 'C2', Ho: 'Lê', Dem: 'Đình', Ten: 'Bắc', Mamon: 'Int1002', Diem: 3 },
        { Masv: 'T3', Ho: 'Trần', Dem: 'Thị', Ten: 'Hảo', Mamon: 'Int1003', Diem: 10 },
        { Masv: 'T4', Ho: 'Vũ', Dem: 'Đức', Ten: 'Lâm', Mamon: 'Int1002', Diem: 8 },
        { Masv: 'C2', Ho: 'Lê', Dem: 'Đình', Ten: 'Bắc', Mamon: 'Int1001', Diem: 8 },
        { Masv: 'T4', Ho: 'Vũ', Dem: 'Đức', Ten: 'Lâm', Mamon: 'Int1001', Diem: 7 },
        { Masv: 'C3', Ho: 'Phạm', Dem: 'Hải', Ten: 'Ngọc', Mamon: 'Int1003', Diem: 6 },
      ],
    },
  },
};

const DAOTAO_OUTER: DatabaseState = {
  id: 'DAOTAO_OUTER',
  title: 'CSDL Nối Tự nhiên & Nối Ngoài (C3_2.pdf tr. 61 & 100–104)',
  description: 'Dữ liệu dùng để phân biệt mất bộ do giá trị null hoặc không khớp ở Natural Join so với Outer Join.',
  relations: {
    SINHVIEN: {
      schema: {
        name: 'SINHVIEN',
        attributes: [
          { name: 'Masv', domain: 'string', nullable: false },
          { name: 'Ho', domain: 'string' },
          { name: 'Dem', domain: 'string' },
          { name: 'Ten', domain: 'string' },
        ],
        primaryKey: ['Masv'],
      },
      rows: [
        { Masv: 'T1', Ho: 'Trần', Dem: 'Văn', Ten: 'An' },
        { Masv: 'C1', Ho: 'Trần', Dem: 'Văn', Ten: 'Đức' },
        { Masv: 'C2', Ho: 'Lê', Dem: 'Đình', Ten: 'Bắc' },
        { Masv: 'T3', Ho: 'Trần', Dem: 'Thị', Ten: 'Hảo' },
        { Masv: 'T4', Ho: 'Vũ', Dem: 'Đức', Ten: 'Lâm' },
        { Masv: 'C3', Ho: 'Phạm', Dem: 'Hải', Ten: 'Ngọc' },
        { Masv: 'T2', Ho: 'Lê', Dem: 'Thị', Ten: 'Hà' },
      ],
    },
    SV_LOPMH: {
      schema: {
        name: 'SV_LOPMH',
        attributes: [
          { name: 'Masv', domain: 'string', nullable: false },
          { name: 'Malop', domain: 'string', nullable: false },
          { name: 'Diem', domain: 'float', min: 0, max: 10 },
        ],
        primaryKey: ['Masv', 'Malop'],
      },
      rows: [
        { Masv: 'T1', Malop: 'Int1001', Diem: 8 },
        { Masv: 'C2', Malop: 'Int1003', Diem: 7 },
        { Masv: 'T3', Malop: 'Int1003', Diem: 10 },
        { Masv: 'T4', Malop: 'Int1002', Diem: 8 },
      ],
    },
    SV_JOIN: {
      schema: {
        name: 'SV_JOIN',
        attributes: [
          { name: 'Masv', domain: 'string', nullable: false },
          { name: 'Ho', domain: 'string' },
          { name: 'Dem', domain: 'string' },
          { name: 'Ten', domain: 'string' },
          { name: 'Ns', domain: 'string' },
          { name: 'Gt', domain: 'string' },
          { name: 'Lop', domain: 'string', nullable: true },
        ],
        primaryKey: ['Masv'],
      },
      rows: [
        { Masv: '10001', Ho: 'Trần', Dem: 'Văn', Ten: 'Minh', Ns: '1/1/1995', Gt: 'Nam', Lop: 'Int1001' },
        { Masv: '10002', Ho: 'Lê', Dem: 'Đức', Ten: 'Vinh', Ns: '2/10/1994', Gt: 'Nam', Lop: 'Int1002' },
        { Masv: '10005', Ho: 'Vũ', Dem: 'Văn', Ten: 'Toàn', Ns: '5/2/1989', Gt: 'Nam', Lop: null },
        { Masv: '11007', Ho: 'Nguyễn', Dem: 'Thị', Ten: 'Hương', Ns: '2/4/1991', Gt: 'Nữ', Lop: 'Int2001' },
      ],
    },
    LOP_JOIN: {
      schema: {
        name: 'LOP_JOIN',
        attributes: [
          { name: 'Malop', domain: 'string', nullable: false },
          { name: 'Tenlop', domain: 'string' },
          { name: 'Giaovien', domain: 'string' },
        ],
        primaryKey: ['Malop'],
      },
      rows: [
        { Malop: 'Int1001', Tenlop: 'Tin học cơ sở 1', Giaovien: 'Hồ Sỹ Đàm' },
        { Malop: 'Int1002', Tenlop: 'Nguyên lý Hệ ĐH', Giaovien: 'Hà Quang Thụy' },
        { Malop: 'Int1003', Tenlop: 'Cơ sở dữ liệu', Giaovien: 'Nguyễn Tuệ' },
        { Malop: 'Int2001', Tenlop: 'Chương trình dịch', Giaovien: 'Lê Anh Cường' },
        { Malop: 'Int1005', Tenlop: 'Tin học cơ sở 4', Giaovien: 'Trần Thị Minh Châu' },
      ],
    },
  },
};

const CONGTY_PHG: DatabaseState = {
  id: 'CONGTY_PHG',
  title: 'CSDL Quản lý Đề án Công ty (C1 tr. 15, C3_2 tr. 54–72, 95–105)',
  description: 'Bộ bảng chuẩn dùng trong phần lớn ví dụ Chọn, Chiếu, Đổi tên, Nối và Gom nhóm.',
  relations: {
    NHANVIEN: {
      schema: {
        name: 'NHANVIEN',
        attributes: [
          { name: 'MANV', domain: 'string', nullable: false },
          { name: 'HONV', domain: 'string' },
          { name: 'TENNV', domain: 'string' },
          { name: 'NS', domain: 'string' },
          { name: 'DCHI', domain: 'string' },
          { name: 'GT', domain: 'string' },
          { name: 'LUONG', domain: 'integer', min: 0 },
          { name: 'MA_NQL', domain: 'string', nullable: true },
          { name: 'PHG', domain: 'integer' },
        ],
        primaryKey: ['MANV'],
        foreignKeys: [
          { columns: ['PHG'], refTable: 'PHONGBAN', refColumns: ['MAPHG'] },
          { columns: ['MA_NQL'], refTable: 'NHANVIEN', refColumns: ['MANV'] },
        ],
      },
      rows: [
        { MANV: '888665555', HONV: 'Pham', TENNV: 'Vinh', NS: '06/19/1961', DCHI: 'Nam Dinh', GT: 'Nam', LUONG: 54000, MA_NQL: null, PHG: 1 },
        { MANV: '333445555', HONV: 'Nguyen', TENNV: 'Tung', NS: '12/08/1955', DCHI: '638 NVC Q5', GT: 'Nam', LUONG: 40000, MA_NQL: '888665555', PHG: 5 },
        { MANV: '987987987', HONV: 'Tran', TENNV: 'Quang', NS: '03/09/1969', DCHI: '98 Hai Ba Trung', GT: 'Nam', LUONG: 30000, MA_NQL: '987654321', PHG: 4 },
        { MANV: '987654321', HONV: 'Le', TENNV: 'Nhu', NS: '06/20/1951', DCHI: '291 HVH QPN', GT: 'Nu', LUONG: 43000, MA_NQL: '888665555', PHG: 4 },
        { MANV: '666884444', HONV: 'Nguyen', TENNV: 'Hung', NS: '09/15/1962', DCHI: 'Ba Ria VT', GT: 'Nam', LUONG: 38000, MA_NQL: '333445555', PHG: 5 },
        { MANV: '999887777', HONV: 'Bui', TENNV: 'Hang', NS: '07/19/1968', DCHI: '332 NTH Q1', GT: 'Nu', LUONG: 25000, MA_NQL: '987654321', PHG: 4 },
      ],
    },
    PHONGBAN: {
      schema: {
        name: 'PHONGBAN',
        attributes: [
          { name: 'MAPHG', domain: 'integer', nullable: false },
          { name: 'TENPHG', domain: 'string' },
          { name: 'TRPHG', domain: 'string' },
          { name: 'NG_NHANCHUC', domain: 'string' },
        ],
        primaryKey: ['MAPHG'],
        foreignKeys: [{ columns: ['TRPHG'], refTable: 'NHANVIEN', refColumns: ['MANV'] }],
      },
      rows: [
        { MAPHG: 1, TENPHG: 'Quan ly', TRPHG: '888665555', NG_NHANCHUC: '06/19/1981' },
        { MAPHG: 4, TENPHG: 'Dieu hanh', TRPHG: '987987987', NG_NHANCHUC: '01/01/1995' },
        { MAPHG: 5, TENPHG: 'Nghien cuu', TRPHG: '333445555', NG_NHANCHUC: '05/22/1988' },
      ],
    },
    DIADIEM_PHG: {
      schema: {
        name: 'DIADIEM_PHG',
        attributes: [
          { name: 'MAPHG', domain: 'integer', nullable: false },
          { name: 'DIADIEM', domain: 'string', nullable: false },
        ],
        primaryKey: ['MAPHG', 'DIADIEM'],
        foreignKeys: [{ columns: ['MAPHG'], refTable: 'PHONGBAN', refColumns: ['MAPHG'] }],
      },
      rows: [
        { MAPHG: 1, DIADIEM: 'TP HCM' },
        { MAPHG: 4, DIADIEM: 'HA NOI' },
        { MAPHG: 5, DIADIEM: 'VUNG TAU' },
        { MAPHG: 5, DIADIEM: 'NHA TRANG' },
        { MAPHG: 5, DIADIEM: 'TP HCM' },
      ],
    },
    DEAN: {
      schema: {
        name: 'DEAN',
        attributes: [
          { name: 'MADA', domain: 'integer', nullable: false },
          { name: 'TENDA', domain: 'string' },
          { name: 'DDIEM_DA', domain: 'string' },
          { name: 'PHONG', domain: 'integer' },
        ],
        primaryKey: ['MADA'],
        foreignKeys: [{ columns: ['PHONG'], refTable: 'PHONGBAN', refColumns: ['MAPHG'] }],
      },
      rows: [
        { MADA: 1, TENDA: 'San pham X', DDIEM_DA: 'VUNG TAU', PHONG: 5 },
        { MADA: 2, TENDA: 'San pham Y', DDIEM_DA: 'NHA TRANG', PHONG: 5 },
        { MADA: 3, TENDA: 'San pham Z', DDIEM_DA: 'TP HCM', PHONG: 5 },
        { MADA: 10, TENDA: 'Tin hoc hoa', DDIEM_DA: 'HA NOI', PHONG: 4 },
      ],
    },
    NV_DEAN: {
      schema: {
        name: 'NV_DEAN',
        attributes: [
          { name: 'MANV', domain: 'string', nullable: false },
          { name: 'MADA', domain: 'integer', nullable: false },
          { name: 'SOGIO', domain: 'float', min: 0 },
        ],
        primaryKey: ['MANV', 'MADA'],
        foreignKeys: [
          { columns: ['MANV'], refTable: 'NHANVIEN', refColumns: ['MANV'] },
          { columns: ['MADA'], refTable: 'DEAN', refColumns: ['MADA'] },
        ],
      },
      rows: [
        { MANV: '333445555', MADA: 1, SOGIO: 10 },
        { MANV: '333445555', MADA: 2, SOGIO: 10 },
        { MANV: '333445555', MADA: 3, SOGIO: 10 },
        { MANV: '333445555', MADA: 10, SOGIO: 10 },
        { MANV: '666884444', MADA: 3, SOGIO: 40 },
        { MANV: '999887777', MADA: 10, SOGIO: 20 },
      ],
    },
    THANNHAN: {
      schema: {
        name: 'THANNHAN',
        attributes: [
          { name: 'MANV', domain: 'string', nullable: false },
          { name: 'TENTN', domain: 'string', nullable: false },
          { name: 'GT', domain: 'string' },
          { name: 'NS', domain: 'string' },
          { name: 'QUANHE', domain: 'string' },
        ],
        primaryKey: ['MANV', 'TENTN'],
        foreignKeys: [{ columns: ['MANV'], refTable: 'NHANVIEN', refColumns: ['MANV'] }],
      },
      rows: [
        { MANV: '333445555', TENTN: 'Trinh', GT: 'Nu', NS: '04/05/1986', QUANHE: 'Con gai' },
        { MANV: '333445555', TENTN: 'Khang', GT: 'Nam', NS: '10/25/1983', QUANHE: 'Con trai' },
        { MANV: '333445555', TENTN: 'Phuong', GT: 'Nu', NS: '05/03/1958', QUANHE: 'Vo chong' },
        { MANV: '987654321', TENTN: 'Minh', GT: 'Nam', NS: '02/28/1942', QUANHE: 'Vo chong' },
      ],
    },
  },
};

const CONGTY_EX: DatabaseState = {
  id: 'CONGTY_EX',
  title: 'CSDL CÔNGTY — Bài tập 2 Tổng hợp (C3_2.pdf tr. 108–109)',
  description: 'Lược đồ đầy đủ 6 bảng dùng cho 7 câu hỏi luyện thi Giữa kỳ ở trang 108–109.',
  relations: {
    NHANVIEN: {
      schema: {
        name: 'NHANVIEN',
        attributes: [
          { name: 'MANV', domain: 'string', nullable: false },
          { name: 'HONV', domain: 'string' },
          { name: 'TENNV', domain: 'string' },
          { name: 'NS', domain: 'string' },
          { name: 'GT', domain: 'string' },
          { name: 'DCHI', domain: 'string' },
          { name: 'LUONG', domain: 'integer' },
          { name: 'MANGS', domain: 'string', nullable: true },
          { name: 'MADV', domain: 'integer' },
        ],
        primaryKey: ['MANV'],
        foreignKeys: [
          { columns: ['MADV'], refTable: 'DONVI', refColumns: ['MADV'] },
          { columns: ['MANGS'], refTable: 'NHANVIEN', refColumns: ['MANV'] },
        ],
      },
      rows: [
        { MANV: 'NV01', HONV: 'Phạm', TENNV: 'Vinh', NS: '19/06/1965', GT: 'Nam', DCHI: 'Hà Nội', LUONG: 55000, MANGS: null, MADV: 1 },
        { MANV: 'NV02', HONV: 'Nguyễn', TENNV: 'Tùng', NS: '08/12/1975', GT: 'Nam', DCHI: 'Cầu Giấy, Hà Nội', LUONG: 40000, MANGS: 'NV01', MADV: 5 },
        { MANV: 'NV03', HONV: 'Trần', TENNV: 'Nam', NS: '09/03/1982', GT: 'Nam', DCHI: 'Đống Đa, Hà Nội', LUONG: 35000, MANGS: 'NV01', MADV: 4 },
        { MANV: 'NV04', HONV: 'Lê', TENNV: 'Như', NS: '20/06/1980', GT: 'Nữ', DCHI: 'Quận 1, TP HCM', LUONG: 43000, MANGS: 'NV03', MADV: 4 },
        { MANV: 'NV05', HONV: 'Nguyễn', TENNV: 'Hùng', NS: '15/09/1985', GT: 'Nam', DCHI: 'Vũng Tàu', LUONG: 38000, MANGS: 'NV02', MADV: 5 },
        { MANV: 'NV06', HONV: 'Bùi', TENNV: 'Hằng', NS: '19/07/1990', GT: 'Nữ', DCHI: 'Thanh Xuân, Hà Nội', LUONG: 28000, MANGS: 'NV02', MADV: 5 },
      ],
    },
    DONVI: {
      schema: {
        name: 'DONVI',
        attributes: [
          { name: 'MADV', domain: 'integer', nullable: false },
          { name: 'TENDV', domain: 'string' },
          { name: 'MANQL', domain: 'string' },
          { name: 'NGAY_BD', domain: 'string' },
        ],
        primaryKey: ['MADV'],
        foreignKeys: [{ columns: ['MANQL'], refTable: 'NHANVIEN', refColumns: ['MANV'] }],
      },
      rows: [
        { MADV: 1, TENDV: 'Quản lý', MANQL: 'NV01', NGAY_BD: '01/01/2010' },
        { MADV: 4, TENDV: 'Điều hành', MANQL: 'NV03', NGAY_BD: '15/03/2015' },
        { MADV: 5, TENDV: 'Nghiên cứu', MANQL: 'NV02', NGAY_BD: '22/05/2012' },
      ],
    },
    DEAN: {
      schema: {
        name: 'DEAN',
        attributes: [
          { name: 'MADA', domain: 'integer', nullable: false },
          { name: 'TENDA', domain: 'string' },
          { name: 'DD_DA', domain: 'string' },
          { name: 'MADV', domain: 'integer' },
        ],
        primaryKey: ['MADA'],
        foreignKeys: [{ columns: ['MADV'], refTable: 'DONVI', refColumns: ['MADV'] }],
      },
      rows: [
        { MADA: 1, TENDA: 'Sản phẩm X', DD_DA: 'Vũng Tàu', MADV: 5 },
        { MADA: 2, TENDA: 'Sản phẩm Y', DD_DA: 'Nha Trang', MADV: 5 },
        { MADA: 3, TENDA: 'Tin học hóa', DD_DA: 'Hà Nội', MADV: 4 },
        { MADA: 4, TENDA: 'Chuyển đổi số', DD_DA: 'Hà Nội', MADV: 1 },
      ],
    },
    NV_DEAN: {
      schema: {
        name: 'NV_DEAN',
        attributes: [
          { name: 'MANV', domain: 'string', nullable: false },
          { name: 'MADA', domain: 'integer', nullable: false },
          { name: 'SOGIO', domain: 'float', min: 0 },
        ],
        primaryKey: ['MANV', 'MADA'],
        foreignKeys: [
          { columns: ['MANV'], refTable: 'NHANVIEN', refColumns: ['MANV'] },
          { columns: ['MADA'], refTable: 'DEAN', refColumns: ['MADA'] },
        ],
      },
      rows: [
        { MANV: 'NV02', MADA: 1, SOGIO: 15 },
        { MANV: 'NV02', MADA: 2, SOGIO: 20 },
        { MANV: 'NV05', MADA: 1, SOGIO: 30 },
        { MANV: 'NV03', MADA: 3, SOGIO: 25 },
        { MANV: 'NV04', MADA: 3, SOGIO: 12 },
        { MANV: 'NV01', MADA: 4, SOGIO: 10 },
        { MANV: 'NV06', MADA: 1, SOGIO: 18 },
        { MANV: 'NV06', MADA: 2, SOGIO: 16 },
      ],
    },
    THANNHAN: {
      schema: {
        name: 'THANNHAN',
        attributes: [
          { name: 'MANV', domain: 'string', nullable: false },
          { name: 'TEN_TN', domain: 'string', nullable: false },
          { name: 'NS', domain: 'string' },
          { name: 'GT', domain: 'string' },
          { name: 'QUANHE', domain: 'string' },
        ],
        primaryKey: ['MANV', 'TEN_TN'],
        foreignKeys: [{ columns: ['MANV'], refTable: 'NHANVIEN', refColumns: ['MANV'] }],
      },
      rows: [
        { MANV: 'NV02', TEN_TN: 'Trinh', NS: '05/04/2005', GT: 'Nữ', QUANHE: 'Con gái' },
        { MANV: 'NV02', TEN_TN: 'Khang', NS: '25/10/2008', GT: 'Nam', QUANHE: 'Con trai' },
        { MANV: 'NV03', TEN_TN: 'Lan', NS: '12/09/1985', GT: 'Nữ', QUANHE: 'Vợ chồng' },
        { MANV: 'NV04', TEN_TN: 'Minh', NS: '14/02/2012', GT: 'Nam', QUANHE: 'Con trai' },
        { MANV: 'NV04', TEN_TN: 'Mai', NS: '18/11/2015', GT: 'Nữ', QUANHE: 'Con gái' },
      ],
    },
    DONVI_DD: {
      schema: {
        name: 'DONVI_DD',
        attributes: [
          { name: 'MADV', domain: 'integer', nullable: false },
          { name: 'DD', domain: 'string', nullable: false },
        ],
        primaryKey: ['MADV', 'DD'],
        foreignKeys: [{ columns: ['MADV'], refTable: 'DONVI', refColumns: ['MADV'] }],
      },
      rows: [
        { MADV: 1, DD: 'Hà Nội' },
        { MADV: 4, DD: 'Hà Nội' },
        { MADV: 5, DD: 'TP HCM' },
        { MADV: 5, DD: 'Vũng Tàu' },
      ],
    },
  },
};

const KYNANG_DB: DatabaseState = {
  id: 'KYNANG_DB',
  title: 'CSDL Kỹ năng Nhân viên (C3_2.pdf tr. 75)',
  description: 'Ví dụ trực quan mở đầu cho Phép chia Đại số quan hệ.',
  relations: {
    NV_KYNANG: {
      schema: {
        name: 'NV_KYNANG',
        attributes: [
          { name: 'MaNV', domain: 'string', nullable: false },
          { name: 'Kynang', domain: 'string', nullable: false },
        ],
        primaryKey: ['MaNV', 'Kynang'],
      },
      rows: [
        { MaNV: 'A1', Kynang: 'Ngôn ngữ C' },
        { MaNV: 'A2', Kynang: 'Lập trình PHP' },
        { MaNV: 'A1', Kynang: 'Lập trình Android' },
        { MaNV: 'A3', Kynang: 'Lập trình Android' },
        { MaNV: 'A1', Kynang: 'Lập trình PHP' },
        { MaNV: 'A4', Kynang: 'Ngôn ngữ C' },
        { MaNV: 'A4', Kynang: 'Lập trình PHP' },
      ],
    },
    KYNANG: {
      schema: {
        name: 'KYNANG',
        attributes: [{ name: 'Kynang', domain: 'string', nullable: false }],
        primaryKey: ['Kynang'],
      },
      rows: [
        { Kynang: 'Ngôn ngữ C' },
        { Kynang: 'Lập trình PHP' },
        { Kynang: 'Lập trình Android' },
      ],
    },
  },
};

const BANHANG_DB: DatabaseState = {
  id: 'BANHANG_DB',
  title: 'CSDL Quản lý Bán hàng (C3_2.pdf tr. 107)',
  description: 'CSDL 6 bảng dùng luyện tập Phép gom nhóm và tìm giá trị lớn nhất / nhỏ nhất.',
  relations: {
    NhaCungcap: {
      schema: {
        name: 'NhaCungcap',
        attributes: [
          { name: 'MaNcc', domain: 'string', nullable: false },
          { name: 'TenNcc', domain: 'string' },
          { name: 'Dienthoai', domain: 'string' },
        ],
        primaryKey: ['MaNcc'],
      },
      rows: [
        { MaNcc: 'NCC1', TenNcc: 'Thiên Long', Dienthoai: '0243811111' },
        { MaNcc: 'NCC2', TenNcc: 'Hồng Hà', Dienthoai: '0243822222' },
        { MaNcc: 'NCC3', TenNcc: 'Bến Nghé', Dienthoai: '0283833333' },
      ],
    },
    Hanghoa: {
      schema: {
        name: 'Hanghoa',
        attributes: [
          { name: 'MaHh', domain: 'string', nullable: false },
          { name: 'TenHh', domain: 'string' },
          { name: 'Dongia', domain: 'integer' },
          { name: 'MaNcc', domain: 'string' },
        ],
        primaryKey: ['MaHh'],
        foreignKeys: [{ columns: ['MaNcc'], refTable: 'NhaCungcap', refColumns: ['MaNcc'] }],
      },
      rows: [
        { MaHh: 'HH1', TenHh: 'Bút bi TL', Dongia: 5000, MaNcc: 'NCC1' },
        { MaHh: 'HH2', TenHh: 'Giấy A4', Dongia: 90000, MaNcc: 'NCC2' },
        { MaHh: 'HH3', TenHh: 'Vở 200 trang', Dongia: 15000, MaNcc: 'NCC2' },
        { MaHh: 'HH4', TenHh: 'Thước kẻ', Dongia: 8000, MaNcc: 'NCC3' },
      ],
    },
    Nhom: {
      schema: {
        name: 'Nhom',
        attributes: [
          { name: 'MaNhom', domain: 'string', nullable: false },
          { name: 'TenNhom', domain: 'string' },
          { name: 'MaNhomtruong', domain: 'string' },
        ],
        primaryKey: ['MaNhom'],
      },
      rows: [
        { MaNhom: 'N1', TenNhom: 'Nhóm Miền Bắc', MaNhomtruong: 'NV1' },
        { MaNhom: 'N2', TenNhom: 'Nhóm Miền Nam', MaNhomtruong: 'NV3' },
      ],
    },
    NhanVien: {
      schema: {
        name: 'NhanVien',
        attributes: [
          { name: 'MaNv', domain: 'string', nullable: false },
          { name: 'TenNV', domain: 'string' },
          { name: 'Ngaysinh', domain: 'string' },
          { name: 'SoDienthoai', domain: 'string' },
          { name: 'MaNhom', domain: 'string' },
        ],
        primaryKey: ['MaNv'],
        foreignKeys: [{ columns: ['MaNhom'], refTable: 'Nhom', refColumns: ['MaNhom'] }],
      },
      rows: [
        { MaNv: 'NV1', TenNV: 'An', Ngaysinh: '01/05/1995', SoDienthoai: '0911111111', MaNhom: 'N1' },
        { MaNv: 'NV2', TenNV: 'Bình', Ngaysinh: '12/08/1997', SoDienthoai: '0922222222', MaNhom: 'N1' },
        { MaNv: 'NV3', TenNV: 'Cường', Ngaysinh: '20/11/1994', SoDienthoai: '0933333333', MaNhom: 'N2' },
      ],
    },
    DiaphuongBanHang: {
      schema: {
        name: 'DiaphuongBanHang',
        attributes: [
          { name: 'MaDp', domain: 'string', nullable: false },
          { name: 'TenDiaphuong', domain: 'string' },
          { name: 'Dacdiem', domain: 'string' },
        ],
        primaryKey: ['MaDp'],
      },
      rows: [
        { MaDp: 'DP1', TenDiaphuong: 'Hà Nội', Dacdiem: 'Trung tâm phía Bắc' },
        { MaDp: 'DP2', TenDiaphuong: 'TP HCM', Dacdiem: 'Trung tâm phía Nam' },
        { MaDp: 'DP3', TenDiaphuong: 'Đà Nẵng', Dacdiem: 'Miền Trung' },
      ],
    },
    BanHang: {
      schema: {
        name: 'BanHang',
        attributes: [
          { name: 'MaNv', domain: 'string', nullable: false },
          { name: 'MaHh', domain: 'string', nullable: false },
          { name: 'MaDp', domain: 'string', nullable: false },
          { name: 'Soluong', domain: 'integer', min: 1 },
        ],
        primaryKey: ['MaNv', 'MaHh', 'MaDp'],
        foreignKeys: [
          { columns: ['MaNv'], refTable: 'NhanVien', refColumns: ['MaNv'] },
          { columns: ['MaHh'], refTable: 'Hanghoa', refColumns: ['MaHh'] },
          { columns: ['MaDp'], refTable: 'DiaphuongBanHang', refColumns: ['MaDp'] },
        ],
      },
      rows: [
        { MaNv: 'NV1', MaHh: 'HH2', MaDp: 'DP1', Soluong: 10 },
        { MaNv: 'NV2', MaHh: 'HH1', MaDp: 'DP1', Soluong: 20 },
        { MaNv: 'NV1', MaHh: 'HH3', MaDp: 'DP3', Soluong: 8 },
        { MaNv: 'NV3', MaHh: 'HH2', MaDp: 'DP2', Soluong: 15 },
        { MaNv: 'NV3', MaHh: 'HH4', MaDp: 'DP2', Soluong: 5 },
        { MaNv: 'NV2', MaHh: 'HH1', MaDp: 'DP3', Soluong: 6 },
      ],
    },
  },
};

const SET_OPS_TOY: DatabaseState = {
  id: 'SET_OPS_TOY',
  title: 'Quan hệ mẫu Phép toán Tập hợp (C3_2.pdf tr. 19–24)',
  description: 'Các bảng mẫu để trực quan hóa Hợp, Giao, Trừ và Tính khả hợp.',
  relations: {
    R: {
      schema: {
        name: 'R',
        attributes: [
          { name: 'A', domain: 'string', nullable: false },
          { name: 'B', domain: 'integer', nullable: false },
        ],
        primaryKey: ['A', 'B'],
      },
      rows: [
        { A: 'α', B: 1 },
        { A: 'α', B: 2 },
        { A: 'β', B: 1 },
      ],
    },
    S: {
      schema: {
        name: 'S',
        attributes: [
          { name: 'A', domain: 'string', nullable: false },
          { name: 'B', domain: 'integer', nullable: false },
        ],
        primaryKey: ['A', 'B'],
      },
      rows: [
        { A: 'α', B: 2 },
        { A: 'β', B: 3 },
      ],
    },
    GIAOVIEN: {
      schema: {
        name: 'GIAOVIEN',
        attributes: [
          { name: 'Ho', domain: 'string', nullable: false },
          { name: 'Dem', domain: 'string', nullable: false },
          { name: 'Ten', domain: 'string', nullable: false },
          { name: 'Ngaysinh', domain: 'string', nullable: false },
          { name: 'HSL', domain: 'float' },
        ],
        primaryKey: ['Ho', 'Dem', 'Ten', 'Ngaysinh'],
      },
      rows: [
        { Ho: 'Lê', Dem: 'Văn', Ten: 'Tám', Ngaysinh: '12/01/1980', HSL: 3.33 },
        { Ho: 'Trần', Dem: 'Đình', Ten: 'Trí', Ngaysinh: '10/12/1970', HSL: 3.66 },
        { Ho: 'Nguyễn', Dem: 'Hữu', Ten: 'Minh', Ngaysinh: '05/06/1980', HSL: 3.0 },
      ],
    },
    NHANVIEN: {
      schema: {
        name: 'NHANVIEN',
        attributes: [
          { name: 'Ho', domain: 'string', nullable: false },
          { name: 'Dem', domain: 'string', nullable: false },
          { name: 'Ten', domain: 'string', nullable: false },
          { name: 'Ngaysinh', domain: 'string', nullable: false },
          { name: 'HSL', domain: 'float' },
        ],
        primaryKey: ['Ho', 'Dem', 'Ten', 'Ngaysinh'],
      },
      rows: [
        { Ho: 'Trần', Dem: 'Văn', Ten: 'Đức', Ngaysinh: '10/01/1980', HSL: 3.33 },
        { Ho: 'Vũ', Dem: 'Vân', Ten: 'Long', Ngaysinh: '18/04/1971', HSL: 3.66 },
        { Ho: 'Phạm', Dem: 'Đức', Ten: 'Thành', Ngaysinh: '01/01/1969', HSL: 3.66 },
        { Ho: 'Nguyễn', Dem: 'Hữu', Ten: 'Minh', Ngaysinh: '05/06/1980', HSL: 3.0 },
      ],
    },
    MONHOC_SMALL: {
      schema: {
        name: 'MONHOC_SMALL',
        attributes: [
          { name: 'MaMH', domain: 'string', nullable: false },
          { name: 'SoTC', domain: 'integer' },
        ],
        primaryKey: ['MaMH'],
      },
      rows: [{ MaMH: 'CSDL', SoTC: 3 }],
    },
  },
};

const JOIN_TOY: DatabaseState = {
  id: 'JOIN_TOY',
  title: 'Quan hệ mẫu Chọn, Chiếu, Đề-các & Nối (C3_2.pdf tr. 28, 34, 50–67, 106)',
  description: 'Bộ bảng gọn để quan sát từng bước ghép cặp trong Chọn, Chiếu, Đề-các, Theta Join, Natural Join và Outer Join.',
  relations: {
    R_SEL: {
      schema: {
        name: 'R_SEL',
        attributes: [
          { name: 'A', domain: 'string', nullable: false },
          { name: 'B', domain: 'string', nullable: false },
          { name: 'C', domain: 'integer', nullable: false },
          { name: 'D', domain: 'integer', nullable: false },
        ],
        primaryKey: ['A', 'B', 'C'],
      },
      rows: [
        { A: 'α', B: 'α', C: 1, D: 7 },
        { A: 'α', B: 'β', C: 5, D: 7 },
        { A: 'β', B: 'β', C: 12, D: 3 },
        { A: 'β', B: 'β', C: 23, D: 10 },
      ],
    },
    R_PROJ: {
      schema: {
        name: 'R_PROJ',
        attributes: [
          { name: 'A', domain: 'string', nullable: false },
          { name: 'B', domain: 'integer', nullable: false },
          { name: 'C', domain: 'integer', nullable: false },
        ],
        primaryKey: ['A', 'B'],
      },
      rows: [
        { A: 'α', B: 10, C: 1 },
        { A: 'α', B: 20, C: 1 },
        { A: 'β', B: 30, C: 1 },
        { A: 'β', B: 40, C: 2 },
      ],
    },
    R_CART: {
      schema: {
        name: 'R_CART',
        attributes: [
          { name: 'A', domain: 'string', nullable: false },
          { name: 'B', domain: 'integer', nullable: false },
        ],
        primaryKey: ['A', 'B'],
      },
      rows: [
        { A: 'α', B: 1 },
        { A: 'β', B: 2 },
      ],
    },
    S_CART: {
      schema: {
        name: 'S_CART',
        attributes: [
          { name: 'B', domain: 'string', nullable: false },
          { name: 'C', domain: 'integer', nullable: false },
          { name: 'D', domain: 'string', nullable: false },
        ],
        primaryKey: ['B', 'C', 'D'],
      },
      rows: [
        { B: 'α', C: 10, D: '+' },
        { B: 'β', C: 10, D: '+' },
        { B: 'β', C: 20, D: '-' },
        { B: 'γ', C: 10, D: '-' },
      ],
    },
    R_THETA: {
      schema: {
        name: 'R_THETA',
        attributes: [
          { name: 'A', domain: 'integer', nullable: false },
          { name: 'B', domain: 'integer', nullable: false },
          { name: 'C', domain: 'integer', nullable: false },
        ],
        primaryKey: ['A'],
      },
      rows: [
        { A: 1, B: 2, C: 3 },
        { A: 4, B: 5, C: 6 },
        { A: 7, B: 8, C: 9 },
      ],
    },
    S_THETA: {
      schema: {
        name: 'S_THETA',
        attributes: [
          { name: 'D', domain: 'integer', nullable: false },
          { name: 'E', domain: 'integer', nullable: false },
        ],
        primaryKey: ['D'],
      },
      rows: [
        { D: 3, E: 1 },
        { D: 6, E: 2 },
      ],
    },
    T1: {
      schema: {
        name: 'T1',
        attributes: [
          { name: 'X', domain: 'integer', nullable: false },
          { name: 'Y', domain: 'string', nullable: false },
          { name: 'Z', domain: 'integer', nullable: false },
        ],
        primaryKey: ['X'],
      },
      rows: [
        { X: 10, Y: 'a', Z: 5 },
        { X: 15, Y: 'b', Z: 8 },
        { X: 25, Y: 'a', Z: 6 },
      ],
    },
    T2: {
      schema: {
        name: 'T2',
        attributes: [
          { name: 'A', domain: 'integer', nullable: false },
          { name: 'B', domain: 'string', nullable: false },
          { name: 'C', domain: 'integer', nullable: false },
        ],
        primaryKey: ['A', 'B', 'C'],
      },
      rows: [
        { A: 10, B: 'b', C: 6 },
        { A: 25, B: 'c', C: 3 },
        { A: 10, B: 'b', C: 5 },
      ],
    },
  },
};

const DIV_TOY: DatabaseState = {
  id: 'DIV_TOY',
  title: 'Quan hệ mẫu Phép chia (C3_2.pdf tr. 77, 81–84)',
  description: 'Dữ liệu kinh điển dùng để theo dõi 4 bước biến đổi T1, S×T1, T2, T1−T2 của Phép chia.',
  relations: {
    R: {
      schema: {
        name: 'R',
        attributes: [
          { name: 'A', domain: 'string', nullable: false },
          { name: 'B', domain: 'string', nullable: false },
          { name: 'C', domain: 'string', nullable: false },
          { name: 'D', domain: 'string', nullable: false },
        ],
        primaryKey: ['A', 'B', 'C', 'D'],
      },
      rows: [
        { A: 'a1', B: 'b1', C: 'x1', D: 'y1' },
        { A: 'a2', B: 'b2', C: 'x1', D: 'y1' },
        { A: 'a1', B: 'b2', C: 'x1', D: 'y1' },
        { A: 'a2', B: 'b2', C: 'x1', D: 'y2' },
        { A: 'a1', B: 'b1', C: 'x1', D: 'y2' },
        { A: 'a1', B: 'b1', C: 'x2', D: 'y1' },
        { A: 'a2', B: 'b2', C: 'x2', D: 'y1' },
        { A: 'a1', B: 'b1', C: 'x2', D: 'y2' },
        { A: 'a2', B: 'b3', C: 'x3', D: 'y2' },
        { A: 'a3', B: 'b1', C: 'x1', D: 'y3' },
      ],
    },
    S: {
      schema: {
        name: 'S',
        attributes: [
          { name: 'A', domain: 'string', nullable: false },
          { name: 'B', domain: 'string', nullable: false },
        ],
        primaryKey: ['A', 'B'],
      },
      rows: [
        { A: 'a1', B: 'b1' },
        { A: 'a2', B: 'b2' },
      ],
    },
  },
};

const AGG_TOY: DatabaseState = {
  id: 'AGG_TOY',
  title: 'Quan hệ mẫu Hàm kết hợp & Gom nhóm (C3_2.pdf tr. 92, 94)',
  description: 'Dữ liệu minh họa sự khác nhau giữa COUNT(B) và COUNT(*), cùng phép gom nhóm F.',
  relations: {
    R_AGG: {
      schema: {
        name: 'R_AGG',
        attributes: [
          { name: 'STT', domain: 'integer', nullable: false },
          { name: 'A', domain: 'integer', nullable: false },
          { name: 'B', domain: 'integer', nullable: true },
        ],
        primaryKey: ['STT'],
      },
      rows: [
        { STT: 1, A: 1, B: 2 },
        { STT: 2, A: 3, B: 4 },
        { STT: 3, A: 1, B: 2 },
        { STT: 4, A: 1, B: null },
      ],
    },
    R_GRP: {
      schema: {
        name: 'R_GRP',
        attributes: [
          { name: 'A', domain: 'string', nullable: false },
          { name: 'B', domain: 'integer', nullable: false },
          { name: 'C', domain: 'integer', nullable: false },
        ],
        primaryKey: ['A', 'B'],
      },
      rows: [
        { A: 'α', B: 2, C: 7 },
        { A: 'α', B: 4, C: 7 },
        { A: 'β', B: 2, C: 3 },
        { A: 'γ', B: 2, C: 10 },
      ],
    },
  },
};

export const UET_DATASETS: Record<string, DatabaseState> = {
  DAOTAO_FLAT,
  NHANVIEN_PHONG_FLAT,
  DAOTAO,
  DAOTAO_OUTER,
  CONGTY_PHG,
  CONGTY_EX,
  KYNANG_DB,
  BANHANG_DB,
  SET_OPS_TOY,
  JOIN_TOY,
  DIV_TOY,
  AGG_TOY,
};

export function cloneDatabase(db: DatabaseState): DatabaseState {
  const clonedRelations: Record<string, RelationInstance> = {};
  for (const [k, rel] of Object.entries(db.relations)) {
    clonedRelations[k] = {
      schema: {
        ...rel.schema,
        attributes: rel.schema.attributes.map((a) => ({ ...a })),
        primaryKey: [...rel.schema.primaryKey],
        foreignKeys: rel.schema.foreignKeys?.map((fk) => ({
          columns: [...fk.columns],
          refTable: fk.refTable,
          refColumns: [...fk.refColumns],
        })),
      },
      rows: rel.rows.map((r) => ({ ...r })),
    };
  }
  return {
    ...db,
    relations: clonedRelations,
  };
}
