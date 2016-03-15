angular
    .module('app.startup')
    .config(function($locationProvider, $urlRouterProvider, $translateProvider, AuthEventsProvider) {

        AuthEventsProvider.init();

        $locationProvider.html5Mode(true);

        // For any unmatched url, send to 404
        $urlRouterProvider.otherwise('/404');

        $translateProvider.useStaticFilesLoader({
            prefix: 'languages/',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en_US');
        $translateProvider.useSanitizeValueStrategy('escape');
    })
    .run(function($rootScope, AuthEvents, routes) {
        AuthEvents.hookEvents();
        $rootScope.routes = routes;
    });
