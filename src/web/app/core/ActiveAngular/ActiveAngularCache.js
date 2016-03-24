(function() {
    angular
        .module('activeAngular')
        .factory('activeAngularCache', function() {
            var defaultCacheTime = 1000 * 60 * 5 // 5 minutes.

            var factory = {
                get: get,
                set: set,
                setArray: setArray,
                setTimestamp: setTimestamp,
                setIsExpired: setIsExpired,
                remove: remove,
                findAndRemove: findAndRemove,
                isExpired: isExpired,
                cacheTime: cacheTime
            }

            return factory;

            function get(instance, key) {
                var cachedItem = instance.$cache[key];
                if (factory.isExpired(instance, cachedItem)) {
                    cachedItem.$isExpired = true;
                }

                return cachedItem;
            }

            function set(instance, key, data) {
                if (instance.$cache[key]) {
                    instance.$cache[key].$isExpired = false;
                    instance.$cache[key] = factory.setTimestamp(instance.$cache[key]);
                    return instance.$cache[key] = _.extend(instance.$cache[key], data);
                }
                factory.setTimestamp(data);
                factory.setIsExpired(data);
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

            function isExpired(instance, cache) {
                if (!cache) {
                    return false;
                }
                var timestamp = cache.$timestamp;
                if (!timestamp) {
                    return false;
                }

                var timeNow = new Date().getTime();
                var defaultTime = angular.isDefined(instance.$cacheTime) ? instance.$cacheTime : defaultCacheTime;
                return timeNow - timestamp > defaultTime;
            }

            function setTimestamp(cache) {
                var date = new Date().getTime();

                if (!angular.isDefined(cache.$timestamp)) {
                    Object.defineProperty(cache, '$timestamp', {
                        enumerable: false,
                        get: function() {
                            return date;
                        },
                        set: function(newDate) {
                            date = newDate;
                        }
                    });
                }

                cache.$timestamp = date;

                return cache;
            }

            function setIsExpired(cache) {
                var isExpired = false;

                if (angular.isDefined(cache.$isExpired)) {
                    return;
                }

                Object.defineProperty(cache, '$isExpired', {
                    enumerable: false,
                    get: function() {
                        return isExpired
                    },
                    set: function(value) {
                        isExpired = value;
                    }
                });
            }

            function cacheTime(instance, cacheTime) {
                var defaultTime = defaultCacheTime;
                if (!angular.isDefined(instance.$cacheTime)) {
                    Object.defineProperty(instance, '$cacheTime', {
                        enumerable: false,
                        get: function() {
                            return defaultTime
                        },
                        set: function(value) {
                            defaultTime = value;
                        }
                    });
                }
                instance.$cacheTime = cacheTime;
                return instance;
            }
        });
})();
