module.exports = {
  extends: [
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  root: true,
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    "new-cap": "off",
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": ["error"],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  }
}
