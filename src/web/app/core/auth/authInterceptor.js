angular
    .module('app.core')
    .service('AuthInterceptor', AuthInterceptor);

function AuthInterceptor(AuthState, urlParser, $q) {
    var service = {
        request: request,
        responseError: responseError
    };

    return service;

    function isApiUrl(url) {
        var path = urlParser.parse(url).path;

        // If this is an api call, attach the token
        return path.indexOf('/api/') === 0;
    }

    function request(config) {
        if (isApiUrl(config.url) && AuthState.isSignedIn()) {
            config.headers.Authorization = 'Bearer ' + AuthState.getToken();
        }

        return config;
    }

    function responseError(rejection) {
        if (rejection.config && isApiUrl(rejection.config.url)) {
            switch (rejection.status) {
                case 401:
                    if (AuthState.isSignedIn()) {
                        AuthState.logout();
                    }
                    break;
            }
        }

        return $q.reject(rejection);
    }
}
