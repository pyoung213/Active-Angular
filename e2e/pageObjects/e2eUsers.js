'use strict';

var di = require('simple-di');

di.register('e2eUsers', e2eUsers);

function e2eUsers() {
    var service = {
        verifiedUser: {
            first_name: 'Verified',
            last_name: 'Tester',
            full_name: 'Verified Tester',
            email: 'test+verified@email.com',
            password: 'secret'
        },
        unverifiedUser: {
            first_name: 'Unverified',
            last_name: 'Tester',
            full_name: 'Unverified Tester',
            email: 'test+unverified@email.com',
            password: 'secret'
        }
    };

    return service;
}
