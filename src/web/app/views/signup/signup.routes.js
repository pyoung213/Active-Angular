angular
    .module('app.web')
    .config(function($stateProvider, routes) {
        $stateProvider
            .state(routes.SIGN_UP, {
                url: '/signup',
                templateUrl: 'signup.html',
                controller: 'SignupController as vm',
                unauthenticated: true,
                hideNavbar: true
            });
    });
