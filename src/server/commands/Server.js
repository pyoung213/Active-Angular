'use strict';

var di = require('simple-di');

di.register('Serve (Command)', Serve);

function Serve(Routes) {

    var service = {
        showHelp: showHelp,
        execute: execute
    };

    return service;

    function showHelp() {
        console.log("Serve");
    }

    function execute() {

        var express = require('express');
        var app = express();

        Routes.enable(app);

        var server = app.listen(process.env.PORT || 8001, function() {
            console.log('Server is listening', {
                pid: process.pid,
                port: server.address().port,
                NODE_ENV: process.env.NODE_ENV,
                SERVE_FROM_SRC: process.env.SERVE_FROM_SRC
            });
        });
    }
}
