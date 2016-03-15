'use strict';

var _ = require('lodash');
var di = require('simple-di');
var findParentDir = require('find-parent-dir');

di.register('Config', Config);

function Config() {
    var environment = process.env.NODE_ENV || 'development';

    var config_path = './environment/';
    var defaults = require(config_path + 'defaults');
    var config = require(config_path + environment);

    var extras = {
        serve_from_src: process.env.SERVE_FROM_SRC === 'true',
        root_path: findParentDir.sync(__dirname, 'package.json'),
        env: {
            name: environment,
            production: environment === "production",
            test: environment === "test",
            development: environment === "development"
        }
    };

    return _.merge(
        defaults,
        config,
        extras);
}
