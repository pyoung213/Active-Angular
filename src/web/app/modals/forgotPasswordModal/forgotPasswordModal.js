(function() {
    'use strict'

    angular
        .module('app.web')
        .service('ForgotPasswordModal', ForgotPasswordModal)
        .controller('ForgotPasswordModalController', ForgotPasswordModalController);

    function ForgotPasswordModal($mdDialog) {
        var vm = {
            open: open
        };

        return vm;

        function open() {
            return $mdDialog.show({
                controller: 'ForgotPasswordModalController as vm',
                templateUrl: 'forgotPasswordModal.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true
            });
        }
    }

    function ForgotPasswordModalController($mdDialog, Auth, Logger, CurrentUser, glToast) {
        Logger = Logger.specialize('Forgot Password Modal');

        var vm = {
            submit: submit,
            cancel: cancel
        };

        return vm;

        function submit(form) {

            if (form.$invalid) {
                return;
            }

            Auth.forgotPassword(vm.email)
                .then(function() {
                    $mdDialog.hide();
                })
                .catch(function(err) {
                    if (err.status === 404) {
                        glToast.simple('FORGOT_PASSWORD.NO_ACCOUNT');
                        return;
                    }
                    glToast.simple('FORGOT_PASSWORD.UNKNOWN_ERROR');

                    Logger.error("An error occurred attempting to change the password", {
                        email: CurrentUser.email,
                        err: err
                    });
                });
        }

        function cancel() {
            $mdDialog.cancel();
        }
    }
})();
