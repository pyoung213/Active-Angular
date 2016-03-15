var _ = require('lodash');
var path = require('path');

var config = require('./gulp.config.js');

/**
 * Show OS level notification using node-notifier
 */
function notify(options) {
    var notifier = require('node-notifier');

    var logo = path.join(config.root, 'gulp/notify_logo.png');

    var notifyOptions = {
        sound: 'Bottle',
        contentImage: logo,
        icon: logo
    };

    _.assign(notifyOptions, options);

    notifier.notify(notifyOptions);
}

module.exports = notify;
