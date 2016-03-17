(function() {
    angular
        .module('activeAngular')
        .factory('ActiveArray', function() {
            function ActiveArray(data, instance) {
                var self = this;
                _.forOwn(data, function(value, key) {
                    self[key] = value;
                });

                Object.defineProperty(self, '$remove', {
                    enumerable: false,
                    value: function(options) {
                        instance.$remove(options)
                    }
                });

                Object.defineProperty(self, '$create', {
                    enumerable: false,
                    value: function(options) {
                        instance.$create(options)
                    }
                });

                Object.defineProperty(self, '$get', {
                    enumerable: false,
                    value: function(options, reference) {
                        instance.$get(options, reference)
                    }
                });

                Object.defineProperty(self, '$isArray', {
                    enumerable: false,
                    value: true
                });
            }

            return ActiveArray;
        });
})();
