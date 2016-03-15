angular
    .module('app.web')
    .service('glToast', glToast);

function glToast($mdToast, $translate) {
    var service = {
        simple: simple
    };

    return service;

    function simple(message) {
        $translate(message).then(function(translation) {
            $mdToast.show(
                $mdToast.simple()
                .content(translation)
                .position('top left')
                .hideDelay(3000)
            );
        });
    }
}
