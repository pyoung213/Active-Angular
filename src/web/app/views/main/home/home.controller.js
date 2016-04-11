angular
    .module('app.web')
    .controller('HomeController', HomeController);

function HomeController(posts, comments) {
    var vm = this;
    var pageNumber = 1;
    var params = {
        sortBy: 'createdAt',
        limit: 4,
        page: pageNumber
    }
    vm.filterQuery = '';
    vm.posts = posts.$query(params);
    vm.normalPosts = posts.$query();
    posts.$get('1').$promise
        .then(function(response) {
            vm.post = response;
            // vm.singlePostComments = vm.post.$edge('comments').$query();
        })
    vm.comments = posts.$edge('comments', '1').$query();
    // vm.singlePostComments = vm.post.$edge('comments').$query();

    vm.editPostMessage = editPostMessage;
    vm.savePost = savePost;
    vm.filter = filter;
    vm.getNextPage = getNextPage;
    vm.createPost = createPost;

    function editPostMessage(post) {
        post.$remove();
    }

    function createPost() {
        var params = {
            message: vm.createMessage
        }
        posts.$create(params)
            .then(function(response) {
                vm.posts.unshift(response);
                vm.createMessage = '';
            })
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
                _.forEach(data, function(item) {
                    vm.posts.push(item)
                });
            });
    }

    function filter() {
        var filter = {
            filter: vm.filterQuery
        }
        vm.normalPosts = posts.$query(filter);
    }

    vm.post = posts.$get('3');
    vm.postCache = posts.$cache;
    vm.commentCache = comments.$cache;
}
