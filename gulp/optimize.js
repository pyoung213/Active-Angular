var gulp = require('gulp');
var path = require('path');
var log = require('./log.js');
var inject = require('./inject.js');

var config = require('./gulp.config.js');

var $ = require('gulp-load-plugins')({
    lazy: true
});

/**
 * Optimize all files, move to a build folder,
 * and inject them into the new index.html
 * @return {Stream}
 */
gulp.task('optimize', ['build-dev', 'templateCache'], function() {
    log('Optimizing the js, css, and html');

    var assets = $.useref.assets({
        searchPath: './'
    });
    // Filters are named for the gulp-useref path
    var cssFilter = $.filter('**/*.css', {
        restore: true
    });
    var jsAppFilter = $.filter('**/' + config.optimized.app, {
        restore: true
    });
    var jslibFilter = $.filter('**/' + config.optimized.lib, {
        restore: true
    });

    var templateCache = [
        config.temp + config.templateCache.html.file,
        config.temp + config.templateCache.svg.file
    ];

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe(inject(templateCache, 'templates'))
        .pipe(assets) // Gather all assets from the html with useref
        // Get the css
        .pipe(cssFilter)
        .pipe($.minifyCss())
        .pipe(cssFilter.restore)
        // Get the custom javascript
        .pipe(jsAppFilter)
        .pipe($.ngAnnotate({
            add: true
        }))
        .pipe($.uglify())
        .pipe(getHeader())
        .pipe(jsAppFilter.restore)
        // Get the vendor javascript
        .pipe(jslibFilter)
        .pipe($.uglify()) // another option is to override wiredep to use min files
        .pipe(jslibFilter.restore)
        // Take inventory of the file names for future rev numbers
        .pipe($.rev())
        // Apply the concat and file replacement with useref
        .pipe(assets.restore())
        .pipe($.useref())
        // Replace the file names in the html with rev numbers
        .pipe($.revReplace())
        .pipe(gulp.dest(config.build));
});

/**
 * Format and return the header for files
 * @return {String}           Formatted file header
 */
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
