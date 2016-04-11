angular
    .module('app.web')
    .controller('SinglePostController', SinglePostController);

function SinglePostController($state, posts) {
    var vm = this;

    vm.savePost = savePost;

    vm.singlePost = posts.$get($state.params.id)

    function savePost() {
        vm.singlePost.$save({
                message: vm.message
            })
            .then(function() {
                vm.message = '';
            });
    }
}
