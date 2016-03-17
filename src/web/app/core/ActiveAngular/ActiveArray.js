(function() {
    angular
        .module('activeAngular')
        .factory('ActiveArray', function() {
            function ActiveArray(data, instance) {
                var self = this;
                _.forOwn(data, function(value, key) {
                    self[key] = value;
                });

                Object.defineProperty(self, 'instance', {
                    enumerable: false,
                    value: instance
                });
            }

            ActiveArray.prototype.$remove = function(options) {
                return this.instance.$remove(options);
            };
            ActiveArray.prototype.$create = function(options) {
                return this.instance.$create(options);
            };
            ActiveArray.prototype.$get = function(options, reference) {
                return this.instance.$get(options, reference);
            };
            ActiveArray.prototype.$isArray = true;

            return ActiveArray;
        });
})();
