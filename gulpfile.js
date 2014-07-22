
// default server port.
var port = 8100;

// processing task
var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('scripts', function() {
  gulp.src(['algernon-trap.js', 'examples/app.js'])
    .pipe(browserify({
      insertGlobals : true,
      //debug : !gulp.env.production
    }))
    .pipe(uglify())
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest('./examples'))
});

// server task
var connect = require('connect');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var http = require('http');
var util = require('gulp-util');

gulp.task('serve', ['scripts'], function () {
  var app = connect()
              .use(bodyParser.urlencoded({'extended': false}))
              .use(function (req, res, next) {
                if (req.method == 'POST') { // && req.body['motion-data']() {}
                  util.log('Motion data received (' + req.body['motion-data'].length + ' bytes):\n'
                         + '-----BEGIN MOTION DATA-----\n'
                         + req.body['motion-data'] + '\n'
                         + '-----END MOTION DATA-----');
                  res.end('ok');
                } else {
                  next();
                }
              })
              .use(serveStatic('./examples'));

  var server = http.createServer(app);
  util.log(util.colors.green('Server started on http://localhost:'+port+'/'));
  server.listen(port);
});

// test task

var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');

gulp.task('test', function () {
  gulp.src(['test/**/test_*.js'], { read: false })
    .pipe(cover.instrument({
      pattern: ['algernon-trap.js']
    }))
    .pipe(mocha({
      reporter: 'spec'
    }))
    .pipe(cover.report({
      outFile: 'coverage/index.html'
    }));
});

// check task

var jshint = require( 'gulp-jshint' );

gulp.task( 'check', function() {
  return gulp.src([ 'algernon-trap.js', ' test/*.js ', ' examples/*.js' ])
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
});
