const path = require('path');
const webpack = require('webpack');

const program = require("./cli");
const __cwd = program.cwd;

const PROD = process.env.NODE_ENV === 'production';

const {
    bundleManifest,
    bundleLocation,
    bundleDependancies: VENDOR
} = program.config;

const example = `\n  { "siteKit": { "bundleDependancies": { "bundle": [ ...dependancies: string[] ] } } }`;

function configForBundle(){
    const {
        output = "./public"
    } = program;

    const entries = {};

    for(const bundle in VENDOR || {})
      if(typeof VENDOR[bundle] == "object")
        entries[bundle] = VENDOR[bundle];

    if(!VENDOR || Object.keys(entries).length == 0)
      program.error(`\n  Vendor bundler requires at least one bundle definition within your package.json! ${example}\n`)
    
    return {
      entry: entries,
    
      mode: PROD 
        ? 'production'
        : 'development',
    
      resolve: {
          modules: [
              path.resolve(__cwd, 'node_modules')
          ]
      },
    
      optimization: PROD
        ? { minimize: true } 
        : undefined,
    
      output: {
        filename: 'vendor.[name].js',
        path: path.resolve(__cwd, bundleLocation),
        library: '[name]_lib'
      },
    
      plugins: [
        new webpack.DllPlugin({
          path: path.resolve(__cwd, bundleManifest, 'vendor.[name].json'),
          name: '[name]_lib'
        })
      ]
    }
}

function configForInclude(){
    
    const {
        output = "./public"
    } = program;

    if(!VENDOR || Object.keys(VENDOR).length == 0)
        program.error(`\n  Vendor bundler requires at least one bundle definition within your package.json! ${example}\n`)

    const bundlesExpected = Object.keys(VENDOR);

    const manifestLocation = path.resolve(__cwd, bundleManifest);

    const dllReferences = [];

    for(const name of bundlesExpected){
      const manifestName = `vendor.${name}.json`;
      let manifest;
      
      try {
        manifest = require(path.resolve(manifestLocation, manifestName))
      }
      catch(err){
        program.error(`Couldn't find manifest file "${manifestName}" in working directory: "${manifestLocation}"\n Run "site vendor" to create needed files.`)
      }

      dllReferences.push(
        new webpack.DllReferencePlugin({
          context: __cwd, 
          manifest
        })
      ) 
    }

    return dllReferences;
}

Object.defineProperty(exports, "config", { get: configForBundle });
Object.defineProperty(exports, "include", { get: configForInclude });