const path = require('path')

module.exports = {
  mode: 'development',
  target: 'electron-main',
  devtool: 'source-map',
  entry: {
    'script': './script.ts',
    'main': './ts/main.ts',
  },
  output: {
    path: __dirname,
    filename: '[name].js' //まとめた結果出力されるファイル名
  },
  resolve: {
    extensions: ['.ts', '.js'] //拡張子がtsだったらTypescirptでコンパイルする
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader' //ts-loader使うよ
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  }
}