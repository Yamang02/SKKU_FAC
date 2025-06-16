import { merge } from 'webpack-merge';
import common from './webpack.common.js';

export default merge(common, {
    mode: 'development',
    devtool: 'eval-source-map',

    devServer: {
        port: 3003,
        hot: true,
        open: true,
        historyApiFallback: true,
        compress: true,
        client: {
            overlay: {
                errors: true,
                warnings: false
            }
        },
        proxy: [
            {
                context: ['/api'],
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false
            }
        ]
    },

    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    }
});
