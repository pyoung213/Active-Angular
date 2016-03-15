'use strict';

var di = require('simple-di');

var omit = ['app.js', '**/*.spec.js'];

if (process.env.NODE_ENV !== 'test') {
    omit.push('test/**/*');
}

di.load('**/*.js', omit);
