const merge = require('webpack-merge')
import path from 'path'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
const utils = require('./utils')
const baseWebpackConfig = require('./webpack.base.babel.js')

/*
 |--------------------------------------------------------------------------
 | Merge the configs
 |--------------------------------------------------------------------------
 */
const prodWebpackConfig = merge(baseWebpackConfig.default, {
  output: {
    filename: utils.assetsPath('js/[name].[hash].js'),
    publicPath: './'
  },
  plugins: [
    new CleanWebpackPlugin(
      [
        utils.resolve(utils.kittnConf.dist.js),
        utils.resolve(utils.kittnConf.dist.css)
      ],
      {
        root: utils.paths.PUBLIC_PATH,
        beforeEmit: true,
        exclude: ['ls.respimg.js', 'modernizr.js']
      }
    ),
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[chunkhash].css'),
      allChunks: true
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
      statsFilename: `${utils.paths.ROOT_PATH}/webpack/stats.json`,
      logLevel: 'info'
    })
  ]
})

module.exports = prodWebpackConfig
