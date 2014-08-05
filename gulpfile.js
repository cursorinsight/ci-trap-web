/* global require */

// default server port.
var port = 8100;

var gulp = require("gulp"),
  util = require("gulp-util"),
  browserify = require("gulp-browserify"),
  uglify = require("gulp-uglify"),
  mocha = require("gulp-mocha"),
  cover = require("gulp-coverage"),
  concat = require("gulp-concat"),
  karma = require("gulp-karma"),
  eslint = require("gulp-eslint"),
  jsdoc = require("gulp-jsdoc");

gulp.task("default", ["compress", "karma"]);

gulp.task("lint", function() {
  return gulp.src(["gulpfile.js", "algernon-trap.js"])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task("doc", function() {
  return gulp.src(["algernon-trap.js", "README.md"])
    .pipe(jsdoc.parser())
    .pipe(jsdoc.generator("doc"));
});

gulp.task("test", function () {
  return gulp.src(["test/test_api.js"], { read: false })
    .pipe(cover.instrument({
      pattern: ["algernon-trap.js"]
    }))
    .pipe(mocha({
      reporter: "nyan"
    }))
    .pipe(cover.report({
      outFile: "coverage/index.html"
    }));
});

gulp.task("compress", function() {
  return gulp.src(["algernon-trap.js", "examples/app.js"])
    .pipe(browserify({
      insertGlobals : true
    }))
    .pipe(uglify())
    .pipe(concat("bundle.min.js"))
    .pipe(gulp.dest("./examples"));
});

gulp.task("compress-tests", function() {
  return gulp.src(["test/test_ajax.js"])
    .pipe(browserify({
      insertGlobals : true
    }))
    .pipe(uglify())
    .pipe(concat("test.min.js"))
    .pipe(gulp.dest("./test"));
});

gulp.task("karma", ["compress-tests"], function() {
  return gulp.src("test/test.min.js")
    .pipe(karma({
      configFile: "karma.conf.js",
      action: "run"
    }))
    .on("error", function(err) {
      util.log(util.colors.red(err));
    });
});

// server task

var connect = require("connect"),
  bodyParser = require("body-parser"),
  serveStatic = require("serve-static"),
  http = require("http");

gulp.task("serve", ["compress"], function () {
  var app = connect()
              .use(bodyParser.urlencoded({"extended": false}))
              .use(function (req, res, next) {
                if (req.method === "POST") { // && req.body["motion-data"]() {}
                  util.log("Motion data received ("
                    + req.body["motion-data"].length + " bytes):\n"
                    + "-----BEGIN MOTION DATA-----\n"
                    + req.body["motion-data"] + "\n"
                    + "-----END MOTION DATA-----");
                  res.end("ok");
                } else {
                    next();
                }
              })
              .use(serveStatic("./examples")),
    server = http.createServer(app);

  util.log(util.colors.green("Server started on http://localhost:" + port + "/"));
  server.listen(port);
});
