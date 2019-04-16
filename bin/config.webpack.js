const EntryPlugin = require('webpack-intermediate-entry');
const webpack = require('webpack');
const path = require('path');
const loader = require('babel-loader');
const fs = require('fs');

const program = require("./cli");
const vendor = require("./vendor")
const __cwd = program.cwd;

const SOURCE = program.dir || './pages';

let isDEV = false;

if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production' && program.args[0] !== "build" )
  isDEV = true;

const OUTPUT = 'public';
const EXTENDS = program.webpackExtends;

const ENV_PLUGINS = [];

function scanPageDirectoryForEntry(DIR){
  const PAGES = {};
  for(let name of fs.readdirSync(DIR)){
    if(name[0] == ".")
      continue
    name = path.resolve(DIR, name);
    if(fs.lstatSync(name).isDirectory()){
      const pageName = path.basename(name);
      const entry = path.join(__cwd, SOURCE, pageName, '/index.js')
      PAGES[pageName] = entry
    }
  }

  return PAGES;
}

let config = {
  entry: scanPageDirectoryForEntry(SOURCE),
  context: path.resolve(__cwd, './pages/'),
  mode: "production",
  devtool: "none",

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
    filename: 'page.[name].js',
    path: path.resolve(__cwd, OUTPUT),
    devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
  },
  
  plugins: [
    new EntryPlugin({ 
      insert: path.join(__dirname, isDEV ? 'entry.dev.js' : 'entry.prod.js' )
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.EnvironmentPlugin(process.env),
    new webpack.optimize.ModuleConcatenationPlugin()
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