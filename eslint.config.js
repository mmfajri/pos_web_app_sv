import prettier from 'eslint-config-prettier';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { svelteParser } from 'svelte-eslint-parser';

// Resolve absolute path to tsconfig.json
const __dirname = dirname(fileURLToPath(import.meta.url));
const tsconfigPath = join(__dirname, 'tsconfig.json');

// Resolve .gitignore
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
  includeIgnoreFile(gitignorePath),

  // Base JS rules
  js.configs.recommended,
  ...ts.configs.recommended,

  // Svelte rules
  ...svelte.configs.recommended,
  ...svelte.configs.prettier, // disables conflicting rules with Prettier

  // Prettier base config
  prettier,

  // Common settings
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'no-undef': 'off'
    }
  },

  // Svelte-specific overrides for proper parsing and typechecking
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
parser: svelteParser,
      parserOptions: {
        project: tsconfigPath,
        extraFileExtensions: ['.svelte']
      }
    }
  }
);
