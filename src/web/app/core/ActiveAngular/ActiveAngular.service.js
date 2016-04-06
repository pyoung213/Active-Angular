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
                self.$cache = activeAngularCache.create(options);
                self.$edges = options.edges;
                self.$hydrate = options.hydrate;
                self.$edges = options.edges;
                self.$get = $get;
                self.$query = $query;
                self.$edgeQuery = $edgeQuery;
                self.$edgeGet = $edgeGet;
                self.$edgeCreate = $edgeCreate;
                self.$save = $save;
                self.$remove = $remove;
                self.$create = $create;
                self.$$http = $$http;
                self._get = _get;
                self._hydrateCollection = _hydrateCollection;
                self._hideMetadata = _hideMetadata;
                self._hydyrateData = _hydyrateData;
                self._logMismatchError = _logMismatchError;
                self._createEdges = _createEdges;

                self = _createEdges(self);

                function $query(options, reference) {
                    reference = reference || '';
                    if (options) {
                        reference = $httpParamSerializerJQLike(options) + reference
                    }
                    return _get.call(this, options, reference, true);
                }

                function $edgeGet(options, reference) {
                    if (!reference) {
                        reference = '';
                    }
                    options = ActiveAngularUtilities.stringToObject(options);
                    var url = this.url;
                    url = ActiveAngularUtilities.replaceUrlIdWithOptionsId(url, options.id)
                    delete options.id

                    options.url = url + "/" + ActiveAngularUtilities.removeIdParam(self.url);
                    var params = _.omit(options, 'url');
                    if (params) {
                        reference = $httpParamSerializerJQLike(params) + reference
                    }
                    return _get.call(this, options, null, false);
                }

                function $edgeQuery(options, reference) {
                    if (!reference) {
                        reference = '';
                    }
                    options = ActiveAngularUtilities.stringToObject(options);
                    var url = this.url;

                    url = ActiveAngularUtilities.replaceUrlIdWithOptionsId(url, options.id)
                    delete options.id

                    options.url = url + "/" + ActiveAngularUtilities.removeIdParam(self.url);
                    var params = _.omit(options, 'url');
                    if (params) {
                        reference = $httpParamSerializerJQLike(params) + reference
                    }
                    return _get.call(this, options, reference, true);
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
                    var key = _valueOrEmpty(options.id) + _valueOrEmpty(options.url) + _valueOrEmpty(reference);
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
                            var isDataArray = angular.isArray(data);

                            if (isDataArray != isArray) {
                                if (!data[collectionKey]) {
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

                function $edgeCreate(options) {
                    options = ActiveAngularUtilities.stringToObject(options);
                    var url = this.url;

                    url = ActiveAngularUtilities.replaceUrlIdWithOptionsId(url, options.id)
                    delete options.id

                    options.url = url + "/" + ActiveAngularUtilities.removeIdParam(self.url);
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

                function _createEdges(object) {
                    if (!object.$edges) {
                        return object;
                    }
                    _.forEach(object.$edges.get, function(value, key) {
                        object['$get' + _.capitalize(key)] = value.$edgeGet;
                        object['$create' + _.capitalize(key)] = value.$edgeCreate;
                    });
                    _.forEach(object.$edges.query, function(value, key) {
                        object['$query' + _.capitalize(key)] = value.$edgeQuery;
                        object['$create' + _.capitalize(key)] = value.$edgeCreate;
                    });
                    return object;
                }

                function _logMismatchError(response, isArray) {
                    if (isArray) {
                        $log.error(response.config.url + ' Expected an Object and got an Array from server.');
                        return;
                    }
                    $log.error(response.config.url + ' Expected an Array and got an Object from server with collection key ' + collectionKey + ' not set.');
                }

                function _hydyrateData(data) {
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

                function _hydrateCollection(collection) {
                    var data = {};

                    _.forEach(collection[collectionKey], function(value, key) {
                        data[key] = value
                    });
                    return data;
                }

                function _hideMetadata(ref, data) {
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

                function _valueOrEmpty(string) {
                    return string || "";
                }
            }

            return ActiveAngular;
        }
    }
})();
