angular
    .module('app.web')
    .controller('HomeController', HomeController);

function HomeController(posts) {
    var vm = this;
    var pageNumber = 1;
    var params = {
        sortBy: 'createdAt',
        limit: 4,
        page: pageNumber
    }
    vm.filterQuery = '';
    vm.posts = posts.$query(params);
    vm.otherPosts = posts.$query();


    vm.editPostMessage = editPostMessage;
    vm.savePost = savePost;
    vm.filter = filter;
    vm.getNextPage = getNextPage;

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

    function getNextPage() {
        pageNumber++;
        var params = {
            sortBy: 'createdAt',
            limit: 4,
            page: pageNumber
        }
        posts.$query(params).$promise
            .then(function(data) {
                vm.posts.unshift(data);
            });
    }

    function filter() {
        var filter = {
            filter: vm.filterQuery
        }
        vm.filteredPosts = posts.$query(filter);
    }

    vm.post = posts.$get('3');
    vm.postCache = posts.$cache;
    // console.log(vm.posts.$get)

    posts.$promise
        .then(function() {

        });

}
