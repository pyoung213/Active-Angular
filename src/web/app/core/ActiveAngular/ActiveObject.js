(function() {
    angular
        .module('activeAngular')
        .factory('ActiveObject', function() {
            function ActiveObject(object, instance) {
                var self = this;

                _.forOwn(object, function(value, key) {
                    self[key] = value;
                });

                Object.defineProperty(self, '$remove', {
                    enumerable: false,
                    value: instance.$remove
                });

                Object.defineProperty(self, '$save', {
                    enumerable: false,
                    value: instance.$save
                });


            }
            return ActiveObject;
        });
})();
