(function() {
    angular
        .module('activeAngular')
        .provider('ActiveAngular', ActiveAngularBase);

    function ActiveAngularBase() {
        var baseUrl = '';

        this.setBaseUrl = function(base) {
            baseUrl = base;
        }

        this.$get = function($http, $q, $log, $httpParamSerializerJQLike, activeAngularCache, ActiveArray, ActiveObject) {
            function ActiveAngular(url, options) {
                var self = this;
                var defer = $q.defer();
                this.url = url;

                this.$cache = activeAngularCache.create(options);
                this.$promise = defer.promise;
                this.$get = $get;
                this.$query = $query;
                this.$save = $save;
                this.$remove = $remove;
                this.$create = $create;
                this.$edges = undefined;
                this.$$http = $$http;
                this._get = _get;
                this._stringToObject = _stringToObject;
                this._undefinedToObject = _undefinedToObject;

                function $query(options, reference) {
                    reference = reference || '';
                    if (options) {
                        reference = $httpParamSerializerJQLike(options) + reference
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
                                return;
                            }
                            data = inheritActiveClass(data);
                            if (isDataArray) {
                                data = self.$cache.setArray(data)
                            }
                            referenceObject = _.extend(referenceObject, data);
                            referenceObject.$deferPromise.resolve(referenceObject);
                        })
                        .catch(function(_error) {

                        })
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
                        .then(function(response) {
                            self.$cache.set(response.data.id, response.data);
                        })
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
                    options = _.omit(options, 'id');
                    options = {
                        method: method,
                        url: self.url,
                        id: id,
                        data: options
                    }

                    //if no id, strip instances of :id
                    if (!options.id || options.id === 'undefined') {
                        options.url = options.url.replace(':id', '');
                        delete options.id;
                        options.url = options.url.replace('//', '/');
                        options.url = _.trimEnd(options.url, '/');
                    }

                    //replace :id with options.id
                    if (self.url.indexOf(':id') > -1 && options.id) {
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
                        var key = item ? item.id : 'undefined';
                        options.id = key;
                    }

                    return options;
                }
            }

            return ActiveAngular;

        }
    }
})();
