angular
    .module('app.web')
    .controller('SinglePostController', SinglePostController);

function SinglePostController($state, posts) {
    var vm = this;

    vm.singlePost = posts.$get($state.params.id)
}
