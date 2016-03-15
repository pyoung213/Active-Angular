(function() {
    'use strict'

    angular
        .module('app.web')
        .service('posts', posts);

    function posts(ActiveAngular) {
        return new ActiveAngular('posts/:id');
    }
})();
