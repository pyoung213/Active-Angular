describe('ActiveAngular', function() {
    var Post, sandbox, $httpBackend, posts, ActiveAngular, ActiveArray, ActiveObject, $q, post, activePosts,
        userId = "1234567890",
        url = "posts/:id";

    beforeEach(module('activeAngular'));

    beforeEach(inject(function(_ActiveAngular_, _ActiveArray_, _ActiveObject_, _$httpBackend_, _$q_) {
        sandbox = sinon.sandbox.create();
        ActiveAngular = _ActiveAngular_;
        ActiveArray = _ActiveArray_;
        ActiveObject = _ActiveObject_;
        Post = new ActiveAngular(url);
        $httpBackend = _$httpBackend_;
        $q = _$q_;

        posts = [{
            id: '1',
            author: '1',
            message: "test"
        }, {
            id: '2',
            author: '2',
            message: "test"
        }, {
            id: '3',
            author: '3',
            message: "test"
        }, {
            id: '4',
            author: '4',
            message: "test"
        }];

        activePosts = ActiveArray.decorateArray(posts, Post);
        _.forEach(activePosts, function(value, key) {
            activePosts[key] = new ActiveObject(value, Post);
        });

        post = posts[1];
    }));

    afterEach(function() {
        sandbox.restore();
        $httpBackend.verifyNoOutstandingExpectation;
    });

    it('creates instance of ActiveAngular', function() {
        expect(Post).to.be.instanceof(ActiveAngular);
    });

    describe('$query', function() {
        it('should query with params', function() {
            var getMockData = {
                sort: 'something',
                param: 'another'
            }
            $httpBackend.expectGET('/posts' + '?param=another&sort=something').respond(200, posts);
            Post.$query(getMockData);
            $httpBackend.flush();
        });

        it('should query with params and cache', function() {
            var getMockData = {
                sort: 'something',
                param: 'another'
            }
            Post.$query(getMockData);
            var key = "param=another&sort=something";
            expect(Post.$cache.cached[key]).to.exist;
        });

        it('should get array and be able to use actions on it', function() {
            $httpBackend.expectGET('/posts').respond(200, posts);
            var allPosts = Post.$query();
            $httpBackend.flush();

            expect(allPosts.$remove).to.exist;
            expect(allPosts.$create).to.exist;
            expect(allPosts.$get).to.exist;
        });

        it('should get array and than get one object', function() {
            var postId = '0';
            $httpBackend.expectGET('/posts').respond(200, posts);
            var allPosts = Post.$query();
            $httpBackend.flush();

            $httpBackend.expectGET('/posts/' + postId).respond(200, posts[postId]);
            allPosts.$get(postId);
            $httpBackend.flush();
        });

        it('should get a collection and turn it into an array', function() {
            var collection = {};
            collection.items = posts;
            collection._count = 100;
            $httpBackend.expectGET('/posts').respond(200, collection);
            var somePosts = Post.$query();
            $httpBackend.flush();

            expect(somePosts[1].id).to.be.equal(posts[1].id);
            expect(somePosts._count).to.exist;
        });
    });

    describe('$get', function() {
        it('should return an instance of ActiveObject', function() {
            var newInstance = Post.$get();
            expect(newInstance).to.be.an.instanceof(ActiveObject);
        });

        it('should get with params', function() {
            var getMockData = {
                id: userId,
                sort: 'something',
                param: 'another'
            }
            $httpBackend.expectGET('/posts/' + userId + '?param=another&sort=something').respond(200, post);
            Post.$get(getMockData);
            $httpBackend.flush();
        });

        it('should get object and be able to use actions on it', function() {
            $httpBackend.expectGET('/posts/' + userId).respond(200, post);
            var myPost = Post.$get(userId);
            $httpBackend.flush();
            expect(myPost.$save).to.exist;
            expect(myPost.$remove).to.exist;
        });
    });

    describe('$hydrate', function() {
        it('should hydrate get into list of posts', function() {
            var Users = new ActiveAngular('user/:id');
            var options = {
                hydrate: {
                    author: Users
                }
            }
            var author = {
                id: 1,
                full_name: "Awesome Sauce"
            }
            var Posts = new ActiveAngular('posts/:id', options);
            $httpBackend.expectGET('/posts').respond(200, posts);
            $httpBackend.expectGET('/user/1').respond(200, author);
            $httpBackend.expectGET('/user/2').respond(200, author);
            $httpBackend.expectGET('/user/3').respond(200, author);
            $httpBackend.expectGET('/user/4').respond(200, author);
            Posts.$query();
            $httpBackend.flush();
        });

        it('should hydrate get one post', function() {
            var Users = new ActiveAngular('user/:id');
            var options = {
                hydrate: {
                    author: Users
                }
            }
            var author = {
                id: 1,
                full_name: "Awesome Sauce"
            }
            var Posts = new ActiveAngular('posts/:id', options);
            $httpBackend.expectGET('/posts/1').respond(200, posts[0]);
            $httpBackend.expectGET('/user/1').respond(200, author);
            Posts.$get('1');
            $httpBackend.flush();
        });
    });

    describe('$promise', function() {
        it('should resolve promise when getting an array', function() {
            var Posts = new ActiveAngular('posts/:id');
            $httpBackend.expectGET('/posts').respond(200, posts);
            Posts.$query().$promise
                .then(function(response) {
                    expect(JSON.stringify(response)).to.be.equal(JSON.stringify(posts));
                });
            $httpBackend.flush();
        });

        it('should resolve promises in array when expecting a list', function() {
            var Posts = new ActiveAngular('posts/:id');
            $httpBackend.expectGET('/posts').respond(200, posts);
            Posts.$query().$promise
                .then(function(response) {
                    response[0].$promise
                        .then(function(singlePostResponse) {
                            expect(singlePostResponse).to.be.an.object;
                        })
                });
            $httpBackend.flush();
        });
    });

    describe('$edges', function() {
        it('should create an edge that can be called', function() {
            var Comments = new ActiveAngular('comments/:id');
            var options = {
                edges: {
                    comments: {
                        model: Comments
                    }
                }
            }
            var Posts = new ActiveAngular('posts/:id', options);
            $httpBackend.expectGET('/posts/2/comments').respond(200, posts);
            Posts.$edge('comments', '2').$query();
            $httpBackend.flush();
        });
        it('should create an edge and hydrate it', function() {
            var Comments = new ActiveAngular('comments/:id');
            var options = {
                hydrate: {
                    comments: Comments
                },
                edges: {
                    comments: {
                        model: Comments
                    }
                }
            }
            var Posts = new ActiveAngular('posts/:id', options);
            $httpBackend.expectGET('/posts/3').respond(200, posts[2]);
            $httpBackend.expectGET('/posts/3/comments').respond(200, posts);
            var post = Posts.$get('3');
            $httpBackend.flush();

            expect(post.comments).to.exist;
        });
        it('should create an edge and set collection key', function() {
            var options = {
                collectionKey: "posts"
            }
            var Posts = new ActiveAngular('posts/:id', options);
            var postsResponse = {
                posts: posts
            }
            $httpBackend.expectGET('/posts').respond(200, postsResponse);
            var somePosts = Posts.$query();
            $httpBackend.flush();

            expect(somePosts[0].id).to.be.equal(posts[0].id);
        });
    });

    describe('$format', function() {
        it('should format response', function() {
            var options = {
                formatResponse: formatResponse
            }

            function formatResponse(data) {
                _.forEach(data, function(item) {
                    item.name = "formated name " + item.id;
                });
                return data;
            }
            var Posts = new ActiveAngular('posts/:id', options);
            $httpBackend.expectGET('/posts').respond(200, posts);
            var somePosts = Posts.$query();
            $httpBackend.flush();

            expect(somePosts[0].name).to.be.equal("formated name 1");
        });
    });

    describe('$$http', function() {
        it('should strip double slashes and trailing slashes', function() {
            var Comments = new ActiveAngular('posts/:id/comments/');
            $httpBackend.expectGET('/posts/comments').respond(200, posts);
            Comments.$query();
            $httpBackend.flush();
        });
    });

    describe('$create', function() {
        it('should create with data on body', function() {
            var createMockData = {
                message: 'this is an awesome message',
                title: 'awesome title'
            }
            $httpBackend.expectPOST('/posts', createMockData).respond(200);
            Post.$create(createMockData);
            $httpBackend.flush();
        });
    });

    describe('$save', function() {
        it('should save options with data on body', function() {
            var saveMockData = {
                message: 'hi',
                title: 'awesome'
            }
            $httpBackend.expectPUT('/posts/' + userId, angular.copy(saveMockData)).respond(200, {});
            saveMockData.id = userId;
            Post.$save(saveMockData);
            $httpBackend.flush();
        });

        it('should save with data on body', function() {
            var singleActivePost = activePosts[0];
            var returnedData = angular.copy(_.omit(singleActivePost, 'id'));
            $httpBackend.expectPUT('/posts/' + singleActivePost.id, returnedData).respond(200, {});
            singleActivePost.$save();
            $httpBackend.flush();
        });
    });

    describe('$update', function() {
        it('should do a partial update with the data', function() {
            var saveMockData = {
                message: 'hi',
                title: 'awesome'
            }
            $httpBackend.expectPATCH('/posts/' + userId, angular.copy(saveMockData)).respond(200, {});
            saveMockData.id = userId;
            Post.$update(saveMockData);
            $httpBackend.flush();
        });
    });

    describe('$remove', function() {
        it('should remove item', function() {
            $httpBackend.expectDELETE('/posts/' + userId).respond(200, {});
            Post.$remove(userId);
            $httpBackend.flush();
        });
    });

    describe('cache', function() {

        it('should $get posts with id and cache it', function() {
            $httpBackend.expectGET('/posts/' + userId).respond(200, post);
            Post.$get(userId);
            $httpBackend.flush();

            expect(Post.$cache.cached[userId]).to.be.eql(post);
        });

        it('should $get posts with id and return cached ref', function() {
            $httpBackend.expectGET('/posts/' + userId).respond(200, post);
            Post.$get(userId);
            $httpBackend.flush();

            sandbox.stub(Post, '$$http');
            Post.$get(userId);
            expect(Post.$$http.called).to.be.false;
        });

        it('should $get from cached array of posts', function() {
            $httpBackend.expectGET('/posts').respond(200, posts);
            Post.$query();
            $httpBackend.flush();

            sandbox.stub(Post, '$$http');
            Post.$get(posts[0].id);
            expect(Post.$$http.called).to.be.false;
        });

        it('should $get unique reference from cache with id', function() {
            var reference = 'someUniqueReference';
            $httpBackend.expectGET('/posts/' + userId).respond(200, post);
            Post.$get(userId, reference);
            $httpBackend.flush();
            expect(Post.$cache.cached[userId + _.toLower(reference)]).to.have.all.keys(post);
        });

        it('should $get when cache timestamp has expired', function() {
            var Ref = new ActiveAngular('something/:id');
            var id = '1234';
            $httpBackend.expectGET('/something/' + id).respond(200, post);
            Ref.$get(id);
            $httpBackend.flush();

            sandbox.stub(Ref, '$$http').returns($q.when(post));
            Ref.$get(id);
            expect(Ref.$$http.called).to.be.false;

            Ref.$cache.cachedTime = -1;
            Ref.$get(id);
            expect(Ref.$$http.called).to.be.true;
        });
    });
});
