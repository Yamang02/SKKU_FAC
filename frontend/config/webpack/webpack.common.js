import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    entry: resolve(__dirname, '../../src/index.js'),

    output: {
        path: resolve(__dirname, '../../dist'),
        filename: '[name].[contenthash].js',
        clean: true,
        publicPath: '/'
    },

    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
            'react-native': 'react-native-web',
            '@': resolve(__dirname, '../../src'),
            '@components': resolve(__dirname, '../../src/components'),
            '@screens': resolve(__dirname, '../../src/screens'),
            '@constants': resolve(__dirname, '../../src/constants'),
            '@utils': resolve(__dirname, '../../src/utils'),
            '@hooks': resolve(__dirname, '../../src/hooks'),
            '@api': resolve(__dirname, '../../src/api'),
            '@admin': resolve(__dirname, '../../src/components/admin'),
            '@common': resolve(__dirname, '../../src/components/common'),
        }
    },

    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        configFile: resolve(__dirname, '../babel.config.js')
                    }
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name].[hash][ext]'
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name].[hash][ext]'
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            // React Native Web의 __DEV__ 플래그 설정
            '__DEV__': JSON.stringify(process.env.NODE_ENV === 'development')
        }),
        new HtmlWebpackPlugin({
            template: resolve(__dirname, '../../public/index.html'),
            filename: 'index.html',
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            }
        })
    ],

    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                },
                react: {
                    test: /[\\/]node_modules[\\/](react|react-dom|react-native-web)[\\/]/,
                    name: 'react',
                    chunks: 'all'
                }
            }
        }
    }
};
