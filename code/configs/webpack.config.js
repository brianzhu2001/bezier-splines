const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require("webpack");

const pathToSrc = './src/'

var common_config = {
    devtool: '#inline-source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader"
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    'raw-loader',
                    'glslify-loader'
                ]
            },
            {
                test: /\.obj$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'raw-loader',
                    },
                ],
            }


        ]
    },
    resolve: {
        extensions: ["*", ".js", ".jsx"],
        modules: [path.resolve(__dirname, '../node_modules')]
    },
    devServer: {
        contentBase: path.join(__dirname, "./dist/"),
        port: 3000,
        publicPath: "http://localhost:3000/",
        hot: true
    },
    node: {
        fs: "empty"
    }
}


var CoreConfig = Object.assign({}, common_config,{
    entry: pathToSrc+'/index.js',
    output: {
        filename: './index.js',
        path: path.resolve(__dirname, './dist/')
    },
    plugins: [

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new HtmlWebpackPlugin({
            filename: './index.html',
            title: "A6",
            template: pathToSrc+'/index.html'
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: pathToSrc+'/static',
                    to: './'
                },
            ],
        }),
    ]
});
//
// var CreativeConfig = Object.assign({}, common_config,{
//     entry: pathToSrc+'/creative.jsx',
//     output: {
//         filename: './creative.js',
//         path: path.resolve(__dirname, './dist/')
//     },
//     plugins: [
//
//         new webpack.ProvidePlugin({
//             $: 'jquery',
//             jQuery: 'jquery'
//         }),
//         new HtmlWebpackPlugin({
//             filename: './creative.html',
//             title: "A2 Creative",
//             template: pathToSrc+'/creative.html'
//         }),
//     ]
// });
module.exports = [
    CoreConfig
];


// new CleanWebpackPlugin({
//     cleanOnceBeforeBuildPatterns: [`${outputPath}/*.hot-update.*`]
// }),
// new webpack.HotModuleReplacementPlugin(),



