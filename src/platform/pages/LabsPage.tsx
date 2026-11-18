import React, { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { AlgebraPlayground } from '../../components/workbench/AlgebraPlayground';
import { AnomalyWorkbench } from '../../components/workbench/AnomalyWorkbench';
import { NormalizationWorkbench } from '../../components/workbench/NormalizationWorkbench';
import { SchemaMapperWorkbench } from '../../components/workbench/SchemaMapperWorkbench';
import { SQLWorkbench } from '../../components/workbench/SQLWorkbench';
import { CourseManifest } from '../types';
import { IosGlassSurface, ReadingGlassPanel } from '../ui/GlassPrimitives';

export interface LabsPageProps {
  course: CourseManifest;
  onGoLearn: () => void;
}

export const LabsPage: React.FC<LabsPageProps> = ({ course, onGoLearn }) => {
  const [selectedLabId, setSelectedLabId] = useState<string>(course.labs[0]?.id ?? '');

  useEffect(() => {
    setSelectedLabId(course.labs[0]?.id ?? '');
  }, [course.id, course.labs]);

  const activeLab =
    course.labs.find((l) => l.id === selectedLabId) ?? course.labs[0] ?? null;

  if (!activeLab) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <IosGlassSurface className="p-8 text-center space-y-3">
          <FlaskConical className="w-8 h-8 mx-auto" style={{ color: 'var(--accent-primary)' }} />
          <h1 className="text-xl font-bold">Môn học {course.code} chưa đăng ký Phòng Lab riêng</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Bạn có thể thực hành toàn bộ 5 Engine tương tác tại học phần <code>UET · IS2099</code> hoặc đọc phần bài giảng mẫu.
          </p>
          <button
            type="button"
            onClick={onGoLearn}
            className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
          >
            Quay về Bài giảng
          </button>
        </IosGlassSurface>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1320px] px-3 sm:px-6 py-5 sm:py-7 space-y-5 pb-20">
      <ReadingGlassPanel className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
              Phòng Thí nghiệm Tương tác Tự do · {course.code}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Thử nghiệm Tự do Không Ràng buộc Bài học
            </h1>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
            {activeLab.badge}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {course.labs.map((lab) => {
            const active = lab.id === activeLab.id;
            return (
              <button
                key={lab.id}
                type="button"
                onClick={() => setSelectedLabId(lab.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors"
                style={{
                  backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: active ? '#FFFFFF' : 'var(--text-primary)',
                  borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                }}
              >
                {lab.title}
              </button>
            );
          })}
        </div>

        <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
          {activeLab.subtitle}
        </p>
      </ReadingGlassPanel>

      <div key={activeLab.id}>
        {activeLab.engineKind === 'algebra' && (
          <AlgebraPlayground
            datasetId={activeLab.defaultDatasetId ?? 'CONGTY_EX'}
            title={activeLab.title}
            caption={activeLab.subtitle}
            initialExpression="π_{HONV, TENNV}(σ_{LUONG >= 40000}(NHANVIEN))"
          />
        )}
        {activeLab.engineKind === 'normalization' && (
          <NormalizationWorkbench title={activeLab.title} caption={activeLab.subtitle} />
        )}
        {activeLab.engineKind === 'sql' && (
          <SQLWorkbench
            datasetId={activeLab.defaultDatasetId ?? 'DAOTAO'}
            title={activeLab.title}
            caption={activeLab.subtitle}
            initialSql="SELECT sv.Masv, sv.Ho, sv.Dem, sv.Ten FROM SINHVIEN sv"
          />
        )}
        {activeLab.engineKind === 'er-schema' && (
          <SchemaMapperWorkbench
            diagramId={activeLab.defaultDiagramId ?? 'CONGTY_ER'}
            title={activeLab.title}
            caption={activeLab.subtitle}
          />
        )}
        {activeLab.engineKind === 'anomaly' && (
          <AnomalyWorkbench
            mode="flat-anomaly"
            datasetId={activeLab.defaultDatasetId ?? 'DAOTAO_FLAT'}
            title={activeLab.title}
            caption={activeLab.subtitle}
          />
        )}
      </div>
    </div>
  );
};
