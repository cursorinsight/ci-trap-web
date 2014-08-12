/* global require */

// defaults and loadable configurations.
var
  project = require("./package.json"),

  port = 8100,                // server port

  distDir = "./dist",         // output directory
  entryFile = ["./src/algernon-trap/index.js"],
  sourceFiles = ["./src/**/*.js"],
  supportingFiles = ["./gulpfile.js", "./karma.conf.js"],
  appFiles = ["./examples/app.js", "./examples/tracker.js"],
  unitTests = ["./test/test_api.js", "./test/test_suite.js"],
  browserTests = ["./test/test_ajax.js"];

// (pre)loading libs.
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

// default task

gulp.task("default", ["check", "test"]);

// compile

gulp.task("dist", function() {
  return gulp.src(entryFile)
    .pipe(browserify({
      // insertGlobals : true,
      // debug: !gulp.env.production
    }))
    .pipe(uglify())
    .pipe(concat(project.name + "-" + project.version + ".min.js"))
    .pipe(gulp.dest(distDir));
});

gulp.task("compile:example-app", function() {
  return gulp.src(["examples/app.js"])
    .pipe(browserify({
      // insertGlobals : true,
      // debug: !gulp.env.production
    }))
    .pipe(concat("bundle.js"))
    .pipe(gulp.dest("./examples"));
});

gulp.task("compile:example-tracker", function() {
  return gulp.src(["examples/tracker.js"])
    .pipe(browserify({
      // insertGlobals : true,
      // debug: !gulp.env.production
    }))
    .pipe(uglify())
    .pipe(concat("tracker.min.js"))
    .pipe(gulp.dest("./examples"));
});

// TODO separated tests!
gulp.task("compile:tests", function() {
  return gulp.src(browserTests)
    .pipe(browserify({
      // insertGlobals : true,
      // debug: !gulp.env.production
    }))
    //.pipe(uglify())
    .pipe(concat("browserified-tests.js"))
    .pipe(gulp.dest("./test"));
});

// documentation

gulp.task("doc", function() {
  return gulp.src(sourceFiles.concat(["./README.md"]))
    .pipe(jsdoc.parser())
    .pipe(jsdoc.generator("./doc"));
});

// run tests

gulp.task("check", ["check:eslint"]);

gulp.task("check:eslint", function() {
  return gulp.src(sourceFiles
      .concat(supportingFiles)
      .concat(appFiles))
    .pipe(eslint())
    .pipe(eslint.format());
});

//gulp.task("test", ["test:unit", "test:browser"]);
gulp.task("test", ["test:browser"]);

gulp.task("test:unit", function () {
  return gulp.src(unitTests, { read: false })
    .pipe(cover.instrument({ pattern: sourceFiles }))
    .pipe(mocha({ reporter: "nyan" }))
    .pipe(cover.report({
      outFile: "./coverage/index.html"
    }));
});

gulp.task("test:browser", ["compile:tests"], function() {
  return gulp.src("./test/browserified-tests.js")
    .pipe(karma({
      configFile: "./karma.conf.js",
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

gulp.task("serve", ["compile:example-app", "compile:example-tracker"], function () {
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
