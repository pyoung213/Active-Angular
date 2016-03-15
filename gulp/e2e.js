var gulp = require('gulp');
var path = require('path');
var args = require('yargs').argv;
var log = require('./log.js');
var runsequence = require('run-sequence');

var config = require('./gulp.config.js');

var $ = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('e2e', function(done) {
    log('Starting e2e tests');
    var options = {
        configFile: path.join(config.root, "e2e/protractor.conf.js")
    };

    if (args.grep) {
        options.args = ['--grep', args.grep];
    }

    gulp.src([path.join(config.root, "e2e/**/*.spec.js")])
        .pipe($.protractor.protractor(options))
        .on('error', function(err) {
            throw err;
        })
        .on('end', done);
});

gulp.task('e2e-build', function(done) {
    runsequence('build', 'e2e', done);
});
