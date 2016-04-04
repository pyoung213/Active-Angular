(function() {
    angular
        .module('activeAngular', []);
})();

angular
    .module('activeAngular')
    .constant('activeAngularConstant', {
        NO_ID: 'noId'
    });

(function() {
    angular
        .module('activeAngular')
        .provider('ActiveAngular', ActiveAngularBase);

    function ActiveAngularBase() {
        var baseUrl = '';

        this.setBaseUrl = function(base) {
            baseUrl = base;
        }

        this.$get = function($http, $q, $log, $httpParamSerializerJQLike, activeAngularCache, ActiveArray, ActiveObject, activeAngularConstant) {
            function ActiveAngular(url, options) {
                options = options || {};
                var self = this;
                var defer = $q.defer();
                var edgeUrl = '';

                self.url = url;
                self.$cache = activeAngularCache.create(options);
                self.$edges = options.edges;
                self.$hydrate = options.hydrate;
                self.$edges = options.edges;
                self.$promise = defer.promise;
                self.$get = $get;
                self.$query = $query;
                self.$edgeQuery = $edgeQuery;
                self.$edgeGet = $edgeGet;
                self.$save = $save;
                self.$remove = $remove;
                self.$create = $create;
                self.$$http = $$http;
                self._get = _get;
                self._stringToObject = _stringToObject;
                self._undefinedToObject = _undefinedToObject;

                self = createEdges(self);

                function createEdges(object) {
                    if (!object.$edges) {
                        return object;
                    }
                    _.forEach(object.$edges.get, function(value, key) {
                        object['$get' + _.capitalize(key)] = value.$edgeGet;
                    });
                    _.forEach(object.$edges.query, function(value, key) {
                        object['$query' + _.capitalize(key)] = value.$edgeQuery;
                    });
                    return object;
                }

                function $query(options, reference) {
                    reference = reference || '';
                    if (options) {
                        reference = $httpParamSerializerJQLike(options) + reference
                    }
                    return _get.call(this, options, reference, true);
                }

                function $edgeGet(options) {
                    options = _stringToObject(options);
                    var url = this.url;
                    if (url.indexOf(':id') > -1 && options.id) {
                        url = url.replace(':id', options.id);
                        delete options.id;
                    }

                    edgeUrl = url;
                    return _get.call(this, options, edgeUrl, false);
                }

                function $edgeQuery(options) {
                    options = _stringToObject(options);
                    var url = this.url;

                    if (url.indexOf(':id') > -1 && options.id) {
                        url = url.replace(':id', options.id);
                        delete options.id;
                    }

                    edgeUrl = url;
                    return _get.call(this, options, edgeUrl, true);
                }

                function $get(options, reference) {
                    return _get.call(this, options, reference, false);
                }

                function _get(options, reference, isArray) {
                    var self = this;
                    //cleanup options
                    options = _stringToObject(options);
                    options = _undefinedToObject(options);

                    //caching check
                    var key = reference ? options.id + reference : options.id;
                    var cachedItem = self.$cache.get(key);

                    if (cachedItem && !cachedItem.$isExpired) {
                        return cachedItem;
                    }
                    if (!cachedItem) {
                        var itemDefer = $q.defer();
                        cachedItem = isArray ? new ActiveArray({}, self) : new ActiveObject({}, self);

                        Object.defineProperty(cachedItem, '$promise', {
                            enumerable: false,
                            value: itemDefer.promise
                        });

                        Object.defineProperty(cachedItem, '$deferPromise', {
                            enumerable: false,
                            value: itemDefer
                        });
                    }

                    //reference creation.
                    self.$cache.set(key, cachedItem);
                    asyncGetRequest(options, cachedItem, isArray);
                    return cachedItem;
                }

                function asyncGetRequest(options, referenceObject, isArray) {
                    self.$$http('GET', options)
                        .then(function(response) {
                            var data = response.data;
                            var isDataArray = angular.isArray(data);
                            if (isDataArray != isArray) {
                                logMismatchError(response, isDataArray);
                            }
                            data = inheritActiveClass(data);

                            if (isDataArray) {
                                _.forEach(data, function(value, key) {
                                    data[key] = hydyrateData(value);
                                });
                                data = self.$cache.setArray(data);
                            } else {
                                data = hydyrateData(data);
                            }
                            referenceObject = _.extend(referenceObject, data);
                            referenceObject.$deferPromise.resolve(referenceObject);
                        })
                        .catch(function(_error) {});
                }

                function hydyrateData(data) {
                    if (!self.$hydrate) {
                        return data;
                    }
                    _.forEach(self.$hydrate, function(value, key) {
                        if (self.$edges && self.$edges.query && self.$edges.query[key]) {
                            data[key] = self.$edges.query[key].$edgeQuery.call(self, data[key] || data.id);
                            return;
                        }
                        if (self.$edges && self.$edges.get && self.$edges.get[key]) {
                            data[key] = self.$edges.query[key].$edgeGet.call(self, data[key] || data.id);
                            return;
                        }
                        data[key] = value.$get(data[key]);
                    });
                    return data;
                }

                function inheritActiveClass(data) {
                    if (angular.isArray(data)) {
                        data = new ActiveArray(data, self);

                        _.forEach(data, function(value, key) {
                            data[key] = new ActiveObject(value, self);
                        });

                        return data;
                    }

                    return new ActiveObject(data, self);
                }

                function logMismatchError(response, isArray) {
                    if (isArray) {
                        $log.error(response.config.url + ' Expected an Object and got an Array from server.');
                        return;
                    }
                    $log.error(response.config.url + ' Expected an Array and got an Object from server.');
                }

                function $save(options) {
                    var item = this;
                    edgeUrl = "";

                    if (!options) {
                        return;
                    }

                    if (options && !options.id) {
                        options.id = item.id;
                    }

                    var oldCopy = angular.copy(item);
                    var savedChanges = _.extend(item, options);
                    self.$cache.set(savedChanges.id, savedChanges);

                    return self.$$http('PUT', options)
                        .catch(function() {
                            self.$cache.set(oldCopy.id, oldCopy);
                        });
                }

                function $remove(options) {
                    var item = this;

                    options = _stringToObject(options);
                    options = _undefinedToObject(options, item);

                    return self.$$http('DELETE', options)
                        .then(function(response) {
                            self.$cache.remove(response.data.id);
                            //remove object binding from view.
                            if (!item.$array) {
                                _.forOwn(item, function(_value, key) {
                                    delete item[key]
                                });
                            }
                        });
                }

                function $create(options) {
                    return this.$$http('POST', options);
                }

                function $$http(method, options) {
                    var self = this;
                    var id = options.id;
                    options = {
                        method: method,
                        url: self.url,
                        id: id,
                        data: _.omit(options, 'id')
                    }

                    //TODO: This all seems hacky...
                    if (edgeUrl) {
                        options.url = _removeIdParam(options.url);
                        options.url = edgeUrl + "/" + options.url;
                        edgeUrl = "";
                    }

                    //if no id, strip instances of :id
                    if (!options.id || options.id === activeAngularConstant.NO_ID) {
                        options.url = _removeIdParam(options.url);
                        delete options.id;
                    }

                    //replace :id with options.id
                    if (options.url.indexOf(':id') > -1 && options.id) {
                        options.url = self.url.replace(':id', options.id);
                        delete options.id;
                    }

                    if (options.method === 'GET' && Object.keys(options.data).length) {
                        options.url += options.url.indexOf('?') == -1 ? '?' : '&';
                        options.url += $httpParamSerializerJQLike(options.data);
                    }

                    options.url = baseUrl + '/' + options.url;

                    return $http(options);
                }

                function _removeIdParam(url) {
                    url = url.replace(':id', '');
                    url = url.replace('//', '/');
                    url = _.trimEnd(url, '/');
                    return url;
                }

                function _stringToObject(options) {
                    if (angular.isString(options)) {
                        var id = options;
                        options = {};
                        options.id = id;
                    }
                    return options;
                }

                function _undefinedToObject(options, item) {
                    if (angular.isUndefined(options)) {
                        options = {};
                        var key = item ? item.id : activeAngularConstant.NO_ID;
                        options.id = key;
                    }

                    return options;
                }
            }

            return ActiveAngular;

        }
    }
})();

(function() {
    angular
        .module('activeAngular')
        .factory('activeAngularCache', function() {

            var cache = {
                create: create
            }

            return cache;

            function create(options) {
                var cached = {};
                var cacheTime = 1000 * 60 * 5; // 5 minutes.
                if (options && options.cacheTime) {
                    cacheTime = options.cacheTime
                }

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
                    cachedTime: cacheTime
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
