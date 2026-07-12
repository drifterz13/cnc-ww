import mockRouter from 'next-router-mock';

export function assertCurrentRoute(
  pathname: string,
  query: Record<string, string> = {},
) {
  expect(mockRouter.pathname).toBe(pathname);

  const search = mockRouter.asPath.split('?').at(1) ?? '';
  const searchParams = new URLSearchParams(search);

  for (const [key, value] of Object.entries(query)) {
    expect(searchParams.get(key)).toBe(value);
  }
}
