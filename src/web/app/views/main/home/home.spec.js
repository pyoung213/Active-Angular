describe('home', function() {
    describe('home.ctrl', function() {
        beforeEach(function() {
            module('app.web');
        });

        var $scope;

        beforeEach(inject(function($rootScope, $controller) {
            $scope = $rootScope.$new();
            $controller('HomeController', {
                accounts: []
            });
        }));

        it('loads the home page', function() {
            $scope.$digest();
        });
    });
});
