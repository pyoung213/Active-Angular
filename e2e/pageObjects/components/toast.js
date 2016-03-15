'use strict';

var di = require('simple-di');

di.register('toast', toast);

function toast() {
    return element(by.tagName('md-toast'));
}
