import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig, globalIgnores } from 'eslint/config'

/* Note: eslint-config-next isn't installed — its parser doesn't support
   ESLint 10 yet. Next 16 no longer runs ESLint during `next build`, so this
   config is for local linting only. Add it back once it's compatible. */
export default defineConfig([
  globalIgnores(['.next', 'out', 'dist']),
  {
    files: ['**/*.{js,jsx,mjs}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
