(function() {
    angular
        .module('activeAngular')
        .factory('ActiveArray', function() {
            var service = {
                decorateArray: decorateArray
            }

            return service;

            function decorateArray(data, instance) {
                data['$remove'] = function(options) {
                    instance.$remove(options);
                };
                data['$create'] = function(options) {
                    instance.$create(options)
                }
                data['$get'] = function(options, reference) {
                    instance.$get(options, reference)
                };

                return data;
            }
        });
})();
