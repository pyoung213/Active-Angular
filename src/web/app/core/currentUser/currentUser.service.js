angular
    .module('app.core')
    .service('CurrentUser', CurrentUser);

function CurrentUser(AuthState) {
    var currentUser = AuthState.getCurrentUser();

    var service = {
        get id() {
            return currentUser.id;
        },

        get first_name() {
            return currentUser.first_name;
        },

        get last_name() {
            return currentUser.last_name;
        },

        get full_name() {
            return currentUser.full_name;
        },

        get email() {
            return currentUser.email;
        },

        get verified() {
            return currentUser.verified;
        }
    };

    return service;
}
