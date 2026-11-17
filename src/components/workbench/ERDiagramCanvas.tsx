import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { formatMinMax } from '../../domain/er/erMappingEngine';
import { ERDiagramSpec } from '../../domain/types';

export interface ERDiagramCanvasProps {
  diagram: ERDiagramSpec;
  defaultNotation?: 'minMax' | 'ratio';
  overrideEdgeLabels?: Record<string, string>;
  overrideSpecialization?: {
    disjointness: 'd' | 'o' | 'u';
    completeness: 'total' | 'partial';
  };
}

interface Point {
  x: number;
  y: number;
}

function getNodeCenter(diagram: ERDiagramSpec, id: string): Point {
  const ent = diagram.entities.find((e) => e.id === id);
  if (ent) return { x: ent.x, y: ent.y };
  const rel = diagram.relationships.find((r) => r.id === id);
  if (rel) return { x: rel.x, y: rel.y };
  const attr = diagram.attributes.find((a) => a.id === id);
  if (attr) return { x: attr.x, y: attr.y };
  const spec = diagram.specializations?.find((s) => s.id === id);
  if (spec) return { x: spec.x, y: spec.y };
  return { x: 0, y: 0 };
}

function renderDoubleOrSingleLine(
  key: string,
  p1: Point,
  p2: Point,
  isDouble: boolean,
  curveOffset = 0,
) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * 2.5;
  const ny = (dx / len) * 2.5;

  if (curveOffset !== 0) {
    const mx = (p1.x + p2.x) / 2 + (-dy / len) * curveOffset;
    const my = (p1.y + p2.y) / 2 + (dx / len) * curveOffset;
    if (!isDouble) {
      return (
        <path
          key={key}
          d={`M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth={1.7}
        />
      );
    }
    return (
      <g key={key}>
        <path
          d={`M ${p1.x + nx} ${p1.y + ny} Q ${mx + nx} ${my + ny} ${p2.x + nx} ${p2.y + ny}`}
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth={1.5}
        />
        <path
          d={`M ${p1.x - nx} ${p1.y - ny} Q ${mx - nx} ${my - ny} ${p2.x - nx} ${p2.y - ny}`}
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth={1.5}
        />
      </g>
    );
  }

  if (!isDouble) {
    return (
      <line
        key={key}
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke="var(--border-strong)"
        strokeWidth={1.7}
      />
    );
  }

  return (
    <g key={key}>
      <line
        x1={p1.x + nx}
        y1={p1.y + ny}
        x2={p2.x + nx}
        y2={p2.y + ny}
        stroke="var(--text-secondary)"
        strokeWidth={1.5}
      />
      <line
        x1={p1.x - nx}
        y1={p1.y - ny}
        x2={p2.x - nx}
        y2={p2.y - ny}
        stroke="var(--text-secondary)"
        strokeWidth={1.5}
      />
    </g>
  );
}

export const ERDiagramCanvas: React.FC<ERDiagramCanvasProps> = ({
  diagram,
  defaultNotation = 'minMax',
  overrideEdgeLabels,
  overrideSpecialization,
}) => {
  const [notation, setNotation] = useState<'minMax' | 'ratio'>(defaultNotation);

  const width = diagram.width ?? 700;
  const height = diagram.height ?? 340;
  const hasEdges = diagram.edges.length > 0;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div
        className="px-3.5 py-2 border-b flex flex-wrap items-center justify-between gap-2"
        style={{
          backgroundColor: 'var(--bg-subtle)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
          {diagram.title}
        </div>

        {hasEdges && (
          <button
            type="button"
            onClick={() => setNotation((n) => (n === 'minMax' ? 'ratio' : 'minMax'))}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--accent-border)',
            }}
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>
              {notation === 'minMax'
                ? 'Đang xem: Ký hiệu (min, max) UET'
                : 'Đang xem: Tỉ số lực lượng 1 : N'}
            </span>
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] select-none"
          role="img"
          aria-label={diagram.title}
        >
          {/* 1. Attribute connector lines */}
          {diagram.attributes.map((attr) => {
            const parentPos = getNodeCenter(diagram, attr.parentId);
            return (
              <line
                key={`attr-line-${attr.id}`}
                x1={parentPos.x}
                y1={parentPos.y}
                x2={attr.x}
                y2={attr.y}
                stroke="var(--border-strong)"
                strokeWidth={1.3}
              />
            );
          })}

          {/* 2. Relationship participation edges & cardinality labels */}
          {diagram.edges.map((edge) => {
            const entPos = getNodeCenter(diagram, edge.entityId);
            const relPos = getNodeCenter(diagram, edge.relationshipId);
            const isTotal = Boolean(edge.totalParticipation || edge.minMax[0] > 0);
            const curve = edge.curveOffset ?? 0;

            const dx = relPos.x - entPos.x;
            const dy = relPos.y - entPos.y;
            const len = Math.hypot(dx, dy) || 1;
            const perpX = (-dy / len) * (curve !== 0 ? curve * 0.55 : 0);
            const perpY = (dx / len) * (curve !== 0 ? curve * 0.55 : 0);

            // Place (min, max) closer to Entity (36% along edge), or 1:N label
            const labelX = entPos.x + dx * 0.36 + perpX;
            const labelY = entPos.y + dy * 0.36 + perpY - 8;

            const displayLabel =
              overrideEdgeLabels?.[edge.id] ??
              (notation === 'minMax' ? formatMinMax(edge.minMax) : edge.ratioLabel);

            return (
              <g key={edge.id}>
                {renderDoubleOrSingleLine(`edge-${edge.id}`, entPos, relPos, isTotal, curve)}

                {edge.roleLabel && (
                  <text
                    x={entPos.x + dx * 0.62 + perpX}
                    y={entPos.y + dy * 0.62 + perpY + 13}
                    textAnchor="middle"
                    fontSize={10}
                    fill="var(--text-muted)"
                    fontStyle="italic"
                  >
                    {edge.roleLabel}
                  </text>
                )}

                <rect
                  x={labelX - 20}
                  y={labelY - 10}
                  width={40}
                  height={16}
                  rx={4}
                  fill="var(--bg-surface)"
                  stroke="var(--accent-border)"
                  strokeWidth={1}
                />
                <text
                  x={labelX}
                  y={labelY + 2}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill="var(--accent-primary)"
                >
                  {displayLabel}
                </text>
              </g>
            );
          })}

          {/* 3. EER Specialization / Union Connectors */}
          {diagram.specializations?.map((spec) => {
            const superPos = getNodeCenter(diagram, spec.superclassId);
            const activeDisjoint = overrideSpecialization?.disjointness ?? spec.disjointness;
            const activeCompleteness = overrideSpecialization?.completeness ?? spec.completeness;

            return (
              <g key={spec.id}>
                {activeDisjoint !== 'u' &&
                  renderDoubleOrSingleLine(
                    `spec-super-${spec.id}`,
                    superPos,
                    { x: spec.x, y: spec.y },
                    activeCompleteness === 'total',
                  )}

                {spec.subclassIds.map((subId) => {
                  const subPos = getNodeCenter(diagram, subId);
                  // If union type 'u', superclasses connect into 'u' and subclass hangs below with double/single line
                  const isUnionTarget = activeDisjoint === 'u' && subId === spec.subclassIds[0];
                  const midX = (spec.x + subPos.x) / 2;
                  const midY = (spec.y + subPos.y) / 2;

                  return (
                    <g key={`${spec.id}-${subId}`}>
                      {renderDoubleOrSingleLine(
                        `spec-sub-${spec.id}-${subId}`,
                        { x: spec.x, y: spec.y },
                        subPos,
                        isUnionTarget && activeCompleteness === 'total',
                      )}
                      <circle
                        cx={midX}
                        cy={midY}
                        r={8}
                        fill="var(--bg-surface)"
                        stroke="var(--border-subtle)"
                      />
                      <text
                        x={midX}
                        y={midY + 3.5}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={700}
                        fill="var(--accent-primary)"
                      >
                        ⊂
                      </text>
                    </g>
                  );
                })}

                {activeDisjoint === 'u' &&
                  renderDoubleOrSingleLine(
                    `spec-union-out-${spec.id}`,
                    superPos,
                    { x: spec.x, y: spec.y },
                    activeCompleteness === 'total',
                  )}

                {spec.predicateLabel && (
                  <text
                    x={spec.x + 22}
                    y={spec.y - 8}
                    fontSize={10}
                    fill="var(--text-secondary)"
                    fontStyle="italic"
                  >
                    {spec.predicateLabel}
                  </text>
                )}

                <circle
                  cx={spec.x}
                  cy={spec.y}
                  r={13}
                  fill="var(--accent-soft)"
                  stroke="var(--accent-primary)"
                  strokeWidth={1.8}
                />
                <text
                  x={spec.x}
                  y={spec.y + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill="var(--accent-primary)"
                >
                  {activeDisjoint}
                </text>
              </g>
            );
          })}

          {/* 4. Relationship Diamonds */}
          {diagram.relationships.map((rel) => {
            const rx = Math.max(52, rel.name.length * 4.3 + 16);
            const ry = 26;
            const pts = `${rel.x},${rel.y - ry} ${rel.x + rx},${rel.y} ${rel.x},${rel.y + ry} ${rel.x - rx},${rel.y}`;
            const innerPts = `${rel.x},${rel.y - (ry - 4)} ${rel.x + (rx - 6)},${rel.y} ${rel.x},${rel.y + (ry - 4)} ${rel.x - (rx - 6)},${rel.y}`;

            return (
              <g key={rel.id}>
                <polygon
                  points={pts}
                  fill="var(--bg-elevated)"
                  stroke="var(--accent-primary)"
                  strokeWidth={1.7}
                />
                {rel.identifying && (
                  <polygon
                    points={innerPts}
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth={1.3}
                  />
                )}
                <text
                  x={rel.x}
                  y={rel.y + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="var(--text-primary)"
                >
                  {rel.name}
                </text>
              </g>
            );
          })}

          {/* 5. Entity Rectangles */}
          {diagram.entities.map((ent) => {
            const w = Math.max(96, ent.name.length * 8.5 + 22);
            const h = 38;
            return (
              <g key={ent.id}>
                <rect
                  x={ent.x - w / 2}
                  y={ent.y - h / 2}
                  width={w}
                  height={h}
                  rx={4}
                  fill="var(--bg-surface)"
                  stroke="var(--text-primary)"
                  strokeWidth={1.8}
                />
                {ent.kind === 'weak' && (
                  <rect
                    x={ent.x - w / 2 + 4}
                    y={ent.y - h / 2 + 4}
                    width={w - 8}
                    height={h - 8}
                    rx={2}
                    fill="none"
                    stroke="var(--text-primary)"
                    strokeWidth={1.3}
                  />
                )}
                <text
                  x={ent.x}
                  y={ent.y + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill="var(--text-primary)"
                >
                  {ent.name}
                </text>
              </g>
            );
          })}

          {/* 6. Attribute Ovals */}
          {diagram.attributes.map((attr) => {
            const rx = Math.max(36, attr.name.length * 4.2 + 12);
            const ry = 15;
            const textW = attr.name.length * 6.2;

            return (
              <g key={attr.id}>
                <ellipse
                  cx={attr.x}
                  cy={attr.y}
                  rx={rx}
                  ry={ry}
                  fill="var(--bg-surface)"
                  stroke="var(--border-strong)"
                  strokeWidth={1.5}
                  strokeDasharray={attr.kind === 'derived' ? '4 3' : undefined}
                />
                {attr.kind === 'multivalued' && (
                  <ellipse
                    cx={attr.x}
                    cy={attr.y}
                    rx={rx - 3.5}
                    ry={ry - 3.5}
                    fill="none"
                    stroke="var(--border-strong)"
                    strokeWidth={1.2}
                  />
                )}
                <text
                  x={attr.x}
                  y={attr.y + 3.5}
                  textAnchor="middle"
                  fontSize={10.5}
                  fontWeight={attr.kind === 'key' || attr.kind === 'partialKey' ? 700 : 500}
                  fontFamily="var(--font-mono)"
                  fill="var(--text-primary)"
                >
                  {attr.name}
                </text>
                {attr.kind === 'key' && (
                  <line
                    x1={attr.x - textW / 2}
                    y1={attr.y + 6.5}
                    x2={attr.x + textW / 2}
                    y2={attr.y + 6.5}
                    stroke="var(--text-primary)"
                    strokeWidth={1.4}
                  />
                )}
                {attr.kind === 'partialKey' && (
                  <line
                    x1={attr.x - textW / 2}
                    y1={attr.y + 6.5}
                    x2={attr.x + textW / 2}
                    y2={attr.y + 6.5}
                    stroke="var(--text-primary)"
                    strokeWidth={1.4}
                    strokeDasharray="3 2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
