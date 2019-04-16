
const WebStyles = require("@expressive/react-modifiers");

//JS file instead of .babelrc (JSON) to compute environment and load specifics.
const program = require("./cli")
const isProd = program.args[0] === "build" || process.env.NODE_ENV === 'production';

//import standard stuff like env and JSX
//I simply include expressive-react as a plugin also.
const presets = [
  ['@babel/env', {  modules: false }],
  '@babel/react'
];

//default language features I'd use typically.
const plugins = [
  ['@babel/plugin-transform-runtime', {
    corejs: false,
    helpers: !isProd,
    regenerator: true,
    useESModules: false
  }],

  ["@expressive/babel-plugin-react", {
    reactEnv: "next",
    output: "js",
    useRequire: true,
    modifiers: [ WebStyles ]
  }],

  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-proposal-class-properties',
  ['@babel/plugin-proposal-decorators', { 
    legacy: true 
  }],

  //module resolve is great for avoiding ../../../ in import and requires.
  ['module-resolver', {
    root: [ './' ],
    cwd: 'babelrc',
    alias: {
      'lib': './lib',
      'common': './components'
    }
  }]
];

//if not in a production setting, import HMR and helper functions.
if(!isProd)
  plugins.push(
    'react-hot-loader/babel'
  );

//export what you'd expect from a .babelrc.
module.exports = {
  presets,
  plugins
}