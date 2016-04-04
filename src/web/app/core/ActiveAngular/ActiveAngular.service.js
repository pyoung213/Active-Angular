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

        this.$get = function($http, $q, $log, $httpParamSerializerJQLike, activeAngularCache, ActiveArray, ActiveObject, activeAngularConstant) {
            function ActiveAngular(url, options) {
                options = options || {};
                var self = this;
                var defer = $q.defer();

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
                    url = _replaceUrlIdWithOptionsId(url, options.id)
                    delete options.id

                    options.url = url + "/" + _removeIdParam(self.url);
                    return _get.call(this, options, null, false);
                }

                function $edgeQuery(options) {
                    options = _stringToObject(options);
                    var url = this.url;

                    url = _replaceUrlIdWithOptionsId(url, options.id)
                    delete options.id

                    options.url = url + "/" + _removeIdParam(self.url);
                    return _get.call(this, options, null, true);
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
                    var key = '';
                    if (options.id) {
                        key += options.id
                    }

                    if (options.url) {
                        key += options.url;
                    }

                    if (reference) {
                        key += reference
                    }
                    var cachedItem = self.$cache.get(key);

                    if (cachedItem && !cachedItem.$isExpired) {
                        return cachedItem;
                    }
                    if (!cachedItem) {
                        var itemDefer = $q.defer();
                        cachedItem = isArray ? ActiveArray.decorateArray([], self) : new ActiveObject({}, self);

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

                function asyncGetRequest(options, cachedItem, isArray) {
                    self.$$http('GET', options)
                        .then(function(response) {
                            var data = response.data;
                            var isDataArray = angular.isArray(data);

                            if (isDataArray != isArray) {
                                if (!data[collectionKey]) {
                                    return logMismatchError(response, isDataArray);
                                }
                                cachedItem = _enumMeta(cachedItem, data);
                                data = _hydrateCollection(data);
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
                            cachedItem = _.assign(cachedItem, data);
                            cachedItem.$deferPromise.resolve(cachedItem);
                        });
                }

                function _enumMeta(ref, data) {
                    _.forEach(data, function(value, key) {
                        if (key !== collectionKey) {
                            Object.defineProperty(ref, key, {
                                enumerable: false,
                                value: value
                            });
                        }
                    });
                    return ref;
                }

                function _hydrateCollection(collection) {
                    var data = {};

                    _.forEach(collection.items, function(value, key) {
                        data[key] = value
                    });
                    return data;
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
                        data = ActiveArray.decorateArray(data, self);

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
                    $log.error(response.config.url + ' Expected an Array and got an Object from server with collection key ' + collectionKey + ' not set.');
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
                    var edgeUrl = options.url;
                    options = {
                        method: method,
                        url: edgeUrl || self.url,
                        id: id,
                        data: _.omit(options, 'id', 'url')
                    }

                    //if no id, strip instances of :id
                    if (!options.id || options.id === activeAngularConstant.NO_ID) {
                        options.url = _removeIdParam(options.url);
                        delete options.id;
                    }

                    options.url = _replaceUrlIdWithOptionsId(options.url, options.id);
                    delete options.id;

                    if (options.method === 'GET' && Object.keys(options.data).length) {
                        options.url += options.url.indexOf('?') == -1 ? '?' : '&';
                        options.url += $httpParamSerializerJQLike(options.data);
                    }

                    options.url = baseUrl + '/' + options.url;

                    return $http(options);
                }

                function _replaceUrlIdWithOptionsId(url, id) {
                    if (url.indexOf(':id') > -1 && id) {
                        url = url.replace(':id', id);
                    }
                    return url;
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
