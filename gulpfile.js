var gulp = require('gulp');
var fs = require('fs');
var path = require('path');

var $ = require('gulp-load-plugins')({
    lazy: true
});

fs.readdirSync(__dirname + '/gulp').forEach(function(file) {
    if (path.extname(file) === '.js') {
        require(__dirname + '/gulp/' + file);
    }
});

/**
 * yargs variables can be passed in to alter the behavior, when present.
 * Example: gulp serve-dev
 *
 * --verbose  : Various tasks will produce more output to the console.
 * --nosync   : Don't launch the browser with browser-sync when serving code.
 * --debug    : Launch debugger with node-inspector.
 * --debug-brk: Launch debugger and break on 1st line with node-inspector.
 * --startServers: Will start servers for midway tests on the test task.
 */

/**
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

module.exports = gulp;
