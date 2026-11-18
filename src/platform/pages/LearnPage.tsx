import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ReferenceDrawer } from '../../components/layout/ReferenceDrawer';
import { SplitStudyWorkspace } from '../../components/layout/SplitStudyWorkspace';
import { TopStudyBar } from '../../components/layout/TopStudyBar';
import { MicroStepStream } from '../../components/story/MicroStepStream';
import { WorkbenchHost } from '../../components/workbench/WorkbenchHost';
import { LessonSpec, ModuleSpec } from '../../domain/types';
import { useProgress } from '../../store/progressStore';
import { useHub } from '../store/hubStore';
import { CourseManifest } from '../types';

export interface LearnPageProps {
  course: CourseManifest;
  externalReferenceOpen?: boolean;
  onCloseExternalReference?: () => void;
}

interface FlatLessonEntry {
  module: ModuleSpec;
  lesson: LessonSpec;
}

export const LearnPage: React.FC<LearnPageProps> = ({
  course,
  externalReferenceOpen = false,
  onCloseExternalReference,
}) => {
  const {
    state,
    selectLesson,
    getActiveStepIndex,
    setActiveStepIndex,
    completeStep,
    saveAnswer,
    getSavedAnswer,
  } = useProgress();
  const { recordStudyActivity } = useHub();

  const [referenceOpen, setReferenceOpen] = useState(false);
  const storyScrollRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<Record<number, HTMLElement | null>>({});

  const flatEntries = useMemo<FlatLessonEntry[]>(() => {
    const out: FlatLessonEntry[] = [];
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        out.push({ module: mod, lesson });
      }
    }
    return out;
  }, [course]);

  // If course switched and saved currentLessonId does not belong to this course, switch to its first lesson
  useEffect(() => {
    if (flatEntries.length === 0) return;
    const belongs = flatEntries.some((e) => e.lesson.id === state.currentLessonId);
    if (!belongs) {
      selectLesson(flatEntries[0].lesson.id);
    }
  }, [flatEntries, state.currentLessonId, selectLesson]);

  const currentIdx = useMemo(() => {
    const idx = flatEntries.findIndex((e) => e.lesson.id === state.currentLessonId);
    return idx >= 0 ? idx : 0;
  }, [flatEntries, state.currentLessonId]);

  const currentEntry = flatEntries[currentIdx];

  useEffect(() => {
    stepRefs.current = {};
    if (storyScrollRef.current) {
      if (typeof storyScrollRef.current.scrollTo === 'function') {
        storyScrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        storyScrollRef.current.scrollTop = 0;
      }
    }
  }, [currentEntry?.lesson.id]);

  if (!currentEntry) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm">
        Học phần <strong>{course.code}</strong> hiện chưa có bài giảng chi tiết.
      </div>
    );
  }

  const prevLesson = currentIdx > 0 ? flatEntries[currentIdx - 1].lesson : null;
  const nextLesson =
    currentIdx < flatEntries.length - 1 ? flatEntries[currentIdx + 1].lesson : null;

  const { module: currentModule, lesson: currentLesson } = currentEntry;
  const rawStepIdx = getActiveStepIndex(currentLesson.id);
  const safeStepIdx = Math.min(Math.max(0, rawStepIdx), currentLesson.steps.length - 1);
  const activeStep = currentLesson.steps[safeStepIdx];

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

  const drawerVisible = referenceOpen || externalReferenceOpen;

  return (
    <div className="w-full flex flex-col">
      <TopStudyBar
        embedded
        courseLabel={course.code}
        modules={course.modules}
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
            onSolved={() => {
              completeStep(
                currentLesson.id,
                activeStep.id,
                safeStepIdx,
                currentLesson.steps.length,
              );
              recordStudyActivity();
            }}
          />
        }
      />

      <ReferenceDrawer
        open={drawerVisible}
        onClose={() => {
          setReferenceOpen(false);
          onCloseExternalReference?.();
        }}
      />
    </div>
  );
};
