const MyEntryMiddewarePlugin = require('webpack-initialize-entry');
const webpack = require('webpack');
const path = require('path');
const loader = require('babel-loader');
const fs = require('fs');

const program = require("./cli");
const vendor = require("./vendor")
const __cwd = program.cwd;

const SOURCE = program.dir || './pages';
const DEV = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production' && program.args[0] !== "build";
const HOT = 'webpack-hot-middleware/client?reload=true&__webpack_public_path=http://webpack:3000';
const OUTPUT = 'public';
const EXTENDS = program.webpackExtends;

const ENV_PLUGINS = [];

if(DEV) ENV_PLUGINS.push(
  new webpack.HotModuleReplacementPlugin()
);

if(program.vendor === true)
  ENV_PLUGINS.push(
    ...vendor.include
  );

//check pages folder and generate entry config based on that.
function scanForEntry(DIR){
  const PAGES = {};
  for(let name of fs.readdirSync(DIR)){
    name = path.resolve(DIR, name);
    if(fs.lstatSync(name).isDirectory()){
      const pageName = path.basename(name);
      const entry = path.join(__cwd, SOURCE, pageName, '/index.js')
      PAGES[pageName] = DEV ? [HOT, entry] : entry
    }
  }
  return PAGES;
}

let config = {
  entry: scanForEntry(SOURCE),
  context: path.resolve(__cwd, './pages/'),

  resolve: {
    modules: [
      path.resolve(__cwd, 'node_modules'), 
      path.resolve(__dirname, '../node_modules')
    ]
  },

  resolveLoader: {
    modules: [
      path.resolve(__dirname, '../node_modules')
    ]
  },

  output: {
    filename: 'bundle.[name].js',
    path: path.resolve(__cwd, OUTPUT),
    devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
  },

  mode: DEV
    ? 'development' 
    : 'production',

  devtool: DEV
    ? "source-map" 
    : "none",
    
  plugins: [
    new MyEntryMiddewarePlugin({ 
      insert: path.join(__dirname, DEV ? 'entry.dev.js' : 'entry.prod.js' )
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.EnvironmentPlugin(process.env),
    new webpack.optimize.ModuleConcatenationPlugin(),
    ...ENV_PLUGINS
  ],

  module: {
    rules: [{
      test: /\.js$/, 
      exclude: [
        /Expressive React/, // <-- avoid compiling linked packages
        /node_modules/, 
        /\.com\.js/
      ],
      use: { 
        loader: 'babel-loader',
        options: {
          extends: path.resolve(__dirname, './config.babel.js')
        }
      }
    }]
  }
};

if(EXTENDS){
  const merge = require("merge-options");

  const configFile = path.resolve(__cwd, 
    typeof EXTENDS == "string" ? EXTENDS : "webpack.config.js");

  if(!fs.existsSync(configFile))
    program.error(`Webpack extention "${path.relative(__cwd, configFile)}" (for flag -e, --webpack-extends) not found!`)


  const extend = require(configFile);

  config = merge(config, extend);
}

module.exports = config;