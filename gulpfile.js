/* global require */

// TODO better task naming!

// defaults and loadable configurations.
var project = require('./package.json')

var port = 8100  // server port

var buildDir = './.build'      // output directory (for intermediate processes and serving results)
var distDir = './dist'         // distribution directory
var sourceFiles = ['./src/ci-trap/**/*.js']
var supportingFiles = ['./gulpfile.js', './karma.conf.js']
var filesToLint = sourceFiles.concat(supportingFiles)
var unitTests = ['./test/test_api.js', './test/test_suite.js', './test/test_transport.js']
var browserTests = ['./test/test_ajax.js']

// (pre)loading libs.
var gulp = require('gulp')
var util = require('gulp-util')
var concat = require('gulp-concat')

var browserify = require('gulp-browserify')
var uglify = require('gulp-uglify')

var karma = require('gulp-karma')
var mocha = require('gulp-mocha')
var cover = require('gulp-coverage')
var eslint = require('gulp-eslint')
var jsdoc = require('gulp-jsdoc')

var connect = require('connect')
var bodyParser = require('body-parser')
var serveStatic = require('serve-static')
var http = require('http')

// default task

gulp.task('default', ['check', 'test'])

// compile

gulp.task('dist', function () {
  return gulp.src(['./src/ci-trap/index.js'])
    .pipe(browserify({
      // insertGlobals : true,
      // debug: !gulp.env.production
    }))
    .pipe(uglify())
    .pipe(concat(project.name + '-' + project.version + '.min.js'))
    .pipe(gulp.dest(distDir))
})

// TODO separated tests!
gulp.task('compile:tests', function () {
  return gulp.src(browserTests)
    .pipe(browserify({
      // insertGlobals : true,
      // debug: !gulp.env.production
    }))
    //.pipe(uglify())
    .pipe(concat('browserified-tests.js'))
    .pipe(gulp.dest(buildDir + '/test'))
})

// documentation

gulp.task('doc', function () {
  return gulp.src(sourceFiles.concat(['./README.md']))
    .pipe(jsdoc.parser())
    .pipe(jsdoc.generator('./doc'))
})

// run tests

gulp.task('check', ['check:eslint'])

gulp.task('check:eslint', function () {
  return gulp.src(filesToLint)
    .pipe(eslint())
    .pipe(eslint.format())
})

gulp.task('test', ['test:unit', 'test:browser'])

gulp.task('test:unit', function () {
  return gulp.src(unitTests, { read: false })
    .pipe(cover.instrument({ pattern: sourceFiles }))
    .pipe(mocha({ reporter: 'nyan' }))
    .pipe(cover.report({
      outFile: './coverage/index.html'
    }))
})

gulp.task('test:browser', ['compile:tests'], function () {
  return gulp.src([buildDir + '/test/browserified-tests.js'])
    .pipe(karma({
      configFile: './karma.conf.js',
      action: 'run'
    }))
    .on('error', function (err) {
      util.log(util.colors.red(err))
    })
})

gulp.task('build:example-app', ['compile:example-app', 'copy-html:example-app', 'copy-css:example-app'])

gulp.task('compile:example-app', function () {
  return gulp.src(['examples/app/app.js'])
    .pipe(browserify({
      // insertGlobals : true,
      // debug: !gulp.env.production
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest(buildDir))
})

gulp.task('copy-css:example-app', function () {
  return gulp.src(['examples/app/app.css'])
    .pipe(gulp.dest(buildDir))
})

gulp.task('copy-html:example-app', function () {
  return gulp.src(['examples/app/index.html'])
    .pipe(gulp.dest(buildDir))
})

// server task

var inspectHeaders = function (headers) {
  var blackList = new RegExp('^(host|accept|content-length|connection|pragma|cache-control)')
  var str = ''
  for (var key in headers) {
    if (!key.match(blackList)) {
      str += key + ': '
      str += headers[key] + '\n'
    }
  }
  return str
}

gulp.task('serve', ['check', 'build:example-app'], function () {
  var app = connect()
              .use(bodyParser.text({'inflate': true}))
              .use(function (req, res, next) {
                if (req.method === 'POST') {
                  util.log('Motion data received (' +
                    req.body.length + ' bytes):\n' +
                    inspectHeaders(req.headers) +
                    '-----BEGIN MOTION DATA-----\n' +
                    // TODO parse motion header
                    // IE9 output will be f*cked up here
                    req.body + '\n' +
                    '-----END MOTION DATA-----')
                  res.setHeader('Access-Control-Allow-Origin', '*')
                  res.setHeader('Access-Control-Allow-Credentials', 'true')
                  res.end('ok')
                } else {
                  next()
                }
              })
              .use(serveStatic(buildDir))
  var server = http.createServer(app)

  util.log(util.colors.green('Server started on http://localhost:' + port + '/'))
  return server.listen(port)
})
