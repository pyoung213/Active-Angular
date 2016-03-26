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

                Object.defineProperty(self, 'push', {
                    enumerable: false,
                    value: function(item) {
                        var collection = this;
                        var length = Object.keys(collection).length;

                        if (item.$isArray) {
                            _.forOwn(item, function(value) {
                                collection[length] = value;
                                length++;
                            });
                            return collection;
                        }

                        return collection[length] = item;
                    }
                });

                Object.defineProperty(self, 'unshift', {
                    enumerable: false,
                    value: function(item) {
                        var collection = this;
                        var length = Object.keys(item).length;

                        _.forEachRight(collection, function(value, key) {
                            collection[length + key] = value;
                        });

                        _.forEach(item, function(value, key) {
                            collection[key] = value;
                        });
                        return collection;
                    }
                });
            }

            return ActiveArray;
        });
})();
