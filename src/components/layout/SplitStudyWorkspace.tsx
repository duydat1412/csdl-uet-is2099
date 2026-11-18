import React, { useState } from 'react';
import { BookOpenText, FlaskConical } from 'lucide-react';

export interface SplitStudyWorkspaceProps {
  storyPane: React.ReactNode;
  workbenchPane: React.ReactNode;
  hasActiveChallenge?: boolean;
  storyScrollRef?: React.RefObject<HTMLDivElement | null>;
}

export const SplitStudyWorkspace: React.FC<SplitStudyWorkspaceProps> = ({
  storyPane,
  workbenchPane,
  hasActiveChallenge = false,
  storyScrollRef,
}) => {
  const [mobileTab, setMobileTab] = useState<'story' | 'workbench'>('story');

  return (
    <div className="relative z-10 w-full h-[calc(100vh-9.6rem)] lg:h-[calc(100vh-6.9rem)] flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile / Tablet Sticky Tab Bar (< 1024px) */}
      <div
        className="lg:hidden shrink-0 flex border-b px-2 pt-1.5 gap-1"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={() => setMobileTab('story')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer"
          style={{
            borderColor: mobileTab === 'story' ? 'var(--accent-primary)' : 'transparent',
            color: mobileTab === 'story' ? 'var(--accent-primary)' : 'var(--text-secondary)',
          }}
        >
          <BookOpenText className="w-3.5 h-3.5" />
          <span>Bài giảng dẫn dắt</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('workbench')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer"
          style={{
            borderColor: mobileTab === 'workbench' ? 'var(--accent-primary)' : 'transparent',
            color: mobileTab === 'workbench' ? 'var(--accent-primary)' : 'var(--text-secondary)',
          }}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Bàn thực hành</span>
          {hasActiveChallenge && (
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* Left Pane (45% on desktop): Guided Interactive Story */}
      <main
        ref={storyScrollRef}
        className={`${
          mobileTab === 'story' ? 'flex' : 'hidden'
        } lg:flex flex-col w-full lg:w-[45%] xl:w-[44%] h-full overflow-y-auto border-r`}
        style={{
          backgroundColor: 'transparent',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="w-full max-w-[68ch] mx-auto px-4 sm:px-7 py-6 sm:py-8">
          {storyPane}
        </div>
      </main>

      {/* Right Pane (55% on desktop): Sticky Live Workbench */}
      <section
        aria-label="Bàn thực hành tương tác trực tiếp"
        className={`${
          mobileTab === 'workbench' ? 'flex' : 'hidden'
        } lg:flex flex-col w-full lg:w-[55%] xl:w-[56%] h-full overflow-y-auto`}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <div className="w-full h-full p-3 sm:p-5 flex flex-col">
          {workbenchPane}
        </div>
      </section>
    </div>
  );
};
