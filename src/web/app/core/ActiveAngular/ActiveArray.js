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
