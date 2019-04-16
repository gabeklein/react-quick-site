const express = require('express');
const webpack = require('webpack');

//use express rather than webpack-dev-server, it's better for advanced dev.
const app = express();

const program = require('./cli');

const {
  port: bindPort = 3000
} = program;

const PORT = require("./cli").port || 3000;

app.use(express.static('public'));
app.use('/static', express.static('static'));

const config = Object.assign({}, require('./config.webpack'));

config.mode = "development";
config.devtool = "source-map";
config.plugins = config.plugins.concat(
    new webpack.HotModuleReplacementPlugin()
)

const multi = [];

for(const key in config.entry){
  const C = Object.assign({}, config);
  const entry = config.entry[key];
  const reloader = `webpack-hot-middleware/client?name=${key}`;
  
  C.name = key;
  C.entry = { [key]: [reloader].concat(entry) };
  C.context += `/{key}`

  multi.push(C);
}

const compiler = webpack(multi);

// dev stuff
app.use(require('webpack-dev-middleware')(compiler, {
  logLevel: "error",
  writeToDisk: onPath => !(/js\.map$/.test(onPath) || /hot-update\.js(on)?$/.test(onPath))
}));

// hot stuff
app.use(require('webpack-hot-middleware')(compiler));

const TrailingSlash = (req, res, next) => {
  debugger
  if (req.path.substr(-1) == '/' && req.path.length > 1) {
      var query = req.url.slice(req.path.length);
      res.redirect(301, req.path.slice(0, -1) + query);
  } else {
      next();
  }
}

// main template
const Main = (req, res, next) => {

  if(req.url.indexOf('.') >= 0)
    //its a most likely file
    //pass to express.static
    return next();

  //use path to determine what bundle HTML will ask for.
  const PAGE = req.params && req.params.page || 'index';

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta content="ie=edge" http-equiv="x-ua-compatible">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
      <meta name='viewport' content='viewport-fit=cover, maximum-scale=1.0, width=device-width, initial-scale=1.0'>
      <link rel="apple-touch-icon" sizes="180x180" href="/static/ios_180.png">
      <link rel="apple-touch-startup-image" href="/static/ios_x_startup.png">
    </head>
    <body>
      <script type="text/javascript" id="init">
        var script = document.createElement('script');
        var path = document.location.pathname;
        script.src = "/page.${PAGE}.js";
        script.onerror = function(){
            if(path.indexOf("/404") == 0)
                return alert("Page not found but 404 also missing.")
            document.location.replace("/404/?ref=" + encodeURIComponent(path.slice(1)))
        };
        document.body.replaceChild(script, document.getElementById("init"));
      </script>
    </body>
    </html>
  `)
}

app.get('/', Main);
app.get('/:page', TrailingSlash, Main);

app.listen(bindPort, () => console.log(`App listening on port ${ bindPort }!`));