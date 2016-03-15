var gulp = require('gulp');
var log = require('./log.js');
var inject = require('./inject.js');

var config = require('./gulp.config.js');

var $ = require('gulp-load-plugins')({
    lazy: true
});

/**
 * Create templates for svg icons
 * @return {Stream}
 */
gulp.task('svg_icons', function() {
    log('Creating svg icon templates');

    return gulp.src(config.svgtemplates)
        .pipe($.svgmin())
        .pipe($.angularTemplatecache(
            config.templateCache.svg.file,
            config.templateCache.svg.options
        ))
        .pipe(gulp.dest(config.temp));
});

gulp.task('inject_svg_icons', function() {
    return gulp
        .src(config.index)
        .pipe(inject(config.temp + config.templateCache.svg.file, 'templates'))
        .pipe(gulp.dest(config.client));
});
