var gulp = require('gulp');
var log = require('./log.js');
var path = require('path');
var del = require('del');

var config = require('./gulp.config.js');

var $ = require('gulp-load-plugins')({
    lazy: true
});

/**
 * Build everything
 * This is separate so we can run tests on
 * optimize before handling image
 */
gulp.task('dist', ['dist-clean'], function() {
    log('Starting dist');
    return gulp
        .src(config.activeAngular)
        .pipe($.order(config.jsOrder))
        .pipe($.concat('activeAngular.js'))
        .pipe(gulp.dest(config.dist))
        .pipe($.concat('activeAngular.min.js'))
        .pipe($.ngAnnotate({
            add: true
        }))
        .pipe($.uglify())
        .pipe(getHeader())
        .pipe(gulp.dest(config.dist));
});

gulp.task('dist-clean', function() {
    log('Cleaning: ' + $.util.colors.blue(config.dist));
    del.sync(config.dist);
});

function getHeader() {
    var pkg = require(path.join(config.root, 'package.json'));
    var template = ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @authors <%= pkg.authors %>',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''
    ].join('\n');
    return $.header(template, {
        pkg: pkg
    });
}
