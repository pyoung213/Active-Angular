(function() {
    angular
        .module('activeAngular')
        .factory('activeAngularCache', function() {

            var cache = {
                create: create
            }

            return cache;

            function create() {
                var cached = {};
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
                    cached: cached,
                    cachedTime: defaultCacheTime
                }

                return factory;

                function get(key) {
                    var cachedItem = cached[key];
                    if (factory.isExpired(cachedItem)) {
                        cachedItem.$isExpired = true;
                    }

                    return cachedItem;
                }

                function set(key, data) {
                    if (cached[key]) {
                        cached[key].$isExpired = false;
                        cached[key] = factory.setTimestamp(cached[key]);
                        return cached[key] = _.extend(cached[key], data);
                    }
                    factory.setTimestamp(data);
                    factory.setIsExpired(data);
                    return cached[key] = data
                }

                function setArray(data) {
                    _.forOwn(data, function(item, key) {
                        data[key] = factory.set(item.id, item);
                    });
                    return data;
                }

                function remove(key) {
                    var cache = cached;
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
                    return timeNow - timestamp > factory.cachedTime;
                }

                function setTimestamp(cachedItem) {
                    var date = new Date().getTime();

                    if (!angular.isDefined(cachedItem.$timestamp)) {
                        Object.defineProperty(cachedItem, '$timestamp', {
                            enumerable: false,
                            get: function() {
                                return date;
                            },
                            set: function(newDate) {
                                date = newDate;
                            }
                        });
                    }

                    cachedItem.$timestamp = date;

                    return cachedItem;
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
            }
        });
})();
