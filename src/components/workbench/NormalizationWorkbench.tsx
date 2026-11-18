import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  GitFork,
  KeyRound,
  Layers,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  analyzeNormalForms,
  computeAttributeClosure,
  computeMinimalCover,
  decomposeToBCNF,
  formatFd,
  partitionAttributesLMR,
  UET_FD_PRESETS,
} from '../../domain/fd/fdEngine';
import { FDChallenge, FunctionalDependencySpec } from '../../domain/types';
import { MathFormula } from '../common/MathFormula';
import { RichText } from '../common/RichText';

export interface NormalizationWorkbenchProps {
  title: string;
  caption?: string;
  preset?: {
    relationName: string;
    attributes: string[];
    fds: FunctionalDependencySpec[];
  };
  challenge?: FDChallenge;
  onSolved?: () => void;
}

function parseFdLine(line: string): FunctionalDependencySpec | null {
  const parts = line.split(/->|→/);
  if (parts.length !== 2) return null;
  const splitSide = (s: string) => {
    const trimmed = s.trim();
    if (!trimmed) return [];
    if (trimmed.includes(',') || trimmed.includes(' ')) {
      return trimmed
        .split(/[\s,]+/)
        .map((x) => x.trim())
        .filter(Boolean);
    }
    return trimmed.split('').filter(Boolean);
  };
  const left = splitSide(parts[0]);
  const right = splitSide(parts[1]);
  if (left.length === 0 || right.length === 0) return null;
  return { left, right };
}

export const NormalizationWorkbench: React.FC<NormalizationWorkbenchProps> = ({
  title,
  caption,
  preset,
  challenge,
  onSolved,
}) => {
  const initialAttrs =
    challenge?.attributes ?? preset?.attributes ?? UET_FD_PRESETS[0].attributes;
  const initialFds = challenge?.fds ?? preset?.fds ?? UET_FD_PRESETS[0].fds;
  const initialRelName =
    challenge?.relationName ?? preset?.relationName ?? UET_FD_PRESETS[0].relationName;

  const [relationName, setRelationName] = useState(initialRelName);
  const [attributes, setAttributes] = useState<string[]>(initialAttrs);
  const [fds, setFds] = useState<FunctionalDependencySpec[]>(initialFds);
  const [selectedSeed, setSelectedSeed] = useState<string[]>(
    challenge?.seedClosureTarget ?? [initialAttrs[0]].filter(Boolean),
  );
  const [newFdInput, setNewFdInput] = useState('');
  const [customAttrInput, setCustomAttrInput] = useState(initialAttrs.join(', '));
  const [activeTab, setActiveTab] = useState<'closure' | 'keys' | 'norm' | 'bcnf'>('closure');

  // Interactive Challenge State
  const [answerSet, setAnswerSet] = useState<string[]>(
    challenge?.seedClosureTarget ?? [],
  );
  const [selectedNormalForm, setSelectedNormalForm] = useState<
    '1NF' | '2NF' | '3NF' | 'BCNF'
  >('1NF');
  const [gradeFeedback, setGradeFeedback] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  useEffect(() => {
    const attrs =
      challenge?.attributes ?? preset?.attributes ?? UET_FD_PRESETS[0].attributes;
    const f = challenge?.fds ?? preset?.fds ?? UET_FD_PRESETS[0].fds;
    const rel =
      challenge?.relationName ?? preset?.relationName ?? UET_FD_PRESETS[0].relationName;
    setRelationName(rel);
    setAttributes(attrs);
    setFds(f);
    setCustomAttrInput(attrs.join(', '));
    setSelectedSeed(challenge?.seedClosureTarget ?? [attrs[0]].filter(Boolean));
    setAnswerSet(challenge?.seedClosureTarget ?? []);
    setGradeFeedback(null);
    if (challenge?.mode === 'candidate-keys') setActiveTab('keys');
    else if (challenge?.mode === 'normal-form') setActiveTab('norm');
    else setActiveTab('closure');
  }, [challenge, preset]);

  const closureResult = useMemo(
    () => computeAttributeClosure(selectedSeed, fds),
    [selectedSeed, fds],
  );

  const lmr = useMemo(
    () => partitionAttributesLMR(attributes, fds),
    [attributes, fds],
  );

  const nfAnalysis = useMemo(
    () => analyzeNormalForms(attributes, fds),
    [attributes, fds],
  );

  const minimalCover = useMemo(() => computeMinimalCover(fds), [fds]);

  const bcnfResult = useMemo(
    () => decomposeToBCNF(attributes, fds),
    [attributes, fds],
  );

  const loadPreset = (presetId: string) => {
    const found = UET_FD_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setRelationName(found.relationName);
    setAttributes(found.attributes);
    setCustomAttrInput(found.attributes.join(', '));
    setFds(found.fds);
    setSelectedSeed([found.attributes[0]].filter(Boolean));
  };

  const handleCheckChallenge = () => {
    if (!challenge) return;

    if (challenge.mode === 'closure') {
      const target = [...(challenge.expectedClosure ?? closureResult.closure)]
        .sort()
        .join(',');
      const actual = [...answerSet].sort().join(',');
      if (target === actual) {
        setGradeFeedback({
          ok: true,
          text: `Chính xác! Bao đóng {${challenge.seedClosureTarget?.join(', ')}}+ = {${target.split(',').join(', ')}}. Đã mở khóa bước tiếp theo!`,
        });
        onSolved?.();
      } else {
        setGradeFeedback({
          ok: false,
          text: `Chưa khớp: Bạn đang chọn {${actual.split(',').join(', ')}}, hãy áp dụng từng phụ thuộc hàm một và bật tab "Bao đóng X+" phía trên để đối chiếu từng bước!`,
        });
      }
      return;
    }

    if (challenge.mode === 'candidate-keys') {
      const expectedKeys = (
        challenge.expectedKeys ?? nfAnalysis.candidateKeys
      ).map((k) => [...k].sort().join(','));
      const sortedAnswer = [...answerSet].sort().join(',');
      if (expectedKeys.includes(sortedAnswer)) {
        setGradeFeedback({
          ok: true,
          text: `Chính xác! {${sortedAnswer.split(',').join(', ')}} là một Khóa dự tuyển tối tiểu của lược đồ ${relationName}.`,
        });
        onSolved?.();
      } else {
        setGradeFeedback({
          ok: false,
          text: `Chưa đúng khóa dự tuyển tối tiểu! Kiểm tra lại tập Nguồn L = {${lmr.sourceL.join(', ')}} (bắt buộc phải có mặt trong mọi khóa) và tính bao đóng sao cho đạt toàn bộ R.`,
        });
      }
      return;
    }

    if (challenge.mode === 'normal-form') {
      const expectedNf =
        challenge.expectedHighestNormalForm ?? nfAnalysis.highestNormalForm;
      if (selectedNormalForm === expectedNf) {
        setGradeFeedback({
          ok: true,
          text: `Chuẩn xác! Lược đồ ${relationName} đạt dạng chuẩn cao nhất là ${expectedNf}.`,
        });
        onSolved?.();
      } else {
        setGradeFeedback({
          ok: false,
          text: `Chưa đúng! Gợi ý: Kiểm tra từng phụ thuộc hàm xem có phụ thuộc bộ phận vào khóa (vi phạm 2NF), phụ thuộc bắc cầu (vi phạm 3NF), hay vế trái chưa phải siêu khóa (vi phạm BCNF).`,
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & UET Presets */}
      <div className="rounded-2xl ios-frosted-panel p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-sm font-bold">{title}</h3>
          </div>
          {!challenge && (
            <div className="flex flex-wrap gap-1.5">
              {UET_FD_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => loadPreset(p.id)}
                  className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors"
                  style={{
                    backgroundColor:
                      relationName === p.relationName ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    color:
                      relationName === p.relationName ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    borderColor:
                      relationName === p.relationName ? 'var(--accent-border)' : 'var(--border-subtle)',
                  }}
                >
                  {p.relationName}
                </button>
              ))}
            </div>
          )}
        </div>

        {caption && (
          <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <RichText content={caption} />
          </div>
        )}

        {/* Current Schema + FDs Summary */}
        <div
          className="rounded-xl p-3 border space-y-2"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="text-xs sm:text-sm overflow-x-auto overflow-y-hidden py-0.5">
            <MathFormula
              tex={`${relationName.replace(/_/g, '\\_')}(${attributes
                .map((a) => `\\text{${a.replace(/_/g, '\\_')}}`)
                .join(',\\; ')})`}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-semibold mr-1" style={{ color: 'var(--text-muted)' }}>
              Tập PTH <MathFormula tex="F:" />
            </span>
            {fds.map((fd, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <span>{formatFd(fd)}</span>
                {!challenge && (
                  <button
                    type="button"
                    onClick={() => setFds((prev) => prev.filter((_, j) => j !== i))}
                    aria-label="Xóa phụ thuộc hàm"
                    className="opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {!challenge && (
            <div className="pt-2 border-t grid grid-cols-1 xl:grid-cols-2 gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customAttrInput}
                  onChange={(e) => setCustomAttrInput(e.target.value)}
                  placeholder="Tập thuộc tính: A, B, C, D"
                  aria-label="Tập thuộc tính quan hệ"
                  className="flex-1 px-2.5 py-1 rounded-lg font-mono text-xs border"
                  style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const parsed = customAttrInput
                      .split(/[\s,]+/)
                      .map((s) => s.trim())
                      .filter(Boolean);
                    if (parsed.length > 0) {
                      setAttributes(Array.from(new Set(parsed)));
                      setSelectedSeed([parsed[0]]);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-strong)' }}
                >
                  Đặt R
                </button>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newFdInput}
                  onChange={(e) => setNewFdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const fd = parseFdLine(newFdInput);
                      if (fd) {
                        setFds((prev) => [...prev, fd]);
                        setNewFdInput('');
                      }
                    }
                  }}
                  placeholder="Thêm PTH: A,B -> C (hoặc Manv -> Hoten)"
                  aria-label="Thêm phụ thuộc hàm mới"
                  className="flex-1 px-2.5 py-1 rounded-lg font-mono text-xs border"
                  style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const fd = parseFdLine(newFdInput);
                    if (fd) {
                      setFds((prev) => [...prev, fd]);
                      setNewFdInput('');
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                  style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm FD</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Challenge Interactive Box (when embedded in a Lesson Step) */}
      {challenge && (
        <div
          className="rounded-2xl ios-frosted-strong p-4 border space-y-3"
          style={{ borderColor: 'var(--accent-border)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
              Nhiệm vụ Chấm tự động (
              {challenge.mode === 'closure'
                ? 'Tính bao đóng X+'
                : challenge.mode === 'candidate-keys'
                  ? 'Chọn đúng tập Khóa dự tuyển'
                  : 'Xác định Dạng chuẩn cao nhất'}
              )
            </div>
            <button
              type="button"
              onClick={() => {
                setAnswerSet(challenge.seedClosureTarget ?? []);
                setGradeFeedback(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Chọn lại</span>
            </button>
          </div>

          {(challenge.mode === 'closure' || challenge.mode === 'candidate-keys') && (
            <div className="flex flex-wrap gap-1.5">
              {attributes.map((attr) => {
                const picked = answerSet.includes(attr);
                return (
                  <button
                    key={`ans-${attr}`}
                    type="button"
                    onClick={() =>
                      setAnswerSet((prev) =>
                        prev.includes(attr) ? prev.filter((x) => x !== attr) : [...prev, attr],
                      )
                    }
                    className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer transition-colors"
                    style={{
                      backgroundColor: picked ? 'var(--accent-primary)' : 'var(--bg-surface)',
                      color: picked ? '#FFFFFF' : 'var(--text-primary)',
                      borderColor: picked ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    }}
                  >
                    {attr}
                  </button>
                );
              })}
            </div>
          )}

          {challenge.mode === 'normal-form' && (
            <div className="grid grid-cols-4 gap-2">
              {(['1NF', '2NF', '3NF', 'BCNF'] as const).map((nf) => {
                const picked = selectedNormalForm === nf;
                return (
                  <button
                    key={nf}
                    type="button"
                    onClick={() => setSelectedNormalForm(nf)}
                    className="font-mono text-xs font-bold py-2 rounded-xl border cursor-pointer transition-colors"
                    style={{
                      backgroundColor: picked ? 'var(--accent-primary)' : 'var(--bg-surface)',
                      color: picked ? '#FFFFFF' : 'var(--text-primary)',
                      borderColor: picked ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    }}
                  >
                    {nf}
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckChallenge}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
          >
            Kiểm tra đáp án
          </button>

          {gradeFeedback && (
            <div
              className="p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2"
              style={{
                backgroundColor: gradeFeedback.ok ? 'var(--success-bg)' : 'var(--error-bg)',
                borderColor: gradeFeedback.ok ? 'var(--success-border)' : 'var(--error-border)',
                color: gradeFeedback.ok ? 'var(--success-text)' : 'var(--error-text)',
              }}
            >
              {gradeFeedback.ok ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <div>{gradeFeedback.text}</div>
            </div>
          )}
        </div>
      )}

      {/* Analysis Engine Tabs (Hide full spoilers when grading that exact mode unless solved!) */}
      <div className="rounded-2xl ios-frosted-panel overflow-hidden">
        <div
          className="px-3 pt-2 border-b flex flex-wrap gap-1.5"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}
        >
          {[
            { id: 'closure' as const, label: '1. Máy tính Bao đóng X+', Icon: Sparkles },
            { id: 'keys' as const, label: '2. Phân hoạch L/M/R & Tìm Khóa', Icon: KeyRound },
            { id: 'norm' as const, label: '3. Kiểm tra 1NF → BCNF', Icon: Layers },
            { id: 'bcnf' as const, label: '4. Phân rã BCNF & Phủ tối tiểu', Icon: GitFork },
          ].map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 cursor-pointer"
                style={{
                  borderColor: active ? 'var(--accent-primary)' : 'transparent',
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-3 text-xs sm:text-sm">
          {activeTab === 'closure' && (
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Chọn tập thuộc tính khởi đầu <MathFormula tex="X" /> để tính bao đóng <MathFormula tex="X^+" />:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {attributes.map((attr) => {
                    const active = selectedSeed.includes(attr);
                    return (
                      <button
                        key={`seed-${attr}`}
                        type="button"
                        onClick={() =>
                          setSelectedSeed((prev) =>
                            prev.includes(attr) ? prev.filter((x) => x !== attr) : [...prev, attr],
                          )
                        }
                        className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer"
                        style={{
                          backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                          color: active ? '#FFFFFF' : 'var(--text-primary)',
                          borderColor: active ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        }}
                      >
                        {attr}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className="p-3 rounded-xl border space-y-2"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              >
                <MathFormula
                  tex={`\\{${closureResult.seed.map((s) => `\\text{${s.replace(/_/g, '\\_')}}`).join(', ')}\\}^+ = \\{${closureResult.closure
                    .map((s) => `\\text{${s.replace(/_/g, '\\_')}}`)
                    .join(', ')}\\}`}
                  displayMode
                />
                {closureResult.steps.length === 0 ? (
                  <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                    Không có phụ thuộc hàm nào kích hoạt thêm thuộc tính mới ngoài tập ban đầu.
                  </p>
                ) : (
                  <ol className="list-decimal pl-5 space-y-1 text-xs">
                    {closureResult.steps.map((st) => (
                      <li key={st.stepNumber}>
                        Áp dụng <code className="font-mono font-bold">{formatFd(st.ruleUsed)}</code>{' '}
                        thêm <strong className="font-mono">{st.added.join(', ')}</strong> →{' '}
                        <span className="font-mono">{`{${st.currentSet.join(', ')}}`}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <div className="text-xs font-bold mb-1">Nhóm Nguồn L & Cô lập (Bắt buộc mọi khóa)</div>
                  <div className="font-mono text-xs">
                    {[...lmr.sourceL, ...lmr.isolated].join(', ') || '∅'}
                  </div>
                </div>
                <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <div className="text-xs font-bold mb-1">Nhóm Trung gian M (Thử ghép thêm)</div>
                  <div className="font-mono text-xs">{lmr.middleM.join(', ') || '∅'}</div>
                </div>
              </div>

              {challenge?.mode === 'candidate-keys' && !gradeFeedback?.ok ? (
                <div className="p-3 rounded-xl border text-xs italic" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  Đáp án Khóa dự tuyển đang tạm ẩn để bạn tự giải ở khung thử thách phía trên! Hãy dùng tab &quot;1. Máy tính Bao đóng X+&quot; để kiểm nghiệm thử các ứng viên khóa.
                </div>
              ) : (
                <div className="p-3 rounded-xl border space-y-1.5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <div className="font-bold text-xs">Tất cả Khóa dự tuyển tìm được:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {nfAnalysis.candidateKeys.map((k, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--accent-soft)',
                          color: 'var(--accent-primary)',
                          borderColor: 'var(--accent-border)',
                        }}
                      >
                        {`K${idx + 1} = {${k.join(', ')}}`}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs pt-1" style={{ color: 'var(--text-secondary)' }}>
                    Thuộc tính khóa: <span className="font-mono font-semibold">{nfAnalysis.primeAttributes.join(', ') || '∅'}</span> · Thuộc tính không khóa:{' '}
                    <span className="font-mono font-semibold">{nfAnalysis.nonPrimeAttributes.join(', ') || '∅'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'norm' && (
            <div className="space-y-3">
              {challenge?.mode === 'normal-form' && !gradeFeedback?.ok ? (
                <div className="p-3 rounded-xl border text-xs italic" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  Kết luận Dạng chuẩn đang tạm ẩn cho tới khi bạn chọn đáp án đúng ở khung phía trên!
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">Dạng chuẩn cao nhất đạt được:</span>
                    <span
                      className="font-mono text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          nfAnalysis.highestNormalForm === 'BCNF'
                            ? 'var(--success-bg)'
                            : 'var(--warning-bg)',
                        color:
                          nfAnalysis.highestNormalForm === 'BCNF'
                            ? 'var(--success-text)'
                            : 'var(--warning-text)',
                      }}
                    >
                      {nfAnalysis.highestNormalForm}
                    </span>
                  </div>

                  {nfAnalysis.violations.length === 0 ? (
                    <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--success-border)', color: 'var(--success-text)' }}>
                      Lược đồ đạt chuẩn BCNF hoàn toàn — mọi phụ thuộc hàm không tầm thường đều có vế trái là siêu khóa!
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {nfAnalysis.violations.map((v, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl border text-xs"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-subtle)',
                          }}
                        >
                          <span className="font-mono font-bold mr-2" style={{ color: 'var(--error-text)' }}>
                            [Vi phạm {v.level}: {formatFd(v.fd)}]
                          </span>
                          <span>{v.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'bcnf' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <div className="text-xs font-bold">Phủ tối tiểu (Minimal Cover) của F:</div>
                <div className="font-mono text-xs">
                  {minimalCover.map(formatFd).join(' ; ') || '∅'}
                </div>
              </div>

              {bcnfResult.steps.length === 0 ? (
                <div className="text-xs" style={{ color: 'var(--success-text)' }}>
                  Lược đồ đã ở dạng chuẩn BCNF, không cần tách thêm bảng nào!
                </div>
              ) : (
                <div className="space-y-2">
                  {bcnfResult.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border text-xs space-y-1"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="font-bold">
                        Tách bước {idx + 1} do PTH vi phạm BCNF:{' '}
                        <span className="font-mono">{formatFd(st.violatingFd)}</span>
                      </div>
                      <div className="font-mono">
                        → Tách thành ({st.splitRight.join(', ')}) và ({st.splitLeft.join(', ')})
                      </div>
                    </div>
                  ))}
                  <div className="p-3 rounded-xl border space-y-1.5" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--success-border)', color: 'var(--success-text)' }}>
                    <div className="text-xs font-bold">Kết quả các quan hệ BCNF cuối cùng:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {bcnfResult.finalRelations.map((r) => (
                        <span key={r.name} className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                          {r.name}({r.attributes.join(', ')})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
