module.exports = {
    env: {
        browser: true,
        node: true,
    },
    plugins: ['react'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    parser: '@babel/eslint-parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:react/jsx-runtime',
    ],
    rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'no-unused-vars': ['warn', { vars: 'all', ignoreRestSiblings: false }],
    },
}
