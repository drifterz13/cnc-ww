import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['.next/**', 'coverage/**', 'dist/**', 'src/infrastrucure/prisma/generated/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
);
