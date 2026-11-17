import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Layers,
  Play,
  Plus,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  DependencyRule,
  executeRelationalUpdate,
  FlatSimulationResult,
  OnDeletePolicy,
  RelationalUpdateResult,
  simulateFlatTableAction,
} from '../../domain/anomaly/anomalyEngine';
import { cloneDatabase, UET_DATASETS } from '../../domain/datasets/uetDatasets';
import { AnomalySimChallenge, DatabaseState } from '../../domain/types';
import { RichText } from '../common/RichText';
import { RelationTableView } from './RelationTableView';

export interface AnomalyWorkbenchProps {
  mode: 'flat-anomaly' | 'three-schema' | 'relational-update';
  datasetId?: string;
  title: string;
  caption?: string;
  challenge?: AnomalySimChallenge;
  onSolved?: () => void;
}

function getFlatDependencyRule(datasetId: string): DependencyRule {
  if (datasetId === 'NHANVIEN_PHONG_FLAT') {
    return { determinant: 'Donvi', dependents: ['Maql'] };
  }
  return { determinant: 'Mamon', dependents: ['Tenmon'] };
}

export const AnomalyWorkbench: React.FC<AnomalyWorkbenchProps> = ({
  mode,
  datasetId = 'DAOTAO_FLAT',
  title,
  caption,
  challenge,
  onSolved,
}) => {
  const sourceDb = UET_DATASETS[datasetId] ?? UET_DATASETS.DAOTAO_FLAT;

  // Flat-anomaly state
  const firstRelKey = Object.keys(sourceDb.relations)[0];
  const [flatDb, setFlatDb] = useState<DatabaseState>(() => cloneDatabase(sourceDb));
  const [flatFeedback, setFlatFeedback] = useState<FlatSimulationResult | null>(null);

  // Three-schema state
  const [physicalIndexed, setPhysicalIndexed] = useState(false);
  const [conceptualEmailAdded, setConceptualEmailAdded] = useState(false);
  const [schemaEventLog, setSchemaEventLog] = useState<string>(
    'Hệ thống đang chạy ổn định ở cả 3 mức lược đồ ANSI/SPARC.',
  );

  // Relational update state
  const [relDb, setRelDb] = useState<DatabaseState>(() => cloneDatabase(sourceDb));
  const [activeRelTab, setActiveRelTab] = useState<string>(firstRelKey);
  const [policy, setPolicy] = useState<OnDeletePolicy>('REJECT');
  const [commandInput, setCommandInput] = useState<string>(
    challenge?.presetCommands?.[0]?.command ?? '',
  );
  const [updateResult, setUpdateResult] = useState<RelationalUpdateResult | null>(null);

  useEffect(() => {
    const fresh = cloneDatabase(UET_DATASETS[datasetId] ?? UET_DATASETS.DAOTAO_FLAT);
    const firstKey = Object.keys(fresh.relations)[0];
    setFlatDb(fresh);
    setFlatFeedback(null);
    setRelDb(cloneDatabase(fresh));
    setActiveRelTab(firstKey);
    setUpdateResult(null);
    setCommandInput(challenge?.presetCommands?.[0]?.command ?? '');
  }, [datasetId, mode, challenge]);

  /* ==========================================================================
   * MODE 1: FLAT TABLE ANOMALY SIMULATOR (C1.pdf)
   * ======================================================================== */
  if (mode === 'flat-anomaly') {
    const rel = flatDb.relations[firstRelKey];
    const rule = getFlatDependencyRule(datasetId);

    const applyAction = (res: FlatSimulationResult) => {
      setFlatDb((prev) => ({
        ...prev,
        relations: {
          ...prev.relations,
          [firstRelKey]: res.updatedRelation,
        },
      }));
      setFlatFeedback(res);
      if (res.anomalyType !== 'NONE') {
        onSolved?.();
      }
    };

    const triggerUpdateAnomaly = () => {
      if (datasetId === 'NHANVIEN_PHONG_FLAT') {
        applyAction(
          simulateFlatTableAction(
            rel,
            { kind: 'update-single-row', rowIndex: 1, column: 'Maql', newValue: '11009' },
            rule,
          ),
        );
      } else {
        applyAction(
          simulateFlatTableAction(
            rel,
            { kind: 'update-single-row', rowIndex: 0, column: 'Tenmon', newValue: 'Hệ Cơ sở dữ liệu' },
            rule,
          ),
        );
      }
    };

    const triggerDeleteAnomaly = () => {
      if (datasetId === 'DAOTAO_FLAT') {
        // Student T3 (Trần Thị Hảo) appears on only 1 row -> deleting her exam score loses her student record
        const studentRule: DependencyRule = { determinant: 'Masv', dependents: ['Ho', 'Dem', 'Ten'] };
        const t3Idx = rel.rows.findIndex((r) => r.Masv === 'T3');
        const idxToDelete = t3Idx >= 0 ? t3Idx : rel.rows.length - 1;
        applyAction(
          simulateFlatTableAction(rel, { kind: 'delete-row', rowIndex: idxToDelete }, studentRule),
        );
        return;
      }
      const counts = new Map<string, number>();
      rel.rows.forEach((r) => {
        const k = String(r[rule.determinant]);
        counts.set(k, (counts.get(k) ?? 0) + 1);
      });
      const singletonIdx = rel.rows.findIndex(
        (r) => (counts.get(String(r[rule.determinant])) ?? 0) === 1,
      );
      const idxToDelete = singletonIdx >= 0 ? singletonIdx : rel.rows.length - 1;
      applyAction(simulateFlatTableAction(rel, { kind: 'delete-row', rowIndex: idxToDelete }, rule));
    };

    const triggerInsertAnomaly = () => {
      if (datasetId === 'NHANVIEN_PHONG_FLAT') {
        applyAction(
          simulateFlatTableAction(
            rel,
            {
              kind: 'insert-partial',
              values: { Manv: null, Ho: null, Dem: null, Ten: null, Donvi: 'Pháp chế', Maql: '11010' },
            },
            rule,
          ),
        );
      } else {
        applyAction(
          simulateFlatTableAction(
            rel,
            {
              kind: 'insert-partial',
              values: {
                Masv: null,
                Ho: null,
                Dem: null,
                Ten: null,
                Mamon: 'Int3401',
                Tenmon: 'Trí tuệ nhân tạo',
                Diem: null,
              },
            },
            rule,
          ),
        );
      }
    };

    return (
      <div className="space-y-4">
        <div
          className="rounded-xl p-4 border space-y-2"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <h3 className="text-sm font-bold">{title}</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setFlatDb(cloneDatabase(sourceDb));
                setFlatFeedback(null);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Khôi phục gốc</span>
            </button>
          </div>
          {caption && (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {caption}
            </p>
          )}

          {/* Quick Anomaly Trigger Buttons */}
          <div className="pt-1 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={triggerUpdateAnomaly}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--warning-bg)',
                color: 'var(--warning-text)',
                border: '1px solid var(--warning-border)',
              }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>1. Gây Dị thường Sửa đổi</span>
            </button>

            <button
              type="button"
              onClick={triggerDeleteAnomaly}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error-text)',
                border: '1px solid var(--error-border)',
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>2. Gây Dị thường Xóa</span>
            </button>

            <button
              type="button"
              onClick={triggerInsertAnomaly}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--info-bg)',
                color: 'var(--info-text)',
                border: '1px solid var(--info-border)',
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>3. Gây Dị thường Chèn (PK null)</span>
            </button>
          </div>
        </div>

        {flatFeedback && (
          <div
            className="rounded-xl p-3.5 border text-xs sm:text-sm leading-relaxed flex items-start gap-2.5"
            style={{
              backgroundColor:
                flatFeedback.anomalyType === 'NONE' ? 'var(--info-bg)' : 'var(--error-bg)',
              borderColor:
                flatFeedback.anomalyType === 'NONE' ? 'var(--info-border)' : 'var(--error-border)',
              color:
                flatFeedback.anomalyType === 'NONE' ? 'var(--info-text)' : 'var(--error-text)',
            }}
          >
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold mb-0.5">
                {flatFeedback.anomalyType === 'NONE'
                  ? 'Trạng thái bảng sau thao tác'
                  : `Phát hiện ${flatFeedback.anomalyType}!`}
              </div>
              <RichText content={flatFeedback.message} />
            </div>
          </div>
        )}

        <RelationTableView
          relation={rel}
          onCellEdit={(rowIndex, column, newValue) =>
            applyAction(simulateFlatTableAction(rel, { kind: 'update-single-row', rowIndex, column, newValue }, rule))
          }
          onRowDelete={(rowIndex) =>
            applyAction(simulateFlatTableAction(rel, { kind: 'delete-row', rowIndex }, rule))
          }
        />
      </div>
    );
  }

  /* ==========================================================================
   * MODE 2: ANSI/SPARC 3-SCHEMA & DATA INDEPENDENCE (C1.pdf pp. 33–39)
   * ======================================================================== */
  if (mode === 'three-schema') {
    return (
      <div className="space-y-4">
        <div
          className="rounded-xl p-4 border space-y-3"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-sm font-bold">{title}</h3>
          </div>
          {caption && (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {caption}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                const next = !physicalIndexed;
                setPhysicalIndexed(next);
                setSchemaEventLog(
                  next
                    ? 'Độc lập dữ liệu vật lý: DBA vừa thêm chỉ mục B+Tree trên MaSV ở Mức trong. Ánh xạ Quan niệm–Trong tự điều chỉnh, còn Lược đồ Quan niệm và Mức ngoài giữ nguyên 100%!'
                    : 'Đã gỡ chỉ mục B+Tree ở Mức trong — ứng dụng ở Mức ngoài hoàn toàn không bị ảnh hưởng.',
                );
                onSolved?.();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: physicalIndexed ? 'var(--success-bg)' : 'var(--accent-soft)',
                color: physicalIndexed ? 'var(--success-text)' : 'var(--accent-primary)',
                border: `1px solid ${physicalIndexed ? 'var(--success-border)' : 'var(--accent-border)'}`,
              }}
            >
              {physicalIndexed ? 'Đã bật B+Tree Index (Mức trong)' : 'Thử Độc lập Vật lý: Thêm B+Tree Index'}
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !conceptualEmailAdded;
                setConceptualEmailAdded(next);
                setSchemaEventLog(
                  next
                    ? 'Độc lập dữ liệu logic: Thêm thuộc tính Email vào bảng SINHVIEN ở Mức quan niệm. Nhờ ánh xạ Ngoài–Quan niệm, Khung nhìn Bảng điểm của Phòng Đào tạo không phải viết lại code!'
                    : 'Đã thu hồi cột Email khỏi Mức quan niệm — Khung nhìn Bảng điểm vẫn giữ nguyên cấu trúc.',
                );
                onSolved?.();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              style={{
                backgroundColor: conceptualEmailAdded ? 'var(--success-bg)' : 'var(--info-bg)',
                color: conceptualEmailAdded ? 'var(--success-text)' : 'var(--info-text)',
                border: `1px solid ${conceptualEmailAdded ? 'var(--success-border)' : 'var(--info-border)'}`,
              }}
            >
              {conceptualEmailAdded
                ? 'Đã thêm cột Email (Mức quan niệm)'
                : 'Thử Độc lập Logic: Thêm cột Email'}
            </button>
          </div>
        </div>

        {/* Visual 3-Layer Stack */}
        <div className="space-y-2.5">
          {/* External Level */}
          <div
            className="rounded-xl p-3.5 border"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                1. Mức ngoài (External / View Schema)
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
                Ứng dụng không đổi
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
                View_BangDiem(MaSV, TenMH, Diem)
              </div>
              <div className="p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
                View_DanhMucMH(MaMH, TenMH, SoTC)
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            ↕ Ánh xạ Ngoài – Quan niệm (Bảo đảm Độc lập Dữ liệu Logic)
          </div>

          {/* Conceptual Level */}
          <div
            className="rounded-xl p-3.5 border transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: conceptualEmailAdded ? 'var(--accent-primary)' : 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                2. Mức quan niệm (Conceptual Schema)
              </span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                Cấu trúc logic toàn CSDL
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="p-2 rounded border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
                SINHVIEN(<u>MaSV</u>, HoTen, NgaySinh{conceptualEmailAdded ? ', Email [MỚI]' : ''})
              </div>
              <div className="p-2 rounded border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
                KETQUA(<u>MaSV, MaMH</u>, Diem)
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            ↕ Ánh xạ Quan niệm – Trong (Bảo đảm Độc lập Dữ liệu Vật lý)
          </div>

          {/* Internal Level */}
          <div
            className="rounded-xl p-3.5 border transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: physicalIndexed ? 'var(--accent-primary)' : 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                3. Mức trong (Internal / Physical Schema)
              </span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                Tệp, khối đĩa & chỉ mục
              </span>
            </div>
            <div className="font-mono text-xs p-2.5 rounded border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
              HeapFile: sinhvien.dat (Page 8KB, UTF-8)
              {physicalIndexed ? ' + B+Tree Index idx_sinhvien_masv [MỚI]' : ' (Chưa đánh chỉ mục)'}
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-3.5 border text-xs sm:text-sm"
          style={{
            backgroundColor: 'var(--info-bg)',
            borderColor: 'var(--info-border)',
            color: 'var(--info-text)',
          }}
        >
          {schemaEventLog}
        </div>
      </div>
    );
  }

  /* ==========================================================================
   * MODE 3: RELATIONAL UPDATE & CONSTRAINT SANDBOX (C3_2.pdf pp. 5–16)
   * ======================================================================== */
  const runUpdateCommand = (cmd: string, expectedStatus?: string) => {
    setCommandInput(cmd);
    const res = executeRelationalUpdate(relDb, cmd, policy);
    setUpdateResult(res);
    if (res.status === 'ok') {
      setRelDb(res.nextDb);
      if (res.affectedTable && res.nextDb.relations[res.affectedTable]) {
        setActiveRelTab(res.affectedTable);
      }
    }
    if (!expectedStatus || res.status === expectedStatus) {
      onSolved?.();
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl p-4 border space-y-3"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-sm font-bold">{title}</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setRelDb(cloneDatabase(sourceDb));
              setUpdateResult(null);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Khôi phục CSDL</span>
          </button>
        </div>

        {/* Policy Selector for Referential Integrity on DELETE */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Chính sách xử lý vi phạm FK khi DELETE:
          </span>
          {(['REJECT', 'CASCADE', 'SET_NULL'] as OnDeletePolicy[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPolicy(p)}
              className="font-mono px-2.5 py-1 rounded-md font-semibold cursor-pointer"
              style={{
                backgroundColor: policy === p ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                color: policy === p ? '#FFFFFF' : 'var(--text-secondary)',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Preset Commands */}
        {challenge?.presetCommands && challenge.presetCommands.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {challenge.presetCommands.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => runUpdateCommand(preset.command, preset.expectStatus)}
                className="text-left px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-strong)',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {/* Command Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runUpdateCommand(commandInput);
            }}
            placeholder="Ví dụ: INSERT(PHONGBAN; 6, 'Pháp chế', 'NV01', '01/01/2025')"
            aria-label="Lệnh cập nhật quan hệ UET"
            className="flex-1 px-3 py-2 rounded-lg font-mono text-xs border"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="button"
            onClick={() => runUpdateCommand(commandInput)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#FFFFFF',
            }}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Thực thi</span>
          </button>
        </div>
      </div>

      {/* Diagnostic Banner */}
      {updateResult && (
        <div
          className="rounded-xl p-3.5 border text-xs sm:text-sm flex items-start gap-2.5"
          style={{
            backgroundColor: updateResult.status === 'ok' ? 'var(--success-bg)' : 'var(--error-bg)',
            borderColor:
              updateResult.status === 'ok' ? 'var(--success-border)' : 'var(--error-border)',
            color: updateResult.status === 'ok' ? 'var(--success-text)' : 'var(--error-text)',
          }}
        >
          {updateResult.status === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <div>
            <div className="font-mono font-bold text-xs uppercase mb-0.5">{updateResult.status}</div>
            <div>{updateResult.message}</div>
          </div>
        </div>
      )}

      {/* Database Relation Tabs */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(relDb.relations).map((rName) => {
            const active = rName === activeRelTab;
            return (
              <button
                key={rName}
                type="button"
                onClick={() => setActiveRelTab(rName)}
                className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer"
                style={{
                  backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  borderColor: active ? 'var(--accent-border)' : 'var(--border-subtle)',
                }}
              >
                {rName} ({relDb.relations[rName].rows.length})
              </button>
            );
          })}
        </div>

        {relDb.relations[activeRelTab] && (
          <RelationTableView relation={relDb.relations[activeRelTab]} compact />
        )}
      </div>
    </div>
  );
};
