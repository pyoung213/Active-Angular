'use strict';

var di = require('simple-di');
var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');
var glob = require('glob');

di.register('AssetRoutes', AssetRoutes);

function AssetRoutes(Config) {
    var service = {
        enable: enable
    };

    return service;

    function enable(app) {
        if (Config.serve_from_src) {
            app.use(serveHtml);
            app.use(express.static(path.join(Config.root_path, 'src/web/')));
            app.use(express.static(Config.root_path));
            app.use(express.static(path.join(Config.root_path, '.tmp')));
            app.use(favicon(path.join(Config.root_path, 'src/web/assets/images/favicons/favicon.ico')));
        } else {
            app.use(express.static(path.join(Config.root_path, 'build/')));
            app.use(favicon(path.join(Config.root_path, 'build/assets/images/favicons/favicon.ico')));
        }
    }

    function serveHtml(req, res, next) {
        if (!req.url.match(/\.html$/)) {
            return next();
        }

        var pattern = Config.root_path + "src/web/**" + req.url;
        glob(pattern, function(err, files) {
            var msg;
            if (err || !files || !files.length) {
                msg = "Could not find a matching html file! (" + req.url + ")";
                throw new Error(msg);
            }

            if (files.length > 1) {
                msg = "Found more than one matching file! (" + JSON.stringify(files, null, 2) + ")";
                throw new Error(msg);
            }

            var file = files[0].replace(Config.root_path, '');
            res.sendFile(file, {
                root: Config.root_path
            });
        });
    }
}
