import js from '@eslint/js';

export default [
  {
    ignores: ['src/injected/vendor/**', 'coverage/**']
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        TextEncoder: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    rules: {
      'max-depth': ['error', 3],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 15, skipBlankLines: true, skipComments: true }],
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
    },
  },
  {
    // Test files can have longer functions
    files: ['test/**/*.js'],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off'
    }
  },
  {
    // String generators and UI config objects legitimately exceed 15 lines
    files: [
      'src/injected/demo.js',
      'src/injected/runtime.js',
      'src/injected/selfbuild.js',
      'src/interpreter/adapter.js',
      'src/interpreter/graphics.js',
      'src/interpreter/html-engine.js',
      'src/thin-client/connector.js',
      'src/ui/actions.js',
      'src/ui/editor.js',
      'src/ui/filetree.js',
      'src/ui/terminal.js'
    ],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off'
    }
  },
  {
    // Injected PDF JS must be ES5 — allow var, no arrow functions, etc.
    // NOTE: This applies to files that ARE injected, not the builder scripts.
    files: ['src/injected/demo.js', 'src/injected/selfbuild.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
];
