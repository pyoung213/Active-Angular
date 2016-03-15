(function() {
    angular
        .module('activeAngular')
        .factory('ActiveArray', function(ActiveObject) {
            function ActiveArray(data, instance) {
                var self = this;

                Object.defineProperty(self, 'instance', {
                    enumerable: false,
                    value: instance
                });

                if (Object.keys(data).length === 0) {
                    return;
                }

                _.forOwn(data, function(value, key) {
                    value = new ActiveObject(value, instance);
                    instance.$cached[value.id] = value;
                    self[key] = value;
                });
            }

            return ActiveArray;
        });
})();
