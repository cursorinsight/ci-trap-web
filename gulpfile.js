var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');

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

gulp.task('serve', function () {
  // var bodyParser = require('body-parser');
  connect
    .server({
      root: './examples',
      port: 8100,
      middleware: function(connect, opt) {
        return [
          connect.bodyParser(),
          function (req, res, next) {
            if (req.method == 'POST') { // && req.body['motion-data']) {

              console.log('Motion data received (' + req.body['motion-data'].length + ' bytes):')
              console.log('-----BEGIN MOTION DATA-----');
              console.log(req.body['motion-data']);
              console.log('-----END MOTION DATA-----');

              res.end('ok');
            } else {
              next();
            }
          }
        ];
      }
    });
});

