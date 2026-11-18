import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import {
  computeNextStreak,
  HUB_STORAGE_KEY,
  HubProvider,
  useHub,
} from './hubStore';

describe('HubStore — Multi-Course Shell, Study Streak & 56-Day Activity Log', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(HubProvider, { defaultCourseId: 'is2099', children });

  it('computes consecutive daily streaks accurately and resets currentStreak on missed days while keeping longestStreak', () => {
    let streak = { currentStreak: 0, longestStreak: 0, lastStudyDate: null as string | null };

    streak = computeNextStreak(streak, '2026-11-16');
    expect(streak).toEqual({ currentStreak: 1, longestStreak: 1, lastStudyDate: '2026-11-16' });

    // Same-day repeat study keeps currentStreak unchanged
    streak = computeNextStreak(streak, '2026-11-16');
    expect(streak).toEqual({ currentStreak: 1, longestStreak: 1, lastStudyDate: '2026-11-16' });

    // Next two consecutive days -> streak reaches 3
    streak = computeNextStreak(streak, '2026-11-17');
    streak = computeNextStreak(streak, '2026-11-18');
    expect(streak).toEqual({ currentStreak: 3, longestStreak: 3, lastStudyDate: '2026-11-18' });

    // 2-day gap -> resets currentStreak to 1, preserves longestStreak = 3
    streak = computeNextStreak(streak, '2026-11-20');
    expect(streak).toEqual({ currentStreak: 1, longestStreak: 3, lastStudyDate: '2026-11-20' });
  });

  it('switches routes/courses, records study activity per date, and persists exam attempts', () => {
    const { result, unmount } = renderHook(() => useHub(), { wrapper });

    expect(result.current.state.activeRoute).toBe('home');
    expect(result.current.state.activeCourseId).toBe('is2099');

    act(() => {
      result.current.navigate('learn');
      result.current.selectCourse('sample-template');
      result.current.recordStudyActivity('2026-10-05');
      result.current.recordStudyActivity('2026-10-05');
      result.current.recordExamAttempt({
        courseId: 'is2099',
        paperId: 'is2099-final-01',
        mcqScore: 4,
        mcqTotal: 5,
        selfWrittenPoints: 4.5,
        writtenTotal: 5,
      });
    });

    expect(result.current.state.activeRoute).toBe('learn');
    expect(result.current.state.activeCourseId).toBe('sample-template');
    expect(result.current.state.dailyActivityByDate['2026-10-05']).toBe(2);
    expect(result.current.state.streak.currentStreak).toBe(1);
    expect(result.current.state.examAttempts).toHaveLength(1);

    unmount();

    const { result: restored } = renderHook(() => useHub(), { wrapper });
    expect(restored.current.state.activeCourseId).toBe('sample-template');
    expect(restored.current.state.dailyActivityByDate['2026-10-05']).toBe(2);
    expect(restored.current.state.examAttempts[0].mcqScore).toBe(4);
  });

  it('recovers cleanly from corrupted localStorage JSON', () => {
    window.localStorage.setItem(HUB_STORAGE_KEY, '{broken');
    const { result } = renderHook(() => useHub(), { wrapper });
    expect(result.current.state.activeRoute).toBe('home');
    expect(result.current.state.activeCourseId).toBe('is2099');
  });
});
