describe('ActiveAngularUtilities', function() {
    var Post, sandbox, posts, ActiveAngular, ActiveObject, post, activeAngularConstant, ActiveAngularUtilities,
        url = "posts/:id";

    beforeEach(module('activeAngular'));

    beforeEach(inject(function(_ActiveAngular_, _ActiveObject_, _activeAngularConstant_, _ActiveAngularUtilities_) {
        sandbox = sinon.sandbox.create();
        ActiveAngular = _ActiveAngular_;
        ActiveObject = _ActiveObject_;
        Post = new ActiveAngular(url);
        activeAngularConstant = _activeAngularConstant_;
        ActiveAngularUtilities = _ActiveAngularUtilities_;

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
    }));

    afterEach(function() {
        sandbox.restore();
    });

    describe('helpers', function() {

        describe('createPromises', function() {
            it('should add promise data to object', function() {
                var newObject = ActiveAngularUtilities.createPromises(posts);

                expect(newObject.$promise).to.exist;
                expect(newObject.$deferPromise).to.exist;
            });
        });

        describe('inheritActiveClass', function() {
            it('array should inherit active classes', function() {
                var newActive = ActiveAngularUtilities.inheritActiveClass(posts, Post);
                expect(newActive).to.be.an("Array");
                expect(newActive.$remove).to.exist;
                expect(newActive.$create).to.exist;
                expect(newActive.$get).to.exist;
                expect(newActive[0]).to.be.instanceOf(ActiveObject);
            });

            it('object should inherit active classes', function() {
                var newActive = ActiveAngularUtilities.inheritActiveClass(post, Post);
                expect(newActive).to.be.an("Object");
                expect(newActive.$remove).to.exist;
                expect(newActive.$save).to.exist;
            });
        });

        describe('removeIdParam', function() {
            it('should remove id from url', function() {
                var url = "comments/:id";
                var id = "1234";
                var newUrl = ActiveAngularUtilities.removeIdParam(url, id);
                expect(newUrl).to.be.equal("comments");
            });
        });

        describe('replaceUrlIdWithOptionsId', function() {
            it('should replace url id with provided id', function() {
                var url = "comments/:id";
                var id = "1234";
                var newUrl = ActiveAngularUtilities.replaceUrlIdWithOptionsId(url, id);
                expect(newUrl).to.be.equal("comments/1234");
            });
        });

        describe('stringToObject', function() {
            it('should turn string to object', function() {
                var id = "someId";
                var object = ActiveAngularUtilities.stringToObject(id);
                expect(object).to.be.an('object');
                expect(object.id).to.be.equal(id)
            });

            it('should return same object', function() {
                var someObject = {
                    id: 1234
                }
                var newObject = ActiveAngularUtilities.stringToObject(someObject);
                expect(someObject).to.be.equal(newObject);
            });
        });

        describe('undefinedToObject', function() {
            it('should turn undefined to object with set id', function() {
                var object = ActiveAngularUtilities.undefinedToObject(undefined);
                expect(object).to.be.an('object');
                expect(object.id).to.be.equal(activeAngularConstant.NO_ID);
            });

            it('should return same object', function() {
                var someObject = {
                    id: 1234
                }
                var newObject = ActiveAngularUtilities.undefinedToObject(someObject);
                expect(someObject).to.be.equal(newObject);
            });
        });
    });
});
