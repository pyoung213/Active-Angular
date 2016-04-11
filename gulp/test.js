var gulp = require('gulp');
var path = require('path');
var args = require('yargs').argv;
var log = require('./log.js');
var runsequence = require('run-sequence');

var config = require('./gulp.config.js');

var $ = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('test', ['vet', 'build'], function(done) {
    process.env.NODE_ENV = 'test';
    runsequence('web:test', done);
});

gulp.task('test-dev', ['vet', 'build-dev'], function(done) {
    process.env.NODE_ENV = 'test';
    process.env.SERVE_FROM_SRC = 'true';

    runsequence('web:test', done);
});

/**
 * Run specs once and exit
 * @return {Stream}
 */
gulp.task('web:test', function(done) {
    startTests(true /*singleRun*/ , done);
});

gulp.task('server:test', function() {
    var options = {
        require: path.join(config.server, 'mocha.conf.js'),
        timeout: 3600000,
        grep: args.grep
    };

    return gulp.src([path.join(config.server, '**/*.spec.js')], {
            read: false
        })
        .pipe($.spawnMocha(options));
});

/**
 * Run specs and wait.
 * Watch for file changes and re-run tests on each change
 */
gulp.task('web:test-auto', ['serve-dev'], function(done) {
    startTests(false /*singleRun*/ , done);
});

/**
 * Start the tests using karma.
 * @param  {boolean} singleRun - True means run once and end (CI), or keep running (dev)
 * @param  {Function} done - Callback to fire when karma is done
 * @return {undefined}
 */
function startTests(singleRun, done) {
    var child;
    var excludeFiles = [];
    var karma = require('karma');

    var options = {
        configFile: path.join(config.client, 'karma.conf.js'),
        exclude: excludeFiles,
        singleRun: !!singleRun
    };

    var server = new karma.Server(options, karmaCompleted);
    server.start();

    function karmaCompleted(karmaResult) {
        log('Karma completed');
        if (child) {
            log('shutting down the child process');
            child.kill();
        }
        if (karmaResult === 1) {
            log('karma: tests failed with code ' + karmaResult);
            throw new Error("Karma failed");
        } else {
            done();
        }
    }
}
