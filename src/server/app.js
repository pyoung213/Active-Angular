'use strict';

var _ = require('lodash');
require('./initDI.js');
var argv = require('yargs').argv;
var di = require('simple-di');
var async = require('async');

di.invoke(runCommand);

function runCommand() {

    async.parallel({
        models: initModels
    }, function(err) {
        if (err) {
            process.exit();
        }

        var command = di.get(argv.command || 'Serve');

        if (argv.help || !command) {
            showHelp();
            process.exit();
        }

        command.execute(process.exit);
    });
}

function showHelp() {
    var commands = di.getByTag('Command');
    _.each(commands, function(command) {
        command.showHelp();
    });
}

function initModels(callback) {
    var models = di.getByTag('Model');
    async.eachSeries(models, function(model, cb) {
        model.init(cb);
    }, callback);
}
