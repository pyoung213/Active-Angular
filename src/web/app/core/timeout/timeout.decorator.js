angular.module('app.core')
    .decorator("$timeout", ['$interval', timeoutDecorator]);

// This is a special decorator that replaces the $timeout service with a new one that uses $interval under the hood.
// The functionality is identical, but $interval plays well with protractor, while $timeout does not.
function timeoutDecorator($interval) {

    var timeout = function() {
        var args = Array.prototype.slice.call(arguments);

        if (args.length === 1) {
            args.push(0);
        }

        // Insert a "call one time" counter into the arguments.
        args.splice(2, 0, 1);

        return $interval.apply($interval, args);
    };

    timeout.flush = $interval.flush;
    timeout.cancel = $interval.cancel;

    return timeout;
}
