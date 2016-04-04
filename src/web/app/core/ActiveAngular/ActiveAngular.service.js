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
                        object['$get' + _.capitalize(key)] = value.$edgeQuery;
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

                function $edgeQuery(options, reference) {
                    if (!options.id) {
                        return;
                    }
                    edgeUrl = "posts/" + options.id;
                    if (options) {
                        reference = $httpParamSerializerJQLike(_.omit(options, 'id'))
                    }
                    return _get.call(this, options, reference, true);
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

                    console.log(options.url);

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
