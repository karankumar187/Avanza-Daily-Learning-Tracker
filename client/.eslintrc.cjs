module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-console': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
  // Ignore all root-level config/tooling files — only lint src/
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.config.js',
    '*.config.cjs',
    '*.config.mjs',
    '*.config.ts',
    '.eslintrc.*',
  ],
}
