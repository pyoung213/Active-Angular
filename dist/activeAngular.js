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
        var collectionKey = 'items';

        this.setBaseUrl = function(base) {
            baseUrl = base;
        }

        this.setCollectionKey = function(key) {
            collectionKey = key;
        }

        this.$get = function($http, $log, $httpParamSerializerJQLike, activeAngularCache, ActiveArray, ActiveObject, activeAngularConstant, ActiveAngularUtilities) {
            function ActiveAngular(url, options) {
                options = options || {};
                var self = this;

                self.url = url;
                self.edgeUrl = '';
                self.$cache = activeAngularCache.create(options);
                self.$hydrate = options.hydrate;
                self.$edge = $edge;
                self.$get = $get;
                self.$query = $query;
                self.$save = $save;
                self.$remove = $remove;
                self.$create = $create;
                self.$$http = $$http;
                self._formatResponse = options.formatResponse;
                self._collectionKey = options.collectionKey || collectionKey;
                self._edges = options.edges;
                self._get = _get;
                self._hydrateCollection = _hydrateCollection;
                self._hideMetadata = _hideMetadata;
                self._hydyrateData = _hydyrateData;
                self._logMismatchError = _logMismatchError;

                function $query(options, reference) {
                    reference = reference || '';
                    if (options) {
                        reference = $httpParamSerializerJQLike(options) + reference
                    }
                    return _get.call(this, options, reference, true);
                }

                function $edge(key, id) {
                    var item = this;
                    if (this instanceof(ActiveObject)) {
                        id = this.id;
                        item = self;
                    }
                    var edge = item._edges[key];
                    var model = edge.model;
                    var url = ActiveAngularUtilities.replaceUrlIdWithOptionsId(item.url, id);
                    model.edgeUrl = url + "/" + ActiveAngularUtilities.removeIdParam(model.url);
                    return model;
                }

                function $get(options, reference) {
                    return _get.call(this, options, reference, false);
                }

                function _get(options, reference, isArray) {
                    var self = this;
                    //cleanup options
                    options = ActiveAngularUtilities.stringToObject(options);
                    options = ActiveAngularUtilities.undefinedToObject(options);

                    //create key
                    var key = _valueOrEmpty(self.edgeUrl || options.id) + _valueOrEmpty(options.url) + _valueOrEmpty(reference);
                    key = _.toLower(key);

                    //caching check
                    var cachedItem = self.$cache.get(key);

                    if (cachedItem && !cachedItem.$isExpired) {
                        cachedItem.$deferPromise.resolve(cachedItem);
                        return cachedItem;
                    }
                    if (!cachedItem) {
                        cachedItem = isArray ? ActiveArray.decorateArray([], self) : new ActiveObject({}, self);
                    }

                    //reference creation.
                    self.$cache.set(key, cachedItem);
                    asyncGetRequest(options, cachedItem, isArray);
                    return cachedItem;
                }

                function asyncGetRequest(options, cachedItem, isArray) {
                    self.$$http('GET', options)
                        .then(function(response) {
                            var data = response.data;
                            if (self._formatResponse) {
                                data = self._formatResponse(data);
                            }
                            var isDataArray = angular.isArray(data);

                            if (isDataArray != isArray) {
                                if (!data[self._collectionKey]) {
                                    return _logMismatchError(response, isDataArray);
                                }
                                cachedItem = _hideMetadata(cachedItem, data);
                                data = _hydrateCollection(data);
                            }

                            data = ActiveAngularUtilities.inheritActiveClass(data, self);

                            if (isDataArray) {
                                _.forEach(data, function(value, key) {
                                    data[key] = _hydyrateData(value);
                                });
                                data = self.$cache.setArray(data);
                            } else {
                                data = _hydyrateData(data);
                            }
                            _.assign(cachedItem, _.omit(data, '$promise', '$deferPromise'));

                            _.forEach(cachedItem, function(item) {
                                if (item.$deferPromise) {
                                    item.$deferPromise.resolve(item);
                                }
                            });
                            cachedItem.$deferPromise.resolve(cachedItem);
                        });
                }

                function $save(options) {
                    var item = this;

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

                    options = ActiveAngularUtilities.stringToObject(options);
                    options = ActiveAngularUtilities.undefinedToObject(options, item);

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
                    return self.$$http('POST', options)
                        .then(function(response) {
                            var data = response.data;

                            data = ActiveAngularUtilities.inheritActiveClass(data, self);
                            data = _hydyrateData(data);
                            return data;
                        });
                }

                function $$http(method, options) {
                    var self = this;
                    var id = options.id;
                    var edgeUrl = options.url;
                    if (self.edgeUrl) {
                        edgeUrl = self.edgeUrl;
                        self.edgeUrl = "";
                    }
                    options = {
                        method: method,
                        url: edgeUrl || self.url,
                        id: id,
                        data: _.omit(options, 'id', 'url')
                    }

                    //if no id, strip instances of :id
                    if (!options.id || options.id === activeAngularConstant.NO_ID) {
                        options.url = ActiveAngularUtilities.removeIdParam(options.url);
                        delete options.id;
                    }

                    options.url = ActiveAngularUtilities.replaceUrlIdWithOptionsId(options.url, options.id);
                    delete options.id;

                    if (options.method === 'GET' && Object.keys(options.data).length) {
                        options.url += options.url.indexOf('?') == -1 ? '?' : '&';
                        options.url += $httpParamSerializerJQLike(options.data);
                    }

                    options.url = baseUrl + '/' + options.url;

                    return $http(options);
                }

                function _logMismatchError(response, isArray) {
                    if (isArray) {
                        $log.error(response.config.url + ' Expected an Object and got an Array from server.');
                        return;
                    }
                    $log.error(response.config.url + ' Expected an Array and got an Object from server with collection key ' + self._collectionKey + ' not set.');
                }

                function _hydyrateData(data) {
                    if (!self.$hydrate) {
                        return data;
                    }
                    _.forEach(self.$hydrate, function(value, key) {
                        var edges = self._edges;
                        if (edges && edges[key]) {
                            var model = edges[key].model;
                            data[key] = model.$edge.call(self, key, data.id).$query();
                            return
                        }
                        data[key] = value.$get(data[key]);
                    });
                    return data;
                }

                function _hydrateCollection(collection) {
                    var data = {};

                    _.forEach(collection[self._collectionKey], function(value, key) {
                        data[key] = value
                    });
                    return data;
                }

                function _hideMetadata(ref, data) {
                    _.forEach(data, function(value, key) {
                        if (key !== self._collectionKey) {
                            Object.defineProperty(ref, key, {
                                enumerable: false,
                                value: value
                            });
                        }
                    });
                    return ref;
                }

                function _valueOrEmpty(string) {
                    return string || "";
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
                    _.forEach(data, function(item, key) {
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
                    _.forEach(cache, function(item, itemkey) {
                        if (!angular.isArray(item)) {
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
        .factory('ActiveAngularUtilities', ActiveAngularUtilities);

    function ActiveAngularUtilities(activeAngularConstant, ActiveObject, ActiveArray) {
        var service = {
            inheritActiveClass: inheritActiveClass,
            removeIdParam: removeIdParam,
            replaceUrlIdWithOptionsId: replaceUrlIdWithOptionsId,
            stringToObject: stringToObject,
            undefinedToObject: undefinedToObject
        }

        return service;

        function inheritActiveClass(data, instance) {
            if (angular.isArray(data)) {
                data = ActiveArray.decorateArray(data, instance);

                _.forEach(data, function(value, key) {
                    data[key] = new ActiveObject(value, instance);
                });

                return data;
            }

            return new ActiveObject(data, instance);
        }

        function removeIdParam(url) {
            url = url.replace(':id', '');
            url = url.replace('//', '/');
            url = _.trimEnd(url, '/');
            return url;
        }

        function replaceUrlIdWithOptionsId(url, id) {
            if (url.indexOf(':id') > -1 && id) {
                url = url.replace(':id', id);
            }
            return url;
        }

        function stringToObject(options) {
            if (angular.isString(options)) {
                var id = options;
                options = {};
                options.id = id;
            }
            return options;
        }

        function undefinedToObject(options, item) {
            if (angular.isUndefined(options)) {
                options = {};
                var key = item ? item.id : activeAngularConstant.NO_ID;
                options.id = key;
            }

            return options;
        }
    }
})();

(function() {
    angular
        .module('activeAngular')
        .factory('ActiveArray', function($q) {
            var service = {
                decorateArray: decorateArray
            }

            return service;

            function decorateArray(data, instance) {
                var defered = $q.defer();

                data['$remove'] = function(options) {
                    instance.$remove(options);
                };
                data['$create'] = function(options) {
                    instance.$create(options)
                }
                data['$get'] = function(options, reference) {
                    instance.$get(options, reference)
                };

                data['$promise'] = defered.promise;
                data['$deferPromise'] = defered;

                return data;
            }
        });
})();

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
