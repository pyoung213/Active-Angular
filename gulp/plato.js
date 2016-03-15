var gulp = require('gulp');
var _ = require('lodash');
var path = require('path');
var glob = require('glob');

var log = require('./log.js');

var config = require('./gulp.config.js');

var $ = require('gulp-load-plugins')({
    lazy: true
});

/**
 * Create a visualizer report
 */
gulp.task('plato', function(done) {
    log('Analyzing source with Plato');

    startPlatoVisualizer(done);
});

/**
 * Start Plato inspector and visualizer
 */
function startPlatoVisualizer(done) {
    var files = _(config.plato.js)
        .map(function(pattern) {
            return glob.sync(pattern);
        })
        .flatten()
        .value();

    var excludeFiles = /.*\.spec\.js/;
    var plato = require('plato');

    var options = {
        title: 'Plato Inspections Report',
        exclude: excludeFiles,
        jshint: false
    };
    var outputDir = config.report + '/plato';

    plato.inspect(files, outputDir, options, platoCompleted);

    function platoCompleted() {
        var options = {
            uri: path.join(outputDir, 'index.html'),
            app: "Google Chrome"
        };
        gulp.src("./gulpfile.js")
            .pipe($.open(options))
            .on('end', done);
    }
}
