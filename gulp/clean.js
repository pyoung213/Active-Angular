var gulp = require('gulp');
var del = require('del');
var log = require('./log.js');

var config = require('./gulp.config.js');

var $ = require('gulp-load-plugins')({
    lazy: true
});

/**
 * Remove all files from the build, temp, and reports folders
 */
gulp.task('clean', function() {
    var delconfig = [].concat(config.build, config.temp, config.report, config.index);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del.sync(delconfig);
});

/**
 * Remove all languages from the build folder
 */
gulp.task('clean-languages', function() {
    clean(config.build + 'languages/**/*.*');
});

/**
 * Remove all images from the build folder
 */
gulp.task('clean-images', function() {
    clean(config.build + 'images/**/*.*');
});

/**
 * Remove all styles from the build and temp folders
 */
gulp.task('clean-styles', function() {
    var files = [].concat(
        config.temp + '**/*.css',
        config.build + 'styles/**/*.css'
    );
    clean(files);
});

/**
 * Remove all js and html from the build and temp folders
 */
gulp.task('clean-code', function() {
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + 'js/**/*.js',
        config.build + '**/*.html'
    );
    clean(files);
});

/**
 * Delete all files in a given path
 * @param  {Array}   path - array of paths to delete
 */
function clean(path) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del.sync(path);
}
