#!/usr/bin/env node

const commander = require("commander");
const webpack = require("webpack");
const version = require('../package.json').version;
const path = require("path");

const program = module.exports = commander
    .version(version)
    .usage('[options] <file ...>')
    .option('-p --port <n>', "Port used by development server.")
    .option('-d --dir [directory]', "Directory where page's source files are located.")
    .option('-v --vendor', "Depend on vendor bundles in build.")
    .option('-e --webpack-extends [directory]', "Webpack config which should augment defaults")
    .parse(process.argv);

const __cwd = program.cwd = process.cwd();

const defaults = {
    bundleManifest:  "private/",
    output: "public/",
    port: 3000
};

defaults.bundleLocation = defaults.output;

let package;

try {
    package = require(path.resolve(__cwd, "package.json"))
}
catch(e){
    package = {}
}

program.package = package;
program.error = message => {
    console.error(message);
    process.exit(1);
}
program.config = Object.assign(
    defaults, package.siteKit || {}
)

switch(program.args[0]){
    case "start":
        require("./dev-server");
        break;

    case "build": {
        const config = require("./config.webpack");

        webpack(
            config, (err, stats) => {
                if(!err)
                    console.log("Build files complete!")

                const info = stats.toJson();

                if (stats.hasErrors()) {
                    info.errors.map(console.error);
                }
                
                if (stats.hasWarnings()) {
                    info.warnings.map(console.warn);
                }
            }
        );
    }   break;

    case "vendor": {
        const config = require("./vendor").config; 

        webpack(
            {}, (err, stats) => {
                if(!err)
                    console.log("Vendor files complete!")
            }
        );
    }   break;

    case undefined:
        program.error(`\nNo command provided! Run site with command "start" to run dev server, or with "-h" for more options.\n`);

    default: 
        program.error(`\nUnknown command "${program.args[0]}" provided! Run "site -h" for valid options.\n`);
}