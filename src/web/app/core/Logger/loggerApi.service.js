angular
    .module('app.core')
    .service('LoggerApi', LoggerApi);

function LoggerApi(Api) {
    var api = Api.all('logger');

    var service = {
        log: log
    };

    return service;

    function log(level, args) {
        return api.all(level).post(args);
    }
}
