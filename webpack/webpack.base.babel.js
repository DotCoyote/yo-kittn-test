/**
 * Webpack Config for Javascript Bundling
 *
 * @package  generator-kittn
 * @author   Lars Eichler <larseichler.le@gmail.com>
 */
import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import StylelintPlugin from 'stylelint-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
const utils = require('./utils')

const {
  ifProduction,
  ifDevelopment
} = utils.getIfUtils(process.env.NODE_ENV)

/*
 |--------------------------------------------------------------------------
 | Defining Entry Points, could be used to manually split Parts of the Application, for example
 | Admin Javascript and FrontEnd JavaScript
 |--------------------------------------------------------------------------
 */
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
  entry: utils.removeEmpty(utils.entryPoints),
  output: {
    path: utils.paths.PUBLIC_PATH,
    filename: utils.assetsPath('js/[name].[hash].js'),
    chunkFilename: utils.assetsPath('js/chunks/[name].[hash].js')
  },
  externals: {
    Modernizr: 'Modernizr'
  },
  resolve: {
    extensions: [
      '.vue',
      '.js'
    ],
    modules: [utils.resolve(utils.kittnConf.src.base), utils.resolve('node_modules')],
    alias: {
      components: path.resolve(utils.paths.LOADER_PATH, 'components/'),
      store: path.resolve(utils.paths.LOADER_PATH, 'store'),
      src: utils.resolve(utils.kittnConf.src.base)
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
        include: utils.resolve(utils.kittnConf.src.base)
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: utils.resolve(utils.kittnConf.src.base),
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
        include: utils.resolve(utils.kittnConf.src.style),
        exclude: [utils.resolve('node_modules'), utils.resolve(utils.kittnConf.dist.base)],
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
          outputPath: utils.assetsPath('fonts/'),
          publicPath: 'fonts/',
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
  plugins: utils.removeEmpty([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    // ifProduction(
    //   new StylelintPlugin({
    //     context: LOADER_PATH,
    //     syntax: 'scss'
    //   })
    // ),
    new HtmlWebpackPlugin({
      template: utils.kittnConf.src.structure + 'index.html',
      filename: 'index.html',
      inject: true,
      hash: false,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: false
      },
      chunksSortMode: 'dependency'
    })
  ])
}
