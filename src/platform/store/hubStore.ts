import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { HubRouteId } from '../types';

export interface StudyStreakState {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

export interface ExamAttemptRecord {
  id: string;
  courseId: string;
  paperId: string;
  mcqScore: number;
  mcqTotal: number;
  selfWrittenPoints: number;
  writtenTotal: number;
  completedAt: string;
}

export interface HubState {
  activeRoute: HubRouteId;
  activeCourseId: string;
  streak: StudyStreakState;
  dailyActivityByDate: Record<string, number>;
  dailyGoalTarget: number;
  examAttempts: ExamAttemptRecord[];
}

export const HUB_STORAGE_KEY = 'studyhub_global_v2';

export function getLocalIsoDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function diffDaysIso(fromIso: string, toIso: string): number {
  const [y1, m1, d1] = fromIso.split('-').map(Number);
  const [y2, m2, d2] = toIso.split('-').map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 0;
  const t1 = Date.UTC(y1, m1 - 1, d1);
  const t2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((t2 - t1) / 86_400_000);
}

export function computeNextStreak(
  prev: StudyStreakState,
  studyDateIso: string,
): StudyStreakState {
  if (!prev.lastStudyDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, prev.longestStreak),
      lastStudyDate: studyDateIso,
    };
  }

  const delta = diffDaysIso(prev.lastStudyDate, studyDateIso);
  if (delta <= 0) {
    return {
      currentStreak: Math.max(1, prev.currentStreak),
      longestStreak: Math.max(prev.longestStreak, Math.max(1, prev.currentStreak)),
      lastStudyDate: prev.lastStudyDate,
    };
  }

  const nextCurrent = delta === 1 ? prev.currentStreak + 1 : 1;
  return {
    currentStreak: nextCurrent,
    longestStreak: Math.max(prev.longestStreak, nextCurrent),
    lastStudyDate: studyDateIso,
  };
}

export interface HeatmapDay {
  dateIso: string;
  count: number;
}

export function buildHeatmapDays(
  dailyActivityByDate: Record<string, number>,
  totalDays = 56,
  anchorDate = new Date(),
): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
    const d = new Date(anchorDate);
    d.setDate(d.getDate() - offset);
    const iso = getLocalIsoDate(d);
    days.push({
      dateIso: iso,
      count: dailyActivityByDate[iso] ?? 0,
    });
  }
  return days;
}

function buildDefaultHubState(defaultCourseId: string): HubState {
  return {
    activeRoute: 'home',
    activeCourseId: defaultCourseId,
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
    },
    dailyActivityByDate: {},
    dailyGoalTarget: 5,
    examAttempts: [],
  };
}

function isValidRoute(route: unknown): route is HubRouteId {
  return (
    route === 'home' ||
    route === 'dashboard' ||
    route === 'learn' ||
    route === 'labs' ||
    route === 'exams'
  );
}

function loadHubState(defaultCourseId: string): HubState {
  if (typeof window === 'undefined') {
    return buildDefaultHubState(defaultCourseId);
  }
  try {
    const raw = window.localStorage.getItem(HUB_STORAGE_KEY);
    if (!raw) return buildDefaultHubState(defaultCourseId);
    const parsed = JSON.parse(raw) as Partial<HubState>;
    if (!parsed || typeof parsed !== 'object') {
      return buildDefaultHubState(defaultCourseId);
    }

    const fallback = buildDefaultHubState(defaultCourseId);
    return {
      activeRoute: isValidRoute(parsed.activeRoute) ? parsed.activeRoute : fallback.activeRoute,
      activeCourseId:
        typeof parsed.activeCourseId === 'string' && parsed.activeCourseId.length > 0
          ? parsed.activeCourseId
          : defaultCourseId,
      streak:
        parsed.streak && typeof parsed.streak === 'object'
          ? {
              currentStreak: Number(parsed.streak.currentStreak) || 0,
              longestStreak: Number(parsed.streak.longestStreak) || 0,
              lastStudyDate:
                typeof parsed.streak.lastStudyDate === 'string'
                  ? parsed.streak.lastStudyDate
                  : null,
            }
          : fallback.streak,
      dailyActivityByDate:
        parsed.dailyActivityByDate && typeof parsed.dailyActivityByDate === 'object'
          ? parsed.dailyActivityByDate
          : {},
      dailyGoalTarget:
        typeof parsed.dailyGoalTarget === 'number' && parsed.dailyGoalTarget >= 1
          ? parsed.dailyGoalTarget
          : fallback.dailyGoalTarget,
      examAttempts: Array.isArray(parsed.examAttempts) ? parsed.examAttempts : [],
    };
  } catch {
    return buildDefaultHubState(defaultCourseId);
  }
}

export interface HubContextValue {
  state: HubState;
  navigate: (route: HubRouteId) => void;
  selectCourse: (courseId: string) => void;
  recordStudyActivity: (dateOverride?: string) => void;
  setDailyGoalTarget: (target: number) => void;
  recordExamAttempt: (attempt: Omit<ExamAttemptRecord, 'id' | 'completedAt'>) => void;
  resetHubStats: () => void;
}

const HubContext = createContext<HubContextValue | null>(null);

export interface HubProviderProps {
  defaultCourseId: string;
  children: React.ReactNode;
}

export const HubProvider: React.FC<HubProviderProps> = ({ defaultCourseId, children }) => {
  const [state, setState] = useState<HubState>(() => loadHubState(defaultCourseId));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(HUB_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors safely
    }
  }, [state]);

  const navigate = useCallback((route: HubRouteId) => {
    setState((prev) => ({
      ...prev,
      activeRoute: route,
    }));
  }, []);

  const selectCourse = useCallback((courseId: string) => {
    setState((prev) => ({
      ...prev,
      activeCourseId: courseId,
    }));
  }, []);

  const recordStudyActivity = useCallback((dateOverride?: string) => {
    const todayIso = dateOverride ?? getLocalIsoDate();
    setState((prev) => ({
      ...prev,
      streak: computeNextStreak(prev.streak, todayIso),
      dailyActivityByDate: {
        ...prev.dailyActivityByDate,
        [todayIso]: (prev.dailyActivityByDate[todayIso] ?? 0) + 1,
      },
    }));
  }, []);

  const setDailyGoalTarget = useCallback((target: number) => {
    setState((prev) => ({
      ...prev,
      dailyGoalTarget: Math.max(1, Math.min(30, Math.round(target))),
    }));
  }, []);

  const recordExamAttempt = useCallback(
    (attempt: Omit<ExamAttemptRecord, 'id' | 'completedAt'>) => {
      const todayIso = getLocalIsoDate();
      const entry: ExamAttemptRecord = {
        ...attempt,
        id: `exam-${Date.now()}`,
        completedAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        streak: computeNextStreak(prev.streak, todayIso),
        dailyActivityByDate: {
          ...prev.dailyActivityByDate,
          [todayIso]: (prev.dailyActivityByDate[todayIso] ?? 0) + 1,
        },
        examAttempts: [entry, ...prev.examAttempts].slice(0, 20),
      }));
    },
    [],
  );

  const resetHubStats = useCallback(() => {
    setState(buildDefaultHubState(defaultCourseId));
  }, [defaultCourseId]);

  const value = useMemo<HubContextValue>(
    () => ({
      state,
      navigate,
      selectCourse,
      recordStudyActivity,
      setDailyGoalTarget,
      recordExamAttempt,
      resetHubStats,
    }),
    [
      state,
      navigate,
      selectCourse,
      recordStudyActivity,
      setDailyGoalTarget,
      recordExamAttempt,
      resetHubStats,
    ],
  );

  return React.createElement(HubContext.Provider, { value }, children);
};

export function useHub(): HubContextValue {
  const ctx = useContext(HubContext);
  if (!ctx) {
    throw new Error('useHub must be used within a HubProvider');
  }
  return ctx;
}
