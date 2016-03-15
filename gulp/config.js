var gulp = require('gulp');
var log = require('./log.js');

var config = require('./gulp.config.js');

var $ = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('config', function() {
    log('running environment config');

    gulp.src(config.environmentConfig.src)
        .pipe($.ngConfig(config.environmentConfig.module, {
            environment: process.env.NODE_ENV || 'development',
            createModule: false
        }))
        .pipe(gulp.dest(config.environmentConfig.dest))
});
