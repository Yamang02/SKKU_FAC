export default {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    browsers: [
                        'last 2 versions',
                        'not dead',
                        '> 1%',
                        'not ie <= 11'
                    ],
                    node: 'current'
                },
                modules: false,
                useBuiltIns: 'entry',
                corejs: 3,
                debug: false
            }
        ],
        [
            '@babel/preset-react',
            {
                runtime: 'automatic',
                development: process.env.NODE_ENV === 'development'
            }
        ],
        [
            '@babel/preset-typescript',
            {
                allowDeclareFields: true,
                onlyRemoveTypeImports: true
            }
        ]
    ],
    plugins: [],
    env: {
        development: {
            plugins: []
        },
        production: {
            plugins: []
        },
        test: {
            presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
                '@babel/preset-react',
                '@babel/preset-typescript'
            ]
        }
    }
};
