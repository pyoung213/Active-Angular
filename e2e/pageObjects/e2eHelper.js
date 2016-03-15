'use strict';

var di = require('simple-di');
var url = require('url');

di.register('e2eHelper', e2eHelper);

function e2eHelper() {
    var service = {
        waitForUrlPathToChangeTo: waitForUrlPathToChangeTo,
        dumpHtml: dumpHtml
    };

    return service;

    function waitForUrlPathToChangeTo(pathname) {
        return browser.wait(function() {
            return browser.getCurrentUrl().then(function(current_url) {
                var parsed = url.parse(current_url);
                return parsed.pathname === pathname;
            });
        });
    }

    function dumpHtml() {
        /*eslint no-console:0*/
        element(by.tagName('html')).getInnerHtml().then(console.log);
    }
}
