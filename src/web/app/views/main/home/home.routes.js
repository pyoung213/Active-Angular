angular
    .module('app.web')
    .config(function($stateProvider, routes) {
        $stateProvider
            .state(routes.HOME, {
                url: '/',
                templateUrl: 'home.html',
                controller: 'HomeController as vm'
            });
    });
