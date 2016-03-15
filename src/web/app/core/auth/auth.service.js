angular
    .module('app.core')
    .service('Auth', Auth);

function Auth(Api, AuthState, $q) {
    var authApi = Api.all('auth');

    var service = {
        signup: signup,
        login: login,
        verify: verify,
        resendVerification: resendVerification,
        changePassword: changePassword,
        changeForgottenPassword: changeForgottenPassword,
        forgotPassword: forgotPassword
    };

    return service;

    function filterAuthErr(err) {
        // Config contains sensitive information like the username and password
        // Omit these, so that they don't accidentally get logged somewhere.
        err = _.omit(err, 'config', 'data');
        return $q.reject(err);
    }

    function signup(payload) {
        return authApi.all('signup').post(payload)
            .then(AuthState.saveToken)
            .catch(filterAuthErr);
    }

    function login(email, password) {
        var payload = {
            email: email,
            password: password
        };

        return authApi.all('login').post(payload)
            .then(AuthState.saveToken)
            .catch(filterAuthErr);
    }

    function verify(token) {
        var payload = {
            verification_token: token
        };

        return authApi.all('verify').post(payload)
            .then(AuthState.saveToken)
            .catch(filterAuthErr);
    }

    function resendVerification(email) {
        return authApi.all('resend-verification').post({
                email: email
            })
            .catch(filterAuthErr);
    }

    function changePassword(old_password, new_password) {
        return authApi.all('change-password').post({
                old_password: old_password,
                new_password: new_password
            })
            .catch(filterAuthErr);
    }

    function changeForgottenPassword(token, new_password) {
        return authApi.all('change-forgotten-password').post({
                forgot_password_token: token,
                new_password: new_password
            })
            .catch(filterAuthErr);
    }

    function forgotPassword(email) {
        return authApi.all('forgot-password').post({
                email: email
            })
            .catch(filterAuthErr);
    }
}
