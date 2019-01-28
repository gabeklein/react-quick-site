const express = require('express');
const webpack = require('webpack');

//use express rather than webpack-dev-server, it's better for advanced dev.
const app = express();
const config = require('./config.webpack');
const program = require('./cli')
const compiler = webpack(config);
const {
  port: bindPort = 3000
} = program;

//react itself can override <title> per-page where needed.
const TITLE = 'Test Site!';
const PORT = require("./cli").port || 3000;

// catch-all static assets, mostly for scripts such app.bundle.js
app.use(express.static('public'));
// for /static route (images, fonts, anything you'd expect on CDN)
app.use('/static', express.static('static'));

// dev stuff
app.use(require('webpack-dev-middleware')(compiler, {
  // logLevel: "error",
  writeToDisk: true
}));

// hot stuff
app.use(require('webpack-hot-middleware')(compiler));

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
      <title>${TITLE}</title>
      <meta charset="utf-8">
      <meta content="ie=edge" http-equiv="x-ua-compatible">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
      <meta name='viewport' content='viewport-fit=cover, maximum-scale=1.0, width=device-width, initial-scale=1.0'>
      <link rel="apple-touch-icon" sizes="180x180" href="static/ios_180.png">
      <link rel="apple-touch-startup-image" href="static/ios_x_startup.png">
    </head>
    <body>
      <script src="/bundle.${PAGE}.js" type="text/javascript"></script>
    </body>
    </html>
  `)
}

app.get('/', Main);
app.get('/:page', Main);

app.listen(bindPort, () => console.log(`App listening on port ${ bindPort }!`));