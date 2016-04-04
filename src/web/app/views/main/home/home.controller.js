angular
    .module('app.web')
    .controller('HomeController', HomeController);

function HomeController(posts, comments, $timeout) {
    var vm = this;
    var pageNumber = 1;
    var params = {
        sortBy: 'createdAt',
        limit: 4,
        page: pageNumber
    }
    vm.filterQuery = '';
    vm.posts = posts.$query(params);
    vm.comments = posts.$queryComments('1');

    vm.editPostMessage = editPostMessage;
    vm.savePost = savePost;
    vm.saveComment = saveComment;
    vm.filter = filter;
    vm.getNextPage = getNextPage;

    $timeout(function() {
        // debugger;
        // vm.posts
    }, 1000)

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

    function saveComment(comment) {
        if (!comment.newComment) {
            return;
        }
        var options = {
            message: comment.newComment
        }
        comment.$save(options)
            .then(function() {
                comment.newComment = "";
            })
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
                    vm.posts.unshift(item)
                });
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
    vm.commentCache = comments.$cache;

    posts.$promise
        .then(function() {});

}
