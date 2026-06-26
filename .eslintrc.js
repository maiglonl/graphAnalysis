module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'plugin:vue/base',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
    'plugin:@intlify/vue-i18n/recommended',
  ],
  ignorePatterns: ['packages/**/tests/*', 'packages/**/dist/*', 'packages/**/node_modules/*'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-empty': 'off',
    'no-explicit-any': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@intlify/vue-i18n/no-v-html': 'off',
    '@intlify/vue-i18n/no-deprecated-tc': 'off',
    '@intlify/vue-i18n/no-missing-keys-in-other-locales': 'off', // TODO: enable when all files are translated
    '@intlify/vue-i18n/key-format-style': ['warn', 'camelCase'],
    '@intlify/vue-i18n/no-missing-keys': 'warn',
    '@intlify/vue-i18n/no-raw-text': [
      'warn',
      { ignoreNodes: ['v-icon'], ignorePattern: '^[^a-zA-Z]*$|(mdi-[^\\s]+)$' },
    ],
    '@intlify/vue-i18n/no-unused-keys': ['warn', { src: './app/', extensions: ['.js', '.ts', '.vue'] }],
  },
  settings: {
    'vue-i18n': {
      localeDir: './app/assets/locales/*.json',
      // messageSyntaxVersion: '^8.25.0', // version of your `vue-i18n` in `package.json`
    },
  },
};
