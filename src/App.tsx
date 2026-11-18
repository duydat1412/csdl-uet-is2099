import React, { useEffect, useMemo, useState } from 'react';
import { ALL_COURSES, findCourseById } from './courses/registry';
import { DashboardPage } from './platform/pages/DashboardPage';
import { ExamArenaPage } from './platform/pages/ExamArenaPage';
import { HomePage } from './platform/pages/HomePage';
import { LabsPage } from './platform/pages/LabsPage';
import { LearnPage } from './platform/pages/LearnPage';
import { HubProvider, useHub } from './platform/store/hubStore';
import { HubRouteId } from './platform/types';
import { ChangelogModal } from './platform/ui/ChangelogModal';
import { CommandPalette, CommandPaletteAction } from './platform/ui/CommandPalette';
import { FloatingGlassDock } from './platform/ui/FloatingGlassDock';
import { HubKonstaShell } from './platform/ui/GlassPrimitives';
import { SceneTransition } from './platform/ui/SceneTransition';
import { APP_VERSION } from './platform/version';
import { isThemeDark, ProgressProvider, useProgress } from './store/progressStore';

const StudyHubShellInner: React.FC = () => {
  const { state: hubState, navigate, selectCourse } = useHub();
  const { state: progressState, selectLesson } = useProgress();
  const activeCourse = useMemo(
    () => findCourseById(hubState.activeCourseId),
    [hubState.activeCourseId],
  );

  const [changelogOpen, setChangelogOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [externalRefOpen, setExternalRefOpen] = useState(false);

  const isDark = isThemeDark(progressState.theme);

  // Global keyboard shortcuts: Ctrl/Cmd+K -> Search; Alt+1..5 -> Switch Pages
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const routeByDigit: Record<string, HubRouteId> = {
          '1': 'home',
          '2': 'dashboard',
          '3': 'learn',
          '4': 'labs',
          '5': 'exams',
        };
        const target = routeByDigit[e.key];
        if (target) {
          e.preventDefault();
          navigate(target);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);

  const commandActions = useMemo<CommandPaletteAction[]>(() => {
    const list: CommandPaletteAction[] = [
      {
        id: 'nav-home',
        category: 'Trang',
        title: 'Home — Trang chủ STUDYHUB & Kệ môn học',
        subtitle: `Phiên bản ${APP_VERSION}`,
        onSelect: () => navigate('home'),
      },
      {
        id: 'nav-dashboard',
        category: 'Trang',
        title: 'Dashboard — Study Streak & Thống kê 56 ngày',
        onSelect: () => navigate('dashboard'),
      },
      {
        id: 'nav-learn',
        category: 'Trang',
        title: `Học tập — ${activeCourse.title}`,
        onSelect: () => navigate('learn'),
      },
      {
        id: 'nav-labs',
        category: 'Trang',
        title: 'Phòng Lab — Công cụ thực hành tự do',
        onSelect: () => navigate('labs'),
      },
      {
        id: 'nav-exams',
        category: 'Trang',
        title: 'Luyện đề Cuối kỳ (Exam Arena · Beta)',
        onSelect: () => navigate('exams'),
      },
      {
        id: 'open-changelog',
        category: 'Hệ thống',
        title: `Nhật ký cập nhật (${APP_VERSION} Change Logs)`,
        onSelect: () => setChangelogOpen(true),
      },
      {
        id: 'open-formula-sheet',
        category: 'Công thức',
        title: 'Sổ tay Ký hiệu & Công thức LaTeX',
        onSelect: () => {
          navigate('learn');
          setExternalRefOpen(true);
        },
      },
    ];

    for (const c of ALL_COURSES) {
      if (c.modules.length === 0) continue;
      list.push({
        id: `course-${c.id}`,
        category: 'Môn học',
        title: `${c.code} — ${c.title}`,
        subtitle: `${c.modules.length} Chặng`,
        onSelect: () => {
          selectCourse(c.id);
          navigate('learn');
        },
      });
    }

    for (const mod of activeCourse.modules) {
      for (const lesson of mod.lessons) {
        list.push({
          id: `lesson-${lesson.id}`,
          category: `Chặng ${mod.order}`,
          title: `${lesson.orderLabel} · ${lesson.title}`,
          subtitle: lesson.slideRange,
          onSelect: () => {
            selectLesson(lesson.id);
            navigate('learn');
          },
        });
      }
    }

    for (const exam of activeCourse.exams) {
      list.push({
        id: `exam-${exam.id}`,
        category: 'Đề thi',
        title: `${exam.code}: ${exam.title}`,
        subtitle: exam.semesterLabel,
        onSelect: () => navigate('exams'),
      });
    }

    return list;
  }, [activeCourse, navigate, selectCourse, selectLesson]);

  return (
    <HubKonstaShell isDark={isDark}>
      {hubState.activeRoute !== 'home' && (
        <FloatingGlassDock
          courses={ALL_COURSES}
          activeCourse={activeCourse}
          onOpenCommandPalette={() => setCommandOpen(true)}
          onOpenChangelog={() => setChangelogOpen(true)}
        />
      )}

      <SceneTransition sceneKey={`${hubState.activeRoute}-${activeCourse.id}`} className="flex-1 w-full">
        {hubState.activeRoute === 'home' && (
          <HomePage
            courses={ALL_COURSES}
            activeCourse={activeCourse}
            isDark={isDark}
            onOpenChangelog={() => setChangelogOpen(true)}
            onOpenCommandPalette={() => setCommandOpen(true)}
          />
        )}

        {hubState.activeRoute === 'dashboard' && (
          <DashboardPage courses={ALL_COURSES} activeCourse={activeCourse} />
        )}

        {hubState.activeRoute === 'learn' && (
          <LearnPage
            course={activeCourse}
            externalReferenceOpen={externalRefOpen}
            onCloseExternalReference={() => setExternalRefOpen(false)}
          />
        )}

        {hubState.activeRoute === 'labs' && (
          <LabsPage course={activeCourse} onGoLearn={() => navigate('learn')} />
        )}

        {hubState.activeRoute === 'exams' && (
          <ExamArenaPage course={activeCourse} onGoLearn={() => navigate('learn')} />
        )}
      </SceneTransition>

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        actions={commandActions}
      />

      <ChangelogModal
        open={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />
    </HubKonstaShell>
  );
};

const ProgressStreakBridge: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state, recordStudyActivity } = useHub();
  const activeCourse = findCourseById(state.activeCourseId);
  const firstLessonId =
    activeCourse.modules[0]?.lessons[0]?.id ?? 'lesson-1-1';

  return (
    <ProgressProvider
      defaultLessonId={firstLessonId}
      onStepCompleted={() => recordStudyActivity()}
    >
      {children}
    </ProgressProvider>
  );
};

export const App: React.FC = () => {
  const defaultCourseId = ALL_COURSES[0]?.id ?? 'is2099';
  return (
    <HubProvider defaultCourseId={defaultCourseId}>
      <ProgressStreakBridge>
        <StudyHubShellInner />
      </ProgressStreakBridge>
    </HubProvider>
  );
};

export default App;
