import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  transpilePackages:
    process.env.NODE_ENV === 'test'
      ? [
          'msw',
          '@mswjs/interceptors',
          '@open-draft/deferred-promise',
          'rettime',
          'until-async',
        ]
      : [],
};

export default nextConfig;
