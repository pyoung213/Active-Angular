var gulp = require('gulp');

var config = require('./gulp.config.js');

var $ = require('gulp-load-plugins')({
    lazy: true
});

gulp.task('copy_index', function() {
    return gulp
        .src(config.index_src)
        .pipe($.rename('index.html'))
        .pipe(gulp.dest(config.client));
});
