'use strict';

var di = require('simple-di');
var path = require('path');
var express = require('express');

di.register('IndexRoutes', IndexRoutes);

function IndexRoutes(Config) {
    var service = {
        enable: enable
    };

    return service;

    function enable(app) {
        var index = Config.serve_from_src ?
            path.join(Config.root_path, 'src/web/index.html') :
            path.join(Config.root_path, 'build/index.html');

        app.use('/*', express.static(index));
    }
}
