(function() {
    angular
        .module('activeAngular')
        .factory('ActiveObject', function($q) {
            function ActiveObject(object, instance) {
                var self = this;
                var defered = $q.defer();

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

                Object.defineProperty(self, '$edge', {
                    enumerable: false,
                    value: instance.$edge
                });

                Object.defineProperty(self, '$promise', {
                    enumerable: false,
                    value: defered.promise
                });

                Object.defineProperty(self, '$deferPromise', {
                    enumerable: false,
                    value: defered
                });
            }

            return ActiveObject;
        });
})();
