import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ReferenceDrawer } from './components/layout/ReferenceDrawer';
import { SplitStudyWorkspace } from './components/layout/SplitStudyWorkspace';
import { TopStudyBar } from './components/layout/TopStudyBar';
import { MicroStepStream } from './components/story/MicroStepStream';
import { WorkbenchHost } from './components/workbench/WorkbenchHost';
import { CURRICULUM_MODULES } from './curriculum';
import { LessonSpec, ModuleSpec } from './domain/types';
import { ProgressProvider, useProgress } from './store/progressStore';

interface FlatLessonEntry {
  module: ModuleSpec;
  lesson: LessonSpec;
}

const StudyWorkspaceInner: React.FC<{ modules: ModuleSpec[] }> = ({ modules }) => {
  const {
    state,
    getActiveStepIndex,
    setActiveStepIndex,
    completeStep,
    saveAnswer,
    getSavedAnswer,
  } = useProgress();

  const [referenceOpen, setReferenceOpen] = useState(false);
  const storyScrollRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<Record<number, HTMLElement | null>>({});

  const flatEntries = useMemo<FlatLessonEntry[]>(() => {
    const out: FlatLessonEntry[] = [];
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        out.push({ module: mod, lesson });
      }
    }
    return out;
  }, [modules]);

  const currentIdx = useMemo(() => {
    const idx = flatEntries.findIndex((e) => e.lesson.id === state.currentLessonId);
    return idx >= 0 ? idx : 0;
  }, [flatEntries, state.currentLessonId]);

  const currentEntry = flatEntries[currentIdx];
  const prevLesson = currentIdx > 0 ? flatEntries[currentIdx - 1].lesson : null;
  const nextLesson =
    currentIdx < flatEntries.length - 1 ? flatEntries[currentIdx + 1].lesson : null;

  const { module: currentModule, lesson: currentLesson } = currentEntry;
  const rawStepIdx = getActiveStepIndex(currentLesson.id);
  const safeStepIdx = Math.min(Math.max(0, rawStepIdx), currentLesson.steps.length - 1);
  const activeStep = currentLesson.steps[safeStepIdx];

  useEffect(() => {
    stepRefs.current = {};
    if (storyScrollRef.current) {
      storyScrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [currentLesson.id]);

  const handleJumpToStep = (stepIndex: number) => {
    setActiveStepIndex(currentLesson.id, stepIndex);
    const el = stepRefs.current[stepIndex];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const hasWorkbenchChallenge = Boolean(
    activeStep.challenge && activeStep.challenge.type !== 'quiz',
  );

  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden">
      <TopStudyBar
        modules={modules}
        currentModule={currentModule}
        currentLesson={currentLesson}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        onOpenReference={() => setReferenceOpen(true)}
        onJumpToStep={handleJumpToStep}
      />

      <SplitStudyWorkspace
        hasActiveChallenge={hasWorkbenchChallenge}
        storyScrollRef={storyScrollRef}
        storyPane={
          <MicroStepStream
            module={currentModule}
            lesson={currentLesson}
            nextLesson={nextLesson}
            stepRefs={stepRefs}
          />
        }
        workbenchPane={
          <WorkbenchHost
            key={`${currentLesson.id}-${activeStep.id}`}
            step={activeStep}
            savedAnswer={getSavedAnswer(activeStep.id)}
            onSaveAnswer={(val) => saveAnswer(activeStep.id, val)}
            onSolved={() =>
              completeStep(
                currentLesson.id,
                activeStep.id,
                safeStepIdx,
                currentLesson.steps.length,
              )
            }
          />
        }
      />

      <ReferenceDrawer open={referenceOpen} onClose={() => setReferenceOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  const defaultLessonId = CURRICULUM_MODULES[0]?.lessons[0]?.id ?? 'lesson-1-1';
  return (
    <ProgressProvider defaultLessonId={defaultLessonId}>
      <StudyWorkspaceInner modules={CURRICULUM_MODULES} />
    </ProgressProvider>
  );
};

export default App;
