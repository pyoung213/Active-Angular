(function() {
    'use strict'

    angular
        .module('app.web')
        .service('posts', posts);

    function posts(ActiveAngular, comments, users) {
        var options = {
            hydrate: {
                author: users,
                comments: comments
            },
            edges: {
                comments: {
                    model: comments
                }
            }
        };
        return new ActiveAngular('posts/:id', options);
    }
})();
