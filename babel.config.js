export default {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
                },
                modules: false,
                useBuiltIns: 'usage',
                corejs: 3
            }
        ],
        [
            '@babel/preset-react',
            {
                runtime: 'automatic'
            }
        ],
        '@babel/preset-typescript'
    ],

    env: {
        development: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            node: 'current'
                        }
                    }
                ]
            ]
        },
        production: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
                        },
                        modules: false,
                        useBuiltIns: 'usage',
                        corejs: 3
                    }
                ]
            ]
        }
    }
};
