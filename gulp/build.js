var gulp = require('gulp');
var del = require('del');
var log = require('./log.js');
var runsequence = require('run-sequence');

var config = require('./gulp.config.js');

/**
 * Build everything
 * This is separate so we can run tests on
 * optimize before handling image
 */
gulp.task('build', ['clean', 'config'], function(done) {
    runsequence('optimize', 'images', 'languages', function() {
        del.sync(config.temp);
        done();
    });
});

gulp.task('build-dev', ['config', 'copy_index'], function(done) {
    log('Wire up css into the html, after files are ready');

    runsequence(['wiredep', 'styles', 'svg_icons'], 'inject_svg_icons', 'inject_styles', done);
});
