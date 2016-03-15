angular
    .module('app.web')
    .controller('LoginController', LoginController);

function LoginController(Auth, Logger, ForgotPasswordModal, glToast) {
    Logger = Logger.specialize('LoginController');

    var vm = {
        login: login,
        forgotPassword: forgotPassword
    };

    return vm;

    function login() {
        Auth.login(vm.email, vm.password)
            .then(function() {
                Logger.info('Successful login.', {
                    email: vm.email
                });
            })
            .catch(function(err) {
                switch (err.status) {
                    case 401:
                        glToast.simple('LOGIN.ERROR_401');
                        Logger.error("Failed login attempt", {
                            email: vm.email
                        });
                        break;

                    default:
                        glToast.show("LOGIN.ERROR_UNKNOWN");
                        Logger.error("Unknown error on login.", {
                            email: vm.email,
                            err: err
                        });
                        break;
                }
            });
    }

    function forgotPassword(event) {
        ForgotPasswordModal.open(event);
    }
}
