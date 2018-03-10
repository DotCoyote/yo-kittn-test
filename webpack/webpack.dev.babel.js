const merge = require('webpack-merge')
const path = require('path')
const portfinder = require('portfinder')
import webpack from 'webpack'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import WriteFilePlugin from 'write-file-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import utils from './utils'
const baseWebpackConfig = require('./webpack.base.babel.js')

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
let entries = utils.entryPoints
Object.keys(entries).forEach((entry) => entries[entry] = [hotClient].concat(entries[entry]))

const HOST = 'localhost'
const PORT = utils.kittnConf.browsersync.port

const devWebpackConfig = merge(baseWebpackConfig.default, {
  entry: utils.removeEmpty(entries),
  output: {
    publicPath: '/',
    filename: utils.assetsPath('js/[name].js'),
  },
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(utils.kittnConf.dist.markup, 'index.html') },
      ],
    },
    hot: true,
    compress: true,
    host: HOST,
    port: PORT,
    proxy: {},
    contentBase: path.join(__dirname, `../${utils.kittnConf.src.base}`),
    publicPath: '/',
    open: utils.kittnConf.browsersync.openbrowser,
    overlay: true
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].css'),
      allChunks: true
    })
    // new WriteFilePlugin({
    //   log: false,
    //   test: /^(?!.+(?:hot-update.(js|json))).+$/
    // })
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || utils.kittnConf.browsersync.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsWebpackPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        }
      }))

      resolve(devWebpackConfig)
    }
  })
})
