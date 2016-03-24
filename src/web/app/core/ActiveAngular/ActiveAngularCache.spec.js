describe('ActiveAngularCache', function() {
    var activeAngularCache, Instance, sandbox, posts, ActiveAngular, ActiveArray,
        url = "posts/:id";

    beforeEach(module('activeAngular'));

    beforeEach(inject(function(_ActiveAngular_, _ActiveArray_, _ActiveObject_, _$q_, _activeAngularCache_) {
        sandbox = sinon.sandbox.create();
        ActiveAngular = _ActiveAngular_;
        ActiveArray = _ActiveArray_;
        Instance = new ActiveAngular(url);
        activeAngularCache = _activeAngularCache_;

        posts = [{
            id: '1',
            message: "test"
        }, {
            id: '2',
            message: "test"
        }, {
            id: '3',
            message: "test"
        }, {
            id: '4',
            message: "test"
        }];
        posts = new ActiveArray(posts, Instance);
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('should set an item in cache', function() {
        activeAngularCache.set(Instance, 'undefined', posts);
        expect(Instance.$cache.undefined).to.be.equal(posts);
    })

    it('should get an item out of cache', function() {
        activeAngularCache.set(Instance, 'undefined', posts);
        var cachedPosts = activeAngularCache.get(Instance, 'undefined');
        expect(cachedPosts).to.be.equal(posts);
    });

    it('should set cache to expired if expired', function() {
        sandbox.stub(activeAngularCache, 'isExpired').returns(true);
        activeAngularCache.set(Instance, 'undefined', posts);

        var cachedItem2 = activeAngularCache.get(Instance, 'undefined');
        expect(cachedItem2.$isExpired).to.be.true;
    });

    it('should set timestamp', function() {
        sandbox.stub(activeAngularCache, 'setTimestamp');
        var post = posts[0];
        activeAngularCache.set(Instance, post.id, post);
        expect(activeAngularCache.setTimestamp).to.be.called;
    });

    it('should set expiration', function() {
        sandbox.stub(activeAngularCache, 'setIsExpired');
        var post = posts[0];
        activeAngularCache.set(Instance, post.id, post);
        expect(activeAngularCache.setIsExpired).to.be.called;
    });

    it('should refresh expiration and merge new data if cache key already exists', function() {
        var post = posts[0];
        var firstCachedPost = activeAngularCache.set(Instance, post.id, post);
        sandbox.stub(activeAngularCache, 'setTimestamp');
        var newPost = angular.copy(post);
        newPost.message = "some new message";

        var returnedPost = activeAngularCache.set(Instance, newPost.id, newPost);
        expect(activeAngularCache.setTimestamp).to.be.called;
        expect(returnedPost.message).to.be.equal(newPost.message);
        expect(returnedPost.$timestamp).to.be.not.equal(firstCachedPost.$timestamp);
    });

    it('should set array and flatten in cache and point to reference', function() {
        sandbox.stub(activeAngularCache, 'set');
        activeAngularCache.setArray(Instance, posts);

        expect(activeAngularCache.set).to.be.called;
    });

    it('should set array and point to flatten cache reference', function() {
        var post = posts[1];
        activeAngularCache.setArray(Instance, posts);

        expect(Instance.$cache[post.id]).to.be.equal(post);
    });

    it('should find and remove cache from flattened list', function() {
        var post = posts[2];
        sandbox.stub(activeAngularCache, 'findAndRemove');

        activeAngularCache.set(Instance, 'undefined', posts);
        activeAngularCache.setArray(Instance, posts);

        activeAngularCache.remove(Instance, post.id);

        expect(activeAngularCache.findAndRemove).to.be.called;
        expect(Instance.$cache[post.id]).to.not.exist;
    });

    it('should find and remove cache from all arrays', function() {
        var post = posts[2];

        activeAngularCache.set(Instance, 'undefined', posts);
        activeAngularCache.setArray(Instance, posts);

        activeAngularCache.findAndRemove(Instance.$cache, post.id);
        var found = _.find(Instance.$cache['undefined'], function(item) {
            if (item.id === post.id) {
                return item;
            }
        });
        expect(found).to.be.undefined;
    });

    it('should return false for expired cache', function() {
        var post = posts[2];

        activeAngularCache.set(Instance, post.id, post);
        var isCacheExpired = activeAngularCache.isExpired(Instance.$cache[post.id]);

        expect(isCacheExpired).to.be.false;
    });

    it('should return true for expired cache', function() {
        var post = posts[2];
        activeAngularCache.cacheTime(Instance, -10);
        activeAngularCache.set(Instance, post.id, post);
        var isCacheExpired = activeAngularCache.isExpired(Instance, Instance.$cache[post.id]);

        expect(isCacheExpired).to.be.true;
    });

    it('should take instance and set timestamp', function() {
        activeAngularCache.setTimestamp(Instance.$cache);

        expect(Instance.$cache.$timestamp).to.exist;
    });

    it('should take a cached item and set expiration', function() {
        var someCachedItem = {};
        activeAngularCache.setIsExpired(someCachedItem);
        expect(someCachedItem.$isExpired).to.exist;
    });

    it('should change cached time to new value', function() {
        var newCachedNumber = 100;
        activeAngularCache.cacheTime(Instance, newCachedNumber);
        expect(Instance.$cacheTime).to.be.equal(newCachedNumber);
    });
});
