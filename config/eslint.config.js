module.exports = {
    files: ['**/*.js'],
    rules: {
        'indent': ['error', 4],
        'linebreak-style': ['error', 'windows'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
        'camelcase': ['error', {
            'properties': 'never',
            'ignoreDestructuring': true,
            'ignoreImports': true,
            'ignoreGlobals': true,
            'ignorePattern': '^[A-Z]+$'
        }],
        'filenames/match-exported': ['error', 'pascal']
    }
};
