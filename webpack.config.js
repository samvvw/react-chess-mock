const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const dotenv = require('dotenv')

module.exports = function (_env, argv) {
    const isProduction = argv.mode === 'production'
    const isDevelopment = !isProduction
    const env = dotenv.config().parsed

    // reduce it to object
    let envKeys
    if (env) {
        envKeys = Object.keys(env).reduce((prev, next) => {
            prev[`process.env.${next}`] = JSON.stringify(env[next])
            return prev
        }, {})
    } else {
        envKeys = {}
    }

    return {
        // tool used to generate source-map
        devtool: isDevelopment && 'cheap-module-source-map',
        // entry file
        entry: './src/index.js',
        // output file
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'assets/js/[name].[contenthash:8].js',
            publicPath: '/',
        },
        // Webpack modules
        module: {
            rules: [
                // Uses babel-loader to transpile jsx into js
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            cacheCompression: false,
                            envName: isProduction
                                ? 'production'
                                : 'development',
                        },
                    },
                },
                // Loads css files
                {
                    test: /\.css$/,
                    use: [
                        isProduction
                            ? MiniCssExtractPlugin.loader
                            : 'style-loader',
                        'css-loader',
                    ],
                },
                // Loads images embedding them in the URL as base64-encoded
                {
                    test: /\.(png|jpg|git)$/i,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                },
                // Loads SVG's so they can be manipulated
                {
                    test: /\.svg$/,
                    use: ['@svgr/webpack'],
                },
                // Loads other kind of files
                {
                    test: /\.(eot|otf|tff|woff|woff2)$/,
                    loader: require.resolve('file-loader'),
                    options: {
                        name: 'static/media/[name].[hash:8].[ext]',
                    },
                },
            ],
        },
        // Use these extensions
        resolve: {
            extensions: ['.js', '.jsx'],
        },
        // plugin section
        plugins: [
            isProduction &&
                new MiniCssExtractPlugin({
                    filename: 'assets/css/[name].[contenthash:8].css',
                    chunkFilename: 'assets/css/[name].[contenthash:8].css',
                }),
            new webpack.DefinePlugin(envKeys),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, 'public/index.html'),
                inject: true,
            }),
            new ESLintPlugin({
                extensions: ['.js', '.jsx'],
                exclude: ['node_modules', 'dist'],
            }),
        ].filter(Boolean),
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserWebpackPlugin({
                    terserOptions: {
                        compress: {
                            comparisons: false,
                        },
                        mangle: {
                            safari10: true,
                        },
                        output: {
                            comments: false,
                            ascii_only: true,
                        },
                        warnings: false,
                    },
                }),
                new CssMinimizerPlugin(),
            ],
            splitChunks: {
                chunks: 'all',
                minSize: 0,
                maxInitialRequests: 20,
                maxAsyncRequests: 20,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module, chunks, cacheGroupKey) {
                            const packageName = module.context.match(
                                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                            )[1]
                            return `${cacheGroupKey}.${packageName.replace(
                                '@',
                                ''
                            )}`
                        },
                    },
                    common: {
                        minChunks: 2,
                        priority: -10,
                    },
                },
            },
            runtimeChunk: 'single',
        },
        devServer: {
            compress: true,
            historyApiFallback: true,
            open: true,
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                },
            },
        },
    }
}
