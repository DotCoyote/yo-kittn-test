const merge = require('webpack-merge')
import CleanWebpackPlugin from 'clean-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
const baseWebpackConfig = require('./webpack.base.babel.js')

/*
 |--------------------------------------------------------------------------
 | Help
 |--------------------------------------------------------------------------
 */
export function assetsPath(_path) {
  return path.posix.join(ASSETS_PATH, _path);
}

/*
 |--------------------------------------------------------------------------
 | Setting some paths for our Application
 |--------------------------------------------------------------------------
 */
export const ROOT_PATH = path.resolve(__dirname, '..')

/*
 |--------------------------------------------------------------------------
 | Merge the configs
 |--------------------------------------------------------------------------
 */
const prodWebpackConfig = merge(baseWebpackConfig.default, {
  output: {
    filename: assetsPath('js/[name].[hash].js'),
  },
  plugins: [
    new CleanWebpackPlugin(
      [
        utils.kittnConf.dist.js,
        utils.kittnConf.dist.css
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
      statsFilename: `${ROOT_PATH}/webpack/stats.json`,
      logLevel: 'info'
    })
  ]
})

module.exports = prodWebpackConfig
