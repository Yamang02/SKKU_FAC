import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: {
        main: './src/frontend/react/index.jsx'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        clean: true,
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                            '@babel/preset-typescript'
                        ]
                    }
                }
            },

            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/frontend/react/public/index.html',
            filename: 'index.html'
        })
    ],
    resolve: {
        extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.js', '.jsx'],
        alias: {
            'react-native$': 'react-native-web',
            'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$': 'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
            'react-native/Libraries/vendor/emitter/EventEmitter$': 'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
            'react-native/Libraries/EventEmitter/NativeEventEmitter$': 'react-native-web/dist/vendor/react-native/NativeEventEmitter',
            '@': path.resolve(__dirname, 'src/frontend/react'),
            '@components': path.resolve(__dirname, 'src/frontend/react/components'),
            '@pages': path.resolve(__dirname, 'src/frontend/react/pages'),
            '@utils': path.resolve(__dirname, 'src/frontend/react/utils'),
            '@services': path.resolve(__dirname, 'src/frontend/react/services'),
            '@hooks': path.resolve(__dirname, 'src/frontend/react/hooks'),
            '@styles': path.resolve(__dirname, 'src/frontend/react/styles')
        }
    }
};
