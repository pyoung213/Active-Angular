angular
    .module('app.web')
    .config(function($stateProvider, routes) {
        $stateProvider
            .state(routes.SINGLE_POST, {
                url: '/singlePost/{id}',
                templateUrl: 'singlePost.html',
                controller: 'SinglePostController as vm'
            });
    });
