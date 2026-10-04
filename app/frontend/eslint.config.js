// ESLint flat config (ESLint 10 + typescript-eslint). React + TypeScript.
//
// Conservative on purpose: unused-vars and exhaustive-deps are `warn`, so `npm run lint` is a real,
// always-on gate that surfaces issues without blocking on day one. Tighten to `error` once clear.
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
