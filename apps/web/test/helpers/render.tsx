import type { ReactNode } from 'react';
import {
  render as testingLibraryRender,
  type RenderOptions,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'sonner';
import { NoticeToast } from '@/components/notice-toast';
import { assertCurrentRoute } from './navigation';

type AppRenderOptions = RenderOptions & {
  notice?: boolean;
};

export function render(content: ReactNode, options: AppRenderOptions = {}) {
  const { notice = true, ...renderOptions } = options;

  return testingLibraryRender(
    <>
      {content}
      <Toaster />
      {notice ? <NoticeToast /> : null}
    </>,
    renderOptions,
  );
}

export { assertCurrentRoute, screen, userEvent, waitFor };
