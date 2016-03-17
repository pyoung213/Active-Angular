(function() {
    angular
        .module('activeAngular')
        .factory('activeAngularCache', function($timeout) {
            var defaultCacheTime = 5000;

            var factory = {
                get: get,
                set: set,
                setArray: setArray,
                remove: remove,
                findAndRemove: findAndRemove,
                isExpired: isExpired
            }

            return factory;

            function get(instance, key) {
                var cachedItem = instance.$cache[key];
                if (factory.isExpired(cachedItem)) {
                    return;
                }

                return cachedItem;
            }

            function set(instance, key, data) {
                if (instance.$cache[key]) {
                    return instance.$cache[key] = _.extend(instance.$cache[key], data);
                }
                return instance.$cache[key] = data
            }

            function setArray(instance, data) {
                _.forOwn(data, function(item, key) {
                    data[key] = factory.set(instance, item.id, item);
                });
                return data;
            }

            function remove(instance, key) {
                var cache = instance.$cache;
                delete cache[key];
                factory.findAndRemove(cache, key);
            }

            function findAndRemove(cache, key) {
                _.forOwn(cache, function(item, itemkey) {
                    if (!item.$isArray) {
                        return;
                    }
                    _.forOwn(item, function(activeObject, activeKey) {
                        if (activeObject.id === key) {
                            delete cache[itemkey][activeKey]
                            return;
                        }
                    });
                });
            }

            function isExpired() {
                return false;
            }
        });
})();
