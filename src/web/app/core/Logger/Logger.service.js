angular
    .module('app.core')
    .service('Logger', Logger);

function Logger(LoggerApi) {
    var service = {
        specialize: specialize
    };

    return service;

    function specialize(prefix, context) {
        var logger = {
            error: error,
            warn: warn,
            info: info
        };

        return logger;

        function error(msg, data) {
            checkArguments(arguments);
            data = _.merge({}, context, data);
            LoggerApi.log('error', {
                prefix: prefix,
                msg: msg,
                data: data
            });
        }

        function warn(msg, data) {
            checkArguments(arguments);
            data = _.merge({}, context, data);
            LoggerApi.log('warn', {
                prefix: prefix,
                msg: msg,
                data: data
            });
        }

        function info(msg, data) {
            checkArguments(arguments);
            data = _.merge({}, context, data);
            LoggerApi.log('info', {
                prefix: prefix,
                msg: msg,
                data: data
            });
        }
    }

    function checkArguments(args) {
        if (args.length > 2) {
            throw new Error("Logger takes 1 or 2 arguments.");
        }

        if (args[0].constructor !== String) {
            throw new Error("The first argument to theLogger must be a string");
        }

        if (args.length === 2 && args[1] && args[1].constructor !== Object) {
            throw new Error("The second argument to theLogger must be a POJO.  It's actually " + getConstructorName(args[1]));
        }
    }

    function getConstructorName(obj) {
        var ctor = obj.constructor.toString();
        var name = ctor.substring(9).split('(')[0];
        return name;
    }
}
