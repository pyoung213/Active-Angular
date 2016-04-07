angular
    .module('app.startup')
    .config(function($locationProvider, ActiveAngularProvider, EnvironmentConfig) {

        $locationProvider.html5Mode(true);

        ActiveAngularProvider.setBaseUrl(EnvironmentConfig.api)
    })
    .run(function($rootScope, routes) {
        $rootScope.routes = routes;
    });
