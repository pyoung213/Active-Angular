angular
    .module('app.core')
    .factory('Api', Api);

function Api(Restangular) {
    return Restangular.withConfig(function(RestangularConfigurer, EnvironmentConfig) {
        RestangularConfigurer.setBaseUrl(EnvironmentConfig);
    });
}
