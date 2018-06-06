const path = require('path');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const manifest = require('./src/manifest.json');

const dist = path.resolve(__dirname, "dist");
module.exports = (env) => {
  return ({
    context: __dirname,
    watch: env.watch === 'true',
    entry: {
      'background/background': './src/background/background.js',
      'options/options': './src/options/options.js'
    },
    output: {
      path: dist
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            loaders: {
              js: 'babel-loader'
            }
          }
        },
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['babel-preset-env']
            }
          }
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {}
            }
          ]
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'options/options.css',
              },
            },
            { loader: 'extract-loader' },
            { loader: 'css-loader' },
            {
              loader: 'sass-loader',
              options: {
                includePaths: ['./node_modules']
              }
            },
          ]
        },
        {
          test: /\.(ttf|eot|woff|woff2)$/,
          use: {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: 'fonts/',
              publicPath: '../fonts',
            },
          },
        }
      ]
    },
    resolve: {
      modules: [
        'node_modules',
        path.resolve(__dirname, 'src')
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, 'src/images/icons'),
          to: path.join(dist, 'images/icons')
        },
        {
          from: path.resolve(__dirname, 'node_modules/vuetify/dist/vuetify.min.css'),
          to: path.join(dist, 'vendors/vuetify')
        },
        {
          from: path.resolve(__dirname, 'node_modules/roboto-fontface/css/roboto/roboto-fontface.css'),
          to: path.join(dist, 'vendors/roboto')
        }
      ]),
      new CleanWebpackPlugin([dist]),
      new GenerateJsonPlugin('manifest.json', manifest),
      new HtmlWebpackPlugin({  // Also generate a test.html
        filename: 'options/options.html',
        template: 'src/options/options.html',
        chunks: ['options/options'],
        title: `${manifest.name} Options`
      })
    ]
  });
};