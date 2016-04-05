(function() {
    angular
        .module('activeAngular')
        .factory('ActiveAngularUtilities', ActiveAngularUtilities);

    function ActiveAngularUtilities($q, activeAngularConstant, ActiveObject, ActiveArray) {
        var service = {
            createPromises: createPromises,
            inheritActiveClass: inheritActiveClass,
            removeIdParam: removeIdParam,
            replaceUrlIdWithOptionsId: replaceUrlIdWithOptionsId,
            stringToObject: stringToObject,
            undefinedToObject: undefinedToObject
        }

        return service;

        function createPromises(data) {
            var itemDefer = $q.defer();
            Object.defineProperty(data, '$promise', {
                enumerable: false,
                value: itemDefer.promise
            });

            Object.defineProperty(data, '$deferPromise', {
                enumerable: false,
                value: itemDefer
            });

            return data;
        }

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
