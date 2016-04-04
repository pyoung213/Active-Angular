describe('ActiveAngularCache', function() {
    var activeAngularCache, Instance, sandbox, posts, ActiveAngular, ActiveArray, createdCache,
        url = "posts/:id";

    beforeEach(module('activeAngular'));

    beforeEach(inject(function(_ActiveAngular_, _ActiveArray_, _ActiveObject_, _$q_, _activeAngularCache_) {
        sandbox = sinon.sandbox.create();
        ActiveAngular = _ActiveAngular_;
        ActiveArray = _ActiveArray_;
        Instance = new ActiveAngular(url);
        activeAngularCache = _activeAngularCache_;
        createdCache = activeAngularCache.create();
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
        posts = ActiveArray.decorateArray(posts, Instance);
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('should set an item in cache', function() {
        createdCache.set('undefined', posts);
        expect(createdCache.cached.undefined).to.be.equal(posts);
    })

    it('should get an item out of cache', function() {
        createdCache.set('undefined', posts);
        var cachedPosts = createdCache.get('undefined');
        expect(cachedPosts).to.be.equal(posts);
    });

    it('should set cache to expired if expired', function() {
        sandbox.stub(createdCache, 'isExpired').returns(true);
        createdCache.set('undefined', posts);

        var cachedItem2 = createdCache.get('undefined');
        expect(cachedItem2.$isExpired).to.be.true;
    });

    it('should set timestamp', function() {
        sandbox.stub(createdCache, 'setTimestamp');
        var post = posts[0];
        createdCache.set(post.id, post);
        expect(createdCache.setTimestamp).to.be.called;
    });

    it('should set expiration', function() {
        sandbox.stub(createdCache, 'setIsExpired');
        var post = posts[0];
        createdCache.set(post.id, post);
        expect(createdCache.setIsExpired).to.be.called;
    });

    it('should refresh expiration and merge new data if cache key already exists', function() {
        var post = posts[0];
        var firstCachedPost = createdCache.set(post.id, post);
        sandbox.stub(createdCache, 'setTimestamp');
        var newPost = angular.copy(post);
        newPost.message = "some new message";

        var returnedPost = createdCache.set(newPost.id, newPost);
        expect(createdCache.setTimestamp).to.be.called;
        expect(returnedPost.message).to.be.equal(newPost.message);
        expect(returnedPost.$timestamp).to.be.not.equal(firstCachedPost.$timestamp);
    });

    it('should set array and flatten in cache and point to reference', function() {
        sandbox.stub(createdCache, 'set');
        createdCache.setArray(posts);

        expect(createdCache.set).to.be.called;
    });

    it('should set array and point to flatten cache reference', function() {
        var post = posts[1];
        createdCache.setArray(posts);

        expect(createdCache.cached[post.id]).to.be.equal(post);
    });

    it('should find and remove cache from flattened list', function() {
        var post = posts[2];
        sandbox.stub(createdCache, 'findAndRemove');

        createdCache.set('undefined', posts);
        createdCache.setArray(posts);

        createdCache.remove(post.id);

        expect(createdCache.findAndRemove).to.be.called;
        expect(createdCache.cached[post.id]).to.not.exist;
    });

    it('should find and remove cache from all arrays', function() {
        var post = posts[2];

        createdCache.set('undefined', posts);
        createdCache.setArray(posts);

        createdCache.findAndRemove(createdCache.cached, post.id);
        var found = _.find(createdCache.cached['undefined'], function(item) {
            if (!item) {
                return;
            }
            if (item.id === post.id) {
                return item;
            }
        });
        expect(found).to.be.undefined;
    });

    it('should return false for expired cache', function() {
        var post = posts[2];

        createdCache.set(post.id, post);
        var isCacheExpired = createdCache.isExpired(createdCache.cached[post.id]);

        expect(isCacheExpired).to.be.false;
    });

    it('should return true for expired cache', function() {
        var post = posts[2];
        createdCache.cachedTime = -10;
        createdCache.set(post.id, post);
        var isCacheExpired = createdCache.isExpired(createdCache.cached[post.id]);

        expect(isCacheExpired).to.be.true;
    });

    it('should take instance and set timestamp', function() {
        createdCache.setTimestamp(createdCache.cached);

        expect(createdCache.cached.$timestamp).to.exist;
    });

    it('should take a cached item and set expiration', function() {
        var someCachedItem = {};
        createdCache.setIsExpired(someCachedItem);
        expect(someCachedItem.$isExpired).to.exist;
    });

    it('should change cached time to new value', function() {
        var newCachedNumber = 100;
        createdCache.cacheTime = newCachedNumber;
        expect(createdCache.cacheTime).to.be.equal(newCachedNumber);
    });
});
