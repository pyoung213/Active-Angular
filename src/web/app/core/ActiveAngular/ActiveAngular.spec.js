describe('ActiveAngular', function() {
    var Post, sandbox, $httpBackend, posts, ActiveAngular, ActiveArray, ActiveObject, $q, post,
        userId = "1234567890",
        url = "posts/:id";

    beforeEach(module('activeAngular'));

    beforeEach(inject(function(_ActiveAngular_, _ActiveArray_, _ActiveObject_, _$httpBackend_, _$q_) {
        sandbox = sinon.sandbox.create();
        ActiveAngular = _ActiveAngular_;
        ActiveArray = _ActiveArray_;
        ActiveObject = _ActiveObject_;
        Post = new ActiveAngular(url);
        Post.$cached.cachedTime = false;
        $httpBackend = _$httpBackend_;
        $q = _$q_;

        posts = {
            0: {
                id: '1',
                message: "test"
            },
            1: {
                id: '2',
                message: "test"
            },
            2: {
                id: '3',
                message: "test"
            },
            3: {
                id: '4',
                message: "test"
            }
        }
        posts = new ActiveArray(posts, Post);
        post = posts[1];
    }));

    afterEach(function() {
        sandbox.restore();
        $httpBackend.verifyNoOutstandingExpectation;
    });

    it('creates instance of ActiveAngular', function() {
        expect(Post).to.be.instanceof(ActiveAngular);
    });

    it('Post should inherit promise', function() {
        expect(Post.$promise.then).to.exist;
    });

    describe('$query', function() {
        it('should return an instance of ActiveAngular', function() {
            var newInstance = Post.$query();
            expect(newInstance).to.be.an.instanceof(ActiveArray);
        });

        it('should query with params', function() {
            var getMockData = {
                sort: 'something',
                param: 'another'
            }
            $httpBackend.expectGET('/posts' + '?param=another&sort=something').respond(200, posts);
            Post.$query(getMockData);
            $httpBackend.flush();
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
            var onePost = allPosts.$get(postId);
            $httpBackend.flush();
            expect(onePost).to.have.all.keys(posts[postId]);
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

    describe('$$http', function() {
        it('should strip double slashes and trailing slashes', function() {
            var Comments = new ActiveAngular('posts/:id/comments/');
            $httpBackend.expectGET('/posts/comments').respond(200, posts);
            Comments.$query();
            $httpBackend.flush();
        });
    })

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
        it('should save with data on body', function() {
            var saveMockData = {
                message: 'hi',
                title: 'awesome'
            }
            $httpBackend.expectPUT('/posts/' + userId, angular.copy(saveMockData)).respond(200);
            saveMockData.id = userId;
            Post.$save(saveMockData);
            $httpBackend.flush();
        });
    });

    describe('$remove', function() {
        it('should remove item', function() {
            $httpBackend.expectDELETE('/posts/' + userId).respond(200);
            Post.$remove(userId);
            $httpBackend.flush();
        });
    });

    describe('cache', function() {

        it('should $get posts with id and cache it', function() {
            $httpBackend.expectGET('/posts/' + userId).respond(200, post);
            Post.$get(userId);
            $httpBackend.flush();

            expect(Post.$cached[userId]).to.be.eql(post);
        });

        it('should $get posts with id and return cached ref', function() {
            $httpBackend.expectGET('/posts/' + userId).respond(200, post);
            Post.$get(userId);
            $httpBackend.flush();

            sandbox.stub(Post, '$$http');
            Post.$get(userId);
            expect(Post.$$http.called).to.be.false;
        });

        it('should $get all posts', function() {
            $httpBackend.expectGET('/posts').respond(200, posts);
            Post.$query();
            $httpBackend.flush();
            // console.log('cache', Post.$cached['undefined']);
            // console.log('posts', posts);
            // console.log('hit');
            // expect(Post.$cached['undefined']).to.equal(posts);
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
            var reference = 'someUniqueRefrence';
            $httpBackend.expectGET('/posts/' + userId).respond(200, post);
            Post.$get(userId, reference);
            $httpBackend.flush();
            expect(Post.$cached[userId + reference]).to.have.all.keys(post);
        });

        it('should not inherit any other instances cache time', function() {
            var Ref = new ActiveAngular('test/:id');
            Ref.$cached.cachedTime = 1000;
            Post.$cached.cachedTime = 3000;

            expect(Ref.$cached.cachedTime).to.be.equal(1000);
            expect(Post.$cached.cachedTime).to.be.equal(3000);
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

            Ref.$cached.cachedTime = -1;
            Ref.$get(id);
            expect(Ref.$$http.called).to.be.true;
        });
    });

    describe('$hasMany', function() {
        it('should not inherit any other instances cache time', function() {
            var CommentsModel = {};
            Post.$hasMany('comments', {
                model: CommentsModel
            });
        });
    });

    describe('helpers', function() {
        describe('stringToObject', function() {
            it('should turn string to object', function() {
                var object = Post._stringToObject('someString');
                expect(object).to.be.an('object');
            });

            it('should return same object', function() {
                var someObject = {
                    id: 1234
                }
                var newObject = Post._stringToObject(someObject);
                expect(someObject).to.be.equal(newObject);
            });
        });
        describe('undefinedToObject', function() {
            it('should turn undefined to object with set id', function() {
                var object = Post._undefinedToObject();
                expect(object).to.be.an('object');
                expect(object.id).to.be.equal('undefined');
            });

            it('should return same object', function() {
                var someObject = {
                    id: 1234
                }
                var newObject = Post._undefinedToObject(someObject);
                expect(someObject).to.be.equal(newObject);
            });
        });
    });
});
