(function() {
    angular
        .module('activeAngular')
        .factory('activeAngularCache', function() {
            function Cache() {
                var defaultCacheTime = 5000;

                Object.defineProperty(this, 'isEmpty', {
                    enumerable: false,
                    value: function() {
                        return !Object.keys(this).length;
                    }
                });
                Object.defineProperty(this, 'length', {
                    enumerable: false,
                    value: function() {
                        return Object.keys(this).length;
                    }
                });
                Object.defineProperty(this, 'cachedTime', {
                    enumerable: false,
                    get: function() {
                        return defaultCacheTime;
                    },
                    set: function(newTime) {
                        defaultCacheTime = newTime;
                    }
                });
                Object.defineProperty(this, 'getTimestamp', {
                    enumerable: false,
                    value: function() {
                        return new Date().getTime();
                    }
                });
                Object.defineProperty(this, 'isExpired', {
                    enumerable: false,
                    value: function(item) {
                        var timestamp = item.timestamp;
                        if (!timestamp) {
                            return;
                        }
                        var timeNow = new Date().getTime();
                        return timeNow - timestamp > this.cachedTime;
                    }
                });
            }
            return Cache;
        });
})();
