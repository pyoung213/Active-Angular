var path = require('path');
var wiredep = require('wiredep');
var findParentDir = require('find-parent-dir');

var root_path = findParentDir.sync(__dirname, 'package.json');

var client = path.join(root_path, 'src/web/');
var server = path.join(root_path, 'src/server/');
var clientApp = client + 'app/';
var report = path.join(root_path, 'report/');
var specRunnerFile = 'specs.html';
var temp = path.join(root_path, '.tmp/');

var bowerFiles = wiredep({
    devDependencies: true
})['js'];

var bower = {
    json: require(path.join(root_path, 'bower.json')),
    directory: path.join(root_path, 'bower_components/'),
    ignorePath: '../..'
};

var nodeModules = path.join(root_path, 'node_modules');

var config = {
    /**
     * File paths
     */
    // all javascript that we want to vet
    alljs: [
        path.join(root_path, 'src/**/*.js'),
        path.join(root_path, '*.js'),
        path.join(root_path, 'gulp/**/*.js'),
        path.join(root_path, 'e2e/**/*.js')
    ],
    build: path.join(root_path, 'build/'),
    client: client,
    clientApp: clientApp,
    css: [
        path.join(temp, '**/*.css')
    ],
    dist: path.join(root_path, 'dist/'),
    activeAngular: [
        path.join(clientApp, 'core/ActiveAngular/**/*.js'),
        '!' + path.join(clientApp, 'core/ActiveAngular/**/*.spec.js')
    ],
    environmentConfig: {
        src: client + 'config/environment.config.json',
        module: 'app.core',
        dest: clientApp + 'core/'
    },
    languages: path.join(client, 'languages/**/*.*'),
    html: path.join(client, '**/*.html'),
    htmltemplates: path.join(clientApp, '**/*.html'),
    svgtemplates: path.join(client, 'assets/svg_icons/*.svg'),
    images: path.join(client, 'assets/images/**/*.*'),
    index: path.join(client, 'index.html'),
    index_src: path.join(client, 'index.src.html'),
    // app js, with no specs
    js: [
        path.join(clientApp, '**/*.module.js'),
        path.join(clientApp, '**/*.js'),
        '!' + path.join(clientApp, '**/*.spec.js')
    ],
    jsOrder: [
        '**/app.module.js',
        '**/*.module.js',
        '**/*.js'
    ],
    sass: {
        watch: [path.join(client, '**/*.scss')],
        compile: [path.join(client, 'assets/styles/styles.scss')]
    },
    report: report,
    root: root_path,
    server: server,
    source: 'src/',
    stubsjs: [
        bower.directory + 'angular-mocks/angular-mocks.js',
        client + 'stubs/**/*.js'
    ],
    temp: temp,

    /**
     * optimized files
     */
    optimized: {
        app: 'app.js',
        lib: 'lib.js'
    },

    /**
     * plato
     */
    plato: {
        js: [
            path.join(clientApp, '**/*.js'),
            path.join(server, '**/*.js')
        ]
    },

    /**
     * browser sync
     */
    browserReloadDelay: 1000,

    /**
     * template cache
     */
    templateCache: {
        html: {
            file: 'html_templates.js',
            options: {
                module: 'app',
                root: 'app/',
                transformUrl: function(url) {
                    return path.basename(url);
                },
                standalone: false
            }
        },
        svg: {
            file: 'svg_templates.js',
            options: {
                module: 'app',
                root: '',
                standalone: false
            }
        }
    },

    /**
     * Bower and NPM files
     */
    bower: bower,
    packages: [
        path.join(root_path, 'package.json'),
        path.join(root_path, 'bower.json')
    ],

    /**
     * specs.html, our HTML spec runner
     */
    specRunner: client + specRunnerFile,
    specRunnerFile: specRunnerFile,

    /**
     * The sequence of the injections into specs.html:
     *  1 testlibraries
     *      mocha setup
     *  2 bower
     *  3 js
     *  4 spechelpers
     *  5 specs
     *  6 templates
     */
    testlibraries: [
        path.join(nodeModules, 'mocha/mocha.js'),
        path.join(nodeModules, 'chai/chai.js'),
        path.join(nodeModules, 'sinon-chai/lib/sinon-chai.js')
    ],
    specHelpers: [
        path.join(client, 'test-helpers/*.js')
    ],
    specs: [
        path.join(clientApp, '**/*.spec.js')
    ],
    serverIntegrationSpecs: [
        path.join(client, 'tests/server-integration/**/*.spec.js')
    ],

    /**
     * Node settings
     */
    nodeServer: path.join(server, 'app.js'),
    defaultPort: '8001'
};

/**
 * wiredep and bower settings
 */
config.getWiredepDefaultOptions = function() {
    var options = {
        bowerJson: config.bower.json,
        directory: config.bower.directory,
        ignorePath: config.bower.ignorePath,
        devDependencies: true
    };
    return options;
};

/**
 * karma settings
 */
config.karma = getKarmaOptions();

////////////////

function getKarmaOptions() {
    var options = {
        files: [].concat(
            bowerFiles,
            path.join(clientApp, '**/*.module.js'),
            path.join(clientApp, '**/*.js'),
            path.join(temp, config.templateCache.html.file),
            path.join(temp, config.templateCache.svg.file)
        ),
        exclude: [],
        coverage: {
            dir: path.join(report, 'coverage'),
            reporters: [
                // reporters not supporting the `file` property
                {
                    type: 'html',
                    subdir: 'report-html'
                }, {
                    type: 'lcov',
                    subdir: 'report-lcov'
                }, {
                    type: 'text-summary'
                } //, subdir: '.', file: 'text-summary.txt'}
            ]
        },
        preprocessors: {}
    };
    options.preprocessors[clientApp + '**/!(*.spec)+(.js)'] = ['coverage'];
    return options;
}

module.exports = config;
