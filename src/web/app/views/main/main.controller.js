angular
    .module('app.web')
    .controller('MainController', MainController);

function MainController(posts) {
    var vm = this;
    // vm.posts = posts.$query();
    vm.post = posts.$get('3');
}
