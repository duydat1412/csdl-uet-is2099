import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { UET_DATASETS } from '../../domain/datasets/uetDatasets';
import { UET_ER_DIAGRAMS } from '../../domain/datasets/uetERDiagrams';
import { MicroStepSpec } from '../../domain/types';
import { RichText } from '../common/RichText';
import { AlgebraPlayground } from './AlgebraPlayground';
import { AnomalyWorkbench } from './AnomalyWorkbench';
import { ERDiagramCanvas } from './ERDiagramCanvas';
import { RelationTableView } from './RelationTableView';
import { SchemaMapperWorkbench } from './SchemaMapperWorkbench';

export interface WorkbenchHostProps {
  step: MicroStepSpec;
  savedAnswer?: string;
  onSaveAnswer: (val: string) => void;
  onSolved: () => void;
}

export const WorkbenchHost: React.FC<WorkbenchHostProps> = ({
  step,
  savedAnswer,
  onSaveAnswer,
  onSolved,
}) => {
  const wb = step.workbench;
  const ch = step.challenge;

  const previewDatasetId = wb?.datasetId ?? 'CONGTY_PHG';
  const previewDb = UET_DATASETS[previewDatasetId] ?? UET_DATASETS.CONGTY_PHG;
  const previewRelNames = Object.keys(previewDb.relations);
  const [selectedPreviewRel, setSelectedPreviewRel] = useState<string>(previewRelNames[0] ?? '');

  // 1. Challenge-driven dispatch takes priority when challenge is a workbench challenge
  if (ch?.type === 'anomaly-sim') {
    return (
      <AnomalyWorkbench
        mode={ch.mode}
        datasetId={ch.datasetId}
        title={wb?.title ?? 'Mô phỏng Dị thường & Ràng buộc toàn vẹn'}
        caption={wb?.caption}
        challenge={ch}
        onSolved={onSolved}
      />
    );
  }

  if (
    ch?.type === 'cardinality-toggle' ||
    ch?.type === 'eer-validator' ||
    ch?.type === 'schema-mapper'
  ) {
    return (
      <SchemaMapperWorkbench
        diagramId={ch.diagramId}
        title={wb?.title ?? 'Bàn thực hành Thiết kế ER / EER & Ánh xạ Quan hệ'}
        caption={wb?.caption}
        challenge={ch}
        onSolved={onSolved}
      />
    );
  }

  if (ch?.type === 'algebra') {
    return (
      <AlgebraPlayground
        datasetId={ch.datasetId}
        title={wb?.title ?? 'Sân chơi Đại số Quan hệ UET'}
        caption={wb?.caption}
        savedExpression={savedAnswer}
        challenge={ch}
        onSaveExpression={onSaveAnswer}
        onSolved={onSolved}
      />
    );
  }

  // 2. Exploratory Workbench panel config (when step has no challenge or has an inline quiz)
  if (wb?.kind === 'anomaly') {
    return (
      <AnomalyWorkbench
        mode="flat-anomaly"
        datasetId={wb.datasetId}
        title={wb.title}
        caption={wb.caption}
      />
    );
  }

  if (wb?.kind === 'three-schema') {
    return (
      <AnomalyWorkbench
        mode="three-schema"
        datasetId={wb.datasetId}
        title={wb.title}
        caption={wb.caption}
      />
    );
  }

  if (wb?.kind === 'er-diagram') {
    const diagram = UET_ER_DIAGRAMS[wb.diagramId ?? 'NV_PB_BASIC'] ?? UET_ER_DIAGRAMS.NV_PB_BASIC;
    return (
      <div className="space-y-3">
        <div
          className="rounded-xl p-3.5 border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
        >
          <h3 className="text-sm font-bold">{wb.title}</h3>
          {wb.caption && (
            <div className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              <RichText content={wb.caption} />
            </div>
          )}
        </div>
        <ERDiagramCanvas diagram={diagram} />
      </div>
    );
  }

  if (wb?.kind === 'schema-mapper') {
    return (
      <SchemaMapperWorkbench
        diagramId={wb.diagramId}
        title={wb.title}
        caption={wb.caption}
      />
    );
  }

  if (wb?.kind === 'algebra') {
    return (
      <AlgebraPlayground
        datasetId={wb.datasetId}
        title={wb.title}
        caption={wb.caption}
        initialExpression={wb.initialExpression}
      />
    );
  }

  // Default: Multi-table Dataset Explorer
  const activeTab = previewDb.relations[selectedPreviewRel]
    ? selectedPreviewRel
    : previewRelNames[0];

  return (
    <div className="space-y-3.5">
      <div
        className="rounded-xl p-4 border space-y-1.5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <h3 className="text-sm font-bold">{wb?.title ?? previewDb.title}</h3>
        </div>
        <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
          <RichText content={wb?.caption ?? previewDb.description} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {previewRelNames.map((rName) => {
          const active = rName === activeTab;
          return (
            <button
              key={rName}
              type="button"
              onClick={() => setSelectedPreviewRel(rName)}
              className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer"
              style={{
                backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
                color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderColor: active ? 'var(--accent-border)' : 'var(--border-subtle)',
              }}
            >
              {rName} ({previewDb.relations[rName].rows.length})
            </button>
          );
        })}
      </div>

      {activeTab && previewDb.relations[activeTab] && (
        <RelationTableView relation={previewDb.relations[activeTab]} />
      )}
    </div>
  );
};
