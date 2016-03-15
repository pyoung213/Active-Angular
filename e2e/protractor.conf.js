'use strict';

var _ = require('lodash');
var di = require('simple-di');
var request = require('request');
var q = require('q');
var async = require('async');
var argv = require('yargs').argv;

var port = Math.floor(Math.random() * 1000) + 3001;
var baseUrl = 'http://localhost:' + port + '/';

exports.config = {
    baseUrl: baseUrl,

    framework: 'mocha',

    mochaOpts: {
        reporter: "spec",
        enableTimeouts: false,
        slow: 1000,
        grep: argv.grep
    },

    capabilities: {
        browserName: 'chrome'
    },

    onPrepare: onPrepare,

    specs: [
        'e2e/**/*.spec.js'
    ]
};

function onPrepare() {
    process.env.PORT = port;
    process.env.LOG_LEVEL = 'warn';
    process.env.NODE_ENV = 'test';

    return initTestingFrameworks()
        .then(initDIForTests)
        .then(disableAnimations)
        .then(startServer)
        .then(createUsers)
        .then(function() {
            return [{
                browserName: 'chrome'
            }];
        })
        .catch(function(err) {
            /*eslint no-console:0*/
            console.log(err);
            process.exit(0);
        });
}

function disableAnimations() {
    /*global angular:false, document:false*/

    var disableNgAnimate = function() {
        angular
            .module('disableNgAnimate', [])
            .run(['$animate', function($animate) {
                $animate.enabled(false);
            }]);
    };

    var disableCssAnimate = function() {
        angular
            .module('disableCssAnimate', [])
            .run(function() {
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = '* {' +
                    '-webkit-transition: none !important;' +
                    '-moz-transition: none !important' +
                    '-o-transition: none !important' +
                    '-ms-transition: none !important' +
                    'transition: none !important' +
                    '}';
                document.getElementsByTagName('head')[0].appendChild(style);
            });
    };

    browser.addMockModule('disableNgAnimate', disableNgAnimate);
    browser.addMockModule('disableCssAnimate', disableCssAnimate);

    return q.when();
}

function startServer() {
    require('../src/server/app.js');

    var deferred = q.defer();

    // Wait for the server to come up.
    var alive = false;
    async.until(
        function() {
            return alive;
        },
        function(cb) {
            request(baseUrl + 'healthcheck', function(err, res) {
                alive = !err && res.statusCode === 200;
                cb();
            });
        },
        function() {
            deferred.resolve();
        });

    return deferred.promise;
}

function createUsers() {
    return di.invoke(function(e2eUsers, UserService, UserModel, Async, Logger, Promise) {
        Logger = Logger.specialize('Protractor');

        return Async.auto({
            remove: function() {
                Logger.info('Removing all users');
                return Promise.promisify(UserModel.remove.bind(UserModel), {});
            },
            create: function(remove) {
                remove = remove; // 'remove' is only here to force a dependency
                Logger.info('Creating users');
                return Async.map(_.values(e2eUsers), UserService.create);
            },
            verify: function(create) {
                Logger.info('Marking users verified');
                var users = _.reject(create, {
                    full_name: e2eUsers.unverifiedUser.full_name
                });
                return Async.map(users, function(user) {
                    return UserService.save(user.id, {
                        verified: true
                    });
                });
            }
        });
    });
}

function initTestingFrameworks() {
    var chai = require('chai');

    chai.should();
    chai.use(require('sinon-chai'));
    chai.use(require('chai-as-promised'));

    return q.resolve();
}

function initDIForTests() {
    var omit = ['**/*.spec.js'];
    di.load('**/*.js', omit);
    return q.resolve();
}
