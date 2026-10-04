// ESLint flat config (ESLint 10+). React JSX, no TypeScript.
//
// Conservative on purpose: `no-unused-vars`/`no-undef` and `exhaustive-deps` are `warn`, so
// `npm run lint` is a real, always-on gate that surfaces issues without blocking CI on day one.
// Tighten to `error` once the current warnings are cleared.
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly', fetch: 'readonly',
        console: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly',
        setInterval: 'readonly', clearInterval: 'readonly',
        localStorage: 'readonly', sessionStorage: 'readonly', URL: 'readonly',
        URLSearchParams: 'readonly', TextDecoder: 'readonly', TextEncoder: 'readonly',
        FormData: 'readonly', Blob: 'readonly', crypto: 'readonly', EventSource: 'readonly',
        AbortController: 'readonly', requestAnimationFrame: 'readonly', performance: 'readonly',
        IntersectionObserver: 'readonly', ResizeObserver: 'readonly', MutationObserver: 'readonly',
        structuredClone: 'readonly', queueMicrotask: 'readonly',
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'warn',
      'no-empty': 'warn',
    },
  },
];
