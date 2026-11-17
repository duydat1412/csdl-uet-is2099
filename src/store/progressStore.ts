import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ProgressState {
  currentLessonId: string;
  activeStepIndexByLesson: Record<string, number>;
  unlockedStepIndexByLesson: Record<string, number>;
  completedStepIds: Record<string, boolean>;
  completedLessonIds: Record<string, boolean>;
  savedAnswers: Record<string, string>;
  theme: ThemeMode;
  freeNavigationMode: boolean;
}

export const STORAGE_KEY = 'studyhub_uet_is2099_v1';

function buildDefaultState(defaultLessonId: string): ProgressState {
  return {
    currentLessonId: defaultLessonId,
    activeStepIndexByLesson: {},
    unlockedStepIndexByLesson: {},
    completedStepIds: {},
    completedLessonIds: {},
    savedAnswers: {},
    theme: 'light',
    freeNavigationMode: false,
  };
}

function loadState(defaultLessonId: string): ProgressState {
  if (typeof window === 'undefined') {
    return buildDefaultState(defaultLessonId);
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultState(defaultLessonId);
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    if (!parsed || typeof parsed !== 'object') {
      return buildDefaultState(defaultLessonId);
    }
    return {
      currentLessonId:
        typeof parsed.currentLessonId === 'string' && parsed.currentLessonId.length > 0
          ? parsed.currentLessonId
          : defaultLessonId,
      activeStepIndexByLesson:
        parsed.activeStepIndexByLesson && typeof parsed.activeStepIndexByLesson === 'object'
          ? parsed.activeStepIndexByLesson
          : {},
      unlockedStepIndexByLesson:
        parsed.unlockedStepIndexByLesson && typeof parsed.unlockedStepIndexByLesson === 'object'
          ? parsed.unlockedStepIndexByLesson
          : {},
      completedStepIds:
        parsed.completedStepIds && typeof parsed.completedStepIds === 'object'
          ? parsed.completedStepIds
          : {},
      completedLessonIds:
        parsed.completedLessonIds && typeof parsed.completedLessonIds === 'object'
          ? parsed.completedLessonIds
          : {},
      savedAnswers:
        parsed.savedAnswers && typeof parsed.savedAnswers === 'object'
          ? parsed.savedAnswers
          : {},
      theme:
        parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system'
          ? parsed.theme
          : 'light',
      freeNavigationMode: Boolean(parsed.freeNavigationMode),
    };
  } catch {
    return buildDefaultState(defaultLessonId);
  }
}

function applyThemeToDocument(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export interface ProgressContextValue {
  state: ProgressState;
  selectLesson: (lessonId: string) => void;
  setActiveStepIndex: (lessonId: string, stepIndex: number) => void;
  getActiveStepIndex: (lessonId: string) => number;
  getUnlockedStepIndex: (lessonId: string) => number;
  completeStep: (
    lessonId: string,
    stepId: string,
    stepIndex: number,
    totalSteps: number,
    advanceFocus?: boolean,
  ) => void;
  isStepCompleted: (stepId: string) => boolean;
  isLessonCompleted: (lessonId: string) => boolean;
  saveAnswer: (stepId: string, answer: string) => void;
  getSavedAnswer: (stepId: string) => string | undefined;
  setTheme: (theme: ThemeMode) => void;
  toggleFreeNavigationMode: () => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export interface ProgressProviderProps {
  defaultLessonId: string;
  children: React.ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({
  defaultLessonId,
  children,
}) => {
  const [state, setState] = useState<ProgressState>(() => loadState(defaultLessonId));

  useEffect(() => {
    applyThemeToDocument(state.theme);
  }, [state.theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors safely
    }
  }, [state]);

  const selectLesson = useCallback((lessonId: string) => {
    setState((prev) => ({
      ...prev,
      currentLessonId: lessonId,
    }));
  }, []);

  const setActiveStepIndex = useCallback((lessonId: string, stepIndex: number) => {
    setState((prev) => ({
      ...prev,
      activeStepIndexByLesson: {
        ...prev.activeStepIndexByLesson,
        [lessonId]: Math.max(0, stepIndex),
      },
    }));
  }, []);

  const getActiveStepIndex = useCallback(
    (lessonId: string) => state.activeStepIndexByLesson[lessonId] ?? 0,
    [state.activeStepIndexByLesson],
  );

  const getUnlockedStepIndex = useCallback(
    (lessonId: string) => state.unlockedStepIndexByLesson[lessonId] ?? 0,
    [state.unlockedStepIndexByLesson],
  );

  const completeStep = useCallback(
    (
      lessonId: string,
      stepId: string,
      stepIndex: number,
      totalSteps: number,
      advanceFocus = false,
    ) => {
      setState((prev) => {
        const prevUnlocked = prev.unlockedStepIndexByLesson[lessonId] ?? 0;
        const nextUnlocked = Math.min(
          Math.max(0, totalSteps - 1),
          Math.max(prevUnlocked, stepIndex + 1),
        );
        const isFinalStep = stepIndex >= totalSteps - 1;
        const nextActive = advanceFocus
          ? isFinalStep
            ? stepIndex
            : nextUnlocked
          : prev.activeStepIndexByLesson[lessonId] ?? stepIndex;

        return {
          ...prev,
          completedStepIds: {
            ...prev.completedStepIds,
            [stepId]: true,
          },
          unlockedStepIndexByLesson: {
            ...prev.unlockedStepIndexByLesson,
            [lessonId]: nextUnlocked,
          },
          activeStepIndexByLesson: {
            ...prev.activeStepIndexByLesson,
            [lessonId]: nextActive,
          },
          completedLessonIds: isFinalStep
            ? {
                ...prev.completedLessonIds,
                [lessonId]: true,
              }
            : prev.completedLessonIds,
        };
      });
    },
    [],
  );

  const isStepCompleted = useCallback(
    (stepId: string) => Boolean(state.completedStepIds[stepId]),
    [state.completedStepIds],
  );

  const isLessonCompleted = useCallback(
    (lessonId: string) => Boolean(state.completedLessonIds[lessonId]),
    [state.completedLessonIds],
  );

  const saveAnswer = useCallback((stepId: string, answer: string) => {
    setState((prev) => ({
      ...prev,
      savedAnswers: {
        ...prev.savedAnswers,
        [stepId]: answer,
      },
    }));
  }, []);

  const getSavedAnswer = useCallback(
    (stepId: string) => state.savedAnswers[stepId],
    [state.savedAnswers],
  );

  const setTheme = useCallback((theme: ThemeMode) => {
    setState((prev) => ({
      ...prev,
      theme,
    }));
  }, []);

  const toggleFreeNavigationMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      freeNavigationMode: !prev.freeNavigationMode,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setState((prev) => ({
      ...buildDefaultState(defaultLessonId),
      theme: prev.theme,
    }));
  }, [defaultLessonId]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      selectLesson,
      setActiveStepIndex,
      getActiveStepIndex,
      getUnlockedStepIndex,
      completeStep,
      isStepCompleted,
      isLessonCompleted,
      saveAnswer,
      getSavedAnswer,
      setTheme,
      toggleFreeNavigationMode,
      resetProgress,
    }),
    [
      state,
      selectLesson,
      setActiveStepIndex,
      getActiveStepIndex,
      getUnlockedStepIndex,
      completeStep,
      isStepCompleted,
      isLessonCompleted,
      saveAnswer,
      getSavedAnswer,
      setTheme,
      toggleFreeNavigationMode,
      resetProgress,
    ],
  );

  return React.createElement(ProgressContext.Provider, { value }, children);
};

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return ctx;
}
