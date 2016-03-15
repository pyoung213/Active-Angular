angular
    .module('app.web')
    .controller('SignupController', SignupController);

function SignupController(Auth, Logger, glToast) {
    Logger = Logger.specialize('SignupController');

    var vm = {
        signup: signup
    };

    return vm;

    function signup() {
        var payload = {
            full_name: (vm.full_name || "").trim(),
            company_name: (vm.company_name || "").trim(),
            email: (vm.email || "").trim(),
            password: (vm.password || "").trim()
        };

        if (detectInputErrors(payload)) {
            return;
        }

        Auth.signup(payload)
            .then(function() {
                Logger.info("Account successfully created", {
                    full_name: vm.full_name,
                    email: vm.email
                });
            })
            .catch(function(err) {
                if (err.status === 409) {
                    glToast.simple("SIGNUP.USER_ALREADY_EXISTS");
                    Logger.error("An error occurred attempting to signup", {
                        email: vm.email,
                        err: err
                    });
                } else {
                    glToast.simple("SIGNUP.ERROR_UNKNOWN");
                    Logger.error("An error occurred attempting to signup", {
                        email: vm.email,
                        err: err
                    });
                }
            });
    }

    function detectInputErrors(payload) {
        if (!payload.full_name || !payload.company_name || !payload.email || !payload.password) {
            glToast.simple("SIGNUP.ERROR_ALL_FIELDS");
            return true;
        }

        return false;
    }
}
