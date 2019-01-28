
//JS file instead of .babelrc (JSON) to compute environment and load specifics.

const isDEV = process.env.NODE_ENV !== 'production';

//import standard stuff like env and JSX
//I simply include expressive-react as a plugin also.
const presets = [
  ['@babel/env', {  modules: false }],
  '@babel/react',
  '@expressive/react'
];

//default language features I'd use typically.
const plugins = [
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-proposal-class-properties',
  ['@babel/plugin-proposal-decorators', { 
    legacy: true 
  }],
  
  ['@babel/plugin-transform-runtime', {
    corejs: false,
    helpers: isDEV,
    regenerator: true,
    useESModules: false
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
if(isDEV)
  plugins.push(
    'react-hot-loader/babel'
  );

//export what you'd expect from a .babelrc.
module.exports = {
  presets,
  plugins
}