/**
 * Webpack Config for Javascript Bundling
 *
 * @package  generator-kittn
 * @author   Lars Eichler <larseichler.le@gmail.com>
 */
import path from 'path'
import webpack from 'webpack'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import WriteFilePlugin from 'write-file-webpack-plugin'
import StylelintPlugin from 'stylelint-webpack-plugin'
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { getIfUtils, removeEmpty } from 'webpack-config-utils'
const kittnConf = require('../config.json')

const nodeEnv = process.env.NODE_ENV || 'production'

const {
  ifProduction,
  ifDevelopment
} = getIfUtils(nodeEnv)

/*
 |--------------------------------------------------------------------------
 | Setting some paths for our Application
 |--------------------------------------------------------------------------
 */
const ROOT_PATH = path.resolve(__dirname, '..')
const PUBLIC_PATH = path.join(ROOT_PATH, kittnConf.dist.webpackpublic)
const ASSETS_PATH = kittnConf.dist.webpackassets
const CSS_ROOT = path.resolve(ROOT_PATH, kittnConf.src.style)
const LOADER_PATH = path.join(ROOT_PATH, kittnConf.src.js)

/*
 |--------------------------------------------------------------------------
 | Hot Middleware Client
 |--------------------------------------------------------------------------
 */

const hotClient =
'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true&overlay=true'

/*
 |--------------------------------------------------------------------------
 | Defining Entry Points, could be used to manually split Parts of the Application, for example
 | Admin Javascript and FrontEnd JavaScript
 |--------------------------------------------------------------------------
 */

const entryPoints = kittnConf.src.jsEntryPoints

if (ifDevelopment()) {
  Object.keys(entryPoints).forEach((entry) => entryPoints[entry] = [hotClient].concat(entryPoints[entry]))
}

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const CSS_LOADERS = [
  {
    loader: 'css-loader',
    options: {
      autoprefixer: false,
      sourceMap: true,
      url: true
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      sourceMap: true,
      config: {
        ctx: {
          normalize: true
        }
      }
    }
  },
  {
    loader: 'sass-loader',
    options: {
      sourceMap: true
    }
  }
]

/*
 |--------------------------------------------------------------------------
 | Let the config begin
 |--------------------------------------------------------------------------
 */
export default {
  entry: removeEmpty(entryPoints),
  output: {
    path: path.join(PUBLIC_PATH, ASSETS_PATH),
    publicPath: '/' + ASSETS_PATH,
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[name].[hash].js'
  },
  externals: {
    Modernizr: 'Modernizr'
  },
  resolve: {
    extensions: [
      '.vue',
      '.js'
    ],
    modules: [resolve(kittnConf.src.base), resolve('node_modules')],
    alias: {
      components: path.resolve(LOADER_PATH, 'components/'),
      store: path.resolve(LOADER_PATH, 'store'),
      src: resolve(kittnConf.src.base)
    }
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        options: {
          configFile: ifProduction('./.eslintrc.js', './.eslintrc-dev.js'),
          formatter: require('eslint-friendly-formatter')
        },
        exclude: /node_modules/,
        include: resolve(kittnConf.src.base)
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: resolve(kittnConf.src.base),
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          hot: true,
          loaders: {
            scss: ifProduction(
              ExtractTextPlugin.extract({
                use: [...CSS_LOADERS],
                fallback: 'vue-style-loader',
              }),
              [{ loader: 'vue-style-loader'}, ...CSS_LOADERS]
            ),
          }
        }
      },
      {
        test: /\.css$/,
        use: ifProduction(ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader'],
        }), ['style-loader', 'css-loader'])
      },
      {
        test: /\.scss$/,
        include: resolve(kittnConf.src.style),
        exclude: [resolve('node_modules'), resolve('public/')],
        use: ifProduction(ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: CSS_LOADERS,
        }), ['style-loader', ...CSS_LOADERS]),
      },
      {
        test: /\.(png|jpe?g|gif)(\?\S*)?$/,
        loader: 'url-loader',
        options: {
          fallback: 'file-loader'
        }
      },
      {
        test: /\.(eot|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader',
        query: {
          outputPath: 'fonts/',
          publicPath: ASSETS_PATH + 'fonts/',
          name: '[name].[ext]'
        }
      },
      {
        test: /\.svg$/,
        loader: 'vue-svg-loader',
        options: {
          // optional [svgo](https://github.com/svg/svgo) options
          svgo: {
            plugins: [
              { removeDoctype: true },
              { removeComments: true }
            ]
          }
        }
      }
    ]
  },
  plugins: removeEmpty([
    ifProduction(
      new CleanWebpackPlugin([
        ASSETS_PATH + 'js/',
        ASSETS_PATH + 'css/'
      ],
      {
        root: PUBLIC_PATH,
        beforeEmit: true,
        exclude: ['ls.respimg.js', 'modernizr.js', 'style.css', 'style.css.map']
      })
    ),
    new ExtractTextPlugin({
      filename: ifDevelopment('css/[name].css', 'css/[name].[chunkhash].css'),
      allChunks: true
    }),
    ifProduction(
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true
        }
      })
    ),
    // ifProduction(
    //   new StylelintPlugin({
    //     context: LOADER_PATH,
    //     syntax: 'scss'
    //   })
    // ),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(nodeEnv)
      }
    }),
    ifProduction(
      new BundleAnalyzerPlugin({
        analyzerMode: 'disabled',
        generateStatsFile: true,
        statsFilename: `${ROOT_PATH}/webpack/stats.json`,
        logLevel: 'info'
      })
    ),
      new HtmlWebpackPlugin({
        template: kittnConf.src.structure + 'index.html',
        filename: 'index.html',
        inject: true,
        hash: false,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: false
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: 'dependency'
      }),
    new WriteFilePlugin({
      log: false,
      test: /^(?!.+(?:hot-update.(js|json))).+$/
    })
  ])
}
