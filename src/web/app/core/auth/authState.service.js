angular
    .module('app.core')
    .factory('AuthState', AuthState);

function AuthState($timeout, $location) {
    var lastAttemptedUrl;
    var currentUser = {};
    var token;

    var service = {
        setLastAttemptedUrl: setLastAttemptedUrl,

        getToken: getToken,
        saveToken: saveToken,
        isSignedIn: isSignedIn,
        logout: logout,
        getSecondsUntilTokenExpiration: getSecondsUntilTokenExpiration,

        getCurrentUser: getCurrentUser
    };

    init();

    return service;

    function init() {
        token = window.localStorage.getItem('token');

        loadCurrentUser();
    }

    function loadCurrentUser() {
        if (getSecondsUntilTokenExpiration() <= 0) {
            token = undefined;
            window.localStorage.removeItem('token');
        }

        var payload = decodeToken();

        currentUser.id = payload.id;
        currentUser.first_name = payload.first_name;
        currentUser.last_name = payload.last_name;
        currentUser.full_name = payload.full_name;
        currentUser.email = payload.email;
        currentUser.verified = payload.verified;
    }

    function getCurrentUser() {
        return currentUser;
    }

    function isSignedIn() {
        return getSecondsUntilTokenExpiration() > 0;
    }

    function getToken() {
        return token;
    }

    function setLastAttemptedUrl(url) {
        lastAttemptedUrl = url;
    }

    function redirectToLastAttemptedUrl() {
        if (!lastAttemptedUrl || !lastAttemptedUrl.length || lastAttemptedUrl === '/') {
            $location.url('/');
            return false;
        }

        $location.url(lastAttemptedUrl);
        lastAttemptedUrl = undefined;
        return true;
    }

    function saveToken(token_to_save, prevent_redirect) {
        token = token_to_save;
        window.localStorage.setItem('token', token);

        loadCurrentUser();

        if (!prevent_redirect) {
            $timeout(redirectToLastAttemptedUrl, 100);
        }
    }

    function logout() {
        token = undefined;
        lastAttemptedUrl = undefined;
        window.localStorage.removeItem('token');
        $location.url('/login');
    }

    function getSecondsUntilTokenExpiration() {
        var payload = decodeToken();

        var expiration = payload.exp * 1000;
        var now = Date.now();
        var difference = expiration - now;
        return difference;
    }

    function decodeToken() {
        try {
            return jwt_decode(token);
        } catch (e) {
            return {};
        }
    }
}
