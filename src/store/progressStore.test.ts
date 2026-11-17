import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import {
  ProgressProvider,
  STORAGE_KEY,
  useProgress,
} from './progressStore';

describe('ProgressStore — Guided Progression, Persistence & Theme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(ProgressProvider, { defaultLessonId: 'lesson-1-1', children });

  it('initializes with default lesson, step index 0, and syncs theme attribute', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    expect(result.current.state.currentLessonId).toBe('lesson-1-1');
    expect(result.current.getUnlockedStepIndex('lesson-1-1')).toBe(0);
    expect(result.current.state.freeNavigationMode).toBe(false);

    act(() => {
      result.current.setTheme('dark');
    });
    expect(result.current.state.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    act(() => {
      result.current.setTheme('system');
    });
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('unlocks subsequent micro-steps, marks lessons complete, and persists across remounts', () => {
    const { result, unmount } = renderHook(() => useProgress(), { wrapper });

    act(() => {
      result.current.completeStep('lesson-1-1', 'step-1', 0, 3);
      result.current.saveAnswer('step-1', 'σ_{PHG=4}(NHANVIEN)');
    });

    expect(result.current.getUnlockedStepIndex('lesson-1-1')).toBe(1);
    expect(result.current.isStepCompleted('step-1')).toBe(true);
    expect(result.current.getSavedAnswer('step-1')).toBe('σ_{PHG=4}(NHANVIEN)');

    // Complete final step (index 2 of total 3) -> marks lesson completed
    act(() => {
      result.current.completeStep('lesson-1-1', 'step-3', 2, 3);
    });
    expect(result.current.isLessonCompleted('lesson-1-1')).toBe(true);

    unmount();

    // Remount -> restores from localStorage
    const { result: restored } = renderHook(() => useProgress(), { wrapper });
    expect(restored.current.isLessonCompleted('lesson-1-1')).toBe(true);
    expect(restored.current.getSavedAnswer('step-1')).toBe('σ_{PHG=4}(NHANVIEN)');
  });

  it('recovers gracefully from malformed localStorage JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{corrupted-json');
    const { result } = renderHook(() => useProgress(), { wrapper });
    expect(result.current.state.currentLessonId).toBe('lesson-1-1');
  });
});
