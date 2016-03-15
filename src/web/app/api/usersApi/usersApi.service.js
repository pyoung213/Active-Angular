angular
    .module('app.web')
    .service('UsersApi', UsersApi);

function UsersApi(ApiHelper) {
    return ApiHelper.createApi('users');
}
