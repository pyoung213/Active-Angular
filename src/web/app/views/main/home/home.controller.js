angular
    .module('app.web')
    .controller('HomeController', HomeController);

function HomeController(posts) {
    var vm = this;
    vm.posts = posts.$query();
    posts.$promise
        .then(function() {
            console.log(vm.posts);
        })
}
