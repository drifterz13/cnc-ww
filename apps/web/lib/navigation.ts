type RedirectValue = string | number | undefined;

export function buildRedirectPath(
  path: string,
  params: Record<string, RedirectValue> = {},
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();

  return query ? `${path}?${query}` : path;
}
