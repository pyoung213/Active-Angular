angular
    .module('app.web')
    .service('ApiHelper', ApiHelper);

function ApiHelper(Api) {
    var service = {
        createApi: createApi
    };

    return service;

    function createApi(entity) {
        var api = Api.all(entity);

        var service = {
            getAll: getAll,
            getOne: getOne,
            save: save
        };

        return service;

        function getAll() {
            return api.getList();
        }

        function getOne(id) {
            return api.one(id).get();
        }

        function save(id, patch) {
            return api.one(id).patch(patch);
        }
    }
}
