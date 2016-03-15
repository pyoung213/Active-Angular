angular
    .module('app.core')
    .provider('AuthEvents', AuthEventsProvider);

function AuthEventsProvider($httpProvider) {
    this.init = function() {
        $httpProvider.interceptors.push('AuthInterceptor');
    };

    this.$get = AuthEvents;
}

function AuthEvents(Api, AuthState, CurrentUser, $state, $q, $interval, $rootScope, $location, Logger, routes) {
    Logger = Logger.specialize('AuthEvents');

    var authApi = Api.all('auth');
    var tokenCheckFrequency = 60 * 60 * 1000;
    var tokenExpirationGap = 60 * 60 * 1000;
    var has_refreshed = false;

    var service = {
        hookEvents: hookEvents
    };
    return service;

    function hookEvents() {
        $interval(checkTokenExpiration, tokenCheckFrequency);
        $rootScope.$on('$stateChangeStart', onStateChangeStart);
    }

    function onStateChangeStart(event, toState, toParams) {
        if (AuthState.isSignedIn() && !has_refreshed) {
            event.preventDefault();
            refreshToken()
                .then(function() {
                    has_refreshed = true;
                    $state.go(toState.name, toParams);
                });
            return;
        }

        if (toState.unauthenticated) {
            return;
        }

        if (!AuthState.isSignedIn()) {
            AuthState.setLastAttemptedUrl($location.url());
            event.preventDefault();
            $state.go(routes.LOGIN);
        }
    }

    function checkTokenExpiration() {
        if (!AuthState.isSignedIn()) {
            return;
        }

        var difference = AuthState.getSecondsUntilTokenExpiration();
        if (difference < tokenExpirationGap) {
            // The token is soon to expire.  Refresh it.
            refreshToken();
        }
    }

    function refreshToken() {
        return authApi.one('refreshToken').get()
            .then(function(token) {
                AuthState.saveToken(token, true);
            })
            .catch(function(err) {
                Logger.error('Failed to refresh token.', {
                    err: err,
                    token: AuthState.getToken()
                });
                AuthState.logout();
                $q.reject(err);
            });
    }
}
