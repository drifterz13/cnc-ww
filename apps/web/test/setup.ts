import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { server } from './msw/server';

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next-router-mock/navigation'),
  redirect: jest.fn((url: string) => {
    const router = jest.requireActual('next-router-mock').default;

    router.setCurrentUrl(url);
  }),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  mockRouter.setCurrentUrl('/');
  server.resetHandlers();
});
afterAll(() => server.close());
