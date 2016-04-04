(function() {
    'use strict'

    angular
        .module('app.web')
        .service('users', users);

    function users(ActiveAngular) {
        return new ActiveAngular('users/:id');
    }
})();
