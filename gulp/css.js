var gulp = require('gulp');
var log = require('./log.js');
var inject = require('./inject.js');
var browserSync = require('browser-sync');

var config = require('./gulp.config.js');

var $ = require('gulp-load-plugins')({
    lazy: true
});

/**
 * Compile less to css
 * @return {Stream}
 */
gulp.task('styles', ['clean-styles'], function() {
    log('Compiling SASS --> CSS');

    return gulp
        .src(config.sass.compile)
        .pipe($.plumber()) // exit gracefully if something fails after this
        .pipe($.sassGlob())
        .pipe($.sass()
            .on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: ['last 2 version', '> 5%']
        }))
        .pipe(gulp.dest(config.temp))
        .pipe(browserSync.stream());
});

gulp.task('inject_styles', function() {
    return gulp
        .src(config.index)
        .pipe(inject(config.css))
        .pipe(gulp.dest(config.client));
});
