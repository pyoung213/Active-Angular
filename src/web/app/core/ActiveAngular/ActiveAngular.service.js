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
            function ActiveAngular(url) {
                var defer = $q.defer();
                this.url = url;

                this.$cached = new activeAngularCache();
                this.$promise = defer.promise;
                this.$get = $get;
                this.$query = $query;
                this.$save = $save;
                this.$remove = $remove;
                this.$create = $create;
                this.$find = $find;
                this.$edges = undefined;
                this.$hasMany = $hasMany;
                this.$transformResponse = $transformResponse;
                this.$$http = $$http;
                this._get = _get;
                this._stringToObject = _stringToObject;
                this._undefinedToObject = _undefinedToObject;

                function $query(options, reference) {
                    return _get.call(this, options, reference, true);
                }

                function $get(options, reference) {
                    return _get.call(this, options, reference, false);
                }

                function _get(options, reference, isArray) {
                    var self = this;

                    options = _stringToObject(options);
                    options = _undefinedToObject(options);

                    var key = reference ? options.id + reference : options.id;
                    var cachedItem = self.$cached[key];
                    if (cachedItem) {
                        if (!self.$cached.isExpired(cachedItem)) {
                            return cachedItem;
                        }
                    }

                    var found = self.$find(key);
                    if (found) {
                        return found;
                    }

                    self.$cached[key] = isArray ? new ActiveArray({}, self) : new ActiveObject({}, self);

                    if (isArray) {
                        ActiveArray.prototype.$remove = function(options) {
                            return self.$remove(options);
                        };
                        ActiveArray.prototype.$create = function(options) {
                            return self.$create(options);
                        };
                        ActiveArray.prototype.$get = function(options, reference) {
                            return self.$get(options, reference);
                        };
                    }
                    if (self.$cached.cachedTime) {
                        Object.defineProperty(self.$cached[key], 'timestamp', {
                            enumerable: false,
                            value: self.$cached.getTimestamp()
                        });
                    }
                    self.$$http('GET', options)
                        .then(function(response) {
                            var data = response.data;
                            var isDataArray = !!data[0] && !!data[1];
                            if (isDataArray != isArray) {
                                if (isDataArray) {
                                    $log.error(response.config.url + ' Expected an Object and got an Array from server.');
                                    return;
                                }
                                $log.error(response.config.url + ' Expected an Array and got an Object from server.');
                                return;
                            }
                            data = _.extend(data, self.$edges);
                            self.$cached[key] = _.extend(self.$cached[key], data);
                            defer.resolve(self.$cached[key]);
                        });
                    return self.$cached[key];
                }

                function $transformResponse(data) {
                    return data;
                }

                function $save(options) {
                    return this.$$http('PUT', options);
                }

                function $remove(options) {
                    if (angular.isString(options)) {
                        var id = options;
                        options = {};
                        options.id = id;
                    }
                    return this.$$http('DELETE', options);
                }

                function $create(options) {
                    return this.$$http('POST', options);
                }

                //Used for looking for references inside cached arrays.
                function $find(id) {
                    var self = this;

                    return _.find(self.$cached, function(instance) {
                        if (instance[0]) {
                            return _.find(instance, function(sub) {
                                if (sub.id === id) {
                                    return sub;
                                }
                            })
                        }
                    });
                }

                function $hasMany() {

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

                    options.transformResponse = appendTransform($http.defaults.transformResponse, function(value) {
                        return self.$transformResponse(value);
                    })

                    options.url = baseUrl + '/' + options.url;

                    return $http(options)
                        .then(function(response) {
                            if (response.status === 200) {
                                return response;
                            }
                        });
                }

                function appendTransform(defaults, transform) {

                    // We can't guarantee that the default transformation is an array
                    defaults = angular.isArray(defaults) ? defaults : [defaults];

                    // Append the new transformation to the defaults
                    return defaults.concat(transform);
                }

                function _stringToObject(options) {
                    if (angular.isString(options)) {
                        var id = options;
                        options = {};
                        options.id = id;
                    }
                    return options;
                }

                function _undefinedToObject(options) {
                    if (angular.isUndefined(options)) {
                        options = {};
                        options.id = 'undefined';
                    }

                    return options;
                }
            }

            return ActiveAngular;

        }
    }
})();
