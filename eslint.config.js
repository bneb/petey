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
        Buffer: 'readonly',
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
      'src/injected/runtime.js',
      'src/interpreter/adapter.js',
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
];
