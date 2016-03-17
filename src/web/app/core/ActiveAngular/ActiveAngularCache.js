(function() {
    angular
        .module('activeAngular')
        .factory('activeAngularCache', function() {
            var defaultCacheTime = 5000 //in milleseconds;

            var factory = {
                get: get,
                set: set,
                setArray: setArray,
                setTimestamp: setTimestamp,
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
                    instance.$cache[key].$timestamp = new Date().getTime();
                    return instance.$cache[key] = _.extend(instance.$cache[key], data);
                }
                factory.setTimestamp(data);
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
                //We need to clean out the empty object in the array.
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

            function isExpired(cache) {
                if (!cache) {
                    return false;
                }
                var timestamp = cache.$timestamp;
                if (!timestamp) {
                    return false;
                }

                var timeNow = new Date().getTime();
                return timeNow - timestamp > defaultCacheTime;
            }

            function setTimestamp(cache) {
                var date = new Date().getTime();
                Object.defineProperty(cache, '$timestamp', {
                    get: function() {
                        return date;
                    },
                    set: function(newDate) {
                        date = newDate;
                    }
                });
            }
        });
})();
