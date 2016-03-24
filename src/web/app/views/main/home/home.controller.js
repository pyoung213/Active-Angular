angular
    .module('app.web')
    .controller('HomeController', HomeController);

function HomeController(posts, $timeout) {
    var vm = this;
    vm.posts = posts.$query();

    vm.editPostMessage = editPostMessage;
    vm.savePost = savePost;

    function editPostMessage(post) {
        post.$remove();
    }

    function savePost() {
        vm.post.$save({
                message: vm.message
            })
            .then(function() {
                vm.message = '';
            });
    }

    vm.post = posts.$get('3');
    vm.postCache = posts.$cache;
    // console.log(vm.posts.$get)

    posts.$promise
        .then(function() {

        });

}
