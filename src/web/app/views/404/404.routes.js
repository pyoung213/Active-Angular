angular
    .module('app.web')
    .config(function($stateProvider, routes) {
        $stateProvider
            .state(routes.PAGE_NOT_FOUND, {
                url: '/404',
                templateUrl: '404.html',
                controller: 'PageNotFoundController as vm',
                unauthenticated: true
            });
    });
